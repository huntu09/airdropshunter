import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollText } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service | Airdrops Hunter",
  description: "Terms of service and user agreement for Airdrops Hunter platform",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <ScrollText className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-gray-400 text-lg">Last updated: June 1, 2024</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                By accessing and using Airdrops Hunter ("the Platform"), you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to abide by the above, please do not use this
                service.
              </p>
              <p>
                These Terms of Service ("Terms") govern your use of our website located at airdropshunter.com (the
                "Service") operated by Airdrops Hunter ("us", "we", or "our").
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">2. Use License</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                Permission is granted to temporarily download one copy of the materials on Airdrops Hunter for personal,
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and
                under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">3. Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                The information on this website is provided on an "as is" basis. To the fullest extent permitted by law,
                this Company:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>excludes all representations and warranties relating to this website and its contents</li>
                <li>
                  excludes all liability for damages arising out of or in connection with your use of this website
                </li>
              </ul>
              <p>
                <strong>Cryptocurrency Risk Warning:</strong> Participating in cryptocurrency airdrops involves risk.
                The value of cryptocurrencies can be extremely volatile and unpredictable. You should carefully consider
                whether trading or holding digital assets is suitable for you in light of your financial condition.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">4. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>As a user of our platform, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and truthful information when creating an account</li>
                <li>Not use the platform for any illegal or unauthorized purpose</li>
                <li>Not transmit any worms, viruses, or any code of a destructive nature</li>
                <li>Not attempt to gain unauthorized access to our systems or networks</li>
                <li>Respect the intellectual property rights of others</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">5. Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your
                information when you use our Service. By using our Service, you agree to the collection and use of
                information in accordance with our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">6. Termination</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice
                or liability, under our sole discretion, for any reason whatsoever and without limitation, including but
                not limited to a breach of the Terms.
              </p>
              <p>If you wish to terminate your account, you may simply discontinue using the Service.</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">7. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p>
                What constitutes a material change will be determined at our sole discretion. By continuing to access or
                use our Service after any revisions become effective, you agree to be bound by the revised terms.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">8. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>If you have any questions about these Terms of Service, please contact us at:</p>
              <div className="bg-[#0a0e17]/50 p-4 rounded-lg">
                <p>
                  <strong>Email:</strong> legal@airdropshunter.com
                </p>
                <p>
                  <strong>Address:</strong> 123 Crypto Street, Blockchain City, BC 12345
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
