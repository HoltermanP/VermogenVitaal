"use client"

import dynamic from "next/dynamic"

// Dynamisch importeren om SSR problemen te voorkomen
const PortfolioPage = dynamic(() => import("@/components/portfolio-page"), {
  ssr: false,
  loading: () => <div>Laden...</div>
})

export default function Portfolio() {
  return <PortfolioPage />
}

