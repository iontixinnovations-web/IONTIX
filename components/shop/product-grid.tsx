"use client"

import type React from "react"

/**
 * Product Grid Component
 * Displays products in a responsive grid
 */

import Link from "next/link"
import Image from "next/image"
import { Heart, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWishlist, useCart } from "@/hooks"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/api"

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { productIds: wishlistIds, addToWishlist, removeFromWishlist } = useWishlist()
  const { addItem, isAdding } = useCart()

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found</p>
      </div>
    )
  }

  const handleWishlist = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (wishlistIds.includes(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await addItem({ product_id: productId })
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        const isWishlisted = wishlistIds.includes(product.id)
        const discount =
          product.original_price && product.original_price > product.price
            ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
            : 0

        return (
          <Link key={product.id} href={`/shop/product/${product.id}`} className="group">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {discount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {discount}% OFF
                  </Badge>
                )}
                {product.has_ar && (
                  <Badge className="text-xs bg-purple-500">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AR
                  </Badge>
                )}
              </div>

              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                onClick={(e) => handleWishlist(product.id, e)}
              >
                <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
              </Button>

              {/* Quick Add */}
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={(e) => handleAddToCart(product.id, e)}
                  disabled={isAdding}
                >
                  Add to Cart
                </Button>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">
                    {product.rating.toFixed(1)} ({product.reviews_count})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {product.currency || "INR"} {product.price}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-muted-foreground text-sm line-through">{product.original_price}</span>
                )}
              </div>

              {/* Seller */}
              {product.seller && (
                <p className="text-xs text-muted-foreground">
                  by {product.seller.shop_name}
                  {product.seller.is_verified && " ✓"}
                </p>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
