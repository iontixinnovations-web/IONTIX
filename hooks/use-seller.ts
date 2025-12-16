"use client"

/**
 * Seller Hooks
 * Seller dashboard and management with full FastAPI integration
 */

import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import {
  sellerService,
  type SellerProfile,
  type SellerDashboard,
  type SellerAnalytics,
  type CreateProductData,
} from "@/lib/api"
import type { Product, Order } from "@/lib/api"
import { toast } from "sonner"

export function useSellerProfile() {
  const { data, error, isLoading, mutate } = useSWR<SellerProfile>(
    "/sellers/profile",
    async () => {
      const response = await sellerService.getProfile()
      if (!response.success) throw new Error(response.error)
      return response.data!
    },
    { revalidateOnFocus: false },
  )

  return { profile: data, isLoading, error, refetch: mutate }
}

export function useSellerDashboard() {
  const { data, error, isLoading, mutate } = useSWR<SellerDashboard>(
    "/sellers/dashboard",
    async () => {
      const response = await sellerService.getDashboard()
      if (!response.success) throw new Error(response.error)
      return response.data!
    },
    { revalidateOnFocus: true },
  )

  return { dashboard: data, isLoading, error, refetch: mutate }
}

export function useSellerAnalytics(period?: "7d" | "30d" | "90d" | "1y") {
  const { data, error, isLoading } = useSWR<SellerAnalytics>(
    `/sellers/analytics?period=${period || "30d"}`,
    async () => {
      const response = await sellerService.getAnalytics({ period })
      if (!response.success) throw new Error(response.error)
      return response.data!
    },
    { revalidateOnFocus: false },
  )

  return { analytics: data, isLoading, error }
}

export function useSellerProducts(params?: { status?: string; page?: number }) {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    `/sellers/products`,
    async () => {
      const response = await sellerService.getProducts(params)
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: true },
  )

  // Create product
  const create = useSWRMutation(
    "/sellers/products",
    async (_, { arg }: { arg: CreateProductData }) => {
      const response = await sellerService.createProduct(arg)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => {
        mutate()
        toast.success("Product created!")
      },
      onError: (err) => toast.error(err.message || "Failed to create product"),
    },
  )

  // Update product
  const update = useSWRMutation(
    "/sellers/products/update",
    async (_, { arg }: { arg: { id: string; data: Partial<CreateProductData> } }) => {
      const response = await sellerService.updateProduct(arg.id, arg.data)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => {
        mutate()
        toast.success("Product updated!")
      },
      onError: (err) => toast.error(err.message || "Failed to update product"),
    },
  )

  // Delete product
  const remove = useSWRMutation(
    "/sellers/products/delete",
    async (_, { arg }: { arg: string }) => {
      const response = await sellerService.deleteProduct(arg)
      if (!response.success) throw new Error(response.error)
    },
    {
      onSuccess: () => {
        mutate()
        toast.success("Product deleted!")
      },
      onError: (err) => toast.error(err.message || "Failed to delete product"),
    },
  )

  return {
    products: data || [],
    isLoading,
    error,
    createProduct: create.trigger,
    isCreating: create.isMutating,
    updateProduct: update.trigger,
    isUpdating: update.isMutating,
    deleteProduct: remove.trigger,
    isDeleting: remove.isMutating,
    refetch: mutate,
  }
}

export function useAddProduct() {
  const { mutate } = useSWR("/sellers/products")

  const addProduct = useSWRMutation(
    "/sellers/products/add",
    async (
      _,
      { arg }: { arg: { name: string; description: string; price: number; category: string; stock: number } },
    ) => {
      const response = await sellerService.createProduct({
        name: arg.name,
        description: arg.description,
        price: arg.price,
        category: arg.category,
        stock: arg.stock,
      } as CreateProductData)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => {
        mutate()
        toast.success("Product added successfully!")
      },
      onError: (err) => toast.error(err.message || "Failed to add product"),
    },
  )

  return {
    addProduct: addProduct.trigger,
    isAdding: addProduct.isMutating,
    product: addProduct.data,
    error: addProduct.error,
  }
}

export function useSellerOrders(params?: { status?: string; page?: number }) {
  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    `/sellers/orders`,
    async () => {
      const response = await sellerService.getOrders(params)
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: true },
  )

  // Update order status
  const updateStatus = useSWRMutation(
    "/sellers/orders/status",
    async (
      _,
      {
        arg,
      }: {
        arg: {
          orderId: string
          status: string
          tracking_number?: string
          carrier?: string
        }
      },
    ) => {
      const response = await sellerService.updateOrderStatus(arg.orderId, {
        status: arg.status,
        tracking_number: arg.tracking_number,
        carrier: arg.carrier,
      })
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => {
        mutate()
        toast.success("Order status updated!")
      },
      onError: (err) => toast.error(err.message || "Failed to update order"),
    },
  )

  return {
    orders: data || [],
    isLoading,
    error,
    updateOrderStatus: updateStatus.trigger,
    isUpdatingStatus: updateStatus.isMutating,
    refetch: mutate,
  }
}

export function useSellerRegistration() {
  const register = useSWRMutation(
    "/sellers/register",
    async (
      _,
      {
        arg,
      }: {
        arg: {
          shop_name: string
          shop_description?: string
          business_registration_number?: string
          gst_number?: string
        }
      },
    ) => {
      const response = await sellerService.register(arg)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => toast.success("Registration submitted!"),
      onError: (err) => toast.error(err.message || "Registration failed"),
    },
  )

  return {
    register: register.trigger,
    isRegistering: register.isMutating,
    profile: register.data,
    error: register.error,
  }
}
