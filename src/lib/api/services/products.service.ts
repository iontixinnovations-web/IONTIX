/**
 * Products Service
 * Product catalog and search integration with FastAPI
 */

import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"
import type { Database } from "../../database.types"

type Product = Database["public"]["Tables"]["products"]["Row"]

export interface ProductFilters {
  category?: string
  subcategory?: string
  gender?: "female" | "male" | "other"
  min_price?: number
  max_price?: number
  seller_id?: string
  tags?: string[]
  sort_by?: "newest" | "price_low" | "price_high" | "popular" | "rating"
  page?: number
  limit?: number
}

export interface ProductSearchParams {
  query: string
  filters?: ProductFilters
  use_ai?: boolean // Enable AI-powered search
}

export interface Category {
  id: string
  name: string
  slug: string
  image_url: string
  subcategories: { id: string; name: string; slug: string }[]
  product_count: number
}

/**
 * Products Service Methods
 */
export const productsService = {
  /**
   * Get paginated list of products
   */
  getProducts: async (filters?: ProductFilters) => {
    return apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.LIST, {
      params: {
        ...filters,
        tags: filters?.tags?.join(","),
      },
    })
  },

  /**
   * Get single product by ID
   */
  getProduct: async (productId: string) => {
    return apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(productId))
  },

  /**
   * Search products with optional AI
   */
  searchProducts: async (params: ProductSearchParams) => {
    return apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.SEARCH, {
      params: {
        q: params.query,
        use_ai: params.use_ai,
        ...params.filters,
        tags: params.filters?.tags?.join(","),
      },
    })
  },

  /**
   * Get all categories
   */
  getCategories: async () => {
    return apiClient.get<Category[]>(API_ENDPOINTS.PRODUCTS.CATEGORIES)
  },

  /**
   * Get product recommendations
   */
  getRecommendations: async (params?: {
    product_id?: string
    user_id?: string
    limit?: number
  }) => {
    return apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.RECOMMENDATIONS, {
      params,
    })
  },

  /**
   * Get featured products
   */
  getFeaturedProducts: async (limit?: number) => {
    return apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.FEATURED, {
      params: { limit },
    })
  },

  /**
   * Get products by seller
   */
  getSellerProducts: async (sellerId: string, filters?: ProductFilters) => {
    return apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.BY_SELLER(sellerId), {
      params: filters,
    })
  },
}

export default productsService
