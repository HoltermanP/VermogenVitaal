"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { AuthDialog } from "./auth-dialog"

export function AuthModalHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn && searchParams.get('auth_required') === 'true') {
      setShowModal(true)
      // Verwijder query parameter uit URL zonder reload
      const url = new URL(window.location.href)
      url.searchParams.delete('auth_required')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [isLoaded, isSignedIn, searchParams, router])

  if (!showModal) return null

  return (
    <AuthDialog 
      open={showModal} 
      onOpenChange={(open) => {
        setShowModal(open)
        if (!open) {
          // Verwijder query parameter wanneer modal wordt gesloten
          const url = new URL(window.location.href)
          url.searchParams.delete('auth_required')
          router.replace(url.pathname + url.search, { scroll: false })
        }
      }}
      defaultMode="signin"
    />
  )
}

