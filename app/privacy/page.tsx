import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy | Airdrops Hunter",
  description: "Privacy policy and data protection information for Airdrops Hunter platform",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg">Last updated: June 1, 2024</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                We collect information you provide directly to us, such as when you create an account, participate in
                airdrops, or contact us for support.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-semibold">Personal Information:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Email address</li>
                    <li>Username</li>
                    <li>Wallet addresses</li>
                    <li>Social media handles (when required for airdrops)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Usage Information:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Pages visited and time spent on our platform</li>
                    <li>Airdrops participated in</li>
                    <li>Search queries and filters used</li>
                    <li>Device and browser information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process airdrop participations and verify eligibility</li>
                <li>Send you updates about new airdrops and platform features</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your
                consent, except in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Airdrop Projects:</strong> When you participate in an airdrop, we may share necessary
                  information with the project team to verify your eligibility
                </li>
                <li>
                  <strong>Service Providers:</strong> We may share information with trusted third-party service
                  providers who assist us in operating our platform
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose information when required by law or to protect
                  our rights and safety
                </li>
                <li>
                  <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user
                  information may be transferred
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                We implement appropriate technical and organizational security measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <div className="bg-[#0a0e17]/50 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Security Measures Include:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and assessments</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Secure hosting infrastructure</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">5. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Access:</strong> Request access to your personal information
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate or incomplete information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal information
                </li>
                <li>
                  <strong>Portability:</strong> Request a copy of your information in a structured format
                </li>
                <li>
                  <strong>Objection:</strong> Object to processing of your personal information
                </li>
                <li>
                  <strong>Restriction:</strong> Request restriction of processing
                </li>
              </ul>
              <p className="mt-4">To exercise these rights, please contact us at privacy@airdropshunter.com</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">6. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies
                help us:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze how you use our platform</li>
                <li>Provide personalized content and recommendations</li>
                <li>Improve our services and user experience</li>
              </ul>
              <p>
                You can control cookies through your browser settings, but disabling cookies may affect the
                functionality of our platform.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">7. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                Our platform is not intended for children under the age of 18. We do not knowingly collect personal
                information from children under 18. If you are a parent or guardian and believe your child has provided
                us with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">8. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
                new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p>
                We encourage you to review this Privacy Policy periodically for any changes. Changes to this Privacy
                Policy are effective when they are posted on this page.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">9. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <div className="bg-[#0a0e17]/50 p-4 rounded-lg">
                <p>
                  <strong>Email:</strong> privacy@airdropshunter.com
                </p>
                <p>
                  <strong>Address:</strong> 123 Crypto Street, Blockchain City, BC 12345
                </p>
                <p>
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
