import { Suspense } from "react"
import { OrdersScreen } from "@/components/orders/orders-screen"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "My Orders | IONTIX",
  description: "Track and manage your orders",
}

function OrdersLoading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-32" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <OrdersScreen />
    </Suspense>
  )
}
