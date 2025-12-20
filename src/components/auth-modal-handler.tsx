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
  const [redirectPath, setRedirectPath] = useState<string | null>(null)

  useEffect(() => {
    // Als gebruiker is ingelogd en er is een redirect parameter, redirect direct
    if (isLoaded && isSignedIn && searchParams.get('redirect')) {
      const redirect = searchParams.get('redirect')
      if (redirect) {
        // Verwijder query parameters en redirect
        const url = new URL(window.location.href)
        url.searchParams.delete('auth_required')
        url.searchParams.delete('redirect')
        router.replace(redirect)
        return
      }
    }
    
    // Alleen modal tonen als gebruiker NIET is ingelogd
    if (isLoaded && !isSignedIn && searchParams.get('auth_required') === 'true') {
      // Sla redirect path op voordat we het verwijderen
      const redirect = searchParams.get('redirect')
      if (redirect) {
        setRedirectPath(redirect)
      }
      
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
      // Gebruik opgeslagen redirect path of fallback naar dashboard
      const path = redirectPath || searchParams.get('redirect') || '/dashboard'
      router.push(path)
      router.refresh() // Refresh om ervoor te zorgen dat de pagina correct laadt
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

