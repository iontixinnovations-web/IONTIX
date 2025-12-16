/**
 * Zustand Chat Store - Glow Chat with Supabase Realtime
 * Messaging with vendors and AI stylist
 */

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { chatService, type Chat, type ChatMessage } from "@/lib/api"
import { realtimeService } from "@/lib/services/realtime.service"

interface ChatState {
  // Chat list
  chats: Chat[]
  activeChat: Chat | null
  activeChatId: string | null

  // Messages
  messages: ChatMessage[]
  isTyping: boolean

  // Loading states
  isLoading: boolean
  isSending: boolean
  isLoadingMessages: boolean

  // Realtime
  realtimeSubscribed: boolean

  // Actions
  fetchChats: () => Promise<void>
  selectChat: (chatId: string) => Promise<void>
  sendMessage: (content: string, type?: "text" | "image" | "product") => Promise<void>
  markAsRead: (chatId: string) => Promise<void>
  createVendorChat: (vendorId: string) => Promise<Chat | null>
  sendToAIStylist: (message: string) => Promise<ChatMessage | null>
  subscribeToRealtime: (chatId: string) => void
  unsubscribeFromRealtime: () => void
  addMessage: (message: ChatMessage) => void
  updateUnreadCount: (chatId: string, count: number) => void
  setTyping: (isTyping: boolean) => void
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => {
      let unsubscribe: (() => void) | null = null

      return {
        // Initial State
        chats: [],
        activeChat: null,
        activeChatId: null,
        messages: [],
        isTyping: false,
        isLoading: false,
        isSending: false,
        isLoadingMessages: false,
        realtimeSubscribed: false,

        // Fetch all chats
        fetchChats: async () => {
          set({ isLoading: true })
          try {
            const response = await chatService.list()
            if (response.success && response.data) {
              set({ chats: response.data })
            }
          } catch (error) {
            console.error("[Chat] Fetch chats failed:", error)
          } finally {
            set({ isLoading: false })
          }
        },

        // Select and load chat messages
        selectChat: async (chatId) => {
          set({ isLoadingMessages: true, activeChatId: chatId })

          // Unsubscribe from previous chat
          if (unsubscribe) {
            unsubscribe()
            unsubscribe = null
          }

          try {
            // Fetch chat details and messages
            const [chatResponse, messagesResponse] = await Promise.all([
              chatService.get(chatId),
              chatService.getMessages(chatId, { limit: 50 }),
            ])

            if (chatResponse.success && chatResponse.data) {
              set({ activeChat: chatResponse.data })
            }

            if (messagesResponse.success && messagesResponse.data) {
              set({ messages: messagesResponse.data })
            }

            // Subscribe to realtime updates
            get().subscribeToRealtime(chatId)

            // Mark as read
            get().markAsRead(chatId)
          } catch (error) {
            console.error("[Chat] Select chat failed:", error)
          } finally {
            set({ isLoadingMessages: false })
          }
        },

        // Send message
        sendMessage: async (content, type = "text") => {
          const { activeChatId } = get()
          if (!activeChatId) return

          set({ isSending: true })
          try {
            const response = await chatService.sendMessage(activeChatId, {
              content,
              message_type: type,
            })

            if (response.success && response.data) {
              // Message will be added via realtime subscription
              // But add optimistically if needed
              get().addMessage(response.data)
            }
          } catch (error) {
            console.error("[Chat] Send message failed:", error)
          } finally {
            set({ isSending: false })
          }
        },

        // Mark chat as read
        markAsRead: async (chatId) => {
          try {
            await chatService.markAsRead(chatId)
            get().updateUnreadCount(chatId, 0)
          } catch (error) {
            console.error("[Chat] Mark as read failed:", error)
          }
        },

        // Create vendor chat
        createVendorChat: async (vendorId) => {
          set({ isLoading: true })
          try {
            const response = await chatService.createVendorChat(vendorId)
            if (response.success && response.data) {
              // Add to chats list
              set((state) => ({
                chats: [response.data!, ...state.chats],
              }))
              return response.data
            }
            return null
          } catch (error) {
            console.error("[Chat] Create vendor chat failed:", error)
            return null
          } finally {
            set({ isLoading: false })
          }
        },

        // Send to AI Stylist
        sendToAIStylist: async (message) => {
          set({ isSending: true })
          try {
            const response = await chatService.aiStylist(message)
            if (response.success && response.data) {
              return response.data
            }
            return null
          } catch (error) {
            console.error("[Chat] AI Stylist failed:", error)
            return null
          } finally {
            set({ isSending: false })
          }
        },

        // Subscribe to Supabase Realtime for chat
        subscribeToRealtime: (chatId) => {
          unsubscribe = realtimeService.subscribeToChatRoom(chatId, (message) => {
            get().addMessage(message as unknown as ChatMessage)
          })
          set({ realtimeSubscribed: true })
        },

        // Unsubscribe from realtime
        unsubscribeFromRealtime: () => {
          if (unsubscribe) {
            unsubscribe()
            unsubscribe = null
          }
          set({ realtimeSubscribed: false })
        },

        // Add message to state
        addMessage: (message) => {
          set((state) => {
            // Avoid duplicates
            if (state.messages.some((m) => m.id === message.id)) {
              return state
            }
            return { messages: [...state.messages, message] }
          })
        },

        // Update unread count
        updateUnreadCount: (chatId, count) => {
          set((state) => ({
            chats: state.chats.map((chat) => (chat.id === chatId ? { ...chat, unread_count: count } : chat)),
          }))
        },

        // Set typing indicator
        setTyping: (isTyping) => {
          set({ isTyping })
        },
      }
    },
    { name: "ChatStore" },
  ),
)
