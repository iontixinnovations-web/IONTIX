"use client"

/**
 * Products Hook
 * SWR-based data fetching for products
 */

import useSWR from "swr"
import { shopService, type Product, type ProductFilters, type Category } from "@/lib/api"

// SWR fetcher
const fetcher = async (key: string) => {
  const [, ...params] = key.split("?")
  const searchParams = new URLSearchParams(params.join("?"))
  const filters: ProductFilters = {}

  searchParams.forEach((value, key) => {
    ;(filters as Record<string, string>)[key] = value
  })

  const response = await shopService.products.list(filters)
  if (!response.success) throw new Error(response.error || "Failed to fetch products")
  return response.data
}

export function useProducts(filters?: ProductFilters) {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, Array.isArray(value) ? value.join(",") : String(value))
      }
    })
  }

  const key = `/products?${params.toString()}`

  const { data, error, isLoading, mutate } = useSWR<Product[]>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return {
    products: data || [],
    isLoading,
    error,
    refetch: mutate,
  }
}

export function useProduct(productId: string) {
  const { data, error, isLoading, mutate } = useSWR<Product>(
    productId ? `/products/${productId}` : null,
    async () => {
      const response = await shopService.products.get(productId)
      if (!response.success) throw new Error(response.error || "Product not found")
      return response.data!
    },
    { revalidateOnFocus: false },
  )

  return {
    product: data,
    isLoading,
    error,
    refetch: mutate,
  }
}

export function useFeaturedProducts(limit?: number) {
  const { data, error, isLoading } = useSWR<Product[]>(
    `/products/featured?limit=${limit || 8}`,
    async () => {
      const response = await shopService.products.featured(limit)
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: false, dedupingInterval: 300000 },
  )

  return { products: data || [], isLoading, error }
}

export function useTrendingProducts(limit?: number) {
  const { data, error, isLoading } = useSWR<Product[]>(
    `/products/trending?limit=${limit || 8}`,
    async () => {
      const response = await shopService.products.trending(limit)
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: false, dedupingInterval: 300000 },
  )

  return { products: data || [], isLoading, error }
}

export function useCategories() {
  const { data, error, isLoading } = useSWR<Category[]>(
    "/products/categories",
    async () => {
      const response = await shopService.products.categories()
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: false, dedupingInterval: 3600000 },
  )

  return { categories: data || [], isLoading, error }
}

export function useProductSearch(query: string, filters?: ProductFilters) {
  const { data, error, isLoading } = useSWR<Product[]>(
    query ? `/products/search?q=${query}` : null,
    async () => {
      const response = await shopService.products.search(query, filters)
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: false },
  )

  return { results: data || [], isLoading, error }
}

export function useProductRecommendations(productId?: string) {
  const { data, error, isLoading } = useSWR<Product[]>(
    productId ? `/products/${productId}/recommendations` : null,
    async () => {
      const response = await shopService.products.recommendations({ product_id: productId, limit: 8 })
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: false },
  )

  return { recommendations: data || [], isLoading, error }
}
