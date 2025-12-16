/**
 * Chat Service
 * AI Stylist, Community, and Vendor DM integration
 */

import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"
import type { Database } from "../../database.types"

type Chat = Database["public"]["Tables"]["chats"]["Row"]
type Message = Database["public"]["Tables"]["messages"]["Row"]

export interface SendMessageData {
  content: string
  message_type?: "text" | "image" | "product" | "order"
  attachments?: {
    type: string
    url: string
    metadata?: Record<string, unknown>
  }[]
}

export interface AIStylistMessage {
  role: "user" | "assistant"
  content: string
  products?: {
    id: string
    name: string
    image: string
    price: number
  }[]
  action?: {
    type: "view_product" | "add_to_cart" | "try_on"
    product_id: string
  }
}

/**
 * Chat Service Methods
 */
export const chatService = {
  /**
   * Get user's chats
   */
  getChats: async (type?: Chat["chat_type"]) => {
    return apiClient.get<Chat[]>(API_ENDPOINTS.CHAT.LIST, {
      params: { type },
    })
  },

  /**
   * Get single chat
   */
  getChat: async (chatId: string) => {
    return apiClient.get<Chat>(API_ENDPOINTS.CHAT.DETAIL(chatId))
  },

  /**
   * Get chat messages
   */
  getMessages: async (chatId: string, params?: { before?: string; limit?: number }) => {
    return apiClient.get<Message[]>(API_ENDPOINTS.CHAT.MESSAGES(chatId), {
      params,
    })
  },

  /**
   * Send message
   */
  sendMessage: async (chatId: string, data: SendMessageData) => {
    return apiClient.post<Message>(API_ENDPOINTS.CHAT.MESSAGES(chatId), data)
  },

  /**
   * Chat with AI Stylist
   */
  sendToAIStylist: async (
    message: string,
    context?: {
      skin_analysis_id?: string
      product_ids?: string[]
      preferences?: Record<string, unknown>
    },
  ) => {
    return apiClient.post<AIStylistMessage>(API_ENDPOINTS.CHAT.AI_STYLIST, {
      message,
      context,
    })
  },

  /**
   * Start vendor DM
   */
  startVendorChat: async (vendorId: string, initialMessage?: string) => {
    return apiClient.post<Chat>(API_ENDPOINTS.CHAT.VENDOR_DM, {
      vendor_id: vendorId,
      message: initialMessage,
    })
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (chatId: string) => {
    return apiClient.patch<void>(`${API_ENDPOINTS.CHAT.DETAIL(chatId)}/read`)
  },
}

export default chatService
