"use client"

/**
 * Chat Hook
 * AI Stylist, Community, and Vendor DM
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuthStore } from "../store"
import { chatService, type SendMessageData, type AIStylistMessage } from "../api"
import { supabase } from "../supabase"
import { toast } from "sonner"
import type { Database } from "../database.types"
import { ENV } from "../env"

type Chat = Database["public"]["Tables"]["chats"]["Row"]
type Message = Database["public"]["Tables"]["messages"]["Row"]

export function useChats(type?: Chat["chat_type"]) {
  const { user } = useAuthStore()
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchChats = useCallback(async () => {
    if (!user) return { success: false, error: "Not authenticated" }

    try {
      setIsLoading(true)
      setError(null)

      // Try FastAPI first
      try {
        const response = await chatService.getChats(type)
        if (response.success && response.data) {
          setChats(response.data)
          return { success: true, data: response.data }
        }
      } catch {
        // Fallback to Supabase
        let query = supabase
          .from("chats")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("last_message_at", { ascending: false })

        if (type) {
          query = query.eq("chat_type", type)
        }

        const { data, error: supabaseError } = await query

        if (supabaseError) throw supabaseError

        if (data) {
          setChats(data as Chat[])
          return { success: true, data }
        }
      }

      return { success: false, error: "Failed to fetch chats" }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch chats"
      console.error("Fetch chats error:", err)
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [user, type])

  useEffect(() => {
    if (user) {
      fetchChats()
    }
  }, [user, fetchChats])

  return {
    chats,
    isLoading,
    error,
    refetch: fetchChats,
  }
}

export function useChatMessages(chatId: string) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchMessages = useCallback(
    async (before?: string) => {
      if (!chatId) return { success: false, error: "No chat ID" }

      try {
        setIsLoading(true)
        setError(null)

        // Try FastAPI first
        try {
          const response = await chatService.getMessages(chatId, { before, limit: 50 })
          if (response.success && response.data) {
            if (before) {
              setMessages((prev) => [...response.data!, ...prev])
            } else {
              setMessages(response.data)
            }
            setHasMore(response.data.length === 50)
            return { success: true, data: response.data }
          }
        } catch {
          // Fallback to Supabase
          let query = supabase
            .from("messages")
            .select("*")
            .eq("chat_id", chatId)
            .order("created_at", { ascending: false })
            .limit(50)

          if (before) {
            query = query.lt("created_at", before)
          }

          const { data, error: supabaseError } = await query

          if (supabaseError) throw supabaseError

          if (data) {
            const sortedMessages = (data as Message[]).reverse()
            if (before) {
              setMessages((prev) => [...sortedMessages, ...prev])
            } else {
              setMessages(sortedMessages)
            }
            setHasMore(data.length === 50)
            return { success: true, data: sortedMessages }
          }
        }

        return { success: false, error: "Failed to fetch messages" }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch messages"
        console.error("Fetch messages error:", err)
        setError(message)
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
      }
    },
    [chatId],
  )

  // Subscribe to new messages
  useEffect(() => {
    if (!chatId) return

    fetchMessages()

    const channel = supabase
      .channel(`messages-${chatId}`)
      .on<Message>(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          if (newMessage) {
            setMessages((prev) => [...prev, newMessage])
          }
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [chatId, fetchMessages])

  const sendMessage = useCallback(
    async (data: SendMessageData) => {
      if (!user || !chatId) {
        return { success: false, error: "Invalid request" }
      }

      try {
        const response = await chatService.sendMessage(chatId, data)

        if (response.success && response.data) {
          // Message will be added via realtime subscription
          return { success: true, data: response.data }
        }

        // Fallback to direct insert
        const { data: newMessage, error: insertError } = await supabase
          .from("messages")
          .insert({
            chat_id: chatId,
            sender_id: user.id,
            content: data.content,
            message_type: data.message_type || "text",
            attachments: data.attachments,
          })
          .select()
          .single()

        if (insertError) throw insertError

        return { success: true, data: newMessage as Message }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send message"
        toast.error(message)
        return { success: false, error: message }
      }
    },
    [user, chatId],
  )

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && messages.length > 0) {
      const oldestMessage = messages[0]
      fetchMessages(oldestMessage.created_at)
    }
  }, [isLoading, hasMore, messages, fetchMessages])

  return {
    messages,
    isLoading,
    hasMore,
    error,
    sendMessage,
    loadMore,
    refetch: () => fetchMessages(),
  }
}

export function useAIStylist() {
  const { user } = useAuthStore()
  const [conversation, setConversation] = useState<AIStylistMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (
      message: string,
      context?: {
        skin_analysis_id?: string
        product_ids?: string[]
        preferences?: Record<string, unknown>
      },
    ) => {
      if (!ENV.ENABLE_CHAT) {
        toast.info("Chat feature is currently disabled")
        return { success: false, error: "Chat disabled" }
      }

      try {
        setIsThinking(true)
        setError(null)

        // Add user message to conversation
        const userMessage: AIStylistMessage = { role: "user", content: message }
        setConversation((prev) => [...prev, userMessage])

        const response = await chatService.sendToAIStylist(message, context)

        if (response.success && response.data) {
          setConversation((prev) => [...prev, response.data!])
          return { success: true, data: response.data }
        }

        return { success: false, error: response.error }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "AI Stylist unavailable"
        console.error("AI Stylist error:", err)
        setError(errorMessage)

        // Add error message to conversation
        setConversation((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I'm having trouble connecting. Please try again in a moment.",
          },
        ])

        return { success: false, error: errorMessage }
      } finally {
        setIsThinking(false)
      }
    },
    [],
  )

  const clearConversation = useCallback(() => {
    setConversation([])
    setError(null)
  }, [])

  return {
    conversation,
    isThinking,
    error,
    sendMessage,
    clearConversation,
  }
}

export function useVendorChat() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const startChat = useCallback(
    async (vendorId: string, initialMessage?: string) => {
      if (!user) {
        toast.error("Please sign in to message vendors")
        return { success: false, error: "Not authenticated" }
      }

      try {
        setIsLoading(true)

        const response = await chatService.startVendorChat(vendorId, initialMessage)

        if (response.success && response.data) {
          return { success: true, chat: response.data }
        }

        return { success: false, error: response.error }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to start chat"
        toast.error(message)
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  return {
    startChat,
    isLoading,
  }
}
