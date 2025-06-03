import type { Metadata } from "next"
import SubmitAirdropForm from "@/components/submit-airdrop-form"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket, Shield, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Submit Airdrop | Airdrops Hunter",
  description: "Submit your airdrop project to our platform and reach thousands of crypto enthusiasts",
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
            Submit Your Airdrop
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Share your project with our community of crypto enthusiasts and airdrop hunters
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <Rocket className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Reach Thousands</CardTitle>
              <CardDescription className="text-gray-400">
                Get your airdrop in front of thousands of active crypto users
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <Shield className="h-8 w-8 text-green-400 mb-2" />
              <CardTitle className="text-white">Verified Listing</CardTitle>
              <CardDescription className="text-gray-400">
                All submissions are reviewed to ensure quality and legitimacy
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <Zap className="h-8 w-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">Fast Approval</CardTitle>
              <CardDescription className="text-gray-400">
                Most submissions are reviewed and approved within 24 hours
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <SubmitAirdropForm />
        </div>
      </div>
    </div>
  )
}
