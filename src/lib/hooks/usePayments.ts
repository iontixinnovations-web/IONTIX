"use client"

/**
 * Payments Hook
 * Manages payment operations with Razorpay/Stripe
 */

import { useState, useCallback } from "react"
import { useAuthStore } from "../store"
import {
  paymentsService,
  type PaymentOrder,
  type PaymentMethod,
  type PaymentVerification,
  type UPIIntentData,
} from "../api"
import { ENV } from "../env"
import { toast } from "sonner"

// Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
  }
}

interface RazorpayInstance {
  open: () => void
  close: () => void
}

interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export function usePayments() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null)

  /**
   * Load Razorpay script dynamically
   */
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }, [])

  /**
   * Create a payment order
   */
  const createPaymentOrder = useCallback(
    async (data: {
      order_id: string
      amount: number
      currency?: string
      provider?: "razorpay" | "stripe" | "upi"
    }) => {
      if (!user) {
        toast.error("Please sign in to make a payment")
        return { success: false, error: "Not authenticated" }
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await paymentsService.createPaymentOrder(data)

        if (response.success && response.data) {
          setPaymentOrder(response.data)
          return { success: true, data: response.data }
        }

        return { success: false, error: response.error }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create payment order"
        console.error("Create payment order error:", err)
        setError(message)
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  /**
   * Process payment with Razorpay
   */
  const payWithRazorpay = useCallback(
    async (
      paymentOrderData: PaymentOrder,
      onSuccess: (data: { order_id: string }) => void,
      onFailure?: (error: string) => void,
    ) => {
      try {
        setIsLoading(true)

        // Load Razorpay script
        const loaded = await loadRazorpayScript()
        if (!loaded) {
          throw new Error("Failed to load payment gateway")
        }

        const options: RazorpayOptions = {
          key: paymentOrderData.key_id || ENV.RAZORPAY_KEY_ID,
          amount: paymentOrderData.amount,
          currency: paymentOrderData.currency,
          name: "MITHAS GLOW",
          description: `Order #${paymentOrderData.order_id}`,
          order_id: paymentOrderData.payment_order_id,
          handler: async (response: RazorpayResponse) => {
            try {
              // Verify payment on backend
              const verification: PaymentVerification = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }

              const verifyResponse = await paymentsService.verifyPayment(paymentOrderData.order_id, verification)

              if (verifyResponse.success) {
                toast.success("Payment successful!")
                onSuccess({ order_id: paymentOrderData.order_id })
              } else {
                throw new Error("Payment verification failed")
              }
            } catch (err) {
              const message = err instanceof Error ? err.message : "Payment verification failed"
              toast.error(message)
              onFailure?.(message)
            }
          },
          prefill: {
            name: user?.full_name || "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          theme: {
            color: "#E91E63", // MITHAS GLOW brand color
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false)
              toast.info("Payment cancelled")
            },
          },
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Payment failed"
        console.error("Razorpay error:", err)
        setError(message)
        toast.error(message)
        onFailure?.(message)
      } finally {
        setIsLoading(false)
      }
    },
    [user, loadRazorpayScript],
  )

  /**
   * Verify payment
   */
  const verifyPayment = useCallback(async (orderId: string, verification: PaymentVerification) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await paymentsService.verifyPayment(orderId, verification)

      if (response.success) {
        return { success: true, data: response.data }
      }

      return { success: false, error: response.error }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed"
      console.error("Verify payment error:", err)
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Request refund
   */
  const requestRefund = useCallback(
    async (data: { order_id: string; amount?: number; reason: string }) => {
      if (!user) {
        return { success: false, error: "Not authenticated" }
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await paymentsService.requestRefund(data)

        if (response.success) {
          toast.success("Refund request submitted")
          return { success: true, data: response.data }
        }

        return { success: false, error: response.error }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Refund request failed"
        console.error("Request refund error:", err)
        setError(message)
        toast.error(message)
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  return {
    paymentOrder,
    isLoading,
    error,
    createPaymentOrder,
    payWithRazorpay,
    verifyPayment,
    requestRefund,
  }
}

export function usePaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMethods = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await paymentsService.getPaymentMethods()

      if (response.success && response.data) {
        setMethods(response.data)
        return { success: true, data: response.data }
      }

      // Fallback to default methods
      const defaultMethods: PaymentMethod[] = [
        { id: "upi", type: "upi", name: "UPI", icon: "/icons/upi.svg", is_enabled: true },
        { id: "card", type: "card", name: "Credit/Debit Card", icon: "/icons/card.svg", is_enabled: true },
        { id: "netbanking", type: "netbanking", name: "Net Banking", icon: "/icons/bank.svg", is_enabled: true },
        { id: "wallet", type: "wallet", name: "Wallets", icon: "/icons/wallet.svg", is_enabled: true },
        {
          id: "cod",
          type: "cod",
          name: "Cash on Delivery",
          icon: "/icons/cod.svg",
          is_enabled: true,
          additional_charge: 40,
        },
      ]
      setMethods(defaultMethods)
      return { success: true, data: defaultMethods }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch payment methods"
      console.error("Fetch payment methods error:", err)
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    methods,
    isLoading,
    error,
    fetchMethods,
  }
}

export function useUPIPayment() {
  const [upiData, setUpiData] = useState<UPIIntentData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateUPIIntent = useCallback(async (data: { order_id: string; amount: number; vpa?: string }) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await paymentsService.generateUPIIntent(data)

      if (response.success && response.data) {
        setUpiData(response.data)
        return { success: true, data: response.data }
      }

      return { success: false, error: response.error }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate UPI intent"
      console.error("Generate UPI intent error:", err)
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const openUPIApp = useCallback((upiUrl: string) => {
    window.location.href = upiUrl
  }, [])

  return {
    upiData,
    isLoading,
    error,
    generateUPIIntent,
    openUPIApp,
  }
}
