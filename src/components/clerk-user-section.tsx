"use client"

import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
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
import { Home, FileText, TrendingUp, Plug, Linkedin } from "lucide-react"
import Link from "next/link"
import * as React from "react"

// Separate component voor Clerk user - wordt dynamisch geïmporteerd om build errors te voorkomen
export function ClerkUserSection() {
  const [isMounted, setIsMounted] = React.useState(false)
  
  React.useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Hook ALTIJD aanroepen (React regel) - zonder conditionals
  const clerkData = useUser()
  const user = clerkData.user
  const isLoaded = clerkData.isLoaded
  const isAuthenticated = !!user
  
  // Check of Clerk key beschikbaar is
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const hasValidKey = publishableKey && publishableKey !== 'pk_test_...' && !publishableKey.includes('placeholder') && !publishableKey.includes('dummy')
  
  // Als er geen geldige key is of niet gemount, toon alleen login buttons
  if (!hasValidKey || !isMounted) {
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
  
  if (!isLoaded) {
    return <Skeleton className="h-10 w-20" />
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm">
            Inloggen
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button size="sm">
            Start gratis
          </Button>
        </SignUpButton>
      </div>
    )
  }
  
  const isAdmin = user?.publicMetadata?.role === 'ADMIN'
  const tier: 'FREE' | 'BASIC' | 'PRO' | 'ELITE' = 'FREE' // TODO: Haal tier op uit database
  
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
                {tier} Plan
              </Badge>
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
            <Link href="/accounting" className="flex items-center">
              <Plug className="mr-2 h-4 w-4" />
              Boekhoudpakket
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
        </DropdownMenuContent>
      </DropdownMenu>
      <UserButton afterSignOutUrl="/" />
    </>
  )
}

