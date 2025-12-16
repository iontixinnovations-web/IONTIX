/**
 * AI Service - Arctic Layer 6 Integration
 * Skin Analysis, AR Try-On, Style Recommendations
 */

import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

// Types for AI features
export interface SkinAnalysisResult {
  skin_type: "dry" | "oily" | "combination" | "normal" | "sensitive"
  skin_tone: string
  concerns: string[]
  recommendations: ProductRecommendation[]
  confidence: number
  analysis_id: string
}

export interface ProductRecommendation {
  product_id: string
  name: string
  image: string
  price: number
  match_score: number
  reason: string
}

export interface ARTryOnResult {
  processed_image_url: string
  product_id: string
  confidence: number
  session_id: string
}

export interface StyleRecommendation {
  style_id: string
  name: string
  description: string
  products: ProductRecommendation[]
  occasion: string
  season: string
}

export interface PersonalizedFeedItem {
  type: "product" | "reel" | "style" | "promotion"
  item_id: string
  score: number
  reason: string
  data: unknown
}

/**
 * AI Service Methods
 */
export const aiService = {
  /**
   * Analyze skin from uploaded image
   * Uses TensorFlow Lite + MediaPipe (Arctic Layer 6)
   */
  analyzeSkin: async (imageFile: File) => {
    const formData = new FormData()
    formData.append("image", imageFile)

    return apiClient.upload<SkinAnalysisResult>(API_ENDPOINTS.AI.SKIN_ANALYSIS, formData)
  },

  /**
   * Get AR try-on result for a product
   * Virtual makeup/accessory try-on
   */
  getARTryOn: async (data: {
    product_id: string
    user_image: File
  }) => {
    const formData = new FormData()
    formData.append("product_id", data.product_id)
    formData.append("user_image", data.user_image)

    return apiClient.upload<ARTryOnResult>(API_ENDPOINTS.AI.AR_TRYON, formData)
  },

  /**
   * Get personalized style recommendations
   */
  getStyleRecommendations: async (params?: {
    occasion?: string
    season?: string
    budget_min?: number
    budget_max?: number
    preferences?: string[]
  }) => {
    return apiClient.get<StyleRecommendation[]>(API_ENDPOINTS.AI.STYLE_RECOMMENDATIONS, { params })
  },

  /**
   * Get personalized feed for user
   * ML-powered content curation
   */
  getPersonalizedFeed: async (params?: {
    page?: number
    limit?: number
    include_types?: ("product" | "reel" | "style" | "promotion")[]
  }) => {
    return apiClient.get<PersonalizedFeedItem[]>(API_ENDPOINTS.AI.PERSONALIZED_FEED, {
      params: {
        ...params,
        include_types: params?.include_types?.join(","),
      },
    })
  },

  /**
   * Visual similarity search
   * Find similar products by image
   */
  searchBySimilarity: async (imageFile: File) => {
    const formData = new FormData()
    formData.append("image", imageFile)

    return apiClient.upload<ProductRecommendation[]>(API_ENDPOINTS.AI.SIMILARITY_SEARCH, formData)
  },
}

export default aiService
