"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  Upload,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Save,
  Loader2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import ExportData from "@/components/admin/export-data"

interface Airdrop {
  id: string
  title: string
  description: string
  category: string
  status: "pending" | "active" | "completed" | "cancelled"
  reward_amount: string
  start_date: string
  end_date: string
  participants_count: number
  created_at: string
  featured: boolean
  priority: number
}

type SortField = "title" | "category" | "status" | "reward_amount" | "participants_count" | "created_at" | "end_date"
type SortDirection = "asc" | "desc"

export default function AirdropsPage() {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [featuredFilter, setFeaturedFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedAirdrops, setSelectedAirdrops] = useState<Set<string>>(new Set())
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [editingAirdrop, setEditingAirdrop] = useState<Airdrop | null>(null)
  const [quickEditLoading, setQuickEditLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchAirdrops()
  }, [])

  const fetchAirdrops = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("airdrops")
        .select(`
          id,
          title,
          description,
          category,
          status,
          reward_amount,
          start_date,
          end_date,
          participants_count,
          created_at,
          featured,
          priority
        `)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setAirdrops(data || [])
    } catch (err: any) {
      console.error("Error fetching airdrops:", err)
      setError(err.message || "Failed to fetch airdrops")

      // Fallback to mock data
      setAirdrops([
        {
          id: "mock-1",
          title: "Sample Airdrop 1",
          description: "This is a sample airdrop for testing",
          category: "DeFi",
          status: "active",
          reward_amount: "$50",
          start_date: "2024-01-01T00:00:00Z",
          end_date: "2024-12-31T00:00:00Z",
          participants_count: 1234,
          created_at: "2024-01-01T00:00:00Z",
          featured: true,
          priority: 1,
        },
        {
          id: "mock-2",
          title: "Sample Airdrop 2",
          description: "Another sample airdrop",
          category: "NFT",
          status: "pending",
          reward_amount: "100 TOKENS",
          start_date: "2024-02-01T00:00:00Z",
          end_date: "2024-11-30T00:00:00Z",
          participants_count: 856,
          created_at: "2024-01-15T00:00:00Z",
          featured: false,
          priority: 0,
        },
        {
          id: "mock-3",
          title: "Gaming Airdrop",
          description: "Gaming platform token distribution",
          category: "Gaming",
          status: "completed",
          reward_amount: "200 GAME",
          start_date: "2024-01-01T00:00:00Z",
          end_date: "2024-06-30T00:00:00Z",
          participants_count: 2500,
          created_at: "2024-01-01T00:00:00Z",
          featured: true,
          priority: 2,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Advanced filtering and sorting
  const filteredAndSortedAirdrops = airdrops
    .filter((airdrop) => {
      const matchesSearch =
        airdrop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airdrop.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || airdrop.status === statusFilter
      const matchesCategory = categoryFilter === "all" || airdrop.category === categoryFilter
      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && airdrop.featured) ||
        (featuredFilter === "not-featured" && !airdrop.featured)

      return matchesSearch && matchesStatus && matchesCategory && matchesFeatured
    })
    .sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle different data types
      if (sortField === "participants_count" || sortField === "priority") {
        aValue = Number(aValue) || 0
        bValue = Number(bValue) || 0
      } else if (sortField === "created_at" || sortField === "start_date" || sortField === "end_date") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else {
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredAndSortedAirdrops.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredAndSortedAirdrops.length / itemsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedAirdrops.size === currentItems.length) {
      setSelectedAirdrops(new Set())
    } else {
      setSelectedAirdrops(new Set(currentItems.map((a) => a.id)))
    }
  }

  const handleSelectAirdrop = (id: string) => {
    const newSelected = new Set(selectedAirdrops)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedAirdrops(newSelected)
  }

  const handleBulkAction = async (action: string) => {
    if (selectedAirdrops.size === 0) {
      toast({
        variant: "destructive",
        title: "No items selected",
        description: "Please select at least one airdrop to perform bulk actions.",
      })
      return
    }

    const selectedIds = Array.from(selectedAirdrops)

    try {
      switch (action) {
        case "delete":
          const confirmDelete = confirm(
            `Are you sure you want to delete ${selectedIds.length} airdrops? This action cannot be undone.`,
          )
          if (!confirmDelete) return

          const { error } = await supabase.from("airdrops").delete().in("id", selectedIds)

          if (error) throw error

          setAirdrops(airdrops.filter((a) => !selectedIds.includes(a.id)))
          setSelectedAirdrops(new Set())

          toast({
            title: "Bulk delete successful",
            description: `${selectedIds.length} airdrops have been deleted.`,
          })
          break

        case "activate":
          const { error: activateError } = await supabase
            .from("airdrops")
            .update({ status: "active" })
            .in("id", selectedIds)

          if (activateError) throw activateError

          setAirdrops(airdrops.map((a) => (selectedIds.includes(a.id) ? { ...a, status: "active" as const } : a)))
          setSelectedAirdrops(new Set())

          toast({
            title: "Bulk activation successful",
            description: `${selectedIds.length} airdrops have been activated.`,
          })
          break

        case "deactivate":
          const { error: deactivateError } = await supabase
            .from("airdrops")
            .update({ status: "pending" })
            .in("id", selectedIds)

          if (deactivateError) throw deactivateError

          setAirdrops(airdrops.map((a) => (selectedIds.includes(a.id) ? { ...a, status: "pending" as const } : a)))
          setSelectedAirdrops(new Set())

          toast({
            title: "Bulk deactivation successful",
            description: `${selectedIds.length} airdrops have been deactivated.`,
          })
          break

        case "feature":
          const { error: featureError } = await supabase
            .from("airdrops")
            .update({ featured: true })
            .in("id", selectedIds)

          if (featureError) throw featureError

          setAirdrops(airdrops.map((a) => (selectedIds.includes(a.id) ? { ...a, featured: true } : a)))
          setSelectedAirdrops(new Set())

          toast({
            title: "Bulk feature successful",
            description: `${selectedIds.length} airdrops have been featured.`,
          })
          break
      }
    } catch (error: any) {
      console.error("Bulk action error:", error)
      toast({
        variant: "destructive",
        title: "Bulk action failed",
        description: error.message || "An error occurred during bulk action.",
      })
    }
  }

  // Quick edit
  const handleQuickEdit = async (airdrop: Airdrop) => {
    setEditingAirdrop(airdrop)
  }

  const handleQuickEditSave = async () => {
    if (!editingAirdrop) return

    try {
      setQuickEditLoading(true)

      const { error } = await supabase
        .from("airdrops")
        .update({
          title: editingAirdrop.title,
          description: editingAirdrop.description,
          status: editingAirdrop.status,
          featured: editingAirdrop.featured,
          reward_amount: editingAirdrop.reward_amount,
        })
        .eq("id", editingAirdrop.id)

      if (error) throw error

      setAirdrops(airdrops.map((a) => (a.id === editingAirdrop.id ? editingAirdrop : a)))
      setEditingAirdrop(null)

      toast({
        title: "Quick edit successful",
        description: "Airdrop has been updated successfully.",
      })
    } catch (error: any) {
      console.error("Quick edit error:", error)
      toast({
        variant: "destructive",
        title: "Quick edit failed",
        description: error.message || "An error occurred while updating the airdrop.",
      })
    } finally {
      setQuickEditLoading(false)
    }
  }

  // Import functionality
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const lines = text.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

      const importedData = lines
        .slice(1)
        .filter((line) => line.trim())
        .map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = values[index] || ""
          })
          return obj
        })

      // Validate and insert data
      for (const item of importedData) {
        if (item.title && item.description) {
          const { error } = await supabase.from("airdrops").insert({
            title: item.title,
            description: item.description,
            category: item.category || "Other",
            status: item.status || "pending",
            reward_amount: item.reward_amount || "0",
            start_date: item.start_date || new Date().toISOString(),
            end_date: item.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            featured: item.featured === "true" || false,
            priority: Number.parseInt(item.priority) || 0,
          })

          if (error) {
            console.error("Import error for item:", item, error)
          }
        }
      }

      await fetchAirdrops()

      toast({
        title: "Import successful",
        description: `${importedData.length} airdrops have been imported.`,
      })
    } catch (error: any) {
      console.error("Import error:", error)
      toast({
        variant: "destructive",
        title: "Import failed",
        description: error.message || "An error occurred while importing data.",
      })
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDelete = async (id: string, title: string) => {
    const confirmMessage = `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone and will:\n- Remove all associated tasks\n- Remove all participant data\n- Remove all verification records\n\nType "DELETE" to confirm:`

    const userInput = prompt(confirmMessage)

    if (userInput !== "DELETE") {
      if (userInput !== null) {
        toast({
          variant: "destructive",
          title: "Deletion cancelled",
          description: "You must type 'DELETE' exactly to confirm.",
        })
      }
      return
    }

    try {
      const { error } = await supabase.from("airdrops").delete().eq("id", id)
      if (error) throw error

      setAirdrops(airdrops.filter((airdrop) => airdrop.id !== id))

      toast({
        title: "Airdrop deleted",
        description: `"${title}" has been successfully deleted.`,
      })
    } catch (error: any) {
      console.error("Error deleting airdrop:", error)
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message || "An unexpected error occurred",
      })
    }
  }

  const categories = Array.from(new Set(airdrops.map((a) => a.category)))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Airdrops Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading airdrops...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Airdrops Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage all airdrops and campaigns</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <ExportData
            table="airdrops"
            filename="airdrops"
            buttonText="Export CSV"
            variant="outline"
            className="w-full sm:w-auto"
          />
          <Link href="/admin-dashboard/airdrops/create">
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add New Airdrop
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-semibold text-red-800">Database Connection Issue</h4>
                <p className="text-sm text-red-600">{error}</p>
                <p className="text-xs text-red-500 mt-1">Showing sample data. Please check your database connection.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Total Airdrops</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{airdrops.length}</p>
              </div>
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                  {airdrops.filter((a) => a.status === "active").length}
                </p>
              </div>
              <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Participants</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                  {airdrops.reduce((sum, a) => sum + (a.participants_count || 0), 0).toLocaleString()}
                </p>
              </div>
              <Users className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                  {airdrops.filter((a) => a.status === "completed").length}
                </p>
              </div>
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Desktop */}
      <Card className="hidden md:block">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search airdrops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="not-featured">Not Featured</SelectItem>
              </SelectContent>
            </Select>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Filters */}
      <div className="md:hidden">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Featured</Label>
                  <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="not-featured">Not Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Items per page</Label>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 per page</SelectItem>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAirdrops.size > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  {selectedAirdrops.size} item(s) selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("activate")}>
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("deactivate")}>
                  Deactivate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("feature")}>
                  Feature
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
                  Delete
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedAirdrops(new Set())}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Airdrops Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Airdrops ({filteredAndSortedAirdrops.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedAirdrops.size === currentItems.length && currentItems.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("title")} className="h-auto p-0 font-semibold">
                      Title {getSortIcon("title")}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <Button variant="ghost" onClick={() => handleSort("category")} className="h-auto p-0 font-semibold">
                      Category {getSortIcon("category")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("status")} className="h-auto p-0 font-semibold">
                      Status {getSortIcon("status")}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("reward_amount")}
                      className="h-auto p-0 font-semibold"
                    >
                      Reward {getSortIcon("reward_amount")}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("participants_count")}
                      className="h-auto p-0 font-semibold"
                    >
                      Participants {getSortIcon("participants_count")}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    <Button variant="ghost" onClick={() => handleSort("end_date")} className="h-auto p-0 font-semibold">
                      End Date {getSortIcon("end_date")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((airdrop) => (
                  <TableRow key={airdrop.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedAirdrops.has(airdrop.id)}
                        onCheckedChange={() => handleSelectAirdrop(airdrop.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <span className="truncate max-w-[150px] md:max-w-[200px]">{airdrop.title}</span>
                          {airdrop.featured && (
                            <Badge variant="secondary" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px] md:max-w-[200px] md:hidden">
                          {airdrop.description}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px] hidden md:block">
                          {airdrop.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{airdrop.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(airdrop.status)}>
                        {airdrop.status.charAt(0).toUpperCase() + airdrop.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium hidden sm:table-cell">{airdrop.reward_amount}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {(airdrop.participants_count || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {airdrop.end_date ? new Date(airdrop.end_date).toLocaleDateString() : "No end date"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin-dashboard/airdrops/${airdrop.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickEdit(airdrop)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Quick Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin-dashboard/airdrops/${airdrop.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Full Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(airdrop.id, airdrop.title)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAndSortedAirdrops.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No airdrops found</p>
              <Link href="/admin-dashboard/airdrops/create">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Airdrop
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredAndSortedAirdrops.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAndSortedAirdrops.length)} of{" "}
            {filteredAndSortedAirdrops.length} results
          </div>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="hidden sm:inline-flex"
                  >
                    {pageNum}
                  </Button>
                )
              }
              return null
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Quick Edit Dialog */}
      <Dialog open={!!editingAirdrop} onOpenChange={() => setEditingAirdrop(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Edit Airdrop</DialogTitle>
          </DialogHeader>
          {editingAirdrop && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingAirdrop.title}
                  onChange={(e) => setEditingAirdrop({ ...editingAirdrop, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingAirdrop.description}
                  onChange={(e) => setEditingAirdrop({ ...editingAirdrop, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingAirdrop.status}
                    onValueChange={(value: any) => setEditingAirdrop({ ...editingAirdrop, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-reward">Reward Amount</Label>
                  <Input
                    id="edit-reward"
                    value={editingAirdrop.reward_amount}
                    onChange={(e) => setEditingAirdrop({ ...editingAirdrop, reward_amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-featured"
                  checked={editingAirdrop.featured}
                  onCheckedChange={(checked) => setEditingAirdrop({ ...editingAirdrop, featured: checked })}
                />
                <Label htmlFor="edit-featured">Featured</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingAirdrop(null)}>
                  Cancel
                </Button>
                <Button onClick={handleQuickEditSave} disabled={quickEditLoading}>
                  {quickEditLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
