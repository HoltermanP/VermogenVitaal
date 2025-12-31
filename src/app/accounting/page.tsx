"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen, CheckCircle, Sparkles } from "lucide-react"
import { NewsTicker } from "@/components/news-ticker"

const EASYBOOK_URL = process.env.NEXT_PUBLIC_EASYBOOK_URL || "https://easybook.nl"

export default function AccountingPage() {
  const handleGoToEasyBook = () => {
    window.open(EASYBOOK_URL, "_blank", "noopener,noreferrer")
  }

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
      
      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-3 animate-fade-in">
            <span className="text-gradient-financial">Boekhouding met EasyBook</span>
          </h1>
          <p className="text-muted-foreground text-lg animate-fade-in delay-200">
            Voor professionele boekhouding en belastingaangiftes
          </p>
        </div>

        {/* News Ticker - Compact */}
        <div className="mb-6">
          <NewsTicker pagePath="/accounting" />
        </div>

        {/* Main Card */}
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-300 mb-8">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 gradient-financial rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-financial">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl text-foreground mb-3">
              Start met EasyBook
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              aivermogen.nl richt zich op informatie en ondersteuning over financiën en belastingen.
              Voor daadwerkelijke boekhouding en belastingaangiftes werken we samen met EasyBook.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Professionele Boekhouding</h3>
                  <p className="text-sm text-muted-foreground">
                    Houd je administratie bij met EasyBook&apos;s gebruiksvriendelijke boekhoudsoftware
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Belastingaangiftes</h3>
                  <p className="text-sm text-muted-foreground">
                    Laat je belastingaangiftes professioneel afhandelen door EasyBook
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">BTW-Aangiftes</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatische BTW-aangiftes en koppeling met je bank
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <Button
                size="lg"
                onClick={handleGoToEasyBook}
                className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300 group"
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:animate-spin" />
                Ga naar EasyBook en sluit een abonnement af
                <ExternalLink className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Je wordt doorgestuurd naar de EasyBook website
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
          <CardHeader>
            <CardTitle className="text-foreground">Over aivermogen.nl</CardTitle>
            <CardDescription className="text-muted-foreground">
              Wat wij wel doen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p>Informatie en ondersteuning over financiën en belastingen</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p>Fiscale calculators voor optimalisatie</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p>Beleggingsanalyses en vermogensopbouw</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p>Community en expert ondersteuning</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
