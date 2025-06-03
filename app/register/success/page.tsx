import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e17] via-[#0f1623] to-[#1a1f2e] px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-[#0f1623]/80 backdrop-blur-sm rounded-xl p-8 border border-gray-800/50 shadow-xl shadow-blue-900/5">
          <div className="flex justify-center mb-6">
            <div className="bg-green-600/20 p-4 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">Registration Successful!</h1>
          <p className="text-gray-400 mb-8">
            Your account has been created successfully. Please check your email to verify your account.
          </p>

          <div className="space-y-4">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/login">Sign In</Link>
            </Button>

            <Button asChild variant="outline" className="w-full border-gray-700 hover:bg-gray-800">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
