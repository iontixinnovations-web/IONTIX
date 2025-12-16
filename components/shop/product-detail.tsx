"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Share2, Star, Truck, Shield, MessageCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCart, useWishlist, useCreateVendorChat } from "@/hooks"
import { cn } from "@/lib/utils"
import type { Product, Review } from "@/lib/api"

interface ProductDetailProps {
  product: Product
  reviews: Review[]
}

export function ProductDetail({ product, reviews }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const { addItem, isAdding } = useCart()
  const { productIds: wishlistIds, addToWishlist, removeFromWishlist } = useWishlist()
  const { createChat } = useCreateVendorChat()

  const isWishlisted = wishlistIds.includes(product.id)
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0

  const handleAddToCart = async () => {
    await addItem({ product_id: product.id, quantity })
  }

  const handleWishlist = async () => {
    if (isWishlisted) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist(product.id)
    }
  }

  const handleContactSeller = async () => {
    if (product.seller_id) {
      await createChat(product.seller_id)
    }
  }

  return (
    <div className="container px-4 py-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
            {product.images?.[selectedImage] ? (
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
            )}

            {product.has_ar && (
              <Link href={`/mirror?product=${product.id}`}>
                <Badge className="absolute bottom-4 left-4 bg-purple-500 cursor-pointer">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Try with AR
                </Badge>
              </Link>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0",
                    selectedImage === index ? "border-primary" : "border-transparent",
                  )}
                >
                  <Image src={image || "/placeholder.svg"} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Title & Price */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

            {product.seller && (
              <Link href={`/seller/${product.seller_id}`} className="text-sm text-muted-foreground hover:text-primary">
                by {product.seller.shop_name} {product.seller.is_verified && "✓"}
              </Link>
            )}

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted",
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating.toFixed(1)} ({product.reviews_count} reviews)
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              {product.currency || "INR"} {product.price}
            </span>
            {product.original_price && product.original_price > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">{product.original_price}</span>
                <Badge variant="destructive">{discount}% OFF</Badge>
              </>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Quantity:</span>
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= product.stock}
              >
                +
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">{product.stock} in stock</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="flex-1" size="lg" onClick={handleAddToCart} disabled={isAdding || product.stock === 0}>
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
            <Button variant="outline" size="lg" onClick={handleWishlist}>
              <Heart className={cn("h-5 w-5", isWishlisted && "fill-red-500 text-red-500")} />
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Free Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Secure Payment</span>
            </div>
          </div>

          {/* Contact Seller */}
          <Button variant="outline" className="w-full bg-transparent" onClick={handleContactSeller}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Seller
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mt-8">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <div className="prose max-w-none">
            <p>{product.description || "No description available."}</p>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.user?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{review.user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{review.user?.username}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.title && <p className="font-medium">{review.title}</p>}
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
