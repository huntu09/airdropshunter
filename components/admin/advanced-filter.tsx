"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"

interface FilterOption {
  key: string
  label: string
  type: "text" | "select" | "date" | "number"
  options?: { value: string; label: string }[]
}

interface AdvancedFilterProps {
  filters: FilterOption[]
  onFiltersChange: (filters: Record<string, any>) => void
  activeFilters: Record<string, any>
}

export default function AdvancedFilter({ filters, onFiltersChange, activeFilters }: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempFilters, setTempFilters] = useState(activeFilters)

  const handleFilterChange = (key: string, value: any) => {
    setTempFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const applyFilters = () => {
    onFiltersChange(tempFilters)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    onFiltersChange({})
    setIsOpen(false)
  }

  const removeFilter = (key: string) => {
    const newFilters = { ...activeFilters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  const activeFilterCount = Object.keys(activeFilters).filter((key) => activeFilters[key]).length

  return (
    <div className="space-y-4">
      {/* Filter Trigger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Advanced Filters</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <Label htmlFor={filter.key}>{filter.label}</Label>

                {filter.type === "text" && (
                  <Input
                    id={filter.key}
                    value={tempFilters[filter.key] || ""}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    placeholder={`Filter by ${filter.label.toLowerCase()}`}
                  />
                )}

                {filter.type === "select" && (
                  <Select
                    value={tempFilters[filter.key] || "all"} // Updated default value to "all"
                    onValueChange={(value) => handleFilterChange(filter.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem> // Updated value to "all"
                      {filter.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {filter.type === "date" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempFilters[filter.key] ? format(new Date(tempFilters[filter.key]), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={tempFilters[filter.key] ? new Date(tempFilters[filter.key]) : undefined}
                        onSelect={(date) => handleFilterChange(filter.key, date?.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}

                {filter.type === "number" && (
                  <Input
                    id={filter.key}
                    type="number"
                    value={tempFilters[filter.key] || ""}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    placeholder={`Filter by ${filter.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}

            <div className="flex gap-2 pt-4">
              <Button onClick={applyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null
            const filter = filters.find((f) => f.key === key)
            return (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {filter?.label}: {String(value)}
                <Button variant="ghost" size="sm" className="h-auto p-0 ml-1" onClick={() => removeFilter(key)}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
