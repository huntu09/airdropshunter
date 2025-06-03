"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreHorizontal, UserCheck, UserX, Shield, User, Calendar, Mail } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"

interface UserProfile {
  id: string
  email: string
  username: string
  role: "user" | "admin"
  status: "active" | "banned"
  created_at: string
  last_login: string | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [bulkOperation, setBulkOperation] = useState<string | null>(null)
  const [bulkProgress, setBulkProgress] = useState(0)
  const [showBulkDialog, setShowBulkDialog] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      // Use mock data if database fails
      setUsers([
        {
          id: "1",
          email: "admin@example.com",
          username: "admin",
          role: "admin",
          status: "active",
          created_at: "2024-01-01T00:00:00Z",
          last_login: "2024-01-30T10:00:00Z",
        },
        {
          id: "2",
          email: "user1@example.com",
          username: "crypto_hunter",
          role: "user",
          status: "active",
          created_at: "2024-01-15T00:00:00Z",
          last_login: "2024-01-29T15:30:00Z",
        },
        {
          id: "3",
          email: "user2@example.com",
          username: "airdrop_fan",
          role: "user",
          status: "active",
          created_at: "2024-01-20T00:00:00Z",
          last_login: null,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "banned":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

      if (error) throw error

      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    } catch (error) {
      console.error("Error updating user role:", error)
      alert("Failed to update user role")
    }
  }

  const handleStatusChange = async (userId: string, newStatus: "active" | "banned") => {
    try {
      const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", userId)

      if (error) throw error

      setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
    } catch (error) {
      console.error("Error updating user status:", error)
      alert("Failed to update user status")
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) {
      toast({
        variant: "destructive",
        title: "No items selected",
        description: "Please select at least one user to perform bulk actions.",
      })
      return
    }

    setShowBulkDialog(true)
    setBulkOperation(action)
  }

  const executeBulkAction = async () => {
    const selectedIds = Array.from(selectedUsers)
    setBulkProgress(0)

    try {
      for (let i = 0; i < selectedIds.length; i++) {
        const userId = selectedIds[i]

        switch (bulkOperation) {
          case "delete":
            await supabase.from("profiles").delete().eq("id", userId)
            break
          case "activate":
            await supabase.from("profiles").update({ status: "active" }).eq("id", userId)
            break
          case "ban":
            await supabase.from("profiles").update({ status: "banned" }).eq("id", userId)
            break
          case "make_admin":
            await supabase.from("profiles").update({ role: "admin" }).eq("id", userId)
            break
          case "remove_admin":
            await supabase.from("profiles").update({ role: "user" }).eq("id", userId)
            break
        }

        setBulkProgress(((i + 1) / selectedIds.length) * 100)
        await new Promise((resolve) => setTimeout(resolve, 100)) // Small delay for UX
      }

      await fetchUsers()
      setSelectedUsers(new Set())
      setShowBulkDialog(false)
      setBulkOperation(null)

      toast({
        title: "Bulk action completed",
        description: `Successfully processed ${selectedIds.length} users.`,
      })
    } catch (error: any) {
      console.error("Bulk action error:", error)
      toast({
        variant: "destructive",
        title: "Bulk action failed",
        description: error.message || "An error occurred during bulk action.",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users Management</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage user accounts and permissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter((u) => u.status === "active").length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Admins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">New This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    users.filter((u) => {
                      const userDate = new Date(u.created_at)
                      const now = new Date()
                      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
                    }).length
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Role: {roleFilter === "all" ? "All" : roleFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setRoleFilter("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("admin")}>Admin</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("user")}>User</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBulkAction("activate")}>
              Activate Selected
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction("ban")}>
              Ban Selected
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction("make_admin")}>
              Make Admin
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction("remove_admin")}>
              Remove Admin
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
              Delete Selected
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedUsers(new Set())}>
              Clear Selection
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          const allUserIds = new Set(filteredUsers.map((user) => user.id))
                          setSelectedUsers(allUserIds)
                        } else {
                          setSelectedUsers(new Set())
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        value={user.id}
                        checked={selectedUsers.has(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers((prev) => new Set(prev).add(user.id))
                          } else {
                            const newSet = new Set(selectedUsers)
                            newSet.delete(user.id)
                            setSelectedUsers(newSet)
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                            {user.username[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.role === "user" ? (
                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")}>
                              <Shield className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, "user")}>
                              <User className="h-4 w-4 mr-2" />
                              Remove Admin
                            </DropdownMenuItem>
                          )}
                          {user.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.id, "banned")}
                              className="text-red-600 dark:text-red-400"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Ban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusChange(user.id, "active")}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Unban User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Bulk Action Dialog */}
      <AlertDialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {bulkOperation?.replace("_", " ")} {selectedUsers.size} selected users? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {bulkProgress > 0 && (
            <div className="space-y-2">
              <Progress value={bulkProgress} className="w-full" />
              <p className="text-sm text-gray-500">Processing... {Math.round(bulkProgress)}%</p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkProgress > 0}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeBulkAction} disabled={bulkProgress > 0}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
