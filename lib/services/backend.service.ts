// Layer 3: Backend Core Service
// FastAPI Gateway - Main brain of MITHAS GLOW

import { appConfig } from "@/lib/config"

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  body?: unknown
  headers?: Record<string, string>
  token?: string
}

class BackendService {
  private baseUrl: string

  constructor() {
    this.baseUrl = appConfig.api.baseUrl
  }

  private getUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    return `${this.baseUrl}/api/${appConfig.api.version}${cleanEndpoint}`
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, token } = options

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    }

    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(this.getUrl(endpoint), {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Glow Shop APIs
  shop = {
    getProducts: (params?: { category?: string; limit?: number; offset?: number }) =>
      this.request<{ products: Product[]; total: number }>("/shop/products", { body: params }),

    getProduct: (id: string) => this.request<Product>(`/shop/products/${id}`),

    getCategories: () => this.request<{ categories: Category[] }>("/shop/categories"),

    searchProducts: (query: string, filters?: ProductFilters) =>
      this.request<{ products: Product[]; total: number }>("/shop/search", {
        method: "POST",
        body: { query, filters },
      }),
  }

  // Glow Reels APIs
  reels = {
    getFeed: (params?: { limit?: number; cursor?: string }) =>
      this.request<{ reels: Reel[]; nextCursor: string | null }>("/reels/feed", { body: params }),

    getReel: (id: string) => this.request<Reel>(`/reels/${id}`),

    uploadReel: (data: ReelUploadData, token: string) =>
      this.request<Reel>("/reels/upload", { method: "POST", body: data, token }),

    likeReel: (reelId: string, token: string) =>
      this.request<{ liked: boolean; likesCount: number }>(`/reels/${reelId}/like`, { method: "POST", token }),

    commentOnReel: (reelId: string, content: string, token: string) =>
      this.request<Comment>(`/reels/${reelId}/comments`, { method: "POST", body: { content }, token }),
  }

  // Booking APIs (Google Calendar integration)
  booking = {
    getSalons: (params?: { lat?: number; lng?: number; radius?: number }) =>
      this.request<{ salons: Salon[] }>("/booking/salons", { body: params }),

    getSalonServices: (salonId: string) => this.request<{ services: Service[] }>(`/booking/salons/${salonId}/services`),

    getAvailableSlots: (salonId: string, serviceId: string, date: string) =>
      this.request<{ slots: TimeSlot[] }>(`/booking/salons/${salonId}/slots`, {
        body: { service_id: serviceId, date },
      }),

    createBooking: (data: BookingData, token: string) =>
      this.request<Booking>("/booking/create", { method: "POST", body: data, token }),

    getMyBookings: (token: string) => this.request<{ bookings: Booking[] }>("/booking/my-bookings", { token }),

    cancelBooking: (bookingId: string, token: string) =>
      this.request<{ cancelled: boolean }>(`/booking/${bookingId}/cancel`, { method: "POST", token }),
  }

  // Geo APIs (PostGIS)
  geo = {
    nearbySalons: (lat: number, lng: number, radiusKm = 10) =>
      this.request<{ salons: SalonWithDistance[] }>("/geo/nearby-salons", {
        body: { lat, lng, radius_km: radiusKm },
      }),

    nearbyDeals: (lat: number, lng: number, radiusKm = 10) =>
      this.request<{ deals: Deal[] }>("/geo/nearby-deals", {
        body: { lat, lng, radius_km: radiusKm },
      }),

    getDirections: (fromLat: number, fromLng: number, toLat: number, toLng: number) =>
      this.request<{ route: RouteInfo }>("/geo/directions", {
        body: { from_lat: fromLat, from_lng: fromLng, to_lat: toLat, to_lng: toLng },
      }),
  }

  // Wallet APIs (GlowPay)
  wallet = {
    getBalance: (token: string) => this.request<{ balance: number; currency: string }>("/wallet/balance", { token }),

    getTransactions: (token: string, params?: { limit?: number; offset?: number }) =>
      this.request<{ transactions: WalletTransaction[]; total: number }>("/wallet/transactions", {
        body: params,
        token,
      }),

    addFunds: (amount: number, token: string) =>
      this.request<{ orderId: string }>("/wallet/add-funds", { method: "POST", body: { amount }, token }),

    pay: (amount: number, description: string, token: string) =>
      this.request<{ transactionId: string; newBalance: number }>("/wallet/pay", {
        method: "POST",
        body: { amount, description },
        token,
      }),

    requestPayout: (amount: number, bankAccount: BankAccount, token: string) =>
      this.request<{ payoutId: string; status: string }>("/wallet/payout", {
        method: "POST",
        body: { amount, bank_account: bankAccount },
        token,
      }),
  }

  // User APIs
  users = {
    getProfile: (token: string) => this.request<UserProfile>("/users/profile", { token }),

    updateProfile: (data: Partial<UserProfile>, token: string) =>
      this.request<UserProfile>("/users/profile", { method: "PUT", body: data, token }),

    getFollowers: (userId: string) => this.request<{ followers: UserPreview[] }>(`/users/${userId}/followers`),

    getFollowing: (userId: string) => this.request<{ following: UserPreview[] }>(`/users/${userId}/following`),

    follow: (userId: string, token: string) =>
      this.request<{ following: boolean }>(`/users/${userId}/follow`, { method: "POST", token }),
  }

  // Seller APIs
  sellers = {
    getDashboard: (token: string) => this.request<SellerDashboard>("/sellers/dashboard", { token }),

    getProducts: (token: string) => this.request<{ products: Product[] }>("/sellers/products", { token }),

    addProduct: (data: ProductData, token: string) =>
      this.request<Product>("/sellers/products", { method: "POST", body: data, token }),

    updateProduct: (productId: string, data: Partial<ProductData>, token: string) =>
      this.request<Product>(`/sellers/products/${productId}`, { method: "PUT", body: data, token }),

    getOrders: (token: string, status?: string) =>
      this.request<{ orders: Order[] }>("/sellers/orders", { body: { status }, token }),

    updateOrderStatus: (orderId: string, status: string, token: string) =>
      this.request<Order>(`/sellers/orders/${orderId}/status`, { method: "PUT", body: { status }, token }),
  }
}

// Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  seller_id: string
  rating: number
  reviews_count: number
  stock: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  image_url: string
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  brand?: string
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest" | "popular"
}

