/**
 * Payments Service
 * Payment processing integration (Razorpay, UPI, etc.)
 */

import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export interface PaymentOrder {
  order_id: string
  payment_order_id: string
  amount: number
  currency: string
  status: string
  provider: "razorpay" | "stripe" | "upi"
  key_id?: string // For client-side SDK initialization
}

export interface PaymentVerification {
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
  upi_txn_id?: string
}

export interface PaymentMethod {
  id: string
  type: "card" | "upi" | "netbanking" | "wallet" | "cod"
  name: string
  icon: string
  is_enabled: boolean
  additional_charge?: number
}

export interface UPIIntentData {
  upi_url: string
  qr_code_url: string
  vpa: string
  amount: number
  transaction_id: string
}

/**
 * Payments Service Methods
 */
export const paymentsService = {
  /**
   * Create payment order
   */
  createPaymentOrder: async (data: {
    order_id: string
    amount: number
    currency?: string
    provider?: "razorpay" | "stripe" | "upi"
  }) => {
    return apiClient.post<PaymentOrder>(API_ENDPOINTS.PAYMENTS.CREATE_ORDER, data)
  },

  /**
   * Verify payment
   */
  verifyPayment: async (orderId: string, verification: PaymentVerification) => {
    return apiClient.post<{ success: boolean; order_id: string }>(API_ENDPOINTS.PAYMENTS.VERIFY, {
      order_id: orderId,
      ...verification,
    })
  },

  /**
   * Request refund
   */
  requestRefund: async (data: {
    order_id: string
    amount?: number
    reason: string
  }) => {
    return apiClient.post<{ refund_id: string; status: string }>(API_ENDPOINTS.PAYMENTS.REFUND, data)
  },

  /**
   * Get available payment methods
   */
  getPaymentMethods: async () => {
    return apiClient.get<PaymentMethod[]>(API_ENDPOINTS.PAYMENTS.METHODS)
  },

  /**
   * Generate UPI intent/QR
   */
  generateUPIIntent: async (data: {
    order_id: string
    amount: number
    vpa?: string
  }) => {
    return apiClient.post<UPIIntentData>(API_ENDPOINTS.PAYMENTS.UPI_INTENT, data)
  },
}

export default paymentsService
