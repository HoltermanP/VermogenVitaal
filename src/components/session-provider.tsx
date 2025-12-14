"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { ReactNode } from "react"

export function SessionProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  // Check of er een geldige key is
  const hasValidKey = publishableKey &&
                      publishableKey !== 'pk_test_...' &&
                      !publishableKey.includes('placeholder') &&
                      !publishableKey.includes('dummy') &&
                      publishableKey !== 'pk_test_dummy_key_for_development'

  // Als er geen geldige key is, render children zonder ClerkProvider
  // ClerkUserSection zal dan een fallback tonen via ClerkUserWrapper
  if (!hasValidKey) {
    return <>{children}</>
  }

  // Render ClerkProvider met de echte key
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/onboarding"
    >
      {children}
    </ClerkProvider>
  )
}

