"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Filter, SlidersHorizontal, X, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import { AirdropCard } from "@/components/airdrop-card"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchFilters {
  categories: string[]
  status: string[]
  difficulty: string[]
  blockchain: string[]
  rewardType: string[]
}

interface Airdrop {
  id: string
  title: string
  description: string
  short_description?: string
  category: string
  status: string
  reward_amount: string
  reward_type: string
  blockchain: string
  difficulty_level: string
  start_date: string
  end_date: string
  logo_url?: string
  banner_url?: string
  featured: boolean
  participants_count: number
  max_participants: number
  views_count: number
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Popular" },
  { value: "reward_high", label: "Highest Reward" },
  { value: "ending_soon", label: "Ending Soon" },
]

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
]

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
]

const BLOCKCHAIN_OPTIONS = [
  { value: "ethereum", label: "Ethereum" },
  { value: "polygon", label: "Polygon" },
  { value: "bsc", label: "BSC" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "optimism", label: "Optimism" },
]

const REWARD_TYPE_OPTIONS = [
  { value: "token", label: "Tokens" },
  { value: "nft", label: "NFTs" },
  { value: "other", label: "Other" },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    status: [],
    difficulty: [],
    blockchain: [],
    rewardType: [],
  })
  const [airdrops, setAirdrops] = useState<Airdrop[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Debounce search query untuk performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase.from("categories").select("*").eq("active", true).order("sort_order")

        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        console.error("Error loading categories:", error)
      }
    }
    loadCategories()
  }, [])

  // Search airdrops
  useEffect(() => {
    async function searchAirdrops() {
      setLoading(true)
      try {
        let query = supabase.from("airdrops").select("*")

        // Apply search query
        if (debouncedSearchQuery.trim()) {
          query = query.or(
            `title.ilike.%${debouncedSearchQuery}%,description.ilike.%${debouncedSearchQuery}%,short_description.ilike.%${debouncedSearchQuery}%`,
          )
        }

        // Apply filters
        if (filters.categories.length > 0) {
          query = query.in("category", filters.categories)
        }
        if (filters.status.length > 0) {
          query = query.in("status", filters.status)
        }
        if (filters.difficulty.length > 0) {
          query = query.in("difficulty_level", filters.difficulty)
        }
        if (filters.blockchain.length > 0) {
          query = query.in("blockchain", filters.blockchain)
        }
        if (filters.rewardType.length > 0) {
          query = query.in("reward_type", filters.rewardType)
        }

        // Apply sorting
        switch (sortBy) {
          case "newest":
            query = query.order("created_at", { ascending: false })
            break
          case "oldest":
            query = query.order("created_at", { ascending: true })
            break
          case "popular":
            query = query.order("views_count", { ascending: false })
            break
          case "reward_high":
            query = query.order("reward_amount", { ascending: false })
            break
          case "ending_soon":
            query = query.order("end_date", { ascending: true })
            break
        }

        const { data, error, count } = await query.limit(50)

        if (error) throw error

        setAirdrops(data || [])
        setTotalResults(count || data?.length || 0)
      } catch (error) {
        console.error("Error searching airdrops:", error)
        setAirdrops([])
        setTotalResults(0)
      } finally {
        setLoading(false)
      }
    }

    searchAirdrops()
  }, [debouncedSearchQuery, filters, sortBy])

  // Handle filter changes
  const handleFilterChange = (filterType: keyof SearchFilters, value: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: checked ? [...prev[filterType], value] : prev[filterType].filter((item) => item !== value),
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      categories: [],
      status: [],
      difficulty: [],
      blockchain: [],
      rewardType: [],
    })
  }

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0)
  }, [filters])

  // Remove specific filter
  const removeFilter = (filterType: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].filter((item) => item !== value),
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0f1623] to-[#1a1f2e]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            DISCOVER AIRDROPS
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Find the perfect airdrop opportunities with our advanced search and filtering system.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="bg-[#0f1623]/80 border-gray-800/50 mb-8 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search airdrops by name, description, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none text-lg"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Mobile Filter Button */}
          <div className="md:hidden">
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full border-gray-700 bg-[#0f1623]/80">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#0f1623] border-gray-800">
                <SheetHeader>
                  <SheetTitle className="text-white">Filters</SheetTitle>
                </SheetHeader>
                <FilterContent
                  categories={categories}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex gap-4 flex-wrap">
            <FilterDropdown
              title="Categories"
              options={categories.map((cat) => ({ value: cat.slug, label: cat.name }))}
              selected={filters.categories}
              onChange={(value, checked) => handleFilterChange("categories", value, checked)}
            />
            <FilterDropdown
              title="Status"
              options={STATUS_OPTIONS}
              selected={filters.status}
              onChange={(value, checked) => handleFilterChange("status", value, checked)}
            />
            <FilterDropdown
              title="Difficulty"
              options={DIFFICULTY_OPTIONS}
              selected={filters.difficulty}
              onChange={(value, checked) => handleFilterChange("difficulty", value, checked)}
            />
            <FilterDropdown
              title="Blockchain"
              options={BLOCKCHAIN_OPTIONS}
              selected={filters.blockchain}
              onChange={(value, checked) => handleFilterChange("blockchain", value, checked)}
            />
            <FilterDropdown
              title="Reward Type"
              options={REWARD_TYPE_OPTIONS}
              selected={filters.rewardType}
              onChange={(value, checked) => handleFilterChange("rewardType", value, checked)}
            />
          </div>

          {/* Sort */}
          <div className="md:ml-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[200px] border-gray-700 bg-[#0f1623]/80">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f1623] border-gray-700">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-400">Active filters:</span>
              {Object.entries(filters).map(([filterType, values]) =>
                values.map((value) => (
                  <Badge
                    key={`${filterType}-${value}`}
                    variant="secondary"
                    className="bg-blue-600/20 text-blue-300 border-blue-600/30"
                  >
                    {value}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2 text-blue-300 hover:text-white"
                      onClick={() => removeFilter(filterType as keyof SearchFilters, value)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )),
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-white">
                Clear all
              </Button>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-400">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </div>
            ) : (
              `${totalResults} airdrops found`
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-[#0f1623]/80 border-gray-800/50 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-3 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : airdrops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {airdrops.map((airdrop) => (
              <AirdropCard key={airdrop.id} airdrop={airdrop} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No airdrops found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search terms or filters to find more results.</p>
            <Button onClick={clearFilters} variant="outline" className="border-gray-700">
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Filter Dropdown Component
function FilterDropdown({
  title,
  options,
  selected,
  onChange,
}: {
  title: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (value: string, checked: boolean) => void
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="border-gray-700 bg-[#0f1623]/80">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {title}
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
              {selected.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-[#0f1623] border-gray-800">
        <SheetHeader>
          <SheetTitle className="text-white">{title}</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={selected.includes(option.value)}
                onCheckedChange={(checked) => onChange(option.value, checked as boolean)}
                className="border-gray-600"
              />
              <label htmlFor={option.value} className="text-sm text-gray-300 cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Filter Content Component for Mobile
function FilterContent({
  categories,
  filters,
  onFilterChange,
  onClearFilters,
}: {
  categories: any[]
  filters: SearchFilters
  onFilterChange: (filterType: keyof SearchFilters, value: string, checked: boolean) => void
  onClearFilters: () => void
}) {
  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-gray-400">
          Clear all
        </Button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.slug} className="flex items-center space-x-2">
              <Checkbox
                id={category.slug}
                checked={filters.categories.includes(category.slug)}
                onCheckedChange={(checked) => onFilterChange("categories", category.slug, checked as boolean)}
                className="border-gray-600"
              />
              <label htmlFor={category.slug} className="text-sm text-gray-300 cursor-pointer">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Status</h4>
        <div className="space-y-2">
          {STATUS_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={filters.status.includes(option.value)}
                onCheckedChange={(checked) => onFilterChange("status", option.value, checked as boolean)}
                className="border-gray-600"
              />
              <label htmlFor={option.value} className="text-sm text-gray-300 cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Difficulty</h4>
        <div className="space-y-2">
          {DIFFICULTY_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={filters.difficulty.includes(option.value)}
                onCheckedChange={(checked) => onFilterChange("difficulty", option.value, checked as boolean)}
                className="border-gray-600"
              />
              <label htmlFor={option.value} className="text-sm text-gray-300 cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Blockchain */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Blockchain</h4>
        <div className="space-y-2">
          {BLOCKCHAIN_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={filters.blockchain.includes(option.value)}
                onCheckedChange={(checked) => onFilterChange("blockchain", option.value, checked as boolean)}
                className="border-gray-600"
              />
              <label htmlFor={option.value} className="text-sm text-gray-300 cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Reward Type */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Reward Type</h4>
        <div className="space-y-2">
          {REWARD_TYPE_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={filters.rewardType.includes(option.value)}
                onCheckedChange={(checked) => onFilterChange("rewardType", option.value, checked as boolean)}
                className="border-gray-600"
              />
              <label htmlFor={option.value} className="text-sm text-gray-300 cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
