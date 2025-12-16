/**
 * Shop Page
 * Product catalog with filters
 * Uses FastAPI backend for data fetching
 */

import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Filter, ChevronRight } from "lucide-react"
import { ProductGrid } from "@/components/shop/product-grid"
import { CategoryFilter } from "@/components/shop/category-filter"
import { SearchBar } from "@/components/shop/search-bar"
import { serverProducts } from "@/lib/services/fastapi"

interface ShopPageProps {
  searchParams: Promise<{
    category?: string
    q?: string
    sort?: string
    page?: string
  }>
}

async function getProducts(filters: { category?: string; search?: string; page?: number }) {
  const response = await serverProducts.list({
    category: filters.category,
    search: filters.search,
    page: filters.page || 1,
    limit: 20,
  })
  return response.data || []
}

async function getCategories() {
  const response = await serverProducts.categories()
  return response.data || []
}

function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square rounded-2xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const [products, categories] = await Promise.all([
    getProducts({
      category: params.category,
      search: params.q,
      page: params.page ? Number.parseInt(params.page) : 1,
    }),
    getCategories(),
  ])

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-4">
            <SearchBar defaultValue={params.q} />
            <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Shop</span>
          {params.category && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground capitalize">{params.category}</span>
            </>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <Link href="/shop">
            <Badge variant={!params.category ? "default" : "outline"} className="cursor-pointer whitespace-nowrap">
              All Products
            </Badge>
          </Link>
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/shop?category=${cat.slug}`}>
              <Badge
                variant={params.category === cat.slug ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
              >
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">{products.length} products found</p>
          <CategoryFilter />
        </div>

        {/* Product Grid */}
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          }
        >
          <ProductGrid products={products} />
        </Suspense>
      </div>
    </main>
  )
}
