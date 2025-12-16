/**
 * Zustand Reels Store - Video Feed State
 * Manages infinite scroll feed and interactions
 */

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { reelsService, type Reel } from "@/lib/api"

interface ReelsState {
  // Feed data
  reels: Reel[]
  forYouReels: Reel[]
  trendingReels: Reel[]

  // Pagination
  currentPage: number
  hasMore: boolean

  // Current viewing
  currentReelIndex: number
  currentReelId: string | null

  // Loading states
  isLoading: boolean
  isLoadingMore: boolean

  // Actions
  loadFeed: (page?: number) => Promise<void>
  loadForYou: () => Promise<void>
  loadTrending: () => Promise<void>
  loadMore: () => Promise<void>
  setCurrentReel: (index: number) => void
  likeReel: (reelId: string) => Promise<void>
  unlikeReel: (reelId: string) => Promise<void>
  updateReelStats: (reelId: string, stats: Partial<Reel>) => void
  prependReel: (reel: Reel) => void
  reset: () => void
}

export const useReelsStore = create<ReelsState>()(
  devtools(
    (set, get) => ({
      // Initial State
      reels: [],
      forYouReels: [],
      trendingReels: [],
      currentPage: 1,
      hasMore: true,
      currentReelIndex: 0,
      currentReelId: null,
      isLoading: false,
      isLoadingMore: false,

      // Load main feed
      loadFeed: async (page = 1) => {
        set({ isLoading: page === 1, isLoadingMore: page > 1 })
        try {
          const response = await reelsService.feed({ page, limit: 10 })
          if (response.success && response.data) {
            set((state) => ({
              reels: page === 1 ? response.data! : [...state.reels, ...response.data!],
              currentPage: page,
              hasMore: response.data!.length === 10,
            }))
          }
        } catch (error) {
          console.error("[Reels] Load feed failed:", error)
        } finally {
          set({ isLoading: false, isLoadingMore: false })
        }
      },

      // Load For You personalized feed
      loadForYou: async () => {
        set({ isLoading: true })
        try {
          const response = await reelsService.forYou({ limit: 20 })
          if (response.success && response.data) {
            set({ forYouReels: response.data })
          }
        } catch (error) {
          console.error("[Reels] Load For You failed:", error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Load trending reels
      loadTrending: async () => {
        try {
          const response = await reelsService.trending(10)
          if (response.success && response.data) {
            set({ trendingReels: response.data })
          }
        } catch (error) {
          console.error("[Reels] Load trending failed:", error)
        }
      },

      // Load more reels (infinite scroll)
      loadMore: async () => {
        const { currentPage, hasMore, isLoadingMore } = get()
        if (!hasMore || isLoadingMore) return
        await get().loadFeed(currentPage + 1)
      },

      // Set current viewing reel
      setCurrentReel: (index) => {
        const { reels } = get()
        set({
          currentReelIndex: index,
          currentReelId: reels[index]?.id || null,
        })
      },

      // Like a reel
      likeReel: async (reelId) => {
        // Optimistic update
        set((state) => ({
          reels: state.reels.map((reel) =>
            reel.id === reelId ? { ...reel, is_liked: true, likes_count: reel.likes_count + 1 } : reel,
          ),
          forYouReels: state.forYouReels.map((reel) =>
            reel.id === reelId ? { ...reel, is_liked: true, likes_count: reel.likes_count + 1 } : reel,
          ),
        }))

        try {
          await reelsService.like(reelId)
        } catch (error) {
          // Revert on error
          set((state) => ({
            reels: state.reels.map((reel) =>
              reel.id === reelId ? { ...reel, is_liked: false, likes_count: reel.likes_count - 1 } : reel,
            ),
            forYouReels: state.forYouReels.map((reel) =>
              reel.id === reelId ? { ...reel, is_liked: false, likes_count: reel.likes_count - 1 } : reel,
            ),
          }))
        }
      },

      // Unlike a reel
      unlikeReel: async (reelId) => {
        // Optimistic update
        set((state) => ({
          reels: state.reels.map((reel) =>
            reel.id === reelId ? { ...reel, is_liked: false, likes_count: reel.likes_count - 1 } : reel,
          ),
          forYouReels: state.forYouReels.map((reel) =>
            reel.id === reelId ? { ...reel, is_liked: false, likes_count: reel.likes_count - 1 } : reel,
          ),
        }))

        try {
          await reelsService.unlike(reelId)
        } catch (error) {
          // Revert on error
          set((state) => ({
            reels: state.reels.map((reel) =>
              reel.id === reelId ? { ...reel, is_liked: true, likes_count: reel.likes_count + 1 } : reel,
            ),
            forYouReels: state.forYouReels.map((reel) =>
              reel.id === reelId ? { ...reel, is_liked: true, likes_count: reel.likes_count + 1 } : reel,
            ),
          }))
        }
      },

      // Update reel stats (from realtime)
      updateReelStats: (reelId, stats) => {
        set((state) => ({
          reels: state.reels.map((reel) => (reel.id === reelId ? { ...reel, ...stats } : reel)),
          forYouReels: state.forYouReels.map((reel) => (reel.id === reelId ? { ...reel, ...stats } : reel)),
        }))
      },

      // Prepend new reel (for uploads)
      prependReel: (reel) => {
        set((state) => ({
          reels: [reel, ...state.reels],
        }))
      },

      // Reset store
      reset: () => {
        set({
          reels: [],
          forYouReels: [],
          trendingReels: [],
          currentPage: 1,
          hasMore: true,
          currentReelIndex: 0,
          currentReelId: null,
          isLoading: false,
          isLoadingMore: false,
        })
      },
    }),
    { name: "ReelsStore" },
  ),
)
