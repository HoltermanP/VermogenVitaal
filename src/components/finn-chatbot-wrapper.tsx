"use client"

import dynamic from "next/dynamic"

// Dynamisch importeren van Finn chatbot (client component)
const FinnChatbot = dynamic(() => import("@/components/finn-chatbot").then(mod => ({ default: mod.FinnChatbot })), {
  ssr: false, // Client-side only voor interactiviteit
})

export function FinnChatbotWrapper() {
  return <FinnChatbot />
}








