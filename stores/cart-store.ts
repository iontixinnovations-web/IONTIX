/**
 * Zustand Cart Store - E-commerce Cart State
 * Persistent shopping cart with sync to backend
 */

import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { shopService } from "@/lib/api"

// Types
interface CartItem {
  id: string
  product_id: string
  product: {
    id: string
    name: string
    price: number
    images: string[]
    seller_id: string
    seller_name: string
  }
  variant_id?: string
  variant?: {
    id: string
    name: string
    price_modifier: number
  }
  quantity: number
  added_at: string
}

interface CartState {
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  couponCode: string | null
  isLoading: boolean
  isSyncing: boolean
  lastSyncedAt: string | null

  // Actions
  addItem: (item: Omit<CartItem, "id" | "added_at">) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  applyCoupon: (code: string) => Promise<boolean>
  removeCoupon: () => void
  syncWithBackend: () => Promise<void>
  setItems: (items: CartItem[]) => void
  calculateTotals: () => void
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
        couponCode: null,
        isLoading: false,
        isSyncing: false,
        lastSyncedAt: null,

        // Add item to cart
        addItem: async (item) => {
          set({ isLoading: true })
          try {
            // Optimistic update
            const newItem: CartItem = {
              ...item,
              id: `temp-${Date.now()}`,
              added_at: new Date().toISOString(),
            }

            set((state) => {
              const existingIndex = state.items.findIndex(
                (i) => i.product_id === item.product_id && i.variant_id === item.variant_id,
              )

              if (existingIndex >= 0) {
                const updatedItems = [...state.items]
                updatedItems[existingIndex].quantity += item.quantity
                return { items: updatedItems }
              }

              return { items: [...state.items, newItem] }
            })

            get().calculateTotals()

            // Sync with backend
            const response = await shopService.cart.addItem({
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
            })

            if (response.success && response.data) {
              set({ items: response.data.items })
              get().calculateTotals()
            }
          } catch (error) {
            console.error("[Cart] Add item failed:", error)
          } finally {
            set({ isLoading: false })
          }
        },

        // Update item quantity
        updateQuantity: async (itemId, quantity) => {
          set({ isLoading: true })
          try {
            // Optimistic update
            set((state) => ({
              items: state.items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
            }))
            get().calculateTotals()

            // Sync with backend
            await shopService.cart.updateItem(itemId, quantity)
          } catch (error) {
            console.error("[Cart] Update quantity failed:", error)
            // Revert on error
            get().syncWithBackend()
          } finally {
            set({ isLoading: false })
          }
        },

        // Remove item from cart
        removeItem: async (itemId) => {
          set({ isLoading: true })
          try {
            // Optimistic update
            set((state) => ({
              items: state.items.filter((item) => item.id !== itemId),
            }))
            get().calculateTotals()

            // Sync with backend
            await shopService.cart.removeItem(itemId)
          } catch (error) {
            console.error("[Cart] Remove item failed:", error)
            get().syncWithBackend()
          } finally {
            set({ isLoading: false })
          }
        },

        // Clear entire cart
        clearCart: async () => {
          set({ isLoading: true })
          try {
            set({
              items: [],
              subtotal: 0,
              discount: 0,
              total: 0,
              couponCode: null,
            })

            await shopService.cart.clear()
          } catch (error) {
            console.error("[Cart] Clear cart failed:", error)
          } finally {
            set({ isLoading: false })
          }
        },

        // Apply coupon code
        applyCoupon: async (code) => {
          set({ isLoading: true })
          try {
            const response = await shopService.cart.applyCoupon(code)
            if (response.success && response.data) {
              set({
                couponCode: code,
                discount: response.data.discount || 0,
              })
              get().calculateTotals()
              return true
            }
            return false
          } catch (error) {
            console.error("[Cart] Apply coupon failed:", error)
            return false
          } finally {
            set({ isLoading: false })
          }
        },

        // Remove coupon
        removeCoupon: () => {
          set({ couponCode: null, discount: 0 })
          get().calculateTotals()
        },

        // Sync cart with backend
        syncWithBackend: async () => {
          set({ isSyncing: true })
          try {
            const response = await shopService.cart.get()
            if (response.success && response.data) {
              set({
                items: response.data.items,
                subtotal: response.data.subtotal,
                discount: response.data.discount || 0,
                total: response.data.total,
                couponCode: response.data.coupon_code || null,
                lastSyncedAt: new Date().toISOString(),
              })
            }
          } catch (error) {
            console.error("[Cart] Sync failed:", error)
          } finally {
            set({ isSyncing: false })
          }
        },

        // Set items directly
        setItems: (items) => {
          set({ items })
          get().calculateTotals()
        },

        // Calculate totals
        calculateTotals: () => {
          const { items, discount } = get()
          const subtotal = items.reduce((sum, item) => {
            const price = item.product.price + (item.variant?.price_modifier || 0)
            return sum + price * item.quantity
          }, 0)
          const total = Math.max(0, subtotal - discount)
          set({ subtotal, total })
        },
      }),
      {
        name: "mithas-cart-store",
        partialize: (state) => ({
          items: state.items,
          couponCode: state.couponCode,
        }),
      },
    ),
    { name: "CartStore" },
  ),
)
