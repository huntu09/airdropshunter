import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import BottomNavigation from "@/components/bottom-navigation"
import AuthProvider from "@/components/auth-provider"
import { RealTimeProvider } from "@/components/real-time-provider"
import { AdProvider } from "@/components/ads/ad-provider"
import { Toaster } from "@/components/ui/toaster"
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/metadata"
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo/structured-data"
import { SEO_CONFIG, ANALYTICS_CONFIG } from "@/lib/config/environment"
import { logEnvironmentStatus } from "@/lib/config/validation"
import PwaMeta from "@/components/pwa/pwa-meta"
import PwaInstallPrompt from "@/components/pwa/install-prompt"
import OfflineIndicator from "@/components/pwa/offline-indicator"
import UpdateNotification from "@/components/pwa/update-notification"
import Script from "next/script"

// Log environment status on startup
if (typeof window === "undefined") {
  logEnvironmentStatus()
}

export const metadata: Metadata = generateSEOMetadata({
  title: "Best Crypto Airdrops 2024 | Free Token Opportunities | Airdrops Hunter",
  description:
    "Discover the latest cryptocurrency airdrops and earn free tokens. Join thousands of users finding profitable airdrop opportunities daily. Verified projects, easy tasks, real rewards.",
  keywords: [
    "crypto airdrops",
    "free tokens",
    "cryptocurrency",
    "airdrop hunter",
    "token distribution",
    "DeFi airdrops",
    "NFT airdrops",
  ],
  path: "/",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16" },
      { url: "/favicon-32x32.png", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#6366F1",
      },
    ],
  },
})

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = generateOrganizationSchema()
  const websiteSchema = generateWebSiteSchema()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* SEO Verification Meta Tags */}
        {SEO_CONFIG.VERIFICATION.GOOGLE && (
          <meta name="google-site-verification" content={SEO_CONFIG.VERIFICATION.GOOGLE} />
        )}
        {SEO_CONFIG.VERIFICATION.BING && <meta name="msvalidate.01" content={SEO_CONFIG.VERIFICATION.BING} />}
        {SEO_CONFIG.VERIFICATION.YANDEX && <meta name="yandex-verification" content={SEO_CONFIG.VERIFICATION.YANDEX} />}
        {SEO_CONFIG.VERIFICATION.PINTEREST && (
          <meta name="p:domain_verify" content={SEO_CONFIG.VERIFICATION.PINTEREST} />
        )}

        {/* Google AdSense Account Verification */}
        <meta name="google-adsense-account" content="ca-pub-9620623978081909" />

        {/* PWA Meta Tags */}
        <PwaMeta />

        {/* Favicon - Custom SVG Logo */}
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236366f1;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%238b5cf6;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='200' rx='40' fill='url(%23a)'/%3E%3Cpath d='M100 60 L140 100 L100 140 L60 100 Z' fill='white' opacity='0.9'/%3E%3Ccircle cx='100' cy='100' r='20' fill='white'/%3E%3Cpath d='M90 95 L95 100 L110 85' stroke='%236366f1' strokeWidth='3' fill='none' strokeLinecap='round'/%3E%3C/svg%3E"
          type="image/svg+xml"
        />
        <link
          rel="apple-touch-icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236366f1;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%238b5cf6;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='200' rx='40' fill='url(%23a)'/%3E%3Cpath d='M100 60 L140 100 L100 140 L60 100 Z' fill='white' opacity='0.9'/%3E%3Ccircle cx='100' cy='100' r='20' fill='white'/%3E%3Cpath d='M90 95 L95 100 L110 85' stroke='%236366f1' strokeWidth='3' fill='none' strokeLinecap='round'/%3E%3C/svg%3E"
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch for Performance */}
        <link rel="dns-prefetch" href="//supabase.co" />
        <link rel="dns-prefetch" href="//vercel.app" />
        <link rel="dns-prefetch" href="//pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="//googleads.g.doubleclick.net" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />

        {/* Google Analytics 4 - Only load if configured */}
        {ANALYTICS_CONFIG.GOOGLE_ANALYTICS.ENABLED && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GOOGLE_ANALYTICS.MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${ANALYTICS_CONFIG.GOOGLE_ANALYTICS.MEASUREMENT_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                    enhanced_measurement_settings: {
                      scrolls: true,
                      outbound_clicks: true,
                      site_search: true,
                      video_engagement: true,
                      file_downloads: true
                    }
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${spaceGrotesk.className} bg-gradient-to-b from-[#0a0e17] to-[#0f1623] text-white min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <RealTimeProvider>
              <AdProvider>
                <OfflineIndicator />
                <Navbar />
                <main className="flex-grow pb-20">{children}</main>
                <Footer />
                <BottomNavigation />
                <Toaster />
                <PwaInstallPrompt />
                <UpdateNotification />
              </AdProvider>
            </RealTimeProvider>
          </ThemeProvider>
        </AuthProvider>

        {/* Register Service Worker */}
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(function(registration) {
                      console.log('Service Worker registered with scope:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('Service Worker registration failed:', error);
                    });
                });
              }
            `,
          }}
        />

        {/* Performance Monitoring */}
        <Script
          id="performance-monitoring"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Mark initial load time
                if (performance && performance.mark) {
                  performance.mark('app-loaded');
                }
                
                // Report initial page load time
                window.addEventListener('load', function() {
                  if (performance && performance.getEntriesByType) {
                    const navEntry = performance.getEntriesByType('navigation')[0];
                    if (navEntry) {
                      console.log('Page load time:', navEntry.duration, 'ms');
                      
                      // Send to analytics if available
                      if (window.gtag) {
                        window.gtag('event', 'timing_complete', {
                          name: 'page_load',
                          value: Math.round(navEntry.duration),
                          event_category: 'Performance'
                        });
                      }
                    }
                  }
                });
              } catch (e) {
                console.error('Performance monitoring error:', e);
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
