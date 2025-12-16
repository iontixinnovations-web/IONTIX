/**
 * Global State Management with Zustand
 * MITHAS GLOW - Centralized state for app
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Database } from './database.types';

// Type aliases for cleaner code
type Profile = Database['public']['Tables']['profiles']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type CartItem = Database['public']['Tables']['cart']['Row'] & {
  product?: Product;
};
type Order = Database['public']['Tables']['orders']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

// =====================================================
// AUTH STORE
// =====================================================
interface AuthState {
  user: Profile | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: Profile | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => set({ user: null, session: null, isAuthenticated: false }),
    }),
    {
      name: 'mithas-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// =====================================================
// CART STORE
// =====================================================
interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  
  // Actions
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  calculateSubtotal: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      subtotal: 0,
      
      setItems: (items) => {
        set({ items, itemCount: items.length });
        get().calculateSubtotal();
      },
      
      addItem: (item) => {
        const items = [...get().items, item];
        set({ items, itemCount: items.length });
        get().calculateSubtotal();
      },
      
      removeItem: (itemId) => {
        const items = get().items.filter((item) => item.id !== itemId);
        set({ items, itemCount: items.length });
        get().calculateSubtotal();
      },
      
      updateQuantity: (itemId, quantity) => {
        const items = get().items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        set({ items });
        get().calculateSubtotal();
      },
      
      clearCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),
      
      calculateSubtotal: () => {
        const subtotal = get().items.reduce(
          (total, item) => total + (item.product?.price || 0) * item.quantity,
          0
        );
        set({ subtotal });
      },
    }),
    {
      name: 'mithas-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// =====================================================
// SHOP STORE (Products, Filters, etc.)
// =====================================================
interface ShopState {
  products: Product[];
  selectedProduct: Product | null;
  filters: {
    category: string | null;
    gender: 'female' | 'male' | null;
    priceRange: [number, number] | null;
    sortBy: string;
  };
  searchQuery: string;
  
  // Actions
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setFilters: (filters: Partial<ShopState['filters']>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

export const useShopStore = create<ShopState>((set) => ({
  products: [],
  selectedProduct: null,
  filters: {
    category: null,
    gender: null,
    priceRange: null,
    sortBy: 'newest',
  },
  searchQuery: '',
  
  setProducts: (products) => set({ products }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearFilters: () => set({
    filters: {
      category: null,
      gender: null,
      priceRange: null,
      sortBy: 'newest',
    },
    searchQuery: '',
  }),
}));

// =====================================================
// ORDER STORE
// =====================================================
interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  
  // Actions
  setOrders: (orders: Order[]) => void;
  setSelectedOrder: (order: Order | null) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  selectedOrder: null,
  
  setOrders: (orders) => set({ orders }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  addOrder: (order) => set((state) => ({
    orders: [order, ...state.orders],
  })),
  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map((order) =>
      order.id === orderId ? { ...order, status } : order
    ),
  })),
}));

// =====================================================
// NOTIFICATION STORE
// =====================================================
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    set({ notifications, unreadCount });
  },
  
  addNotification: (notification) => set((state) => {
    const notifications = [notification, ...state.notifications];
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    return { notifications, unreadCount };
  }),
  
  markAsRead: (notificationId) => set((state) => {
    const notifications = state.notifications.map((n) =>
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    return { notifications, unreadCount };
  }),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
    unreadCount: 0,
  })),
  
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

// =====================================================
// UI STORE (Theme, Modals, etc.)
// =====================================================
interface UIState {
  theme: 'light' | 'dark';
  isSearchOpen: boolean;
  isNotificationOpen: boolean;
  activeModal: string | null;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSearch: () => void;
  toggleNotifications: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      isSearchOpen: false,
      isNotificationOpen: false,
      activeModal: null,
      
      setTheme: (theme) => set({ theme }),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      toggleNotifications: () => set((state) => ({
        isNotificationOpen: !state.isNotificationOpen,
      })),
      openModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: 'mithas-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// =====================================================
// SELLER STORE (for seller dashboard)
// =====================================================
interface SellerState {
  seller: Database['public']['Tables']['sellers']['Row'] | null;
  products: Product[];
  orders: Order[];
  analytics: {
    dailySales: number;
    totalOrders: number;
    viewsToday: number;
    walletBalance: number;
  };
  
  // Actions
  setSeller: (seller: Database['public']['Tables']['sellers']['Row'] | null) => void;
  setProducts: (products: Product[]) => void;
  setOrders: (orders: Order[]) => void;
  setAnalytics: (analytics: Partial<SellerState['analytics']>) => void;
}

export const useSellerStore = create<SellerState>((set) => ({
  seller: null,
  products: [],
  orders: [],
  analytics: {
    dailySales: 0,
    totalOrders: 0,
    viewsToday: 0,
    walletBalance: 0,
  },
  
  setSeller: (seller) => set({ seller }),
  setProducts: (products) => set({ products }),
  setOrders: (orders) => set({ orders }),
  setAnalytics: (analytics) => set((state) => ({
    analytics: { ...state.analytics, ...analytics },
  })),
}));

// Export all stores
export default {
  useAuthStore,
  useCartStore,
  useShopStore,
  useOrderStore,
  useNotificationStore,
  useUIStore,
  useSellerStore,
};
