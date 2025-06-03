export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0f1623] to-[#1a1f2e] flex items-center justify-center">
      <div className="text-white text-xl flex items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        Loading Admin Dashboard...
      </div>
    </div>
  )
}
