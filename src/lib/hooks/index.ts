/**
 * Hooks Index
 * Export all custom hooks
 */

// Auth
export { useAuth } from "./useAuth"

// Products
export { useProducts, useProduct, useSearchProducts, useRecommendations } from "./useProducts"

// Cart
export { useCart } from "./useCart"

// Orders
export { useOrders, useOrder, useCreateOrder, useOrderTracking } from "./useOrders"

// Payments
export { usePayments, usePaymentMethods, useUPIPayment } from "./usePayments"

// AI Features
export { useSkinAnalysis, useARTryOn, useStyleRecommendations, usePersonalizedFeed, useVisualSearch } from "./useAI"

// Realtime
export {
  useOrderUpdates,
  useNotificationUpdates,
  useChatMessages as useRealtimeChatMessages,
  useCartSync,
  usePresence,
  useSellerOrderUpdates,
  useRealtimeInit,
} from "./useRealtime"

// Reels
export { useReels, useForYouFeed, useReelInteractions, useReelComments, useCreateReel } from "./useReels"

// Chat
export { useChats, useChatMessages, useAIStylist, useVendorChat } from "./useChat"
