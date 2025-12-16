import { Suspense } from "react"
import { WalletScreen } from "@/components/wallet/wallet-screen"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "My Wallet | IONTIX",
  description: "Manage your wallet balance and transactions",
}

function WalletLoading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-40 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

export default function WalletPage() {
  return (
    <Suspense fallback={<WalletLoading />}>
      <WalletScreen />
    </Suspense>
  )
}
