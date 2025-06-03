"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface TestResult {
  name: string
  status: "success" | "error" | "warning"
  message: string
  data?: any
}

export default function AdminTestPanel() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    const results: TestResult[] = []

    // Test 1: Admin Stats
    try {
      const { data, error } = await supabase.rpc("get_admin_stats")
      if (error) throw error
      results.push({
        name: "Admin Stats Function",
        status: "success",
        message: `Retrieved stats successfully. Total users: ${data.total_users}`,
        data,
      })
    } catch (error: any) {
      results.push({
        name: "Admin Stats Function",
        status: "error",
        message: error.message,
      })
    }

    // Test 2: Recent Activities
    try {
      const { data, error } = await supabase.rpc("get_recent_activities", { limit_count: 5 })
      if (error) throw error
      results.push({
        name: "Recent Activities Function",
        status: "success",
        message: `Retrieved ${data?.length || 0} activities`,
        data,
      })
    } catch (error: any) {
      results.push({
        name: "Recent Activities Function",
        status: "error",
        message: error.message,
      })
    }

    // Test 3: User Analytics
    try {
      const { data, error } = await supabase.rpc("get_user_analytics")
      if (error) throw error
      results.push({
        name: "User Analytics Function",
        status: "success",
        message: "User analytics retrieved successfully",
        data,
      })
    } catch (error: any) {
      results.push({
        name: "User Analytics Function",
        status: "error",
        message: error.message,
      })
    }

    // Test 4: Airdrops Table Access
    try {
      const { data, error } = await supabase.from("airdrops").select("*").limit(5)
      if (error) throw error
      results.push({
        name: "Airdrops Table Access",
        status: "success",
        message: `Can access airdrops table. Found ${data?.length || 0} records`,
        data,
      })
    } catch (error: any) {
      results.push({
        name: "Airdrops Table Access",
        status: "error",
        message: error.message,
      })
    }

    // Test 5: Categories Table
    try {
      const { data, error } = await supabase.from("categories").select("*")
      if (error) throw error
      results.push({
        name: "Categories Table Access",
        status: "success",
        message: `Found ${data?.length || 0} categories`,
        data,
      })
    } catch (error: any) {
      results.push({
        name: "Categories Table Access",
        status: "error",
        message: error.message,
      })
    }

    // Test 6: Admin Settings
    try {
      const { data, error } = await supabase.from("admin_settings").select("*")
      if (error) throw error
      results.push({
        name: "Admin Settings Access",
        status: "success",
        message: `Found ${data?.length || 0} settings`,
        data,
      })
    } catch (error: any) {
      results.push({
        name: "Admin Settings Access",
        status: "error",
        message: error.message,
      })
    }

    // Test 7: Log Admin Action
    try {
      const { error } = await supabase.rpc("log_admin_action", {
        action_type: "test_action",
        target_type_param: "test",
        target_id_param: null,
        old_data_param: { test: "old" },
        new_data_param: { test: "new" },
      })
      if (error) throw error
      results.push({
        name: "Admin Logging Function",
        status: "success",
        message: "Successfully logged admin action",
      })
    } catch (error: any) {
      results.push({
        name: "Admin Logging Function",
        status: "error",
        message: error.message,
      })
    }

    // Test 8: Profile Access
    try {
      const { data, error } = await supabase.from("profiles").select("*").limit(5)
      if (error) throw error
      results.push({
        name: "Profiles Table Access",
        status: "success",
        message: `Can access profiles. Found ${data?.length || 0} users`,
        data,
      })
    } catch (error: any) {
      results.push({
        name: "Profiles Table Access",
        status: "error",
        message: error.message,
      })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      success: { label: "Success", className: "bg-green-600" },
      error: { label: "Error", className: "bg-red-600" },
      warning: { label: "Warning", className: "bg-yellow-600" },
    }
    const statusConfig = config[status as keyof typeof config] || config.error
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
  }

  return (
    <Card className="bg-[#0f1623]/80 border-gray-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Admin Panel System Tests</CardTitle>
          <Button onClick={runTests} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {testResults.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Click "Run Tests" to verify all admin functions are working correctly</p>
          </div>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-[#0a0e17]/30 rounded-lg">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{result.name}</h4>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-gray-400 text-sm">{result.message}</p>
                {result.data && (
                  <details className="mt-2">
                    <summary className="text-blue-400 text-xs cursor-pointer">View Data</summary>
                    <pre className="text-xs text-gray-500 mt-1 overflow-auto max-h-32">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))
        )}

        {testResults.length > 0 && (
          <div className="mt-6 p-4 bg-[#0a0e17]/30 rounded-lg">
            <h4 className="text-white font-medium mb-2">Test Summary</h4>
            <div className="flex gap-4 text-sm">
              <span className="text-green-400">
                ✓ {testResults.filter((r) => r.status === "success").length} Passed
              </span>
              <span className="text-red-400">✗ {testResults.filter((r) => r.status === "error").length} Failed</span>
              <span className="text-yellow-400">
                ⚠ {testResults.filter((r) => r.status === "warning").length} Warnings
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
