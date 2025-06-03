import type React from "react"
import type { Metadata } from "next"
import AdminLayout from "@/components/admin/admin-layout"

export const metadata: Metadata = {
  title: "Admin Dashboard - Airdrops Hunter",
  description: "Manage airdrops, users, and analytics",
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
