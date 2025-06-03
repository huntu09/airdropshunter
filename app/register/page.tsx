import Link from "next/link"
import { Rocket } from "lucide-react"
import RegisterForm from "@/components/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e17] via-[#0f1623] to-[#1a1f2e] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-full p-3 shadow-lg shadow-blue-500/20">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight group-hover:text-blue-400 transition-colors">
                AIRDROPS
              </span>
              <span className="text-sm font-medium text-gray-400 tracking-widest group-hover:text-blue-400 transition-colors">
                HUNTER
              </span>
            </div>
          </Link>
        </div>

        {/* Register Form */}
        <div className="bg-[#0f1623]/80 backdrop-blur-sm rounded-xl p-8 border border-gray-800/50 shadow-xl shadow-blue-900/5">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Join the Airdrops Hunter community</p>
          </div>

          <RegisterForm />

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
