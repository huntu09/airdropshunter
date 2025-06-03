import Link from "next/link"
import { Rocket, Twitter, Github, DiscIcon as Discord } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-gray-800/50 bg-[#0a0e17]/80 backdrop-blur-md mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-full p-2">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold">AIRDROPS</span>
                <span className="text-xs font-medium text-gray-400 tracking-widest">HUNTER</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Discover the latest cryptocurrency airdrops and earn free tokens. Join our community of airdrop hunters
              today.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Discord className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Submit Airdrop
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories/defi" className="text-gray-400 hover:text-blue-400 transition-colors">
                  DeFi
                </Link>
              </li>
              <li>
                <Link href="/categories/nft" className="text-gray-400 hover:text-blue-400 transition-colors">
                  NFT
                </Link>
              </li>
              <li>
                <Link href="/categories/launchpad" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Launchpad
                </Link>
              </li>
              <li>
                <Link href="/categories/gaming" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Gaming
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-blue-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/50 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Airdrops Hunter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
