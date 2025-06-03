import type { Metadata } from "next"
import SearchConsoleSetup from "@/components/seo/search-console-setup"

export const metadata: Metadata = {
  title: "SEO Management | Admin Dashboard",
  description: "Manage SEO settings and search engine submissions",
}

export default function SEOPage() {
  return (
    <div className="container mx-auto py-6">
      <SearchConsoleSetup />
    </div>
  )
}
