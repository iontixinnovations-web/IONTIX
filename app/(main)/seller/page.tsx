import { Suspense } from "react"
import { SellerDashboard } from "@/components/seller/seller-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Seller Dashboard | IONTIX",
  description: "Manage your store, products, and sales",
}

function DashboardLoading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

export default function SellerPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <SellerDashboard />
    </Suspense>
  )
}
