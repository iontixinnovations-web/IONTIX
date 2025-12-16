"use client"

import { useProductRecommendations } from "@/hooks"
import { ProductGrid } from "./product-grid"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductRecommendationsProps {
  productId: string
}

export function ProductRecommendations({ productId }: ProductRecommendationsProps) {
  const { recommendations, isLoading } = useProductRecommendations(productId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (recommendations.length === 0) return null

  return <ProductGrid products={recommendations} />
}
