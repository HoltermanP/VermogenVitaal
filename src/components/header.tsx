"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
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
import { Calculator, Home, FileText, TrendingUp, Menu, Plug } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Wrapper component voor Clerk hooks
function ClerkUserWrapper({ children }: { children: (user: ReturnType<typeof useUser>['user'], isLoaded: boolean) => ReactNode }) {
  // Altijd de hook aanroepen (React regel), maar vangen we errors op
  let user: ReturnType<typeof useUser>['user'] = null
  let isLoaded = true
  
  try {
    const clerkData = useUser()
    user = clerkData.user
    isLoaded = clerkData.isLoaded
  } catch {
    // Clerk niet beschikbaar tijdens build of wanneer niet geconfigureerd
    user = null
    isLoaded = true
  }
  
  return <>{children(user, isLoaded)}</>
}

export function Header() {
  const pathname = usePathname()
  const tier: 'FREE' | 'BASIC' | 'PRO' | 'ELITE' = 'FREE' // TODO: Haal tier op uit database

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 gradient-financial rounded-lg flex items-center justify-center shadow-financial group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
              Tax & Wealth Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/"
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive("/") ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Calculators</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    <NavigationMenuLink asChild>
                      <Link href="/calculators" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="flex items-center gap-2">
                          <Calculator className="h-4 w-4" />
                          <div className="text-sm font-medium leading-none">Alle Calculators</div>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-2">
                          Bekijk alle beschikbare fiscale calculators
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="/calculators/bv-vs-emz" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">BV vs EMZ</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                          Bereken of een BV of EMZ voordeliger is
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="/calculators/etf" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">ETF Groei</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                          Bereken de potentiële groei van je ETF beleggingen
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="/calculators/real-estate" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Vastgoed Cashflow</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                          Analyseer de cashflow van je vastgoed investeringen
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/advies"
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive("/advies") ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Advies
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/community"
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive("/community") ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Community
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/stocks"
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive("/stocks") ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Beurskoersen
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/accounting"
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive("/accounting") ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Boekhoudpakket
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/pricing"
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive("/pricing") ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Prijzen
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side - Auth & User Menu */}
        <ClerkUserWrapper>
          {(user, isLoaded) => {
            const isAuthenticated = !!user
            return (
              <div className="flex items-center gap-4">
                {isLoaded && isAuthenticated ? (
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
                        {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.firstName || user.username || "Gebruiker"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.emailAddresses[0]?.emailAddress}
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
                </DropdownMenuContent>
              </DropdownMenu>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : isLoaded ? (
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
                ) : (
                  <Skeleton className="h-10 w-20" />
                )}

                {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu openen</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/"
                  className={`text-lg font-medium ${
                    isActive("/") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/calculators"
                  className={`text-lg font-medium ${
                    isActive("/calculators") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Calculators
                </Link>
                <Link
                  href="/advies"
                  className={`text-lg font-medium ${
                    isActive("/advies") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Advies
                </Link>
                <Link
                  href="/community"
                  className={`text-lg font-medium ${
                    isActive("/community") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Community
                </Link>
                <Link
                  href="/stocks"
                  className={`text-lg font-medium ${
                    isActive("/stocks") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Beurskoersen
                </Link>
                <Link
                  href="/accounting"
                  className={`text-lg font-medium ${
                    isActive("/accounting") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Boekhoudpakket
                </Link>
                <Link
                  href="/pricing"
                  className={`text-lg font-medium ${
                    isActive("/pricing") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Prijzen
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      href="/dashboard"
                      className={`text-lg font-medium ${
                        isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Dashboard
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
              </div>
            )
          }}
        </ClerkUserWrapper>
      </div>
    </header>
  )
}

