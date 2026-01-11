"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores"
import { useSellerStore } from "@/stores"
import { useSellerProfile } from "@/hooks/use-seller"
import { SellerVerifyForm } from "@/components/seller/seller-verify-form"
import { Loader2 } from "lucide-react"

export default function SellerVerifyPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { sellerProfile, setSellerProfile } = useSellerStore()
  const { profile, isLoading, error } = useSellerProfile()

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/auth/login")
      return
    }
  }, [isAuthenticated, user, router])

  // Seller flow logic
  useEffect(() => {
    if (isLoading) return

    if (!profile) {
      // No seller profile, redirect to onboard
      setSellerProfile(null)
      router.push("/seller/onboard")
    } else {
      const onboarded = !!profile.shop_name
      const verified = profile.is_verified

      setSellerProfile({
        user_id: profile.user_id,
        onboarded,
        verified,
        shop_name: profile.shop_name,
      })

      if (!onboarded) {
        router.push("/seller/onboard")
      } else if (verified) {
        router.push("/seller/dashboard")
      }
      // If onboarded and not verified, stay here
    }
  }, [profile, isLoading, router, setSellerProfile])

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <SellerVerifyForm />
}