"use client"

/**
 * Reels Hook
 * SWR-based reels feed management
 */

import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import useSWRInfinite from "swr/infinite"
import { reelsService, type Reel, type ReelComment, type ReelFilters } from "@/lib/api"
import { toast } from "sonner"

export function useReelsFeed(filters?: ReelFilters) {
  const getKey = (pageIndex: number, previousPageData: Reel[] | null) => {
    if (previousPageData && previousPageData.length === 0) return null
    const params = new URLSearchParams()
    params.set("page", String(pageIndex + 1))
    params.set("limit", String(filters?.limit || 10))
    if (filters?.creator_id) params.set("creator_id", filters.creator_id)
    if (filters?.is_featured) params.set("is_featured", "true")
    return `/reels?${params.toString()}`
  }

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<Reel[]>(
    getKey,
    async (key) => {
      const params = new URLSearchParams(key.split("?")[1])
      const response = await reelsService.feed({
        page: Number(params.get("page")),
        limit: Number(params.get("limit")),
        creator_id: params.get("creator_id") || undefined,
        is_featured: params.get("is_featured") === "true",
      })
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: false },
  )

  const reels = data ? data.flat() : []
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined")
  const isEmpty = data?.[0]?.length === 0
  const hasMore = !isEmpty && data && data[data.length - 1]?.length === (filters?.limit || 10)

  return {
    reels,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore: () => setSize(size + 1),
    refetch: mutate,
  }
}

export function useForYouFeed() {
  const getKey = (pageIndex: number, previousPageData: Reel[] | null) => {
    if (previousPageData && previousPageData.length === 0) return null
    return `/reels/for-you?page=${pageIndex + 1}&limit=10`
  }

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<Reel[]>(
    getKey,
    async (key) => {
      const params = new URLSearchParams(key.split("?")[1])
      const response = await reelsService.forYou({
        page: Number(params.get("page")),
        limit: Number(params.get("limit")),
      })
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: false },
  )

  const reels = data ? data.flat() : []
  const hasMore = data && data[data.length - 1]?.length === 10

  return {
    reels,
    isLoading,
    error,
    hasMore,
    loadMore: () => setSize(size + 1),
    refetch: mutate,
  }
}

export function useReel(reelId: string) {
  const { data, error, isLoading, mutate } = useSWR<Reel>(
    reelId ? `/reels/${reelId}` : null,
    async () => {
      const response = await reelsService.get(reelId)
      if (!response.success) throw new Error(response.error)
      return response.data!
    },
    { revalidateOnFocus: false },
  )

  return { reel: data, isLoading, error, refetch: mutate }
}

export function useReelInteractions(reelId: string) {
  const { mutate } = useSWR(`/reels/${reelId}`)

  const like = useSWRMutation(
    `/reels/${reelId}/like`,
    async () => {
      const response = await reelsService.like(reelId)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    { onSuccess: () => mutate() },
  )

  const unlike = useSWRMutation(
    `/reels/${reelId}/unlike`,
    async () => {
      const response = await reelsService.unlike(reelId)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    { onSuccess: () => mutate() },
  )

  const share = useSWRMutation(
    `/reels/${reelId}/share`,
    async (_, { arg }: { arg?: string }) => {
      const response = await reelsService.share(reelId, arg)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: async (data) => {
        if (data?.share_url) {
          if (navigator.share) {
            try {
              await navigator.share({
                title: "Check out this reel",
                url: data.share_url,
              })
            } catch {
              await navigator.clipboard.writeText(data.share_url)
              toast.success("Link copied!")
            }
          } else {
            await navigator.clipboard.writeText(data.share_url)
            toast.success("Link copied!")
          }
        }
      },
    },
  )

  return {
    like: like.trigger,
    unlike: unlike.trigger,
    share: share.trigger,
    isLiking: like.isMutating,
    isSharing: share.isMutating,
  }
}

export function useReelComments(reelId: string) {
  const { data, error, isLoading, mutate } = useSWR<ReelComment[]>(
    reelId ? `/reels/${reelId}/comments` : null,
    async () => {
      const response = await reelsService.getComments(reelId, { limit: 50 })
      if (!response.success) throw new Error(response.error)
      return response.data || []
    },
    { revalidateOnFocus: false },
  )

  const addComment = useSWRMutation(
    `/reels/${reelId}/comments`,
    async (_, { arg }: { arg: string }) => {
      const response = await reelsService.addComment(reelId, arg)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    {
      onSuccess: () => {
        mutate()
        toast.success("Comment added")
      },
      onError: (err) => toast.error(err.message || "Failed to add comment"),
    },
  )

  return {
    comments: data || [],
    isLoading,
    error,
    addComment: addComment.trigger,
    isAdding: addComment.isMutating,
    refetch: mutate,
  }
}
