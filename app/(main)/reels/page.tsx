/**
 * Reels Page
 * TikTok-style vertical video feed
 */

"use client"

import { useRef, useEffect, useState } from "react"
import { useForYouFeed } from "@/hooks"
import { ReelCard } from "@/components/reels/reel-card"
import { Loader2 } from "lucide-react"

export default function ReelsPage() {
  const { reels, isLoading, hasMore, loadMore } = useForYouFeed()
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Infinite scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"))
            setCurrentIndex(index)

            // Load more when near end
            if (index >= reels.length - 2 && hasMore && !isLoading) {
              loadMore()
            }
          }
        })
      },
      { threshold: 0.5 },
    )

    container.querySelectorAll("[data-index]").forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [reels.length, hasMore, isLoading, loadMore])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" && currentIndex < reels.length - 1) {
        document.querySelector(`[data-index="${currentIndex + 1}"]`)?.scrollIntoView({ behavior: "smooth" })
      } else if (e.key === "ArrowUp" && currentIndex > 0) {
        document.querySelector(`[data-index="${currentIndex - 1}"]`)?.scrollIntoView({ behavior: "smooth" })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex, reels.length])

  if (isLoading && reels.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {reels.map((reel, index) => (
        <div key={reel.id} data-index={index} className="h-screen w-full snap-start">
          <ReelCard reel={reel} isActive={currentIndex === index} />
        </div>
      ))}

      {/* Loading more */}
      {isLoading && reels.length > 0 && (
        <div className="h-20 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      )}
    </div>
  )
}
