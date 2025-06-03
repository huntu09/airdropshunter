"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Clock, Eye, Filter, Search, ExternalLink, User, Calendar } from "lucide-react"

// Tambahkan import toast
import { toast } from "@/hooks/use-toast"
import { dbHelpers } from "@/lib/supabase"

interface VerificationItem {
  verification_id: string
  airdrop_title: string
  task_title: string
  user_email: string
  submission_type: string
  submission_data: any
  proof_url?: string
  submitted_at: string
  days_pending: number
  status: string
  task_type: string
  points_reward: number
}

export default function VerificationQueuePage() {
  const searchParams = useSearchParams()
  const airdropFilter = searchParams.get("airdrop")

  const [verifications, setVerifications] = useState<VerificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVerification, setSelectedVerification] = useState<VerificationItem | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchVerifications()
  }, [filter, airdropFilter])

  // Perbaiki fetchVerifications untuk menambahkan error handling yang lebih baik
  const fetchVerifications = async () => {
    try {
      setLoading(true)

      let query = supabase.from("airdrop_verifications").select(`
        id,
        submission_type,
        submission_data,
        proof_url,
        submitted_at,
        status,
        user_id,
        airdrop_tasks!inner(
          title,
          task_type,
          points_reward,
          airdrops!inner(
            title
          )
        ),
        profiles!inner(
          email
        )
      `)

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      if (airdropFilter) {
        query = query.eq("airdrop_id", airdropFilter)
      }

      const { data, error } = await query.order("submitted_at", { ascending: false }).limit(100)

      if (error) {
        toast({
          title: "Error fetching verifications",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      // Transform data to match our interface
      const transformedData =
        data?.map((item: any) => ({
          verification_id: item.id,
          airdrop_title: item.airdrop_tasks.airdrops.title,
          task_title: item.airdrop_tasks.title,
          task_type: item.airdrop_tasks.task_type,
          points_reward: item.airdrop_tasks.points_reward,
          user_email: item.profiles.email,
          submission_type: item.submission_type,
          submission_data: item.submission_data,
          proof_url: item.proof_url,
          submitted_at: item.submitted_at,
          status: item.status,
          days_pending: Math.floor(
            (new Date().getTime() - new Date(item.submitted_at).getTime()) / (1000 * 60 * 60 * 24),
          ),
        })) || []

      setVerifications(transformedData)
    } catch (err: any) {
      console.error("Error fetching verifications:", err)
    } finally {
      setLoading(false)
    }
  }

  // Ganti fungsi processVerification dengan yang baru
  const processVerification = async (verificationId: string, newStatus: string, reason?: string) => {
    try {
      setProcessing(verificationId)

      // Gunakan dbHelpers dengan retry logic
      await dbHelpers.processVerification(verificationId, newStatus as "approved" | "rejected", reason)

      // Tambahkan toast notification
      toast({
        title: `Verification ${newStatus}`,
        description: `The submission has been ${newStatus} successfully.`,
        variant: newStatus === "approved" ? "default" : "destructive",
      })

      // Refresh the list
      fetchVerifications()
      setSelectedVerification(null)
      setRejectionReason("")
    } catch (err: any) {
      console.error("Error processing verification:", err)
      toast({
        title: "Error processing verification",
        description: err.message || "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "needs_review":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case "social_follow":
        return "👥"
      case "social_share":
        return "📢"
      case "join_discord":
        return "💬"
      case "join_telegram":
        return "📱"
      case "wallet_connect":
        return "💰"
      case "quiz":
        return "❓"
      default:
        return "📋"
    }
  }

  const filteredVerifications = verifications.filter(
    (v) =>
      v.airdrop_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.user_email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = {
    pending: verifications.filter((v) => v.status === "pending").length,
    approved: verifications.filter((v) => v.status === "approved").length,
    rejected: verifications.filter((v) => v.status === "rejected").length,
    total: verifications.length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading verification queue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
        <p className="text-gray-600">Review and approve user task submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="needs_review">Needs Review</SelectItem>
              <SelectItem value="all">All Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by airdrop, task, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Verification List */}
      <div className="grid gap-4">
        {filteredVerifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Verifications Found</h3>
              <p className="text-gray-600">
                {filter === "pending" ? "No pending submissions to review" : `No ${filter} submissions found`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVerifications.map((verification) => (
            <Card key={verification.verification_id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getTaskTypeIcon(verification.task_type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{verification.task_title}</h4>
                        <Badge variant="outline">{verification.points_reward} pts</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{verification.airdrop_title}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {verification.user_email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {verification.days_pending} days ago
                        </div>
                      </div>

                      {/* Submission Data */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Submission:</p>
                        {verification.submission_type === "url" && (
                          <a
                            href={verification.submission_data?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {verification.submission_data?.url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {verification.submission_type === "text" && (
                          <p className="text-sm text-gray-900">{verification.submission_data?.text}</p>
                        )}
                        {verification.submission_type === "social_username" && (
                          <p className="text-sm text-gray-900">@{verification.submission_data?.username}</p>
                        )}
                        {verification.proof_url && (
                          <div className="mt-2">
                            <a
                              href={verification.proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              View Proof Screenshot
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(verification.status)}>
                      {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                    </Badge>

                    {verification.status === "pending" && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => processVerification(verification.verification_id, "approved")}
                          disabled={processing === verification.verification_id}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedVerification(verification)}
                          disabled={processing === verification.verification_id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Rejection Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reject Submission</CardTitle>
              <CardDescription>Provide a reason for rejecting this submission</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Task:</p>
                <p className="text-sm text-gray-900">{selectedVerification.task_title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">User:</p>
                <p className="text-sm text-gray-900">{selectedVerification.user_email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Rejection Reason</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this submission is being rejected..."
                  rows={3}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => processVerification(selectedVerification.verification_id, "rejected", rejectionReason)}
                  disabled={!rejectionReason.trim() || processing === selectedVerification.verification_id}
                >
                  Reject Submission
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedVerification(null)
                    setRejectionReason("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
