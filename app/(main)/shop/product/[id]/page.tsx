/**
 * Product Detail Page
 */

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductDetail } from "@/components/shop/product-detail"
import { ProductRecommendations } from "@/components/shop/product-recommendations"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*, sellers(id, shop_name, is_verified, rating)")
    .eq("id", id)
    .single()

  if (error || !data) return null
  return data
}

async function getProductReviews(productId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from("reviews")
    .select("*, users(id, username, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(10)

  return data || []
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const [product, reviews] = await Promise.all([getProduct(id), getProductReviews(id)])

  if (!product) notFound()

  return (
    <main className="min-h-screen pb-20">
      <ProductDetail product={product} reviews={reviews} />

      {/* Recommendations */}
      <section className="container px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">You May Also Like</h2>
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          }
        >
          <ProductRecommendations productId={id} />
        </Suspense>
      </section>
    </main>
  )
}
