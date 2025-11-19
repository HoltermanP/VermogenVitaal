"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { ReactNode } from "react"

export function SessionProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  // Tijdens build, zorg dat we altijd een ClerkProvider hebben (ook met placeholder key)
  // Dit voorkomt errors tijdens static generation
  if (!publishableKey || publishableKey === 'pk_test_...') {
    // Gebruik een placeholder key tijdens build om errors te voorkomen
    // In productie zal dit worden overschreven door de echte key
    return (
      <ClerkProvider publishableKey="pk_test_placeholder">
        {children}
      </ClerkProvider>
    )
  }
  
  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
}

