"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Users, DollarSign, TrendingUp, BarChart3, Activity, RefreshCw, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ExportData from "@/components/admin/export-data"

interface ReportData {
  id: string
  name: string
  type: "user_activity" | "airdrop_performance" | "financial" | "engagement"
  description: string
  generated_at: string
  status: "generating" | "ready" | "failed"
  file_url?: string
  parameters: any
}

interface QuickStat {
  label: string
  value: string | number
  change: string
  trend: "up" | "down" | "neutral"
  icon: any
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState("30")
  const [reportType, setReportType] = useState("all")
  const [quickStats, setQuickStats] = useState<QuickStat[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchReports()
    fetchQuickStats()
  }, [dateRange])

  const fetchReports = async () => {
    try {
      setLoading(true)

      // Simulasi data reports
      const mockReports: ReportData[] = [
        {
          id: "1",
          name: "Monthly User Activity Report",
          type: "user_activity",
          description: "Comprehensive analysis of user engagement and activity patterns",
          generated_at: "2024-01-30T10:00:00Z",
          status: "ready",
          file_url: "/reports/user-activity-jan-2024.pdf",
          parameters: { period: "monthly", users: "all" },
        },
        {
          id: "2",
          name: "Airdrop Performance Analysis",
          type: "airdrop_performance",
          description: "Performance metrics for all active airdrops",
          generated_at: "2024-01-29T15:30:00Z",
          status: "ready",
          file_url: "/reports/airdrop-performance-jan-2024.pdf",
          parameters: { period: "monthly", status: "active" },
        },
        {
          id: "3",
          name: "Financial Summary Report",
          type: "financial",
          description: "Revenue and cost analysis for the platform",
          generated_at: "2024-01-28T09:00:00Z",
          status: "ready",
          file_url: "/reports/financial-summary-jan-2024.pdf",
          parameters: { period: "monthly", currency: "USD" },
        },
        {
          id: "4",
          name: "User Engagement Metrics",
          type: "engagement",
          description: "Detailed engagement analytics and user behavior",
          generated_at: "2024-01-30T14:00:00Z",
          status: "generating",
          parameters: { period: "weekly", metrics: "all" },
        },
      ]

      setReports(mockReports)
    } catch (error: any) {
      console.error("Error fetching reports:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch reports",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchQuickStats = async () => {
    try {
      // Simulasi quick stats berdasarkan date range
      const stats: QuickStat[] = [
        {
          label: "Total Users",
          value: "2,547",
          change: "+12.5%",
          trend: "up",
          icon: Users,
        },
        {
          label: "Active Airdrops",
          value: "23",
          change: "+3",
          trend: "up",
          icon: DollarSign,
        },
        {
          label: "Completion Rate",
          value: "68.4%",
          change: "+5.2%",
          trend: "up",
          icon: TrendingUp,
        },
        {
          label: "Platform Revenue",
          value: "$12,450",
          change: "-2.1%",
          trend: "down",
          icon: BarChart3,
        },
      ]

      setQuickStats(stats)
    } catch (error: any) {
      console.error("Error fetching quick stats:", error)
    }
  }

  const generateReport = async (type: string, name: string) => {
    try {
      setGenerating(type)

      // Simulasi generate report
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const newReport: ReportData = {
        id: Date.now().toString(),
        name,
        type: type as any,
        description: `Generated ${name.toLowerCase()} for ${dateRange} days period`,
        generated_at: new Date().toISOString(),
        status: "ready",
        file_url: `/reports/${type}-${Date.now()}.pdf`,
        parameters: { period: `${dateRange}days`, generated_by: "admin" },
      }

      setReports([newReport, ...reports])

      toast({
        title: "Success",
        description: `${name} has been generated successfully`,
      })
    } catch (error: any) {
      console.error("Error generating report:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report",
      })
    } finally {
      setGenerating(null)
    }
  }

  const downloadReport = (report: ReportData) => {
    // Simulasi download
    toast({
      title: "Download Started",
      description: `Downloading ${report.name}...`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "generating":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "user_activity":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "airdrop_performance":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "financial":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "engagement":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const filteredReports = reports.filter((report) => reportType === "all" || report.type === reportType)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">Generate and manage platform reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReports}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <ExportData table="reports" filename="reports-summary" buttonText="Export All" variant="outline" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p
                    className={`text-sm ${
                      stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-gray-600"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <stat.icon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="user_activity">User Activity</SelectItem>
                  <SelectItem value="airdrop_performance">Airdrop Performance</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">Generated Reports</TabsTrigger>
          <TabsTrigger value="generate">Generate New</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Reports ({filteredReports.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{report.name}</div>
                            <div className="text-sm text-gray-500">{report.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(report.type)}>{report.type.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status === "generating" && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(report.generated_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {report.status === "ready" && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => downloadReport(report)}>
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </>
                            )}
                            {report.status === "generating" && (
                              <Button size="sm" variant="outline" disabled>
                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                Generating...
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-600">Generate your first report to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          {/* Generate New Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Activity Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Comprehensive analysis of user registration, engagement, and activity patterns.
                </p>
                <Button
                  onClick={() => generateReport("user_activity", "User Activity Report")}
                  disabled={generating === "user_activity"}
                  className="w-full"
                >
                  {generating === "user_activity" ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Airdrop Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Performance metrics, completion rates, and ROI analysis for all airdrops.
                </p>
                <Button
                  onClick={() => generateReport("airdrop_performance", "Airdrop Performance Report")}
                  disabled={generating === "airdrop_performance"}
                  className="w-full"
                >
                  {generating === "airdrop_performance" ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Revenue analysis, cost breakdown, and financial performance metrics.
                </p>
                <Button
                  onClick={() => generateReport("financial", "Financial Summary Report")}
                  disabled={generating === "financial"}
                  className="w-full"
                >
                  {generating === "financial" ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">User engagement analytics, retention rates, and behavior patterns.</p>
                <Button
                  onClick={() => generateReport("engagement", "Engagement Metrics Report")}
                  disabled={generating === "engagement"}
                  className="w-full"
                >
                  {generating === "engagement" ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
