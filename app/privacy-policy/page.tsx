import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Cookie, Users, Lock, FileText, AlertTriangle, Mail } from "lucide-react"
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = generateSEOMetadata({
  title: "Privacy Policy | Airdrops Hunter - Data Protection & Ad Compliance",
  description:
    "Complete privacy policy for Airdrops Hunter including data collection, ad networks (AdSense, AdMob), cookies, and user rights under GDPR and CCPA.",
  keywords: ["privacy policy", "data protection", "GDPR", "CCPA", "AdSense", "AdMob", "cookies"],
  path: "/privacy-policy",
})

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg">Last updated: January 1, 2025</p>
          <p className="text-gray-400 mt-2">Effective for both web and mobile app users</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Eye className="h-6 w-6 text-blue-400" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                Welcome to Airdrops Hunter. This Privacy Policy explains how we collect, use, disclose, and safeguard
                your information when you visit our website or use our mobile application, including our advertising
                practices with Google AdSense (web) and Google AdMob (mobile app).
              </p>
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-2">Important Notice:</h4>
                <p className="text-sm">
                  We use different advertising networks for our web platform (Google AdSense) and mobile application
                  (Google AdMob) to comply with each platform's terms of service and provide you with relevant
                  advertisements.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Users className="h-6 w-6 text-green-400" />
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">Personal Information:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Email address (for account creation and notifications)</li>
                    <li>Username and display name</li>
                    <li>Cryptocurrency wallet addresses (for airdrop participation)</li>
                    <li>Social media handles (when required for specific airdrops)</li>
                    <li>Profile information and preferences</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">Usage Information:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Pages visited and time spent on our platform</li>
                    <li>Airdrops viewed and participated in</li>
                    <li>Search queries and filters used</li>
                    <li>Device information (type, operating system, browser)</li>
                    <li>IP address and approximate location</li>
                    <li>Referral sources and exit pages</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">Advertising Information:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>
                      <strong>Web Users:</strong> Google AdSense collects data for personalized ads
                    </li>
                    <li>
                      <strong>Mobile App Users:</strong> Google AdMob collects data for mobile advertising
                    </li>
                    <li>Ad interaction data (clicks, views, conversions)</li>
                    <li>Advertising identifiers (GAID, IDFA when available)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <FileText className="h-6 w-6 text-purple-400" />
                2. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>We use the information we collect to:</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-2">Core Services:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Provide and maintain our airdrop platform</li>
                    <li>Process airdrop participations</li>
                    <li>Verify eligibility for airdrops</li>
                    <li>Send notifications about new opportunities</li>
                    <li>Provide customer support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Advertising & Analytics:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Display relevant advertisements</li>
                    <li>Measure ad performance and effectiveness</li>
                    <li>Analyze platform usage and trends</li>
                    <li>Improve user experience</li>
                    <li>Prevent fraud and abuse</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advertising Networks */}
          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
                3. Advertising Networks & Data Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-3">🌐 Web Platform (AdSense)</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Google AdSense displays ads on our website</li>
                    <li>Google may use cookies and web beacons</li>
                    <li>Personalized ads based on your interests</li>
                    <li>You can opt-out via Google Ad Settings</li>
                  </ul>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm underline mt-2 inline-block"
                  >
                    Google Privacy Policy →
                  </a>
                </div>

                <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
                  <h4 className="text-green-400 font-semibold mb-3">📱 Mobile App (AdMob)</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Google AdMob displays ads in our mobile app</li>
                    <li>Uses advertising identifiers (GAID/IDFA)</li>
                    <li>Collects app usage and interaction data</li>
                    <li>You can reset ad ID in device settings</li>
                  </ul>
                  <a
                    href="https://support.google.com/admob/answer/6128543"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 text-sm underline mt-2 inline-block"
                  >
                    AdMob Privacy →
                  </a>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">Third-Party Data Sharing:</h4>
                <p className="text-sm">
                  We may share information with airdrop project teams for verification purposes, trusted service
                  providers who assist in platform operations, and as required by law. We never sell your personal
                  information to third parties.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Cookie className="h-6 w-6 text-orange-400" />
                4. Cookies and Tracking Technologies
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">Types of Cookies We Use:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-orange-400 font-medium">Essential Cookies:</h5>
                      <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                        <li>Authentication and security</li>
                        <li>Platform functionality</li>
                        <li>User preferences</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-orange-400 font-medium">Advertising Cookies:</h5>
                      <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                        <li>Google AdSense (web)</li>
                        <li>Ad personalization</li>
                        <li>Performance measurement</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-900/20 border border-orange-800/50 rounded-lg p-4">
                  <h4 className="text-orange-400 font-semibold mb-2">Cookie Control:</h4>
                  <p className="text-sm mb-2">
                    You can control cookies through your browser settings. However, disabling certain cookies may affect
                    platform functionality and ad relevance.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://support.google.com/chrome/answer/95647"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 text-sm underline"
                    >
                      Chrome Settings
                    </a>
                    <span className="text-gray-500">•</span>
                    <a
                      href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 text-sm underline"
                    >
                      Firefox Settings
                    </a>
                    <span className="text-gray-500">•</span>
                    <a
                      href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 text-sm underline"
                    >
                      Safari Settings
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Lock className="h-6 w-6 text-red-400" />
                5. Data Security & Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>We implement comprehensive security measures to protect your personal information:</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-2">Technical Safeguards:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Encrypted data storage</li>
                    <li>Regular security audits and assessments</li>
                    <li>Access controls and authentication</li>
                    <li>Secure hosting infrastructure</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Operational Safeguards:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Limited employee access to personal data</li>
                    <li>Regular staff training on data protection</li>
                    <li>Incident response procedures</li>
                    <li>Data retention policies</li>
                    <li>Third-party security assessments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Users className="h-6 w-6 text-cyan-400" />
                6. Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>Depending on your location, you may have the following rights:</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-2">GDPR Rights (EU):</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      <strong>Access:</strong> Request copies of your data
                    </li>
                    <li>
                      <strong>Rectification:</strong> Correct inaccurate information
                    </li>
                    <li>
                      <strong>Erasure:</strong> Request deletion of your data
                    </li>
                    <li>
                      <strong>Portability:</strong> Receive data in structured format
                    </li>
                    <li>
                      <strong>Objection:</strong> Object to data processing
                    </li>
                    <li>
                      <strong>Restriction:</strong> Limit how we use your data
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">CCPA Rights (California):</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      <strong>Know:</strong> What personal information is collected
                    </li>
                    <li>
                      <strong>Delete:</strong> Request deletion of personal information
                    </li>
                    <li>
                      <strong>Opt-out:</strong> Opt-out of sale of personal information
                    </li>
                    <li>
                      <strong>Non-discrimination:</strong> Equal service regardless of privacy choices
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-cyan-900/20 border border-cyan-800/50 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">How to Exercise Your Rights:</h4>
                <p className="text-sm mb-2">
                  To exercise any of these rights, please contact us at privacy@airdropshunter.com with your request. We
                  will respond within the timeframes required by applicable law.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">7. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                Our platform is not intended for children under the age of 18. We do not knowingly collect personal
                information from children under 18. If you are a parent or guardian and believe your child has provided
                us with personal information, please contact us immediately at privacy@airdropshunter.com.
              </p>
              <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Important:</strong> Cryptocurrency and financial services require users to be of legal age. By
                  using our platform, you confirm that you are at least 18 years old or the age of majority in your
                  jurisdiction.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">8. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure
                appropriate safeguards are in place for international transfers, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Standard Contractual Clauses approved by the European Commission</li>
                <li>Adequacy decisions for countries with equivalent data protection</li>
                <li>Certification schemes and codes of conduct</li>
                <li>Binding corporate rules for intra-group transfers</li>
              </ul>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">9. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology,
                legal requirements, or other factors. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Posting the updated policy on our website and mobile app</li>
                <li>Updating the "Last updated" date at the top of this policy</li>
                <li>Sending email notifications for significant changes (if you've provided an email)</li>
                <li>Displaying prominent notices on our platform</li>
              </ul>
              <p>
                We encourage you to review this Privacy Policy periodically to stay informed about how we protect your
                information.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-[#1a2236]/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Mail className="h-6 w-6 text-green-400" />
                10. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-4">
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices,
                please contact us:
              </p>
              <div className="bg-[#0a0e17]/50 p-6 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-white font-semibold">Email:</p>
                    <a href="mailto:privacy@airdropshunter.com" className="text-green-400 hover:text-green-300">
                      privacy@airdropshunter.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-white font-semibold">Data Protection Officer:</p>
                    <a href="mailto:dpo@airdropshunter.com" className="text-blue-400 hover:text-blue-300">
                      dpo@airdropshunter.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Mailing Address:</p>
                    <p className="text-gray-400">
                      Airdrops Hunter Privacy Team
                      <br />
                      123 Crypto Street
                      <br />
                      Blockchain City, BC 12345
                      <br />
                      United States
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-2">Response Time:</h4>
                <p className="text-sm">
                  We aim to respond to all privacy-related inquiries within 30 days. For urgent matters, please mark
                  your email as "URGENT - Privacy Request" in the subject line.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Badges */}
          <div className="text-center py-8">
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 text-center">
                <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-blue-400 font-semibold">GDPR Compliant</p>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4 text-center">
                <Lock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-sm text-yellow-400 font-semibold">CCPA Compliant</p>
              </div>
              <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4 text-center">
                <Eye className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-green-400 font-semibold">Privacy by Design</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              This privacy policy is designed to be transparent, comprehensive, and compliant with international privacy
              regulations including GDPR, CCPA, and advertising network requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
