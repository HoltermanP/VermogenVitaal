"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Calculator, TrendingUp, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Dynamisch importeren van ClerkUserSection om build errors te voorkomen
// ssr: false betekent dat deze component niet tijdens static generation wordt gerenderd
const ClerkUserSection = dynamic(
  () => import("@/components/clerk-user-section").then(mod => ({ default: mod.ClerkUserSection })),
  { 
    ssr: false,
    loading: () => (
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
)


export function Header() {
  const pathname = usePathname()

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
                    Ondersteuning
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
                    href="/stocks/deep-research"
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive("/stocks/deep-research") ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Deep Research
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/portfolio"
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive("/portfolio") ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Portefeuille
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
                    EasyBook
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
        <div className="flex items-center gap-4">
          <ClerkUserSection />
          
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
                  Ondersteuning
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
                  href="/stocks/deep-research"
                  className={`text-lg font-medium ${
                    isActive("/stocks/deep-research") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Deep Research
                </Link>
                <Link
                  href="/portfolio"
                  className={`text-lg font-medium ${
                    isActive("/portfolio") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Portefeuille
                </Link>
                <Link
                  href="/accounting"
                  className={`text-lg font-medium ${
                    isActive("/accounting") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  EasyBook
                </Link>
                <Link
                  href="/pricing"
                  className={`text-lg font-medium ${
                    isActive("/pricing") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Prijzen
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

