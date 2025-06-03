"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface FileUploadProps {
  onUpload: (url: string) => void
  currentFile?: string
  accept?: string
  maxSize?: number
  className?: string
}

export default function FileUpload({
  onUpload,
  currentFile,
  accept = "*/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    setIsUploading(true)

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `airdrops/${fileName}`

      // Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage.from("airdrops-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("airdrops-images").getPublicUrl(filePath)

      // Return the permanent URL
      onUpload(publicUrl)
    } catch (error: any) {
      console.error("Upload error:", error)
      setError(error.message || "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeFile = async () => {
    if (currentFile && currentFile.includes("supabase.co/storage")) {
      try {
        // Extract file path from URL
        const url = new URL(currentFile)
        const pathParts = url.pathname.split("/")
        const filePath = pathParts.slice(-2).join("/") // Get last 2 parts (folder/filename)

        // Delete from storage
        await supabase.storage.from("airdrops-images").remove([filePath])
      } catch (error) {
        console.error("Error deleting file:", error)
      }
    }

    onUpload("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {currentFile ? (
        <div className="relative">
          {isImage(currentFile) ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700">
              <img src={currentFile || "/placeholder.svg"} alt="Uploaded file" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 p-1 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <FileText className="h-8 w-8 text-gray-400" />
              <div className="flex-1">
                <p className="text-white text-sm font-medium">File uploaded</p>
                <p className="text-gray-400 text-xs">Click to view</p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDragging ? "border-blue-500 bg-blue-500/10" : "border-gray-700 hover:border-gray-600",
            isUploading && "opacity-50 pointer-events-none",
          )}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        >
          <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileInputChange} className="hidden" />

          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center">
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
              ) : (
                <Upload className="h-6 w-6 text-gray-400" />
              )}
            </div>

            <div>
              <p className="text-white font-medium">
                {isUploading ? "Uploading to Supabase Storage..." : "Drop files here or click to upload"}
              </p>
              <p className="text-gray-400 text-sm">Max size: {Math.round(maxSize / 1024 / 1024)}MB</p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="border-gray-700 hover:bg-gray-800"
            >
              {isUploading ? "Uploading..." : "Choose File"}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  )
}
