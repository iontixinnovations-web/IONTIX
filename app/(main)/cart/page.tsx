/**
 * Cart Page
 */

"use client"

import Link from "next/link"
import Image from "next/image"
import { Trash2, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks"
import { useState } from "react"

export default function CartPage() {
  const { cart, items, subtotal, total, isLoading, updateItem, removeItem, applyCoupon, isUpdating } = useCart()
  const [couponCode, setCouponCode] = useState("")

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen pb-20">
        <div className="container px-4 py-12 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet</p>
          <Button asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-20">
      <div className="container px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length})</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <Link href={`/shop/product/${item.product_id}`} className="shrink-0">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                      {item.product.images?.[0] && (
                        <Image
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/shop/product/${item.product_id}`}>
                      <h3 className="font-medium line-clamp-1 hover:text-primary">{item.product.name}</h3>
                    </Link>
                    {item.variant && <p className="text-sm text-muted-foreground">{item.variant.name}</p>}
                    <p className="font-semibold mt-1">
                      {item.product.currency || "INR"} {item.price}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateItem({ itemId: item.id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1 || isUpdating}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateItem({ itemId: item.id, quantity: item.quantity + 1 })}
                          disabled={isUpdating}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="font-semibold mb-4">Order Summary</h2>

              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                <Button variant="outline" onClick={() => applyCoupon(couponCode)} disabled={!couponCode}>
                  Apply
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>INR {subtotal}</span>
                </div>
                {cart?.discount && cart.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-INR {cart.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{cart?.shipping === 0 ? "Free" : `INR ${cart?.shipping}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>INR {total}</span>
                </div>
              </div>

              <Button className="w-full mt-6" size="lg" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Taxes and shipping calculated at checkout
              </p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
