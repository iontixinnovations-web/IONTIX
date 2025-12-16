"use client"

/**
 * Realtime Subscriptions Hook
 * Supabase Realtime for live updates
 */

import { useEffect, useCallback, useRef } from "react"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { supabase } from "../supabase"
import { useAuthStore, useNotificationStore, useOrderStore, useCartStore } from "../store"
import type { Database } from "../database.types"

type Order = Database["public"]["Tables"]["orders"]["Row"]
type Notification = Database["public"]["Tables"]["notifications"]["Row"]
type Message = Database["public"]["Tables"]["messages"]["Row"]
type CartItem = Database["public"]["Tables"]["cart"]["Row"]

/**
 * Hook for subscribing to order status updates
 */
export function useOrderUpdates(orderId?: string) {
  const { user } = useAuthStore()
  const { updateOrderStatus } = useOrderStore()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!user) return

    const filter = orderId ? `id=eq.${orderId}` : `buyer_id=eq.${user.id}`

    const channel = supabase
      .channel(`orders-${user.id}`)
      .on<Order>(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter,
        },
        (payload: RealtimePostgresChangesPayload<Order>) => {
          const newOrder = payload.new as Order
          if (newOrder) {
            updateOrderStatus(newOrder.id, newOrder.status)
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
  }, [user, orderId, updateOrderStatus])
}

/**
 * Hook for subscribing to notifications
 */
export function useNotificationUpdates() {
  const { user } = useAuthStore()
  const { addNotification, setNotifications } = useNotificationStore()
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (data) {
      setNotifications(data as Notification[])
    }
  }, [user, setNotifications])

  useEffect(() => {
    if (!user) return

    fetchNotifications()

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on<Notification>(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          const newNotification = payload.new as Notification
          if (newNotification) {
            addNotification(newNotification)

            // Show toast for new notification
            if (typeof window !== "undefined" && "Notification" in window) {
              if (Notification.permission === "granted") {
                new Notification(newNotification.title, {
                  body: newNotification.message,
                  icon: "/icons/notification.png",
                })
              }
            }
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
  }, [user, addNotification, fetchNotifications])

  return { refetch: fetchNotifications }
}

/**
 * Hook for subscribing to chat messages
 */
export function useChatMessages(chatId: string) {
  const { user } = useAuthStore()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const messagesRef = useRef<Message[]>([])
  const onMessageRef = useRef<((message: Message) => void) | null>(null)

  const subscribe = useCallback(
    (onMessage: (message: Message) => void) => {
      if (!user || !chatId) return

      onMessageRef.current = onMessage

      const channel = supabase
        .channel(`chat-${chatId}`)
        .on<Message>(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `chat_id=eq.${chatId}`,
          },
          (payload: RealtimePostgresChangesPayload<Message>) => {
            const newMessage = payload.new as Message
            if (newMessage && onMessageRef.current) {
              messagesRef.current = [...messagesRef.current, newMessage]
              onMessageRef.current(newMessage)
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
    },
    [user, chatId],
  )

  // Send typing indicator
  const sendTyping = useCallback(() => {
    if (!channelRef.current || !user) return

    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: user.id },
    })
  }, [user])

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  return { subscribe, sendTyping, messages: messagesRef.current }
}

/**
 * Hook for subscribing to cart updates (sync across tabs)
 */
export function useCartSync() {
  const { user } = useAuthStore()
  const { setItems } = useCartStore()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`cart-${user.id}`)
      .on<CartItem>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart",
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          // Refetch cart on any change
          const { data } = await supabase
            .from("cart")
            .select(
              `
            *,
            product:products(*)
          `,
            )
            .eq("user_id", user.id)

          if (data) {
            setItems(data as (CartItem & { product: unknown })[])
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
  }, [user, setItems])
}

/**
 * Hook for presence - online users in a room
 */
export function usePresence(roomId: string) {
  const { user } = useAuthStore()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const presenceRef = useRef<Map<string, { user_id: string; online_at: string }>>(new Map())

  const join = useCallback(
    (onSync: (users: Map<string, { user_id: string; online_at: string }>) => void) => {
      if (!user || !roomId) return

      const channel = supabase.channel(`presence-${roomId}`, {
        config: {
          presence: {
            key: user.id,
          },
        },
      })

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState()
          const users = new Map<string, { user_id: string; online_at: string }>()

          Object.entries(state).forEach(([key, value]) => {
            const presence = value[0] as { user_id: string; online_at: string }
            if (presence) {
              users.set(key, presence)
            }
          })

          presenceRef.current = users
          onSync(users)
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          const presence = newPresences[0] as { user_id: string; online_at: string }
          if (presence) {
            presenceRef.current.set(key, presence)
            onSync(new Map(presenceRef.current))
          }
        })
        .on("presence", { event: "leave" }, ({ key }) => {
          presenceRef.current.delete(key)
          onSync(new Map(presenceRef.current))
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            })
          }
        })

      channelRef.current = channel

      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current)
        }
      }
    },
    [user, roomId],
  )

  const leave = useCallback(async () => {
    if (channelRef.current) {
      await channelRef.current.untrack()
      await supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  return { join, leave, presence: presenceRef.current }
}

/**
 * Hook for seller order notifications
 */
export function useSellerOrderUpdates(sellerId?: string) {
  const { user } = useAuthStore()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const onNewOrderRef = useRef<((order: Order) => void) | null>(null)

  const subscribe = useCallback(
    (onNewOrder: (order: Order) => void) => {
      const id = sellerId || user?.id
      if (!id) return

      onNewOrderRef.current = onNewOrder

      const channel = supabase
        .channel(`seller-orders-${id}`)
        .on<Order>(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: `seller_id=eq.${id}`,
          },
          (payload: RealtimePostgresChangesPayload<Order>) => {
            const newOrder = payload.new as Order
            if (newOrder && onNewOrderRef.current) {
              onNewOrderRef.current(newOrder)

              // Play notification sound
              if (typeof window !== "undefined") {
                const audio = new Audio("/sounds/new-order.mp3")
                audio.play().catch(() => {
                  // Ignore autoplay errors
                })
              }
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
    },
    [user, sellerId],
  )

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  return { subscribe }
}

/**
 * Master hook for initializing all realtime subscriptions
 */
export function useRealtimeInit() {
  const { user } = useAuthStore()

  useOrderUpdates()
  useNotificationUpdates()
  useCartSync()

  useEffect(() => {
    if (user && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [user])
}
