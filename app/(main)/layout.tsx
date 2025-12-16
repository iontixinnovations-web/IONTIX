/**
 * Main App Layout
 * With navigation and bottom tabs
 */

import type { ReactNode } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { Header } from "@/components/navigation/header"

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  )
}
