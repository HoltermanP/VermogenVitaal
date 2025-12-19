"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Home, FileText, TrendingUp, Linkedin, LogOut } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { ClerkErrorBoundary } from "./clerk-error-boundary"
import { AuthDialog, SignInDialog } from "./auth-dialog"

// Controleer of Clerk beschikbaar is
function isClerkAvailable(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return !!publishableKey &&
         publishableKey !== 'pk_test_...' &&
         !publishableKey.includes('placeholder') &&
         !publishableKey.includes('dummy') &&
         publishableKey !== 'pk_test_dummy_key_for_development'
}

// Fallback component voor wanneer Clerk niet beschikbaar is
function FallbackAuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/auth/signin">Inloggen</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/auth/signup">Start gratis</Link>
      </Button>
    </div>
  )
}

// Hook wrapper om Clerk hooks alleen aan te roepen als Clerk beschikbaar is
function useClerkUser() {
  // Altijd useUser aanroepen voor consistente React Hook volgorde
  const clerkData = useUser()

  // Als Clerk niet beschikbaar is, retourneer dummy data maar hook is al aangeroepen
  const clerkAvailable = isClerkAvailable()
  if (!clerkAvailable) {
    return { user: null, isLoaded: true }
  }

  return clerkData
}

// Separate component voor Clerk user - wordt dynamisch geïmporteerd om build errors te voorkomen
function ClerkUserContent() {
  const [isMounted, setIsMounted] = React.useState(false)
  const [userData, setUserData] = React.useState<{
    tier: 'FREE' | 'PREMIUM'
    isTrialActive: boolean
    trialEndsAt: string | null
  } | null>(null)
  const { signOut } = useClerk()
  const router = useRouter()

  // Hook alleen aanroepen als Clerk beschikbaar is
  const clerkData = useClerkUser()
  const user = clerkData.user
  const isLoaded = clerkData.isLoaded
  const isAuthenticated = !!user && isClerkAvailable()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Haal user data op wanneer user is ingelogd
  React.useEffect(() => {
    if (isAuthenticated && isLoaded) {
      fetch('/api/user')
        .then(response => {
          // Check of response OK is en content-type is JSON
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const contentType = response.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON')
          }
          return response.json()
        })
        .then(data => {
          if (!data.error) {
            setUserData({
              tier: data.tier,
              isTrialActive: data.isTrialActive,
              trialEndsAt: data.trialEndsAt,
            })
          }
        })
        .catch(error => {
          // Alleen loggen in development, niet in production om console te vermijden
          if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching user data:', error)
          }
          // Stil falen - gebruiker kan nog steeds de app gebruiken zonder tier info
        })
    }
  }, [isAuthenticated, isLoaded])

  // Clerk is beschikbaar (gecheckt in parent component)
  
  if (!isMounted) {
    return <Skeleton className="h-10 w-20" />
  }
  
  if (!isLoaded) {
    return <Skeleton className="h-10 w-20" />
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <SignInDialog />
        <AuthDialog />
      </div>
    )
  }
  
  const isAdmin = user?.publicMetadata?.role === 'ADMIN'

  // Gebruik opgehaalde user data, of fallback naar defaults
  const tier = userData?.tier || 'FREE'
  const isTrialActive = userData?.isTrialActive || false
  const trialEndsAt = userData?.trialEndsAt ? new Date(userData.trialEndsAt) : null
  
  return (
    <>
      <Link href="/dashboard" className="hidden md:block">
        <Button variant="ghost" size="sm">
          Dashboard
        </Button>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.firstName || user?.username || "Gebruiker"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
              <Badge variant="secondary" className="mt-2 w-fit">
                {isTrialActive ? 'Proefperiode' : `${tier} Plan`}
              </Badge>
              {isTrialActive && trialEndsAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Verloopt op {new Date(trialEndsAt).toLocaleDateString('nl-NL')}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/reports" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Rapporten
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/pricing" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/linkedin" className="flex items-center">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn Posts
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Uitloggen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

// Export wrapper die error handling heeft
export function ClerkUserSection() {
  // Als Clerk niet beschikbaar is, toon direct fallback zonder ClerkErrorBoundary
  if (!isClerkAvailable()) {
    return <FallbackAuthButtons />
  }

  // Als Clerk beschikbaar is, gebruik error boundary
  return (
    <ClerkErrorBoundary>
      <ClerkUserContent />
    </ClerkErrorBoundary>
  )
}

