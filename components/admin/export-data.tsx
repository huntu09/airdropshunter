"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface ExportDataProps {
  table: string
  filename?: string
  buttonText?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function ExportData({
  table,
  filename,
  buttonText = "Export Data",
  variant = "outline",
  size = "sm",
  className = "",
}: ExportDataProps) {
  const [loading, setLoading] = useState(false)

  const exportToCSV = async () => {
    try {
      setLoading(true)

      // Fetch data from the specified table
      const { data, error } = await supabase.from(table).select("*")

      if (error) throw error

      if (!data || data.length === 0) {
        toast({
          title: "No data to export",
          description: `The ${table} table is empty.`,
          variant: "default",
        })
        return
      }

      // Convert data to CSV
      const headers = Object.keys(data[0])
      const csvRows = [
        // Headers row
        headers.join(","),
        // Data rows
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header]
              // Handle special cases (objects, arrays, null values)
              if (value === null) return ""
              if (typeof value === "object") return JSON.stringify(value).replace(/"/g, '""')
              if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`
              return value
            })
            .join(","),
        ),
      ]

      const csvString = csvRows.join("\n")

      // Create a blob and download
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${filename || table}_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export successful",
        description: `${data.length} records exported from ${table}.`,
        variant: "default",
      })
    } catch (err: any) {
      console.error("Error exporting data:", err)
      toast({
        title: "Export failed",
        description: err.message || "An error occurred while exporting data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={exportToCSV} disabled={loading} className={className}>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          {buttonText}
        </>
      )}
    </Button>
  )
}
