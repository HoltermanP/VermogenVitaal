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
      // Verwijder query parameters uit URL zonder reload
      const url = new URL(window.location.href)
      url.searchParams.delete('auth_required')
      url.searchParams.delete('redirect')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [isLoaded, isSignedIn, searchParams, router])

  const handleSuccess = () => {
    setShowModal(false)
    // Wacht even zodat Clerk de authenticatie status kan updaten
    setTimeout(() => {
      // Als er een redirect parameter is, ga daar naartoe na succesvol inloggen
      const redirectPath = searchParams.get('redirect')
      if (redirectPath) {
        router.push(redirectPath)
        router.refresh() // Refresh om ervoor te zorgen dat de pagina correct laadt
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }, 500)
  }

  const handleModalClose = (open: boolean) => {
    setShowModal(open)
    if (!open) {
      // Verwijder query parameters wanneer modal wordt gesloten
      const url = new URL(window.location.href)
      url.searchParams.delete('auth_required')
      url.searchParams.delete('redirect')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }

  if (!showModal) return null

  return (
    <AuthDialog 
      open={showModal} 
      onOpenChange={handleModalClose}
      onSuccess={handleSuccess}
      defaultMode="signin"
    />
  )
}

