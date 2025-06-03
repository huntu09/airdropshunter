import { NextResponse } from "next/server"
import { dbHelpers } from "@/lib/supabase"

export async function GET() {
  try {
    // Use centralized dbHelpers for consistent error handling
    const categories = await dbHelpers.categories.getAll(true)

    // Add "All" category at the beginning
    const allCategories = [
      {
        id: "all",
        name: "All",
        slug: "all",
        icon: "layers",
        color: "#64748b",
        active: true,
        sort_order: 0,
        created_at: new Date().toISOString(),
      },
      ...categories,
    ]

    return NextResponse.json(allCategories)
  } catch (error: any) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 })
  }
}
