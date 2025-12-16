import { Suspense } from "react"
import { BookingScreen } from "@/components/booking/booking-screen"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Book Appointment | IONTIX",
  description: "Book salon and beauty appointments near you",
}

function BookingLoading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingLoading />}>
      <BookingScreen />
    </Suspense>
  )
}
