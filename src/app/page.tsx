import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { NewsTicker } from "@/components/news-ticker"
import { 
  CheckCircle, 
  Calculator, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  TrendingUp,
  BarChart3
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        {/* Financial grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-2 bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <Sparkles className="mr-2 h-3 w-3" />
            Nieuwe fiscale regels 2024
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-foreground animate-fade-in">
            <span className="text-gradient-financial">aivermogen.nl</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl animate-fade-in delay-200">
            De complete oplossing voor belastingondersteuning en vermogensopbouw voor ondernemers. 
            Van BV vs EMZ tot ETF-allocatie en vastgoedstrategieën.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button size="lg" className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
              <Link href="/pricing">
                Bekijk functionaliteiten
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300" asChild>
              <Link href="/auth/signin">Start gratis account</Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl pt-12">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-300 group">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-gradient-financial group-hover:scale-110 transition-transform duration-300">500+</div>
                <div className="text-sm text-muted-foreground mt-1">Actieve gebruikers</div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-400 group">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-gradient-financial group-hover:scale-110 transition-transform duration-300">10K+</div>
                <div className="text-sm text-muted-foreground mt-1">Berekeningen</div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-500 group">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-gradient-financial group-hover:scale-110 transition-transform duration-300">98%</div>
                <div className="text-sm text-muted-foreground mt-1">Tevreden klanten</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator className="bg-slate-700" />

      {/* News Ticker - Compact banner */}
      <section className="container mx-auto px-4 relative z-10 py-4">
        <NewsTicker pagePath="/" />
      </section>

      <Separator className="bg-slate-700" />

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <Badge variant="secondary" className="mb-2 bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <Sparkles className="mr-2 h-3 w-3" />
            Complete oplossing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Alles wat je nodig hebt voor fiscale optimalisatie
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl">
            Van calculators tot persoonlijke ondersteuning - alles onder één dak
          </p>
        </div>

        {/* Premium AI Features Highlight */}
        <div className="mb-12 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-primary/20 border-purple-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 animate-pulse"></div>
            <CardContent className="p-8 relative">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/50">
                    <Sparkles className="h-10 w-10 text-white animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 shadow-lg">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Premium AI Features
                    </Badge>
                    <Badge variant="outline" className="bg-background/50 border-primary/50 text-primary font-semibold">
                      €19,95/maand
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Ontgrendel de kracht van AI voor je fiscale optimalisatie
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Met het Premium abonnement krijg je toegang tot alle AI-powered features: 
                    intelligente documentanalyse, diepgaande stock research, en gepersonaliseerde fiscale adviezen 
                    met intelligente technologie. Start je 30-dagen gratis proefperiode vandaag nog.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
                      ✓ AI Document Analyse
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
                      ✓ AI Deep Research
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
                      ✓ AI Expert Q&A
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
                      ✓ Intelligente samenvattingen
                    </Badge>
                  </div>
                  <Button className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
                    <Link href="/pricing">
                      Start Premium proefperiode
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-card/90 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-financial shadow-financial group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Calculator className="h-7 w-7 text-white" />
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  18+ Tools
                </Badge>
              </div>
              <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors mb-2">
                Smart Calculators
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground leading-relaxed">
                Bereken de fiscale impact van je keuzes met onze uitgebreide suite van calculators. 
                Van BV vs EMZ vergelijkingen tot complexe vastgoed cashflow analyses - alles wat je nodig hebt voor weloverwogen beslissingen.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 group-hover:bg-accent/50 transition-colors">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Breed scala aan calculators</p>
                    <p className="text-xs text-muted-foreground mt-1">BV vs EMZ, ETF-groei, Vastgoed cashflow, Crypto allocatie en meer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 group-hover:bg-accent/50 transition-colors">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Scenario-vergelijking & PDF-rapporten</p>
                    <p className="text-xs text-muted-foreground mt-1">Vergelijk verschillende opties en exporteer professionele rapporten</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 group-hover:bg-accent/50 transition-colors">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Gevoeligheidsanalyse</p>
                    <p className="text-xs text-muted-foreground mt-1">Zie hoe verschillende variabelen je resultaten beïnvloeden</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4 group-hover:bg-primary/10" asChild>
                <Link href="/calculators">
                  Bekijk alle calculators
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-400 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-financial shadow-financial group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                  Real-time
                </Badge>
              </div>
              <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors mb-2">
                Portfolio Tracking
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground leading-relaxed">
                Houd je volledige investeringsportefeuille in de gaten met real-time koersupdates en gedetailleerde prestatie-analyses. 
                Ontvang direct meldingen bij belangrijke prijsbewegingen en volg je rendement over tijd.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 group-hover:bg-accent/50 transition-colors">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Real-time koersen & rendement</p>
                    <p className="text-xs text-muted-foreground mt-1">Live updates van alle posities en automatische rendementsberekening</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 group-hover:bg-accent/50 transition-colors">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Historische grafieken</p>
                    <p className="text-xs text-muted-foreground mt-1">Visualiseer je portefeuille-ontwikkeling over verschillende tijdsperioden</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 group-hover:bg-accent/50 transition-colors">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Prijsalerts & meldingen</p>
                    <p className="text-xs text-muted-foreground mt-1">Stel drempels in en ontvang directe notificaties bij belangrijke bewegingen</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4 group-hover:bg-primary/10" asChild>
                <Link href="/portfolio">
                  Bekijk portfolio
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-sm border-2 border-purple-500/30 shadow-xl hover:shadow-purple-500/50 hover:border-purple-500/50 transition-all duration-500 animate-fade-in delay-500 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 shadow-lg animate-pulse">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium AI
              </Badge>
            </div>
            <CardHeader className="relative pt-12">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl text-foreground group-hover:text-purple-400 transition-colors mb-2">
                Stocks & Deep Research
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground leading-relaxed">
                <span className="font-semibold text-purple-300">Premium Feature:</span> Krijg toegang tot diepgaande AI-onderzoeken van aandelen en volg de trades van congresleden. 
                Combineer fundamentele analyse met unieke inzichten voor betere investeringsbeslissingen.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                  <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm flex items-center gap-2">
                      AI Deep Research rapporten
                      <Badge variant="outline" className="h-4 px-1.5 text-xs border-purple-500/50 text-purple-300">
                        Premium
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Uitgebreide analyses met financiële data, nieuws en technische patronen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 group-hover:bg-accent/50 transition-colors">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Marktinzichten & nieuws</p>
                    <p className="text-xs text-muted-foreground mt-1">Blijf op de hoogte met relevante marktupdates en nieuwsaggregatie</p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-purple-500/20">
                <p className="text-xs text-muted-foreground mb-3 text-center">
                  <span className="font-semibold text-purple-300">Premium Feature</span> - Upgrade naar Premium voor €19,95/maand
                </p>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg shadow-purple-500/25" asChild>
                  <Link href="/pricing">
                    Upgrade naar Premium
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-sm border-2 border-purple-500/30 shadow-xl hover:shadow-purple-500/50 hover:border-purple-500/50 transition-all duration-500 animate-fade-in delay-600 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 shadow-lg animate-pulse">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium AI
              </Badge>
            </div>
            <CardHeader className="relative pt-12">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Zap className="h-7 w-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl text-foreground group-hover:text-purple-400 transition-colors mb-2">
                AI-Powered Insights
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground leading-relaxed">
                <span className="font-semibold text-purple-300">Premium Feature:</span> Krijg gepersonaliseerde fiscale adviezen op basis van jouw specifieke situatie. 
                Onze intelligente technologie combineert actuele regelgeving met jouw data voor relevante en betrouwbare inzichten.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                  <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm flex items-center gap-2">
                      AI Document Analyse
                      <Badge variant="outline" className="h-4 px-1.5 text-xs border-purple-500/50 text-purple-300">
                        Premium
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Upload documenten voor automatische fiscale analyse en optimalisatievoorstellen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                  <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm flex items-center gap-2">
                      AI Expert Q&A & Intelligente samenvattingen
                      <Badge variant="outline" className="h-4 px-1.5 text-xs border-purple-500/50 text-purple-300">
                        Premium
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Stel vragen en krijg intelligente antwoorden met bronvermelding</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 group-hover:bg-accent/50 transition-colors">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Bronvermelding & transparantie</p>
                    <p className="text-xs text-muted-foreground mt-1">Alle informatie bevat duidelijke bronvermelding voor volledige transparantie</p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-purple-500/20">
                <p className="text-xs text-muted-foreground mb-3 text-center">
                  <span className="font-semibold text-purple-300">Premium Feature</span> - Upgrade naar Premium voor €19,95/maand
                </p>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg shadow-purple-500/25" asChild>
                  <Link href="/pricing">
                    Upgrade naar Premium
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      <Separator className="bg-slate-700" />

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <Badge variant="outline" className="mb-2 bg-slate-800/50 backdrop-blur-sm border-slate-700">
            Flexibele prijzen
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Kies je abonnement
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl">
            Van gratis tot volledig service - kies wat bij je past
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">Gratis</CardTitle>
              <CardDescription className="text-muted-foreground">Perfect om te beginnen</CardDescription>
              <div className="text-4xl font-bold pt-4 text-gradient-financial">€0</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">QuickScan Belasting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">ETF basisallocatie</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">3 kennisbankartikelen per maand</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Community lezen</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300" asChild>
                <Link href="/auth/signin">Start gratis</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-primary border-2 shadow-financial-lg hover:shadow-financial-lg transition-all duration-500 animate-fade-in delay-400 relative group">
            <CardHeader className="text-center relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-financial text-white shadow-financial">
                Meest populair
              </Badge>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors">Premium</CardTitle>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/50 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI
                </Badge>
              </div>
              <CardDescription className="text-muted-foreground">Alle functionaliteiten met AI-ondersteuning</CardDescription>
              <div className="text-4xl font-bold pt-4 text-gradient-financial">
                €19,95<span className="text-lg font-normal text-muted-foreground">/maand</span>
              </div>
              <Badge variant="secondary" className="mt-2 bg-green-500/20 text-green-400 border-green-500/50">
                30 dagen gratis proefperiode
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg mb-3">
                <p className="text-xs font-semibold text-purple-300 mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI-Powered Features:
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• AI Document Analyse</li>
                  <li>• Intelligente AI-samenvattingen</li>
                  <li>• AI Deep Research</li>
                  <li>• AI Expert Q&A</li>
                </ul>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Alles van Gratis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Onbeperkte functionaliteiten</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Portfolio tracking</span>
                </li>
              </ul>
              <Button className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
                <Link href="/auth/signin">Start gratis proefperiode</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-12">
          <Button variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-700" asChild>
            <Link href="/pricing">Bekijk alle prijzen</Link>
          </Button>
        </div>
      </section>

      <Separator className="bg-slate-700" />

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-2 bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <Zap className="mr-2 h-3 w-3" />
            Start vandaag
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Klaar om je fiscale situatie te optimaliseren?
          </h2>
          <p className="text-lg text-muted-foreground">
            Start vandaag nog met je gratis account en ontdek hoe je belastingen kunt optimaliseren.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button size="lg" className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
              <Link href="/pricing">
                Bekijk functionaliteiten
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300" asChild>
              <Link href="/auth/signin">Start gratis account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
