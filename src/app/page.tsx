import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  Calculator, 
  FileText, 
  Users, 
  Shield, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Target
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
            <span className="text-gradient-financial">Tax & Wealth Hub</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl animate-fade-in delay-200">
            De complete oplossing voor belastingadvies en vermogensopbouw voor ondernemers. 
            Van BV vs EMZ tot ETF-allocatie en vastgoedstrategieën.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button size="lg" className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
              <Link href="/dashboard">
                Start gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300" asChild>
              <Link href="/pricing">Bekijk prijzen</Link>
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
            Van calculators tot persoonlijk advies - alles onder één dak
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-300 group">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-financial shadow-financial group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-foreground group-hover:text-primary transition-colors">Smart Calculators</CardTitle>
              <CardDescription className="text-muted-foreground">
                BV vs EMZ, ETF-groei, vastgoed cashflow en crypto-allocatie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Scenario-vergelijking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Gevoeligheidsanalyse</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">PDF-rapporten</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-400 group">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-financial shadow-financial group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-foreground group-hover:text-primary transition-colors">Document Management</CardTitle>
              <CardDescription className="text-muted-foreground">
                Upload en beheer je fiscale documenten veilig
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Veilige opslag</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Status tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Aangifte check</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-500 group">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-financial shadow-financial group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-foreground group-hover:text-primary transition-colors">Expert Community</CardTitle>
              <CardDescription className="text-muted-foreground">
                Stel vragen en deel kennis met andere ondernemers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Q&A forum</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Expert antwoorden</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Nieuwe regels updates</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-600 group">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-financial shadow-financial group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-foreground group-hover:text-primary transition-colors">Compliance & Security</CardTitle>
              <CardDescription className="text-muted-foreground">
                AVG-compliant met bank-niveau beveiliging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">End-to-end encryptie</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">AVG-compliant</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Audit logging</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-700 group">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-financial shadow-financial group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-foreground group-hover:text-primary transition-colors">AI-Powered Insights</CardTitle>
              <CardDescription className="text-muted-foreground">
                Krijg gepersonaliseerde adviezen op basis van je situatie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">RAG-gebaseerde adviezen</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Scenario-optimalisatie</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Bronvermelding</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-800 group">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-financial shadow-financial group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Target className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-foreground group-hover:text-primary transition-colors">EU Vastgoed & Crypto</CardTitle>
              <CardDescription className="text-muted-foreground">
                Specialisatie in Europese vastgoed en crypto-educatie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">EU-landen support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Crypto educatie</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Transparante affiliates</span>
                </li>
              </ul>
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

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
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
                  <span className="text-muted-foreground">3 kennisbankartikelen</span>
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
              <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors">Pro</CardTitle>
              <CardDescription className="text-muted-foreground">Voor serieuze ondernemers</CardDescription>
              <div className="text-4xl font-bold pt-4 text-gradient-financial">
                €39<span className="text-lg font-normal text-muted-foreground">/maand</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Alles van Gratis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Document upload</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Scenariovergelijking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Expert Q&A</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Aangifte check (€149)</span>
                </li>
              </ul>
              <Button className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
                <Link href="/auth/signin">Start Pro</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-500 group">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors">Elite</CardTitle>
              <CardDescription className="text-muted-foreground">Volledig service</CardDescription>
              <div className="text-4xl font-bold pt-4 text-gradient-premium">
                €99<span className="text-lg font-normal text-muted-foreground">/maand</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Alles van Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Aangifte indienen</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Video consult (kwartaal)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Prioriteitssupport</span>
                </li>
              </ul>
              <Button className="w-full gradient-premium text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
                <Link href="/auth/signin">Start Elite</Link>
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
              <Link href="/dashboard">
                Start gratis nu
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300" asChild>
              <Link href="/pricing">Bekijk prijzen</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
