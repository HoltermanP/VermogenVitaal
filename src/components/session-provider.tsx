"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { ReactNode } from "react"

export function SessionProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  // Alleen ClerkProvider renderen als er een echte key is
  // ClerkUserSection wordt dynamisch geïmporteerd met ssr: false, dus dit is OK
  if (!publishableKey || publishableKey === 'pk_test_...' || publishableKey.includes('placeholder') || publishableKey.includes('dummy')) {
    return <>{children}</>
  }
  
  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
}

