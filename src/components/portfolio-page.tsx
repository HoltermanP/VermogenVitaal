"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Wallet } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { SignInDialog } from "@/components/auth-dialog"

export function PortfolioPage() {
  const { isLoaded, isSignedIn, user } = useUser()

  // Als nog aan het laden, toon loading state
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-muted-foreground">Laden...</div>
          </div>
        </div>
      </div>
    )
  }

  // Als niet ingelogd, toon inlog boodschap
  if (!isSignedIn || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Portfolio Tracking</h1>
            <p className="text-lg text-muted-foreground">
              Beheer je beleggingen en volg je rendement
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Inloggen vereist
              </CardTitle>
              <CardDescription>
                Portfolio tracking is alleen beschikbaar voor ingelogde gebruikers.
                Log in om je portefeuille te beheren en je beleggingen te volgen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Volg je aandelen en ETF&apos;s</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Realtime prijs updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Rendement analyse</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Prijs alerts</span>
                </div>
              </div>
              <SignInDialog
                trigger={
                  <Button className="w-full">
                    Inloggen om te beginnen
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Als ingelogd, toon portfolio functionaliteit
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Wallet className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Portfolio Tracking</h1>
          <p className="text-lg text-muted-foreground">
            Beheer je beleggingen en volg je rendement
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Je Portefeuille</CardTitle>
            <CardDescription>
              Hier zie je al je beleggingen en hun prestaties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Je portefeuille is nog leeg.</p>
              <p className="text-sm mt-2">Voeg je eerste belegging toe om te beginnen.</p>
            </div>
            {/* TODO: Voeg hier portfolio functionaliteit toe */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}