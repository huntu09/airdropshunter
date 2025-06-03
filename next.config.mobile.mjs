/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mobile-specific configuration for Ionic AppFlow
  output: 'export',
  trailingSlash: true,
  distDir: 'dist-mobile',
  
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  
  compress: true,
  poweredByHeader: false,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Remove server-side features for mobile
  async headers() {
    return []
  },
  
  async redirects() {
    return []
  },
  
  // Ensure all pages are statically generated
  generateStaticParams: true,
}

export default nextConfig
