"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Wallet } from "lucide-react"
import Link from "next/link"

export function PortfolioPage() {
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
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                Inloggen om te beginnen
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}