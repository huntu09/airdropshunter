import type { Metadata } from "next"
import BlogCard from "@/components/blog-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog | Airdrops Hunter",
  description: "Latest news, guides, and insights about cryptocurrency airdrops and DeFi",
}

const blogPosts = [
  {
    id: 1,
    title: "The Ultimate Guide to Cryptocurrency Airdrops in 2024",
    excerpt: "Learn everything you need to know about finding, participating in, and maximizing your airdrop rewards.",
    author: "Alex Chen",
    date: "2024-05-15",
    readTime: "8 min read",
    category: "Guide",
    image: "/placeholder.svg?height=200&width=400",
    featured: true,
  },
  {
    id: 2,
    title: "Top 10 DeFi Airdrops to Watch This Month",
    excerpt: "Discover the most promising DeFi projects that are likely to launch airdrops soon.",
    author: "Sarah Johnson",
    date: "2024-05-12",
    readTime: "6 min read",
    category: "DeFi",
    image: "/placeholder.svg?height=200&width=400",
    featured: false,
  },
  {
    id: 3,
    title: "How to Safely Participate in Airdrops: Security Best Practices",
    excerpt: "Protect yourself from scams and ensure your wallet security while hunting for airdrops.",
    author: "Mike Rodriguez",
    date: "2024-05-10",
    readTime: "5 min read",
    category: "Security",
    image: "/placeholder.svg?height=200&width=400",
    featured: false,
  },
  {
    id: 4,
    title: "Layer 2 Airdrops: The Next Big Opportunity",
    excerpt: "Why Layer 2 solutions are becoming the hottest source of airdrop opportunities.",
    author: "Emma Davis",
    date: "2024-05-08",
    readTime: "7 min read",
    category: "Layer 2",
    image: "/placeholder.svg?height=200&width=400",
    featured: true,
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
            Airdrop Blog
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Stay updated with the latest news, guides, and insights about cryptocurrency airdrops
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search articles..."
              className="pl-10 bg-[#1a2236]/50 border-gray-800/50 text-white placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-blue-900/20 text-blue-400 cursor-pointer hover:bg-blue-900/30">
              All
            </Badge>
            <Badge variant="outline" className="border-gray-700 text-gray-400 cursor-pointer hover:bg-gray-800/50">
              Guide
            </Badge>
            <Badge variant="outline" className="border-gray-700 text-gray-400 cursor-pointer hover:bg-gray-800/50">
              DeFi
            </Badge>
            <Badge variant="outline" className="border-gray-700 text-gray-400 cursor-pointer hover:bg-gray-800/50">
              Security
            </Badge>
            <Badge variant="outline" className="border-gray-700 text-gray-400 cursor-pointer hover:bg-gray-800/50">
              Layer 2
            </Badge>
          </div>
        </div>

        {/* Featured Posts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {blogPosts
              .filter((post) => post.featured)
              .map((post) => (
                <BlogCard key={post.id} post={post} featured />
              ))}
          </div>
        </div>

        {/* All Posts */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
