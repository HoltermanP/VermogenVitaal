"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calculator, FileText, Users, TrendingUp, AlertCircle, CheckCircle, ArrowRight, Sparkles, Zap, Target, FileCheck, Linkedin, BarChart3, PieChart, MessageSquare, Receipt, CreditCard } from "lucide-react"
import Link from "next/link"
import { NewsTicker } from "@/components/news-ticker"
import { DailyTop3 } from "@/components/daily-top-3"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface UserData {
  tier: 'FREE' | 'PREMIUM'
  isTrialActive: boolean
  trialEndsAt: string | null
  name: string
  email: string
}

export default function DashboardPage() {
  const { user: clerkUser, isLoaded } = useUser()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const router = useRouter()

  const handleUpgrade = async () => {
    try {
      setUpgrading(true)
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'premium', // Use identifier, backend will resolve to actual price ID
        }),
      })

      const data = await response.json()

      if (data.sessionId && data.url) {
        // Redirect naar Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Er is iets misgegaan bij het starten van de upgrade')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Er is iets misgegaan bij het upgraden. Probeer het opnieuw.')
    } finally {
      setUpgrading(false)
    }
  }

  useEffect(() => {
    if (isLoaded && clerkUser) {
      fetch('/api/user')
        .then(response => response.json())
        .then(data => {
          console.log('Dashboard Debug - User API response:', data)
          if (!data.error) {
            setUserData(data)
            console.log('Dashboard Debug - UserData set:', data)
          }
        })
        .catch(error => {
          console.error('Error fetching user data:', error)
        })
        .finally(() => setLoading(false))
    } else if (isLoaded && !clerkUser) {
      console.log('Dashboard Debug - No clerk user')
      setLoading(false)
    }
  }, [isLoaded, clerkUser])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12">
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Skeleton className="h-10 w-64 mb-3" />
                <Skeleton className="h-6 w-96" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Geen toegang</h1>
          <p className="text-muted-foreground mb-4">Je moet ingelogd zijn om je dashboard te bekijken.</p>
          <Button asChild>
            <Link href="/auth/signin">Inloggen</Link>
          </Button>
        </div>
      </div>
    )
  }

  const tier = userData.tier
  const user = { name: userData.name, email: userData.email }
  const isTrialActive = userData.isTrialActive
  const trialEndsAt = userData.trialEndsAt ? new Date(userData.trialEndsAt) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        {/* Financial grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 animate-fade-in">
                Welkom terug, <span className="text-gradient-financial">{user.name || user.email}</span>!
              </h1>
              <p className="text-muted-foreground text-lg animate-fade-in delay-200">Hier is een overzicht van je fiscale dashboard</p>
            </div>
            <div className="flex items-center gap-4 animate-fade-in delay-300">
              <Badge variant={tier === 'FREE' ? 'secondary' : 'default'}>
                {tier} Plan
              </Badge>
              {tier === 'FREE' && !isTrialActive && (
                <Badge variant="outline" className="border-primary/50 bg-primary/10 hover:bg-primary/20">
                  <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                  Upgrade beschikbaar
                </Badge>
              )}
              {isTrialActive && trialEndsAt && (
                <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-400">
                  <Zap className="w-3 h-3 mr-1" />
                  Proefperiode actief tot {new Date(trialEndsAt).toLocaleDateString('nl-NL')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* News Ticker - Compact */}
        <div className="mb-6">
          <NewsTicker pagePath="/dashboard" />
        </div>

        {/* Dag-Top 3 Beleggingsproducten */}
        <DailyTop3 />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 mb-16">
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 group hover:scale-105 animate-fade-in">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 gradient-financial rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-financial">
                <Calculator className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-foreground text-lg sm:text-xl group-hover:text-primary transition-colors">Calculators</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 sm:mb-6 group-hover:text-foreground transition-colors text-sm sm:text-base">
                Bereken je fiscale optimalisatie
              </p>
              <Button size="sm" className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300 text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2" asChild>
                <Link href="/calculators" className="flex items-center justify-center gap-1.5">
                  <span>Start berekening</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 group hover:scale-105 animate-fade-in delay-100">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 gradient-financial rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-financial">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-foreground text-lg sm:text-xl group-hover:text-primary transition-colors">Documenten</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 sm:mb-6 group-hover:text-foreground transition-colors text-sm sm:text-base">
                {tier === 'FREE' ? 'Upload documenten (Pro+)' : 'Beheer je documenten'}
              </p>
              <Button 
                size="sm" 
                variant={tier === 'FREE' ? 'outline' : 'default'}
                className={tier === 'FREE' ? 'w-full border-primary/50 hover:bg-primary/10 hover:border-primary text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2' : 'w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300 text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2'}
                asChild
                disabled={tier === 'FREE'}
              >
                <Link href={tier === 'FREE' ? '/pricing' : '/documents'} className="flex items-center justify-center">
                  <span>{tier === 'FREE' ? 'Upgrade nodig' : 'Bekijk documenten'}</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 group hover:scale-105 animate-fade-in delay-200">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 gradient-financial rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-financial">
                <Users className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-foreground text-lg sm:text-xl group-hover:text-primary transition-colors">Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 sm:mb-6 group-hover:text-foreground transition-colors text-sm sm:text-base">
                {tier === 'FREE' ? 'Lees community (Pro+ posten)' : 'Stel vragen aan experts'}
              </p>
              <Button 
                size="sm" 
                variant={tier === 'FREE' ? 'outline' : 'default'}
                className={tier === 'FREE' ? 'w-full border-primary/50 hover:bg-primary/10 hover:border-primary text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2' : 'w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300 text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2'}
                asChild
              >
                <Link href="/community" className="flex items-center justify-center">
                  <span>{tier === 'FREE' ? 'Bekijk community' : 'Ga naar community'}</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 group hover:scale-105 animate-fade-in delay-300">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 gradient-financial rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-financial">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-foreground text-lg sm:text-xl group-hover:text-primary transition-colors">Rapporten</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 sm:mb-6 group-hover:text-foreground transition-colors text-sm sm:text-base">
                Bekijk je gegenereerde rapporten
              </p>
              <Button size="sm" className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300 text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2" asChild>
                <Link href="/reports" className="flex items-center justify-center gap-1.5">
                  <span>Bekijk rapporten</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 group hover:scale-105 animate-fade-in delay-400">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 gradient-financial rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-financial">
                <FileCheck className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-foreground text-lg sm:text-xl group-hover:text-primary transition-colors">Admin Controle</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 sm:mb-6 group-hover:text-foreground transition-colors text-sm sm:text-base">
                Controleer je administratie met AI
              </p>
              <Button size="sm" className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300 text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2" asChild>
                <Link href="/audit" className="flex items-center justify-center gap-1.5">
                  <span>Start controle</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Admin: LinkedIn Posts Generator */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 group hover:scale-105 animate-fade-in delay-500">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/25">
                <Linkedin className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-foreground text-lg sm:text-xl group-hover:text-primary transition-colors">LinkedIn Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 sm:mb-6 group-hover:text-foreground transition-colors text-sm sm:text-base">
                Genereer en beheer LinkedIn posts
              </p>
              <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2" asChild>
                <Link href="/admin/linkedin" className="flex items-center justify-center gap-1.5">
                  <span>Beheer posts</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Stocks Analysis */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 group hover:scale-105 animate-fade-in delay-600">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 gradient-financial rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-financial">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-foreground text-lg sm:text-xl group-hover:text-primary transition-colors">Stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 sm:mb-6 group-hover:text-foreground transition-colors text-sm sm:text-base">
                Analyseer aandelen en volg de markt
              </p>
              <Button size="sm" className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300 text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2" asChild>
                <Link href="/stocks" className="flex items-center justify-center gap-1.5">
                  <span>Start analyse</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Portfolio Management */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 group hover:scale-105 animate-fade-in delay-700">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 gradient-financial rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-financial">
                <PieChart className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-foreground text-lg sm:text-xl group-hover:text-primary transition-colors">Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 sm:mb-6 group-hover:text-foreground transition-colors text-sm sm:text-base">
                Beheer je beleggingsportefeuille
              </p>
              <Button size="sm" className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300 text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2" asChild>
                <Link href="/portfolio" className="flex items-center justify-center gap-1.5">
                  <span>Bekijk portfolio</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Personal Advice */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 group hover:scale-105 animate-fade-in delay-800">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 gradient-financial rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-financial">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-foreground text-lg sm:text-xl group-hover:text-primary transition-colors">Advies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 sm:mb-6 group-hover:text-foreground transition-colors text-sm sm:text-base">
                {tier === 'FREE' ? 'Persoonlijke tips (Pro+)' : 'Krijg persoonlijke fiscale tips'}
              </p>
              <Button
                size="sm"
                variant={tier === 'FREE' ? 'outline' : 'default'}
                className={tier === 'FREE' ? 'w-full border-primary/50 hover:bg-primary/10 hover:border-primary text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2' : 'w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300 text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2'}
                asChild
                disabled={tier === 'FREE'}
              >
                <Link href={tier === 'FREE' ? '/pricing' : '/tips'} className="flex items-center justify-center">
                  <span>{tier === 'FREE' ? 'Upgrade nodig' : 'Start gesprek'}</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Accounting Integration */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 group hover:scale-105 animate-fade-in delay-900">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 gradient-financial rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-financial">
                <Receipt className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-foreground text-lg sm:text-xl group-hover:text-primary transition-colors">Boekhouding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 sm:mb-6 group-hover:text-foreground transition-colors text-sm sm:text-base">
                {tier === 'FREE' ? 'Boekhouding integratie (Pro+)' : 'Koppel je boekhoudsoftware'}
              </p>
              <Button
                size="sm"
                variant={tier === 'FREE' ? 'outline' : 'default'}
                className={tier === 'FREE' ? 'w-full border-primary/50 hover:bg-primary/10 hover:border-primary text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2' : 'w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300 text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2'}
                asChild
                disabled={tier === 'FREE'}
              >
                <Link href={tier === 'FREE' ? '/pricing' : '/accounting'} className="flex items-center justify-center">
                  <span>{tier === 'FREE' ? 'Upgrade nodig' : 'Beheer integratie'}</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Progress & Next Steps */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-400">
            <CardHeader>
              <CardTitle className="text-foreground text-2xl group-hover:text-primary transition-colors">Onboarding Voortgang</CardTitle>
              <CardDescription className="text-muted-foreground">
                Voltooi je profiel voor betere ondersteuning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">Profiel compleet</span>
                  <span className="text-muted-foreground">2/4 stappen</span>
                </div>
                <Progress value={50} className="h-2" />
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-5 w-5 text-primary mr-3" />
                    <span className="text-muted-foreground">Basis profiel</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-5 w-5 text-primary mr-3" />
                    <span className="text-muted-foreground">Interesses</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mr-3" />
                    <span className="text-muted-foreground">Risicoprofiel</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mr-3" />
                    <span className="text-muted-foreground">Toestemmingen</span>
                  </div>
                </div>

                <Button size="sm" className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300 text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2" asChild>
                  <Link href="/onboarding" className="flex items-center justify-center">
                    <span>Voltooi profiel</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-500">
            <CardHeader>
              <CardTitle className="text-foreground text-2xl group-hover:text-primary transition-colors">Volgende Stappen</CardTitle>
              <CardDescription className="text-muted-foreground">
                Aanbevelingen op basis van je tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  console.log('Dashboard Debug - Upgrade button check:', { tier, isTrialActive, condition: tier === 'FREE' && !isTrialActive })
                  return null
                })()}

                {/* TEMP: Force upgrade button for debugging - altijd zichtbaar */}
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-red-500 mr-2" />
                      <h4 className="font-semibold text-foreground">DEBUG: Force Upgrade Button</h4>
                    </div>
                    <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/50">
                      Debug Mode
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Deze button is altijd zichtbaar voor debugging. Tier: {tier}, Trial: {isTrialActive ? 'Ja' : 'Nee'}
                  </p>
                  <Button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all duration-300"
                  >
                    {upgrading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Upgraden...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Force Upgrade Test
                      </>
                    )}
                  </Button>
                </div>

                {tier === 'FREE' && !isTrialActive && (
                  <>
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl hover:bg-primary/20 hover:border-primary/40 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-primary mr-2" />
                          <h4 className="font-semibold text-foreground">Upgrade naar Premium</h4>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/50">
                          €19,95/maand
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Krijg toegang tot AI document analyse, Deep Research rapporten en expert Q&A
                      </p>
                      <Button
                        onClick={handleUpgrade}
                        disabled={upgrading}
                        className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300"
                      >
                        {upgrading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Upgraden...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Start Premium nu
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <Target className="h-5 w-5 text-primary mr-2" />
                        <h4 className="font-semibold text-foreground">Probeer calculators</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Start met BV vs EMZ of ETF berekening
                      </p>
                    </div>
                  </>
                )}

                {/* Premium features */}
                {tier === 'PREMIUM' && (
                  <>
                    <div className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/40 transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <Zap className="h-5 w-5 text-gray-300 mr-2 animate-pulse" />
                        <h4 className="font-semibold text-gray-200">Upload documenten</h4>
                      </div>
                      <p className="text-sm text-gray-300">
                        Upload documenten voor fiscale analyse en optimalisatie
                      </p>
                    </div>
                    <div className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/40 transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <Target className="h-5 w-5 text-gray-300 mr-2 animate-pulse" />
                        <h4 className="font-semibold text-gray-200">Stel expert vragen</h4>
                      </div>
                      <p className="text-sm text-gray-300">
                        Gebruik de Q&A voor specifieke vragen
                      </p>
                    </div>
                    <div className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/40 transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <Target className="h-5 w-5 text-gray-300 mr-2 animate-pulse" />
                        <h4 className="font-semibold text-gray-200">Genereer rapporten</h4>
                      </div>
                      <p className="text-sm text-gray-300">
                        Export je berekeningen als PDF
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-600">
          <CardHeader>
            <CardTitle className="text-foreground text-2xl group-hover:text-primary transition-colors">Recente Activiteit</CardTitle>
            <CardDescription className="text-muted-foreground">
              Je laatste berekeningen en activiteiten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300 group">
                <div className="flex items-center">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-financial">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">BV vs EMZ berekening</p>
                    <p className="text-sm text-muted-foreground">2 dagen geleden</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300 text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2" asChild>
                  <Link href="/reports/1" className="flex items-center justify-center">
                    <span>Bekijk</span>
                  </Link>
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300 group">
                <div className="flex items-center">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-financial">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">ETF groei scenario</p>
                    <p className="text-sm text-muted-foreground">1 week geleden</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300 text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2" asChild>
                  <Link href="/reports/2" className="flex items-center justify-center">
                    <span>Bekijk</span>
                  </Link>
                </Button>
              </div>

              {tier !== 'FREE' && (
                <div className="flex items-center justify-between p-4 bg-slate-700/50 border border-slate-600 rounded-xl hover:bg-slate-700 hover:border-violet-500/50 transition-all duration-300 group">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-violet-500/25">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-violet-300 transition-colors">Document geüpload</p>
                      <p className="text-sm text-gray-400">3 dagen geleden</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500/50 hover:text-gray-200 transition-all duration-300 text-xs sm:text-sm whitespace-normal break-words min-h-[2rem] py-2" asChild>
                    <Link href="/documents" className="flex items-center justify-center">
                      <span>Bekijk</span>
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}