"use client"
import useSWR from "swr"
import { searchService, type SearchSuggestion } from "@/lib/api"

export function useSearch(query: string) {
  const { data, error, isLoading } = useSWR(
    query ? `/search?q=${query}` : null,
    async () => {
      const response = await searchService.globalSearch(query, { limit_per_type: 10 })
      if (!response.success) throw new Error(response.error)
      return response.data!
    },
    { revalidateOnFocus: false },
  )

  return {
    results: data,
    isLoading,
    error,
  }
}

export function useProductSearch(
  query: string,
  filters?: { category?: string; min_price?: number; max_price?: number },
) {
  const { data, error, isLoading } = useSWR(
    query ? `/search/products?q=${query}` : null,
    async () => {
      const response = await searchService.searchProducts(query, filters)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    { revalidateOnFocus: false },
  )

  return {
    products: data?.hits || [],
    total: data?.total || 0,
    isLoading,
    error,
  }
}

export function useSearchSuggestions(query: string) {
  const { data, error, isLoading } = useSWR<SearchSuggestion[]>(
    query && query.length >= 2 ? `/search/suggestions?q=${query}` : null,
    async () => {
      const response = await searchService.getSuggestions(query)
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: false, dedupingInterval: 300 },
  )

  return { suggestions: data || [], isLoading, error }
}
