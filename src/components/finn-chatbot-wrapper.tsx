"use client"

import dynamic from "next/dynamic"

// Controleer of Clerk beschikbaar is
function isClerkAvailable(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return !!publishableKey &&
         publishableKey !== 'pk_test_...' &&
         !publishableKey.includes('placeholder') &&
         !publishableKey.includes('dummy') &&
         publishableKey !== 'pk_test_dummy_key_for_development'
}

// Dynamisch importeren van Finn chatbot (client component) - alleen als Clerk beschikbaar is
const FinnChatbot = dynamic(() => import("@/components/finn-chatbot").then(mod => ({ default: mod.FinnChatbot })), {
  ssr: false, // Client-side only voor interactiviteit
})

export function FinnChatbotWrapper() {
  // Alleen render FinnChatbot als Clerk beschikbaar is
  if (!isClerkAvailable()) {
    return null // Geen chatbot tonen als Clerk niet beschikbaar is
  }

  return <FinnChatbot />
}










