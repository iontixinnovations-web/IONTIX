"use client"

/**
 * Chat Hook
 * Messaging with vendors and AI stylist
 */

import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { chatService, type Chat, type ChatMessage, type SendMessageData } from "@/lib/api"
import { toast } from "sonner"

export function useChats() {
  const { data, error, isLoading, mutate } = useSWR<Chat[]>(
    "/chats",
    async () => {
      const response = await chatService.list()
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: true },
  )

  return { chats: data || [], isLoading, error, refetch: mutate }
}

export function useChatMessages(chatId: string) {
  const { data, error, isLoading, mutate } = useSWR<ChatMessage[]>(
    chatId ? `/chats/${chatId}/messages` : null,
    async () => {
      const response = await chatService.getMessages(chatId, { limit: 50 })
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: true, refreshInterval: 5000 },
  )

  // Send message
  const send = useSWRMutation(
    `/chats/${chatId}/messages`,
    async (_, { arg }: { arg: SendMessageData }) => {
      const response = await chatService.sendMessage(chatId, arg)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => mutate(),
      onError: (err) => toast.error(err.message || "Failed to send message"),
    },
  )

  // Mark as read
  const markRead = useSWRMutation(`/chats/${chatId}/read`, async () => {
    await chatService.markAsRead(chatId)
  })

  return {
    messages: data || [],
    isLoading,
    error,
    send: send.trigger,
    isSending: send.isMutating,
    markRead: markRead.trigger,
    refetch: mutate,
  }
}

export function useCreateVendorChat() {
  const create = useSWRMutation(
    "/chats/vendor",
    async (_, { arg }: { arg: string }) => {
      const response = await chatService.createVendorChat(arg)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onError: (err) => toast.error(err.message || "Failed to start chat"),
    },
  )

  return {
    createChat: create.trigger,
    isCreating: create.isMutating,
    chat: create.data,
    error: create.error,
  }
}
