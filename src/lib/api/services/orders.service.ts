/**
 * Orders Service
 * Order management and tracking integration
 */

import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"
import type { Database } from "../../database.types"

type Order = Database["public"]["Tables"]["orders"]["Row"]

export interface CreateOrderData {
  items: {
    product_id: string
    variant_id?: string
    quantity: number
  }[]
  shipping_address_id: string
  billing_address_id?: string
  payment_method: string
  coupon_code?: string
  customer_notes?: string
}

export interface OrderTrackingInfo {
  order_id: string
  status: Order["status"]
  tracking_number: string | null
  carrier: string | null
  estimated_delivery: string | null
  timeline: {
    status: string
    timestamp: string
    location?: string
    description: string
  }[]
}

export interface OrderFilters {
  status?: Order["status"]
  from_date?: string
  to_date?: string
  page?: number
  limit?: number
}

/**
 * Orders Service Methods
 */
export const ordersService = {
  /**
   * Get user's orders
   */
  getOrders: async (filters?: OrderFilters) => {
    return apiClient.get<Order[]>(API_ENDPOINTS.ORDERS.LIST, {
      params: filters,
    })
  },

  /**
   * Get single order details
   */
  getOrder: async (orderId: string) => {
    return apiClient.get<Order>(API_ENDPOINTS.ORDERS.DETAIL(orderId))
  },

  /**
   * Create new order
   */
  createOrder: async (data: CreateOrderData) => {
    return apiClient.post<Order>(API_ENDPOINTS.ORDERS.CREATE, data)
  },

  /**
   * Cancel an order
   */
  cancelOrder: async (orderId: string, reason: string) => {
    return apiClient.post<Order>(API_ENDPOINTS.ORDERS.CANCEL(orderId), {
      cancellation_reason: reason,
    })
  },

  /**
   * Track order
   */
  trackOrder: async (orderId: string) => {
    return apiClient.get<OrderTrackingInfo>(API_ENDPOINTS.ORDERS.TRACK(orderId))
  },
}

export default ordersService
