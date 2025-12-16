/**
 * API Module Exports
 * MITHAS GLOW - Centralized API access
 */

// Core client and config
export { apiClient, type ApiResponse, type ApiError } from "./client"
export { API_CONFIG, API_ENDPOINTS, getApiUrl, isApiConfigured } from "./config"

// Services
export { aiService } from "./services/ai.service"
export { productsService } from "./services/products.service"
export { ordersService } from "./services/orders.service"
export { paymentsService } from "./services/payments.service"
export { reelsService } from "./services/reels.service"
export { chatService } from "./services/chat.service"
export { sellerService } from "./services/seller.service"

// Re-export types
export type {
  SkinAnalysisResult,
  ARTryOnResult,
  StyleRecommendation,
  PersonalizedFeedItem,
  ProductRecommendation,
} from "./services/ai.service"

export type {
  ProductFilters,
  ProductSearchParams,
  Category,
} from "./services/products.service"

export type {
  CreateOrderData,
  OrderTrackingInfo,
  OrderFilters,
} from "./services/orders.service"

export type {
  PaymentOrder,
  PaymentVerification,
  PaymentMethod,
  UPIIntentData,
} from "./services/payments.service"

export type {
  ReelFilters,
  CreateReelData,
  ReelComment,
} from "./services/reels.service"

export type {
  SendMessageData,
  AIStylistMessage,
} from "./services/chat.service"

export type {
  SellerAnalytics,
  WalletInfo,
  CreateProductData,
} from "./services/seller.service"
