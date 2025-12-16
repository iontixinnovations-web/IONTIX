"use client"

/**
 * Orders Hook
 * Manages order operations with FastAPI backend
 */

import { useState, useEffect, useCallback } from "react"
import { useAuthStore, useOrderStore } from "../store"
import { ordersService, type CreateOrderData, type OrderTrackingInfo, type OrderFilters } from "../api"
import { supabase } from "../supabase"
import { toast } from "sonner"
import type { Database } from "../database.types"

type Order = Database["public"]["Tables"]["orders"]["Row"]

export function useOrders(filters?: OrderFilters) {
  const { user } = useAuthStore()
  const { orders, setOrders, addOrder, updateOrderStatus } = useOrderStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([])
      return { success: false, error: "Not authenticated" }
    }

    try {
      setIsLoading(true)
      setError(null)

      // Try FastAPI first, fallback to Supabase
      try {
        const response = await ordersService.getOrders(filters)
        if (response.success && response.data) {
          setOrders(response.data)
          return { success: true, data: response.data }
        }
      } catch {
        // Fallback to direct Supabase query
        let query = supabase
          .from("orders")
          .select("*")
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false })

        if (filters?.status) {
          query = query.eq("status", filters.status)
        }
        if (filters?.limit) {
          query = query.limit(filters.limit)
        }

        const { data, error: supabaseError } = await query

        if (supabaseError) throw supabaseError

        if (data) {
          setOrders(data as Order[])
          return { success: true, data }
        }
      }

      return { success: false, error: "Failed to fetch orders" }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch orders"
      console.error("Fetch orders error:", err)
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [user, filters, setOrders])

  // Auto-fetch on mount
  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user, fetchOrders])

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
  }
}

export function useOrder(orderId: string) {
  const { user } = useAuthStore()
  const { setSelectedOrder } = useOrderStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    if (!user || !orderId) {
      return { success: false, error: "Invalid request" }
    }

    try {
      setIsLoading(true)
      setError(null)

      // Try FastAPI first
      try {
        const response = await ordersService.getOrder(orderId)
        if (response.success && response.data) {
          setOrder(response.data)
          setSelectedOrder(response.data)
          return { success: true, data: response.data }
        }
      } catch {
        // Fallback to Supabase
        const { data, error: supabaseError } = await supabase.from("orders").select("*").eq("id", orderId).single()

        if (supabaseError) throw supabaseError

        if (data) {
          setOrder(data as Order)
          setSelectedOrder(data as Order)
          return { success: true, data }
        }
      }

      return { success: false, error: "Order not found" }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch order"
      console.error("Fetch order error:", err)
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [user, orderId, setSelectedOrder])

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId, fetchOrder])

  return {
    order,
    isLoading,
    error,
    refetch: fetchOrder,
  }
}

export function useCreateOrder() {
  const { user } = useAuthStore()
  const { addOrder } = useOrderStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrder = async (data: CreateOrderData) => {
    if (!user) {
      toast.error("Please sign in to place an order")
      return { success: false, error: "Not authenticated" }
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await ordersService.createOrder(data)

      if (response.success && response.data) {
        addOrder(response.data)
        toast.success("Order placed successfully!")
        return { success: true, data: response.data }
      }

      return { success: false, error: response.error || "Failed to create order" }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create order"
      console.error("Create order error:", err)
      setError(message)
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const cancelOrder = async (orderId: string, reason: string) => {
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await ordersService.cancelOrder(orderId, reason)

      if (response.success) {
        toast.success("Order cancelled successfully")
        return { success: true }
      }

      return { success: false, error: response.error }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel order"
      console.error("Cancel order error:", err)
      setError(message)
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createOrder,
    cancelOrder,
    isLoading,
    error,
  }
}

export function useOrderTracking(orderId: string) {
  const [tracking, setTracking] = useState<OrderTrackingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTracking = useCallback(async () => {
    if (!orderId) return { success: false, error: "No order ID" }

    try {
      setIsLoading(true)
      setError(null)

      const response = await ordersService.trackOrder(orderId)

      if (response.success && response.data) {
        setTracking(response.data)
        return { success: true, data: response.data }
      }

      return { success: false, error: response.error }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch tracking"
      console.error("Fetch tracking error:", err)
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (orderId) {
      fetchTracking()
    }
  }, [orderId, fetchTracking])

  return {
    tracking,
    isLoading,
    error,
    refetch: fetchTracking,
  }
}
