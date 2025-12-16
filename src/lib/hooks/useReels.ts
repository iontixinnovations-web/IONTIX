"use client"

/**
 * Reels Hook
 * Short video content management
 */

import { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "../store"
import { reelsService, type ReelFilters, type CreateReelData, type ReelComment } from "../api"
import { supabase } from "../supabase"
import { toast } from "sonner"
import type { Database } from "../database.types"

type Reel = Database["public"]["Tables"]["reels"]["Row"]

export function useReels(filters?: ReelFilters) {
  const [reels, setReels] = useState<Reel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const fetchReels = useCallback(
    async (reset = false) => {
      try {
        setIsLoading(true)
        setError(null)

        const currentPage = reset ? 1 : page
        const limit = filters?.limit || 10

        // Try FastAPI first
        try {
          const response = await reelsService.getReels({
            ...filters,
            page: currentPage,
            limit,
          })

          if (response.success && response.data) {
            if (reset) {
              setReels(response.data)
              setPage(2)
            } else {
              setReels((prev) => [...prev, ...response.data!])
              setPage((p) => p + 1)
            }
            setHasMore(response.data.length === limit)
            return { success: true, data: response.data }
          }
        } catch {
          // Fallback to Supabase
          let query = supabase
            .from("reels")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .range((currentPage - 1) * limit, currentPage * limit - 1)

          if (filters?.creator_id) {
            query = query.eq("creator_id", filters.creator_id)
          }
          if (filters?.is_featured) {
            query = query.eq("is_featured", true)
          }

          const { data, error: supabaseError } = await query

          if (supabaseError) throw supabaseError

          if (data) {
            if (reset) {
              setReels(data as Reel[])
              setPage(2)
            } else {
              setReels((prev) => [...prev, ...(data as Reel[])])
              setPage((p) => p + 1)
            }
            setHasMore(data.length === limit)
            return { success: true, data }
          }
        }

        return { success: false, error: "Failed to load reels" }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load reels"
        console.error("Fetch reels error:", err)
        setError(message)
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
      }
    },
    [page, filters],
  )

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchReels(false)
    }
  }, [isLoading, hasMore, fetchReels])

  const refresh = useCallback(() => {
    fetchReels(true)
  }, [fetchReels])

  useEffect(() => {
    fetchReels(true)
  }, [])

  return {
    reels,
    isLoading,
    hasMore,
    error,
    loadMore,
    refresh,
  }
}

export function useForYouFeed() {
  const { user } = useAuthStore()
  const [reels, setReels] = useState<Reel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const fetchFeed = useCallback(
    async (reset = false) => {
      try {
        setIsLoading(true)
        setError(null)

        const currentPage = reset ? 1 : page
        const limit = 10

        const response = await reelsService.getForYouFeed({
          page: currentPage,
          limit,
        })

        if (response.success && response.data) {
          if (reset) {
            setReels(response.data)
            setPage(2)
          } else {
            setReels((prev) => [...prev, ...response.data!])
            setPage((p) => p + 1)
          }
          setHasMore(response.data.length === limit)
          return { success: true, data: response.data }
        }

        // Fallback to regular reels
        const { data } = await supabase
          .from("reels")
          .select("*")
          .eq("is_active", true)
          .order("views", { ascending: false })
          .range((currentPage - 1) * limit, currentPage * limit - 1)

        if (data) {
          if (reset) {
            setReels(data as Reel[])
            setPage(2)
          } else {
            setReels((prev) => [...prev, ...(data as Reel[])])
            setPage((p) => p + 1)
          }
          setHasMore(data.length === limit)
        }

        return { success: true, data }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load feed"
        console.error("Fetch feed error:", err)
        setError(message)
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
      }
    },
    [user, page],
  )

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchFeed(false)
    }
  }, [isLoading, hasMore, fetchFeed])

  const refresh = useCallback(() => {
    fetchFeed(true)
  }, [fetchFeed])

  useEffect(() => {
    fetchFeed(true)
  }, [])

  return {
    reels,
    isLoading,
    hasMore,
    error,
    loadMore,
    refresh,
  }
}

