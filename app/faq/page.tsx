import type { Metadata } from "next"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, MessageCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "FAQ | Airdrops Hunter",
  description: "Frequently asked questions about cryptocurrency airdrops and our platform",
}

const faqData = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "What is an airdrop?",
        answer:
          "An airdrop is a distribution of cryptocurrency tokens or coins, usually for free, to numerous wallet addresses. Airdrops are primarily implemented as a way of gaining attention and new followers, resulting in a larger user-base and a wider disbursement of coins.",
      },
      {
        question: "How do I participate in airdrops?",
        answer:
          "To participate in airdrops, you typically need to complete certain tasks such as following social media accounts, joining Telegram groups, or holding specific tokens in your wallet. Each airdrop has its own requirements which are clearly listed on our platform.",
      },
      {
        question: "Is it safe to participate in airdrops?",
        answer:
          "While many airdrops are legitimate, some can be scams. We verify all airdrops on our platform, but you should always be cautious. Never share your private keys, and be wary of airdrops asking for payments or sensitive information.",
      },
    ],
  },
  {
    category: "Platform Usage",
    questions: [
      {
        question: "How do I submit an airdrop to your platform?",
        answer:
          "You can submit an airdrop by visiting our Submit page and filling out the comprehensive form. All submissions are reviewed by our team within 24 hours to ensure quality and legitimacy.",
      },
      {
        question: "How do you verify airdrops?",
        answer:
          "Our team manually reviews each submission, checking the project's legitimacy, social media presence, whitepaper, and team information. We also monitor for red flags and scam indicators.",
      },
      {
        question: "Can I get notifications for new airdrops?",
        answer:
          "Yes! You can subscribe to our newsletter and enable browser notifications to get alerts about new airdrops that match your interests.",
      },
    ],
  },
  {
    category: "Rewards & Points",
    questions: [
      {
        question: "How do I earn points on the platform?",
        answer:
          "You can earn points by participating in airdrops, completing daily tasks, referring friends, and engaging with our community. Points can be redeemed for various rewards in our shop.",
      },
      {
        question: "What can I do with my points?",
        answer:
          "Points can be redeemed for cryptocurrency rewards, NFTs, merchandise, and premium platform features. Visit our Rewards page to see all available options.",
      },
      {
        question: "Do points expire?",
        answer:
          "No, your points never expire. However, some limited-time rewards in our shop may have expiration dates.",
      },
    ],
  },
  {
    category: "Technical Support",
    questions: [
      {
        question: "I'm having trouble connecting my wallet",
        answer:
          "Make sure you have a compatible wallet installed (MetaMask, WalletConnect, etc.) and that it's unlocked. If you're still having issues, try refreshing the page or clearing your browser cache.",
      },
      {
        question: "Why can't I see some airdrops?",
        answer:
          "Some airdrops may be region-restricted or have specific eligibility requirements. Make sure your profile is complete and check if there are any geographic restrictions.",
      },
      {
        question: "How do I report a problem or scam?",
        answer:
          "You can report issues through our contact form or email us directly. We take all reports seriously and investigate them promptly.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Find answers to common questions about airdrops and our platform
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-[#1a2236]/50 border-gray-800/50">
              <CardHeader className="text-center">
                <HelpCircle className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <CardTitle className="text-white">Help Center</CardTitle>
                <CardDescription className="text-gray-400">Browse our comprehensive help documentation</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-[#1a2236]/50 border-gray-800/50">
              <CardHeader className="text-center">
                <MessageCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <CardTitle className="text-white">Live Chat</CardTitle>
                <CardDescription className="text-gray-400">Chat with our support team in real-time</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-[#1a2236]/50 border-gray-800/50">
              <CardHeader className="text-center">
                <Mail className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <CardTitle className="text-white">Email Support</CardTitle>
                <CardDescription className="text-gray-400">
                  Send us an email and we'll respond within 24 hours
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* FAQ Sections */}
          {faqData.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white">{section.category}</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {section.questions.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`${sectionIndex}-${index}`}
                    className="bg-[#1a2236]/50 border-gray-800/50 rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-400 pb-4">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {/* Still Need Help */}
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/50 mt-12">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4 text-white">Still need help?</h3>
              <p className="text-gray-400 mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Contact Support</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
