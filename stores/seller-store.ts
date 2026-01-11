/**
 * Zustand Seller Store
 * Manages seller profile state globally
 */

import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface SellerProfile {
  user_id: string
  onboarded: boolean
  verified: boolean
  shop_name: string | null
}

interface SellerState {
  sellerProfile: SellerProfile | null
  isLoading: boolean
  error: string | null

  // Actions
  setSellerProfile: (profile: SellerProfile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearSellerProfile: () => void
}

export const useSellerStore = create<SellerState>()(
  devtools(
    (set) => ({
      sellerProfile: null,
      isLoading: false,
      error: null,

      setSellerProfile: (profile) => set({ sellerProfile: profile }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearSellerProfile: () => set({ sellerProfile: null }),
    }),
    {
      name: "seller-store",
    }
  )
)