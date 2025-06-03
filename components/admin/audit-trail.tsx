"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Eye, User, Activity, RefreshCw, Download, AlertCircle } from "lucide-react"
import { auditTrail, type AuditLog } from "@/lib/audit-trail"
import { useToast } from "@/hooks/use-toast"

interface AuditTrailProps {
  resourceType?: string
  resourceId?: string
  showFilters?: boolean
  limit?: number
}

export default function AuditTrail({ resourceType, resourceId, showFilters = true, limit = 50 }: AuditTrailProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [resourceTypeFilter, setResourceTypeFilter] = useState(resourceType || "all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchLogs()
  }, [resourceType, resourceId, actionFilter, resourceTypeFilter, dateFrom, dateTo])

  const fetchLogs = async () => {
    try {
      setLoading(true)

      const filters: any = { limit }

      if (resourceType) filters.resourceType = resourceType
      if (actionFilter !== "all") filters.action = actionFilter
      if (resourceTypeFilter !== "all") filters.resourceType = resourceTypeFilter
      if (dateFrom) filters.dateFrom = dateFrom
      if (dateTo) filters.dateTo = dateTo

      const data = await auditTrail.getLogs(filters)

      // Filter by resourceId if provided
      let filteredData = data
      if (resourceId) {
        filteredData = data.filter((log) => log.resource_id === resourceId)
      }

      setLogs(filteredData)
    } catch (error: any) {
      console.error("Error fetching audit logs:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch audit logs",
      })
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "update":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "verification_approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "verification_rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "airdrop":
        return "🚀"
      case "user":
        return "👤"
      case "verification":
        return "✅"
      case "notification":
        return "🔔"
      default:
        return "📄"
    }
  }

  const formatChanges = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) return "No changes"

    if (!oldValues) {
      return `Created: ${JSON.stringify(newValues, null, 2)}`
    }

    if (!newValues) {
      return `Deleted: ${JSON.stringify(oldValues, null, 2)}`
    }

    const changes: string[] = []
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])

    allKeys.forEach((key) => {
      if (oldValues[key] !== newValues[key]) {
        changes.push(`${key}: ${oldValues[key]} → ${newValues[key]}`)
      }
    })

    return changes.length > 0 ? changes.join(", ") : "No changes detected"
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_id.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading audit trail...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Trail ({filteredLogs.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="VERIFICATION_APPROVED">Approved</SelectItem>
                  <SelectItem value="VERIFICATION_REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="airdrop">Airdrop</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="verification">Verification</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From date"
                />
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To date" />
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium text-sm">{log.user_email}</div>
                        <div className="text-xs text-gray-500">{log.ip_address}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getResourceTypeIcon(log.resource_type)}</span>
                      <div>
                        <div className="font-medium text-sm capitalize">{log.resource_type}</div>
                        <div className="text-xs text-gray-500 font-mono">{log.resource_id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-sm">
                      {formatChanges(log.old_values, log.new_values)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(log.created_at).toLocaleDateString()}
                      <div className="text-xs text-gray-500">{new Date(log.created_at).toLocaleTimeString()}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Audit Log Details</DialogTitle>
                        </DialogHeader>
                        {selectedLog && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>User</Label>
                                <p className="text-sm font-mono">{selectedLog.user_email}</p>
                              </div>
                              <div>
                                <Label>Action</Label>
                                <Badge className={getActionColor(selectedLog.action)}>{selectedLog.action}</Badge>
                              </div>
                              <div>
                                <Label>Resource Type</Label>
                                <p className="text-sm">{selectedLog.resource_type}</p>
                              </div>
                              <div>
                                <Label>Resource ID</Label>
                                <p className="text-sm font-mono">{selectedLog.resource_id}</p>
                              </div>
                              <div>
                                <Label>IP Address</Label>
                                <p className="text-sm font-mono">{selectedLog.ip_address}</p>
                              </div>
                              <div>
                                <Label>Date</Label>
                                <p className="text-sm">{new Date(selectedLog.created_at).toLocaleString()}</p>
                              </div>
                            </div>

                            {selectedLog.old_values && (
                              <div>
                                <Label>Old Values</Label>
                                <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto max-h-32">
                                  {JSON.stringify(selectedLog.old_values, null, 2)}
                                </pre>
                              </div>
                            )}

                            {selectedLog.new_values && (
                              <div>
                                <Label>New Values</Label>
                                <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto max-h-32">
                                  {JSON.stringify(selectedLog.new_values, null, 2)}
                                </pre>
                              </div>
                            )}

                            {selectedLog.user_agent && (
                              <div>
                                <Label>User Agent</Label>
                                <p className="text-xs text-gray-600 break-all">{selectedLog.user_agent}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit logs found</h3>
            <p className="text-gray-600">No activity has been recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
