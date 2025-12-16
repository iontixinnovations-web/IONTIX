"use client"

/**
 * Cart Hook
 * SWR-based cart management
 */

import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { shopService, type Cart } from "@/lib/api"
import { toast } from "sonner"

export function useCart() {
  const { data, error, isLoading, mutate } = useSWR<Cart>(
    "/cart",
    async () => {
      const response = await shopService.cart.get()
      if (!response.success) throw new Error(response.error)
      return response.data!
    },
    { revalidateOnFocus: true },
  )

  // Add item mutation
  const addItem = useSWRMutation(
    "/cart",
    async (_, { arg }: { arg: { product_id: string; variant_id?: string; quantity?: number } }) => {
      const response = await shopService.cart.addItem(arg)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => {
        mutate()
        toast.success("Added to cart")
      },
      onError: (err) => {
        toast.error(err.message || "Failed to add to cart")
      },
    },
  )

  // Update item mutation
  const updateItem = useSWRMutation(
    "/cart",
    async (_, { arg }: { arg: { itemId: string; quantity: number } }) => {
      const response = await shopService.cart.updateItem(arg.itemId, arg.quantity)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => mutate(),
      onError: (err) => toast.error(err.message || "Failed to update cart"),
    },
  )

  // Remove item mutation
  const removeItem = useSWRMutation(
    "/cart",
    async (_, { arg }: { arg: string }) => {
      const response = await shopService.cart.removeItem(arg)
      if (!response.success) throw new Error(response.error)
    },
    {
      onSuccess: () => {
        mutate()
        toast.success("Removed from cart")
      },
      onError: (err) => toast.error(err.message || "Failed to remove item"),
    },
  )

  // Clear cart mutation
  const clearCart = useSWRMutation(
    "/cart",
    async () => {
      const response = await shopService.cart.clear()
      if (!response.success) throw new Error(response.error)
    },
    {
      onSuccess: () => mutate(),
    },
  )

  // Apply coupon mutation
  const applyCoupon = useSWRMutation(
    "/cart",
    async (_, { arg }: { arg: string }) => {
      const response = await shopService.cart.applyCoupon(arg)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: (data) => {
        mutate()
        toast.success(data?.message || "Coupon applied")
      },
      onError: (err) => toast.error(err.message || "Invalid coupon"),
    },
  )

  return {
    cart: data,
    items: data?.items || [],
    itemCount: data?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
    subtotal: data?.subtotal || 0,
    total: data?.total || 0,
    isLoading,
    error,
    addItem: addItem.trigger,
    updateItem: updateItem.trigger,
    removeItem: removeItem.trigger,
    clearCart: clearCart.trigger,
    applyCoupon: applyCoupon.trigger,
    isAdding: addItem.isMutating,
    isUpdating: updateItem.isMutating,
    refetch: mutate,
  }
}
