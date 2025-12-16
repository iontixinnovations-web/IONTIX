/**
 * Zustand Search Store - Meilisearch Integration
 * Global search with suggestions and history
 */

import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { searchService as apiSearchService } from "@/lib/api"

interface SearchResult {
  id: string
  type: "product" | "seller" | "salon" | "reel"
  title: string
  subtitle: string
  image_url?: string
  url: string
  score?: number
}

interface SearchState {
  // Query
  query: string
  debouncedQuery: string

  // Results
  results: SearchResult[]
  suggestions: string[]
  recentSearches: string[]
  trendingSearches: string[]

  // Loading
  isSearching: boolean
  isLoadingSuggestions: boolean

  // Filters
  activeFilter: "all" | "products" | "sellers" | "salons" | "reels"

  // Actions
  setQuery: (query: string) => void
  search: (query?: string) => Promise<void>
  fetchSuggestions: (query: string) => Promise<void>
  fetchTrending: () => Promise<void>
  addToRecent: (query: string) => void
  clearRecent: () => void
  setFilter: (filter: "all" | "products" | "sellers" | "salons" | "reels") => void
  clearResults: () => void
}

export const useSearchStore = create<SearchState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        query: "",
        debouncedQuery: "",
        results: [],
        suggestions: [],
        recentSearches: [],
        trendingSearches: [],
        isSearching: false,
        isLoadingSuggestions: false,
        activeFilter: "all",

        // Set query
        setQuery: (query) => {
          set({ query })
        },

        // Perform search
        search: async (searchQuery) => {
          const query = searchQuery || get().query
          if (!query.trim()) {
            set({ results: [] })
            return
          }

          set({ isSearching: true, debouncedQuery: query })
          try {
            const response = await apiSearchService.global(query, {
              types: get().activeFilter === "all" ? undefined : [get().activeFilter],
            })

            if (response.success && response.data) {
              set({ results: response.data })
              get().addToRecent(query)
            }
          } catch (error) {
            console.error("[Search] Search failed:", error)
          } finally {
            set({ isSearching: false })
          }
        },

        // Fetch suggestions as user types
        fetchSuggestions: async (query) => {
          if (!query.trim() || query.length < 2) {
            set({ suggestions: [] })
            return
          }

          set({ isLoadingSuggestions: true })
          try {
            const response = await apiSearchService.suggestions(query)
            if (response.success && response.data) {
              set({ suggestions: response.data })
            }
          } catch (error) {
            console.error("[Search] Suggestions failed:", error)
          } finally {
            set({ isLoadingSuggestions: false })
          }
        },

        // Fetch trending searches
        fetchTrending: async () => {
          try {
            const response = await apiSearchService.trending()
            if (response.success && response.data) {
              set({ trendingSearches: response.data })
            }
          } catch (error) {
            console.error("[Search] Trending failed:", error)
          }
        },

        // Add to recent searches
        addToRecent: (query) => {
          set((state) => {
            const recent = state.recentSearches.filter((q) => q !== query)
            return {
              recentSearches: [query, ...recent].slice(0, 10),
            }
          })
        },

        // Clear recent searches
        clearRecent: () => {
          set({ recentSearches: [] })
        },

        // Set active filter
        setFilter: (activeFilter) => {
          set({ activeFilter })
          // Re-search with new filter
          const { query } = get()
          if (query) {
            get().search()
          }
        },

        // Clear results
        clearResults: () => {
          set({ results: [], query: "", suggestions: [] })
        },
      }),
      {
        name: "mithas-search-store",
        partialize: (state) => ({
          recentSearches: state.recentSearches,
        }),
      },
    ),
    { name: "SearchStore" },
  ),
)