export function useReelInteractions(reelId: string) {
  const { user } = useAuthStore()
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const toggleLike = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to like reels")
      return { success: false }
    }

    try {
      setIsLoading(true)

      if (isLiked) {
        const response = await reelsService.unlikeReel(reelId)
        if (response.success) {
          setIsLiked(false)
          setLikes((l) => Math.max(0, l - 1))
        }
      } else {
        const response = await reelsService.likeReel(reelId)
        if (response.success) {
          setIsLiked(true)
          setLikes((l) => l + 1)
        }
      }

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed"
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [user, reelId, isLiked])

  const share = useCallback(
    async (platform?: string) => {
      try {
        const response = await reelsService.shareReel(reelId, platform)
        if (response.success && response.data) {
          // Use Web Share API if available
          if (navigator.share) {
            await navigator.share({
              title: "Check out this reel on MITHAS GLOW",
              url: response.data.share_url,
            })
          } else {
            // Copy to clipboard
            await navigator.clipboard.writeText(response.data.share_url)
            toast.success("Link copied to clipboard!")
          }
          return { success: true, shareUrl: response.data.share_url }
        }
        return { success: false }
      } catch (err) {
        // User cancelled share
        return { success: false }
      }
    },
    [reelId],
  )

  return {
    isLiked,
    likes,
    isLoading,
    toggleLike,
    share,
    setLikes,
    setIsLiked,
  }
}

export function useReelComments(reelId: string) {
  const { user } = useAuthStore()
  const [comments, setComments] = useState<ReelComment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const fetchComments = useCallback(
    async (reset = false) => {
      try {
        setIsLoading(true)

        const currentPage = reset ? 1 : page
        const response = await reelsService.getComments(reelId, {
          page: currentPage,
          limit: 20,
        })

        if (response.success && response.data) {
          if (reset) {
            setComments(response.data)
            setPage(2)
          } else {
            setComments((prev) => [...prev, ...response.data!])
            setPage((p) => p + 1)
          }
          setHasMore(response.data.length === 20)
        }

        return response
      } catch (err) {
        console.error("Fetch comments error:", err)
        return { success: false }
      } finally {
        setIsLoading(false)
      }
    },
    [reelId, page],
  )

  const addComment = useCallback(
    async (content: string) => {
      if (!user) {
        toast.error("Please sign in to comment")
        return { success: false }
      }

      try {
        const response = await reelsService.addComment(reelId, content)

        if (response.success && response.data) {
          setComments((prev) => [response.data!, ...prev])
          toast.success("Comment added!")
          return { success: true, comment: response.data }
        }

        return { success: false }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to add comment"
        toast.error(message)
        return { success: false, error: message }
      }
    },
    [user, reelId],
  )

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchComments(false)
    }
  }, [isLoading, hasMore, fetchComments])

  useEffect(() => {
    fetchComments(true)
  }, [reelId])

  return {
    comments,
    isLoading,
    hasMore,
    addComment,
    loadMore,
    refresh: () => fetchComments(true),
  }
}

export function useCreateReel() {
  const { user } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadVideo = useCallback(async (videoFile: File) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)
      setError(null)

      const response = await reelsService.uploadReelVideo(videoFile)

      if (response.success && response.data) {
        setUploadProgress(100)
        return { success: true, data: response.data }
      }

      return { success: false, error: response.error }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsUploading(false)
    }
  }, [])

  const createReel = useCallback(
    async (data: CreateReelData) => {
      if (!user) {
        toast.error("Please sign in to create reels")
        return { success: false, error: "Not authenticated" }
      }

      try {
        setIsUploading(true)
        setError(null)

        const response = await reelsService.createReel(data)

        if (response.success) {
          toast.success("Reel published!")
          return { success: true, data: response.data }
        }

        return { success: false, error: response.error }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create reel"
        setError(message)
        toast.error(message)
        return { success: false, error: message }
      } finally {
        setIsUploading(false)
      }
    },
    [user],
  )

  return {
    uploadVideo,
    createReel,
    isUploading,
    uploadProgress,
    error,
  }
}
