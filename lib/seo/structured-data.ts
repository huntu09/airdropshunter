interface BreadcrumbItem {
  name: string
  url: string
}

interface FAQItem {
  question: string
  answer: string
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Airdrops Hunter",
    url: "https://airdropshunter.com",
    logo: "https://airdropshunter.com/logo.png",
    description: "Discover the latest cryptocurrency airdrops and earn free tokens",
    foundingDate: "2024",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "support@airdropshunter.com",
    },
    sameAs: ["https://twitter.com/airdropshunter", "https://t.me/airdropshunter", "https://discord.gg/airdropshunter"],
  }
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Airdrops Hunter",
    url: "https://airdropshunter.com",
    description: "Discover the latest cryptocurrency airdrops and earn free tokens",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://airdropshunter.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  }
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://airdropshunter.com${item.url}`,
    })),
  }
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export function generateAirdropSchema(airdrop: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${airdrop.title} Airdrop`,
    description: airdrop.description,
    startDate: airdrop.start_date,
    endDate: airdrop.end_date,
    eventStatus: airdrop.status === "active" ? "EventScheduled" : "EventCancelled",
    eventAttendanceMode: "OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url: `https://airdropshunter.com/airdrops/${airdrop.id}`,
    },
    organizer: {
      "@type": "Organization",
      name: airdrop.title,
      url: airdrop.website_url,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: `Free ${airdrop.reward_amount || "tokens"}`,
      availability: "InStock",
    },
    image: airdrop.banner_url || airdrop.logo_url,
    url: `https://airdropshunter.com/airdrops/${airdrop.id}`,
  }
}

export function generateArticleSchema(article: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image,
    author: {
      "@type": "Person",
      name: "Airdrops Hunter Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Airdrops Hunter",
      logo: {
        "@type": "ImageObject",
        url: "https://airdropshunter.com/logo.png",
      },
    },
    datePublished: article.created_at,
    dateModified: article.updated_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://airdropshunter.com/blog/${article.slug}`,
    },
  }
}
