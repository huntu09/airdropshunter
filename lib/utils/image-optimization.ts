/**
 * Image Optimization Utilities
 * Provides functions for optimizing images and generating responsive images
 */

// Calculate responsive image sizes based on viewport
export function getResponsiveImageSizes(
  defaultSize = 100,
  sizes: { sm?: number; md?: number; lg?: number; xl?: number } = {},
): string {
  const { sm = 640, md = 768, lg = 1024, xl = 1280 } = sizes

  return `
    (max-width: ${sm}px) ${defaultSize}vw,
    (max-width: ${md}px) ${sizes.sm || 80}vw,
    (max-width: ${lg}px) ${sizes.md || 60}vw,
    (max-width: ${xl}px) ${sizes.lg || 40}vw,
    ${sizes.xl || 30}vw
  `.trim()
}

// Generate srcSet for responsive images
export function generateSrcSet(baseUrl: string, widths: number[] = [320, 480, 640, 768, 1024, 1280, 1536]): string {
  // Handle different image URL formats
  if (baseUrl.includes("?")) {
    // URL already has query parameters
    return widths.map((width) => `${baseUrl}&w=${width} ${width}w`).join(", ")
  } else {
    // URL has no query parameters
    return widths.map((width) => `${baseUrl}?w=${width} ${width}w`).join(", ")
  }
}

// Get image dimensions from URL (for next/image)
export function getImageDimensions(url: string): { width: number; height: number } {
  // Default dimensions
  const defaultDimensions = { width: 1200, height: 630 }

  try {
    // Try to extract dimensions from URL if they exist
    const match = url.match(/(\d+)x(\d+)/)
    if (match && match.length === 3) {
      return {
        width: Number.parseInt(match[1], 10),
        height: Number.parseInt(match[2], 10),
      }
    }

    // For placeholder images with width/height in query params
    const urlObj = new URL(url)
    const width = urlObj.searchParams.get("width") || urlObj.searchParams.get("w")
    const height = urlObj.searchParams.get("height") || urlObj.searchParams.get("h")

    if (width && height) {
      return {
        width: Number.parseInt(width, 10),
        height: Number.parseInt(height, 10),
      }
    }

    return defaultDimensions
  } catch (error) {
    return defaultDimensions
  }
}

// Generate blur data URL for image placeholders
export function generateBlurDataURL(width = 8, height = 8, color = "rgba(15, 23, 42, 0.5)"): string {
  return `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E`
}

// Get image type from URL
export function getImageType(url: string): string {
  const extension = url.split(".").pop()?.toLowerCase() || ""

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg"
    case "png":
      return "image/png"
    case "webp":
      return "image/webp"
    case "avif":
      return "image/avif"
    case "gif":
      return "image/gif"
    case "svg":
      return "image/svg+xml"
    default:
      return "image/jpeg"
  }
}

// Check if image is animated
export function isAnimatedImage(url: string): boolean {
  const extension = url.split(".").pop()?.toLowerCase() || ""
  return extension === "gif" || url.includes("animated")
}

// Generate optimized image URL for CDN
export function getOptimizedImageUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number; format?: string } = {},
): string {
  if (!url) return ""

  // If URL is already optimized or is a data URL, return as is
  if (url.startsWith("data:") || url.includes("?w=") || url.includes("&w=")) {
    return url
  }

  try {
    const urlObj = new URL(url)

    // Add optimization parameters
    if (options.width) urlObj.searchParams.set("w", options.width.toString())
    if (options.height) urlObj.searchParams.set("h", options.height.toString())
    if (options.quality) urlObj.searchParams.set("q", options.quality.toString())
    if (options.format) urlObj.searchParams.set("fm", options.format)

    return urlObj.toString()
  } catch (error) {
    // If URL parsing fails, return original URL
    return url
  }
}
