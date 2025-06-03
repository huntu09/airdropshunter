"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

interface BlogPost {
  id: number
  title: string
  excerpt: string
  author: string
  date: string
  readTime: string
  category: string
  image: string
  featured?: boolean
}

interface BlogCardProps {
  post: BlogPost
  featured?: boolean
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const categoryColors: { [key: string]: string } = {
    Guide: "bg-blue-900/20 text-blue-400",
    DeFi: "bg-green-900/20 text-green-400",
    Security: "bg-red-900/20 text-red-400",
    "Layer 2": "bg-purple-900/20 text-purple-400",
    NFT: "bg-pink-900/20 text-pink-400",
    Gaming: "bg-cyan-900/20 text-cyan-400",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Link href={`/blog/${post.id}`}>
        <Card
          className={`bg-[#1a2236]/50 border-gray-800/50 hover:border-blue-800/50 transition-all duration-300 cursor-pointer group overflow-hidden ${featured ? "lg:flex lg:flex-row" : ""}`}
        >
          <div className={`relative ${featured ? "lg:w-1/2" : "w-full"}`}>
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4">
                <Badge className={categoryColors[post.category] || "bg-gray-900/20 text-gray-400"}>
                  {post.category}
                </Badge>
              </div>
              {featured && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-900/20 text-yellow-400">Featured</Badge>
                </div>
              )}
            </div>
          </div>

          <div className={`${featured ? "lg:w-1/2" : "w-full"}`}>
            <CardHeader>
              <CardTitle className="text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                {post.title}
              </CardTitle>
              <CardDescription className="text-gray-400 line-clamp-3">{post.excerpt}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`/placeholder.svg?height=24&width=24&query=${post.author}`} />
                      <AvatarFallback className="text-xs">
                        {post.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{post.author}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
