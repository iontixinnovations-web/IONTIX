/**
 * Reels Service
 * Short video content integration
 */

import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"
import type { Database } from "../../database.types"

type Reel = Database["public"]["Tables"]["reels"]["Row"]

export interface ReelFilters {
  creator_id?: string
  seller_id?: string
  hashtag?: string
  is_featured?: boolean
  page?: number
  limit?: number
}

export interface CreateReelData {
  video_url: string
  thumbnail_url?: string
  caption?: string
  hashtags?: string[]
  tagged_products?: string[]
}

export interface ReelComment {
  id: string
  user_id: string
  user_name: string
  user_avatar: string
  content: string
  likes: number
  created_at: string
}

/**
 * Reels Service Methods
 */
export const reelsService = {
  /**
   * Get reels feed
   */
  getReels: async (filters?: ReelFilters) => {
    return apiClient.get<Reel[]>(API_ENDPOINTS.REELS.LIST, {
      params: filters,
    })
  },

  /**
   * Get single reel
   */
  getReel: async (reelId: string) => {
    return apiClient.get<Reel>(API_ENDPOINTS.REELS.DETAIL(reelId))
  },

  /**
   * Get personalized "For You" feed
   */
  getForYouFeed: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get<Reel[]>(API_ENDPOINTS.REELS.FOR_YOU, {
      params,
    })
  },

  /**
   * Get trending reels
   */
  getTrendingReels: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get<Reel[]>(API_ENDPOINTS.REELS.TRENDING, {
      params,
    })
  },

  /**
   * Create new reel
   */
  createReel: async (data: CreateReelData) => {
    return apiClient.post<Reel>(API_ENDPOINTS.REELS.CREATE, data)
  },

  /**
   * Upload reel video file
   */
  uploadReelVideo: async (videoFile: File) => {
    const formData = new FormData()
    formData.append("video", videoFile)

    return apiClient.upload<{ video_url: string; thumbnail_url: string }>(
      `${API_ENDPOINTS.REELS.CREATE}/upload`,
      formData,
    )
  },

  /**
   * Like a reel
   */
  likeReel: async (reelId: string) => {
    return apiClient.post<{ likes: number }>(API_ENDPOINTS.REELS.LIKE(reelId))
  },

  /**
   * Unlike a reel
   */
  unlikeReel: async (reelId: string) => {
    return apiClient.delete<{ likes: number }>(API_ENDPOINTS.REELS.LIKE(reelId))
  },

  /**
   * Share a reel
   */
  shareReel: async (reelId: string, platform?: string) => {
    return apiClient.post<{ shares: number; share_url: string }>(API_ENDPOINTS.REELS.SHARE(reelId), { platform })
  },

  /**
   * Get reel comments
   */
  getComments: async (reelId: string, params?: { page?: number; limit?: number }) => {
    return apiClient.get<ReelComment[]>(API_ENDPOINTS.REELS.COMMENTS(reelId), {
      params,
    })
  },

  /**
   * Add comment to reel
   */
  addComment: async (reelId: string, content: string) => {
    return apiClient.post<ReelComment>(API_ENDPOINTS.REELS.COMMENTS(reelId), {
      content,
    })
  },
}

export default reelsService
