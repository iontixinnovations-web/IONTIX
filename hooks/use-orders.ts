"use client"

/**
 * Orders Hook
 * SWR-based order management with FastAPI backend
 */

import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { shopService, type Order, type OrderTracking, type OrderStatus } from "@/lib/api"
import { toast } from "sonner"

export function useOrders(params?: { status?: OrderStatus; page?: number; limit?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set("status", params.status)
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))

  const key = `/orders?${searchParams.toString()}`

  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    key,
    async () => {
      const response = await shopService.orders.list(params)
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: true },
  )

  return {
    orders: data || [],
    isLoading,
    error,
    refetch: mutate,
  }
}

export function useOrder(orderId: string) {
  const { data, error, isLoading, mutate } = useSWR<Order>(
    orderId ? `/orders/${orderId}` : null,
    async () => {
      const response = await shopService.orders.get(orderId)
      if (!response.success) throw new Error(response.error)
      return response.data!
    },
    { revalidateOnFocus: true },
  )

  // Cancel order mutation
  const cancelOrder = useSWRMutation(
    `/orders/${orderId}`,
    async (_, { arg }: { arg: string }) => {
      const response = await shopService.orders.cancel(orderId, arg)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => {
        mutate()
        toast.success("Order cancelled")
      },
      onError: (err) => toast.error(err.message || "Failed to cancel order"),
    },
  )

  return {
    order: data,
    isLoading,
    error,
    cancelOrder: cancelOrder.trigger,
    isCancelling: cancelOrder.isMutating,
    refetch: mutate,
  }
}

export function useOrderTracking(orderId: string) {
  const { data, error, isLoading, mutate } = useSWR<OrderTracking>(
    orderId ? `/orders/${orderId}/tracking` : null,
    async () => {
      const response = await shopService.orders.track(orderId)
      if (!response.success) throw new Error(response.error)
      return response.data!
    },
    { refreshInterval: 60000 },
  )

  return {
    tracking: data,
    isLoading,
    error,
    refetch: mutate,
  }
}

export function useCreateOrder() {
  const createOrder = useSWRMutation(
    "/orders",
    async (
      _,
      {
        arg,
      }: {
        arg: {
          shipping_address_id: string
          billing_address_id?: string
          payment_method: string
          notes?: string
        }
      },
    ) => {
      const response = await shopService.orders.create(arg)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => toast.success("Order placed successfully!"),
      onError: (err) => toast.error(err.message || "Failed to place order"),
    },
  )

  return {
    createOrder: createOrder.trigger,
    isCreating: createOrder.isMutating,
    error: createOrder.error,
    order: createOrder.data,
  }
}