export interface Reel {
  id: string
  video_url: string
  thumbnail_url: string
  caption: string
  user: UserPreview
  likes_count: number
  comments_count: number
  products: Product[]
  created_at: string
}

export interface ReelUploadData {
  video_id: string
  caption: string
  product_ids?: string[]
}

export interface Comment {
  id: string
  content: string
  user: UserPreview
  created_at: string
}

export interface Salon {
  id: string
  name: string
  address: string
  location: { lat: number; lng: number }
  rating: number
  reviews_count: number
  images: string[]
  services: string[]
}

export interface SalonWithDistance extends Salon {
  distance_km: number
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export interface BookingData {
  salon_id: string
  service_id: string
  slot_start: string
  slot_end: string
  notes?: string
}

export interface Booking {
  id: string
  salon: Salon
  service: Service
  status: "pending" | "confirmed" | "completed" | "cancelled"
  slot_start: string
  slot_end: string
  created_at: string
}

export interface Deal {
  id: string
  title: string
  description: string
  discount_percent: number
  salon: Salon
  expires_at: string
}

export interface RouteInfo {
  distance_km: number
  duration_minutes: number
  polyline: string
}

export interface WalletTransaction {
  id: string
  amount: number
  type: "credit" | "debit"
  description: string
  status: "pending" | "completed" | "failed"
  created_at: string
}

export interface BankAccount {
  account_number: string
  ifsc_code: string
  account_name: string
}

export interface UserProfile {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url: string
  bio: string
  followers_count: number
  following_count: number
  is_seller: boolean
  skin_profile?: {
    skin_type: string
    concerns: string[]
  }
}

export interface UserPreview {
  id: string
  username: string
  avatar_url: string
}

export interface SellerDashboard {
  total_sales: number
  total_orders: number
  pending_orders: number
  wallet_balance: number
  top_products: Product[]
  recent_orders: Order[]
}

export interface Order {
  id: string
  products: { product: Product; quantity: number }[]
  total: number
  status: string
  shipping_address: string
  created_at: string
}

export interface ProductData {
  name: string
  description: string
  price: number
  category: string
  images: string[]
  stock: number
}

export const backendService = new BackendService()
