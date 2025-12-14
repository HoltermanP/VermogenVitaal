"use client"

import { useState } from "react"
import Link from "next/link"
import { SignIn, SignUp } from "@clerk/nextjs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Shield, Zap, CheckCircle } from "lucide-react"

// Controleer of Clerk beschikbaar is
function isClerkAvailable(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return !!publishableKey &&
         publishableKey !== 'pk_test_...' &&
         !publishableKey.includes('placeholder') &&
         !publishableKey.includes('dummy') &&
         publishableKey !== 'pk_test_dummy_key_for_development'
}

export function SignInDialog() {
  const [open, setOpen] = useState(false)

  // Als Clerk niet beschikbaar is, toon direct link naar signin pagina
  if (!isClerkAvailable()) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link href="/auth/signin">Inloggen</Link>
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Inloggen
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/50 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Welkom terug
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold text-gradient-financial">
            Inloggen
          </DialogTitle>
          <DialogDescription>
            Log in om verder te gaan waar je gebleven was
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none mt-6">
          <CardContent>
            <SignIn
              routing="virtual"
              redirectUrl="/dashboard"
              appearance={{
                baseTheme: undefined,
                variables: {
                  colorPrimary: "hsl(var(--primary))",
                  colorBackground: "hsl(var(--background))",
                  colorInputBackground: "hsl(var(--background))",
                  colorInputText: "hsl(var(--foreground))",
                  colorText: "hsl(var(--foreground))",
                  borderRadius: "0.5rem"
                },
                elements: {
                  formButtonPrimary: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium",
                  card: "shadow-none border-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "border border-border hover:bg-accent transition-colors",
                  socialButtonsBlockButtonText: "text-foreground",
                  dividerLine: "bg-border",
                  dividerText: "text-muted-foreground",
                  formFieldLabel: "text-foreground font-medium",
                  formFieldInput: "border-border focus:border-primary focus:ring-1 focus:ring-primary/20",
                  footerActionLink: "text-primary hover:text-primary/80 font-medium",
                  identityPreviewEditButton: "text-primary",
                  formFieldErrorText: "text-red-600 text-sm",
                  alert: "border-red-200 bg-red-50 text-red-800",
                  alertText: "text-red-800"
                }
              }}
            />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

export function AuthDialog() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")

  // Als Clerk niet beschikbaar is, toon direct link naar signup pagina
  if (!isClerkAvailable()) {
    return (
      <Button size="sm" className="gap-2" asChild>
        <Link href="/auth/signup">
          <Sparkles className="h-4 w-4" />
          Start gratis
        </Link>
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Start gratis
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/50 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Veilig & Vertrouwd
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold text-gradient-financial">
            Welkom bij aivermogen.nl
          </DialogTitle>
          <DialogDescription>
            Start gratis en ontdek hoe je belasting kunt optimaliseren
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Inloggen</TabsTrigger>
            <TabsTrigger value="signup">Account aanmaken</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Welkom terug!</CardTitle>
                <CardDescription>
                  Log in om verder te gaan waar je gebleven was
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignIn
                  routing="virtual"
                  redirectUrl="/dashboard"
                  appearance={{
                    baseTheme: undefined,
                    variables: {
                      colorPrimary: "hsl(var(--primary))",
                      colorBackground: "hsl(var(--background))",
                      colorInputBackground: "hsl(var(--background))",
                      colorInputText: "hsl(var(--foreground))",
                      colorText: "hsl(var(--foreground))",
                      borderRadius: "0.5rem"
                    },
                    elements: {
                      formButtonPrimary: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium",
                      card: "shadow-none border-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "border border-border hover:bg-accent transition-colors",
                      socialButtonsBlockButtonText: "text-foreground",
                      dividerLine: "bg-border",
                      dividerText: "text-muted-foreground",
                      formFieldLabel: "text-foreground font-medium",
                      formFieldInput: "border-border focus:border-primary focus:ring-1 focus:ring-primary/20",
                      footerActionLink: "text-primary hover:text-primary/80 font-medium",
                      identityPreviewEditButton: "text-primary",
                      formFieldErrorText: "text-red-600 text-sm",
                      alert: "border-red-200 bg-red-50 text-red-800",
                      alertText: "text-red-800"
                    }
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  Start gratis proefperiode
                  <Badge className="gradient-financial text-white text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    30 dagen
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Geen creditcard nodig • Annuleer op elk moment
                </CardDescription>

                {/* Features list */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>QuickScan Belasting (5 min)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>AI Document Analyse</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Uitgebreide calculators</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SignUp
                  routing="virtual"
                  redirectUrl="/onboarding"
                  appearance={{
                    baseTheme: undefined,
                    variables: {
                      colorPrimary: "hsl(var(--primary))",
                      colorBackground: "hsl(var(--background))",
                      colorInputBackground: "hsl(var(--background))",
                      colorInputText: "hsl(var(--foreground))",
                      colorText: "hsl(var(--foreground))",
                      borderRadius: "0.5rem"
                    },
                    elements: {
                      formButtonPrimary: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium",
                      card: "shadow-none border-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "border border-border hover:bg-accent transition-colors",
                      socialButtonsBlockButtonText: "text-foreground",
                      dividerLine: "bg-border",
                      dividerText: "text-muted-foreground",
                      formFieldLabel: "text-foreground font-medium",
                      formFieldInput: "border-border focus:border-primary focus:ring-1 focus:ring-primary/20",
                      footerActionLink: "text-primary hover:text-primary/80 font-medium",
                      identityPreviewEditButton: "text-primary",
                      formFieldErrorText: "text-red-600 text-sm",
                      alert: "border-red-200 bg-red-50 text-red-800",
                      alertText: "text-red-800"
                    }
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
