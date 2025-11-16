"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { ReactNode } from "react"

export function SessionProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  if (!publishableKey) {
    // Fallback voor wanneer Clerk niet is geconfigureerd (bijv. tijdens build zonder env vars)
    return <>{children}</>
  }
  
  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
}

