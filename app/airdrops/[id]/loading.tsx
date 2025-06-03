export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0f1623] to-[#1a1f2e] p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-[#0f1623]/80 backdrop-blur-sm rounded-xl p-8 border border-gray-800/50 animate-pulse">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gray-700 rounded-full"></div>
            <div className="space-y-3 flex-1">
              <div className="h-8 bg-gray-700 rounded w-64"></div>
              <div className="h-4 bg-gray-700 rounded w-48"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0f1623]/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-2 bg-gray-700 rounded"></div>
          </div>
        </div>

        <div className="bg-[#0f1623]/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-24 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#0a0e17]/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-48"></div>
                    <div className="h-3 bg-gray-700 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-700 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
