"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { motion } from "framer-motion"

const categories = [
  {
    id: "defi",
    name: "DeFi",
    description: "Decentralized Finance protocols and platforms",
    icon: "💰",
    count: 45,
    color: "from-green-400 to-emerald-600",
    bgColor: "from-green-900/30 to-emerald-900/10",
    borderColor: "border-green-700/40",
    hoverColor: "hover:border-green-500/60",
  },
  {
    id: "nft",
    name: "NFT",
    description: "Non-Fungible Token marketplaces and collections",
    icon: "🎨",
    count: 32,
    color: "from-purple-400 to-pink-600",
    bgColor: "from-purple-900/30 to-pink-900/10",
    borderColor: "border-purple-700/40",
    hoverColor: "hover:border-purple-500/60",
  },
  {
    id: "gaming",
    name: "Gaming",
    description: "Blockchain games and gaming platforms",
    icon: "🎮",
    count: 28,
    color: "from-blue-400 to-cyan-600",
    bgColor: "from-blue-900/30 to-cyan-900/10",
    borderColor: "border-blue-700/40",
    hoverColor: "hover:border-blue-500/60",
  },
  {
    id: "launchpad",
    name: "Launchpad",
    description: "Token launch platforms and IDO projects",
    icon: "🚀",
    count: 19,
    color: "from-orange-400 to-red-600",
    bgColor: "from-orange-900/30 to-red-900/10",
    borderColor: "border-orange-700/40",
    hoverColor: "hover:border-orange-500/60",
  },
  {
    id: "layer2",
    name: "Layer 2",
    description: "Scaling solutions and Layer 2 protocols",
    icon: "⚡",
    count: 15,
    color: "from-yellow-400 to-orange-600",
    bgColor: "from-yellow-900/30 to-orange-900/10",
    borderColor: "border-yellow-700/40",
    hoverColor: "hover:border-yellow-500/60",
  },
  {
    id: "exchange",
    name: "Exchange",
    description: "Centralized and decentralized exchanges",
    icon: "🔄",
    count: 12,
    color: "from-indigo-400 to-purple-600",
    bgColor: "from-indigo-900/30 to-purple-900/10",
    borderColor: "border-indigo-700/40",
    hoverColor: "hover:border-indigo-500/60",
  },
]

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          <Link href={`/categories/${category.id}`}>
            <Card
              className={`bg-gradient-to-br ${category.bgColor} ${category.borderColor} ${category.hoverColor} border backdrop-blur-sm transition-all duration-300 hover:scale-105 cursor-pointer group shadow-lg hover:shadow-2xl`}
            >
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <motion.div
                    className="text-5xl mb-3"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {category.icon}
                  </motion.div>
                  <Badge
                    variant="secondary"
                    className="bg-gray-800/60 text-gray-300 backdrop-blur-sm border border-gray-700/50"
                  >
                    {category.count} airdrops
                  </Badge>
                </div>
                <CardTitle
                  className={`text-2xl bg-gradient-to-r ${category.color} bg-clip-text text-transparent group-hover:scale-105 transition-transform font-bold`}
                >
                  {category.name}
                </CardTitle>
                <CardDescription className="text-gray-400 text-base leading-relaxed">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">Browse category</span>
                  <motion.div
                    className="text-gray-400 group-hover:text-white transition-colors text-xl"
                    whileHover={{ x: 5 }}
                  >
                    →
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
