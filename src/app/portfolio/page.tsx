"use client"

import dynamic from "next/dynamic"

// Dynamisch importeren om SSR problemen te voorkomen
const PortfolioPageWrapper = dynamic(() => import("@/components/portfolio-page").then(mod => ({ default: mod.PortfolioPageWrapper })), {
  ssr: false,
  loading: () => <div>Laden...</div>
})

export default function Portfolio() {
  return <PortfolioPageWrapper />
}

