/**
 * Seller Service
 * Seller dashboard and management integration
 */

import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"
import type { Database } from "../../database.types"

type Seller = Database["public"]["Tables"]["sellers"]["Row"]
type Product = Database["public"]["Tables"]["products"]["Row"]
type Order = Database["public"]["Tables"]["orders"]["Row"]

export interface SellerAnalytics {
  period: "day" | "week" | "month" | "year"
  revenue: number
  orders: number
  views: number
  conversion_rate: number
  top_products: {
    product_id: string
    name: string
    sales: number
    revenue: number
  }[]
  daily_stats: {
    date: string
    revenue: number
    orders: number
    views: number
  }[]
}

export interface WalletInfo {
  balance: number
  pending: number
  currency: string
  transactions: {
    id: string
    type: "credit" | "debit" | "withdrawal"
    amount: number
    description: string
    status: string
    created_at: string
  }[]
}

export interface CreateProductData {
  name: string
  description?: string
  category: string
  subcategory?: string
  gender?: "female" | "male" | "other"
  price: number
  original_price?: number
  stock: number
  sku?: string
  images: string[]
  video_url?: string
  tags?: string[]
  is_draft?: boolean
}

/**
 * Seller Service Methods
 */
export const sellerService = {
  /**
   * Get seller profile
   */
  getProfile: async (sellerId: string) => {
    return apiClient.get<Seller>(API_ENDPOINTS.SELLERS.PROFILE(sellerId))
  },

  /**
   * Get seller dashboard data
   */
  getDashboard: async () => {
    return apiClient.get<{
      seller: Seller
      todayStats: {
        revenue: number
        orders: number
        views: number
      }
      recentOrders: Order[]
      lowStockProducts: Product[]
    }>(API_ENDPOINTS.SELLERS.DASHBOARD)
  },

  /**
   * Get seller analytics
   */
  getAnalytics: async (period?: "day" | "week" | "month" | "year") => {
    return apiClient.get<SellerAnalytics>(API_ENDPOINTS.SELLERS.ANALYTICS, {
      params: { period },
    })
  },

  /**
   * Get seller's products
   */
  getProducts: async (params?: {
    status?: "active" | "draft" | "out_of_stock"
    page?: number
    limit?: number
  }) => {
    return apiClient.get<Product[]>(API_ENDPOINTS.SELLERS.PRODUCTS, {
      params,
    })
  },

  /**
   * Create new product
   */
  createProduct: async (data: CreateProductData) => {
    return apiClient.post<Product>(API_ENDPOINTS.SELLERS.PRODUCTS, data)
  },

  /**
   * Update product
   */
  updateProduct: async (productId: string, data: Partial<CreateProductData>) => {
    return apiClient.patch<Product>(`${API_ENDPOINTS.SELLERS.PRODUCTS}/${productId}`, data)
  },

  /**
   * Delete product
   */
  deleteProduct: async (productId: string) => {
    return apiClient.delete(`${API_ENDPOINTS.SELLERS.PRODUCTS}/${productId}`)
  },

  /**
   * Upload product images
   */
  uploadProductImages: async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file)
    })

    return apiClient.upload<{ urls: string[] }>(`${API_ENDPOINTS.SELLERS.PRODUCTS}/upload-images`, formData)
  },

  /**
   * Get seller orders
   */
  getOrders: async (params?: {
    status?: Order["status"]
    page?: number
    limit?: number
  }) => {
    return apiClient.get<Order[]>(API_ENDPOINTS.SELLERS.ORDERS, {
      params,
    })
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (
    orderId: string,
    data: {
      status: Order["status"]
      tracking_number?: string
      notes?: string
    },
  ) => {
    return apiClient.patch<Order>(`${API_ENDPOINTS.SELLERS.ORDERS}/${orderId}`, data)
  },

  /**
   * Get wallet info
   */
  getWallet: async () => {
    return apiClient.get<WalletInfo>(API_ENDPOINTS.SELLERS.WALLET)
  },

  /**
   * Request withdrawal
   */
  requestWithdrawal: async (amount: number) => {
    return apiClient.post<{ withdrawal_id: string; status: string }>(`${API_ENDPOINTS.SELLERS.WALLET}/withdraw`, {
      amount,
    })
  },
}

export default sellerService
