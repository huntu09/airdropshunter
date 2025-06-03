"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import type { Category } from "@/lib/supabase"

interface CategoryFilterProps {
  onCategoryChange?: (category: string) => void
  initialCategory?: string
}

// Fallback categories in case API fails
const fallbackCategories: Category[] = [
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
  {
    id: "defi",
    name: "DeFi",
    slug: "defi",
    icon: "coins",
    color: "#10B981",
    active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "nft",
    name: "NFT",
    slug: "nft",
    icon: "image",
    color: "#8B5CF6",
    active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "gaming",
    name: "Gaming",
    slug: "gaming",
    icon: "gamepad-2",
    color: "#F59E0B",
    active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: "layer2",
    name: "Layer 2",
    slug: "layer2",
    icon: "layers",
    color: "#3B82F6",
    active: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: "metaverse",
    name: "Metaverse",
    slug: "metaverse",
    icon: "globe",
    color: "#EC4899",
    active: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
  },
]

export default function CategoryFilter({ onCategoryChange, initialCategory = "all" }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories)
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        // Use API endpoint for client-side fetching
        const res = await fetch("/api/categories")
        if (!res.ok) throw new Error("Failed to fetch categories")

        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        // Keep using fallback categories
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    if (onCategoryChange) {
      onCategoryChange(category)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="mb-12">
      {/* Desktop version */}
      <div className="hidden md:flex flex-wrap justify-center gap-4">
        {categories.map((category) => (
          <Button
            key={category.slug}
            variant="outline"
            className="rounded-full px-8 py-6 relative overflow-hidden border-blue-600/50 hover:border-blue-500 transition-all duration-300"
            onClick={() => handleCategoryChange(category.slug)}
            style={category.color && activeCategory !== category.slug ? { borderColor: `${category.color}30` } : {}}
          >
            {activeCategory === category.slug && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0"
                style={{ background: category.color || "linear-gradient(to right, #3b82f6, #2563eb)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            <span
              className={`relative z-10 font-medium text-base ${
                activeCategory === category.slug ? "text-white" : "text-gray-300"
              }`}
            >
              {category.name}
            </span>
          </Button>
        ))}
      </div>

      {/* Mobile version - Horizontal scroll */}
      <div className="md:hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 px-4 pb-2" style={{ width: "max-content" }}>
            {categories.map((category) => (
              <Button
                key={category.slug}
                variant="outline"
                className="rounded-full px-6 py-3 relative overflow-hidden border-blue-600/50 hover:border-blue-500 transition-all duration-300 whitespace-nowrap flex-shrink-0"
                onClick={() => handleCategoryChange(category.slug)}
                style={category.color && activeCategory !== category.slug ? { borderColor: `${category.color}30` } : {}}
              >
                {activeCategory === category.slug && (
                  <motion.div
                    layoutId="activePillMobile"
                    className="absolute inset-0"
                    style={{ background: category.color || "linear-gradient(to right, #3b82f6, #2563eb)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span
                  className={`relative z-10 font-medium text-sm ${
                    activeCategory === category.slug ? "text-white" : "text-gray-300"
                  }`}
                >
                  {category.name}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-600/30"></div>
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <div className="w-2 h-2 rounded-full bg-blue-600/30"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
