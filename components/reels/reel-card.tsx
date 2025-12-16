"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, MessageCircle, Share2, ShoppingBag, Play, Volume2, VolumeX, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useReelInteractions } from "@/hooks"
import { cn } from "@/lib/utils"
import type { Reel } from "@/lib/api"

interface ReelCardProps {
  reel: Reel
  isActive: boolean
}

export function ReelCard({ reel, isActive }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showProducts, setShowProducts] = useState(false)

  const { like, unlike, share, isLiking } = useReelInteractions(reel.id)
  const [isLiked, setIsLiked] = useState(reel.is_liked || false)
  const [likesCount, setLikesCount] = useState(reel.likes_count)

  // Auto play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isActive) {
      video.play().catch(() => {})
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [isActive])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleLike = async () => {
    if (isLiked) {
      await unlike()
      setIsLiked(false)
      setLikesCount((c) => c - 1)
    } else {
      await like()
      setIsLiked(true)
      setLikesCount((c) => c + 1)
    }
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  return (
    <div className="relative h-full w-full bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.video_url}
        poster={reel.thumbnail_url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onClick={togglePlay}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full bg-black/50 text-white"
            onClick={togglePlay}
          >
            <Play className="h-8 w-8" />
          </Button>
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="text-white">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Right Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-10">
        {/* Like */}
        <button className="flex flex-col items-center gap-1" onClick={handleLike} disabled={isLiking}>
          <div
            className={cn(
              "h-12 w-12 rounded-full bg-black/30 flex items-center justify-center",
              isLiked && "text-red-500",
            )}
          >
            <Heart className={cn("h-6 w-6", isLiked && "fill-current")} />
          </div>
          <span className="text-white text-xs">{formatCount(likesCount)}</span>
        </button>

        {/* Comments */}
        <Link href={`/reels/${reel.id}?comments=true`} className="flex flex-col items-center gap-1">
          <div className="h-12 w-12 rounded-full bg-black/30 flex items-center justify-center text-white">
            <MessageCircle className="h-6 w-6" />
          </div>
          <span className="text-white text-xs">{formatCount(reel.comments_count)}</span>
        </Link>

        {/* Share */}
        <button className="flex flex-col items-center gap-1" onClick={() => share()}>
          <div className="h-12 w-12 rounded-full bg-black/30 flex items-center justify-center text-white">
            <Share2 className="h-6 w-6" />
          </div>
          <span className="text-white text-xs">{formatCount(reel.shares_count)}</span>
        </button>

        {/* Products */}
        {reel.products && reel.products.length > 0 && (
          <button className="flex flex-col items-center gap-1" onClick={() => setShowProducts(!showProducts)}>
            <div className="h-12 w-12 rounded-full bg-black/30 flex items-center justify-center text-white">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="text-white text-xs">{reel.products.length}</span>
          </button>
        )}
      </div>

      {/* Bottom Info */}
      <div className="absolute left-4 right-20 bottom-8 z-10">
        {/* Creator */}
        <Link href={`/profile/${reel.creator_id}`} className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={reel.creator.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{reel.creator.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold flex items-center gap-1">
              @{reel.creator.username}
              {reel.creator.is_verified && (
                <Badge variant="secondary" className="h-4 px-1 text-xs">
                  ✓
                </Badge>
              )}
            </p>
          </div>
        </Link>

        {/* Caption */}
        <p className="text-white text-sm line-clamp-2">{reel.caption}</p>

        {/* Hashtags */}
        {reel.hashtags && reel.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {reel.hashtags.slice(0, 3).map((tag) => (
              <Link key={tag} href={`/reels?tag=${tag}`} className="text-white/80 text-sm hover:text-white">
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Products Sheet */}
      {showProducts && reel.products && (
        <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md rounded-t-3xl p-4 z-20 max-h-[50vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Products in this Reel</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowProducts(false)}>
              Close
            </Button>
          </div>
          <div className="space-y-3">
            {reel.products.map((item) => (
              <Link
                key={item.id}
                href={`/shop/product/${item.product_id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                  {item.product.images?.[0] && (
                    <Image src={item.product.images[0] || "/placeholder.svg"} alt="" fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                  <p className="text-primary font-semibold">INR {item.product.price}</p>
                </div>
                <Button size="sm">View</Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
