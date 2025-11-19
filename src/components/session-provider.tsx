"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { ReactNode } from "react"

export function SessionProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  // Als er geen key is, gebruik een dummy key voor build
  // In productie zal dit worden overschreven door de echte key uit Vercel env vars
  const key = publishableKey || "pk_test_dummy_for_build_only"
  
  // ClerkProvider moet altijd aanwezig zijn, anders faalt useUser hook
  // Gebruik een dummy key tijdens build (wordt niet gevalideerd tijdens build)
  return <ClerkProvider publishableKey={key}>{children}</ClerkProvider>
}

