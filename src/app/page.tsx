import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calculator, FileText, Users, Shield, TrendingUp, ArrowRight, Sparkles, Zap, Target } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-100">
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-24">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl"></div>
        
        <div className="relative text-center max-w-5xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-white/80 backdrop-blur-sm border-slate-200 text-slate-700 hover:bg-white/90">
            <Sparkles className="w-4 h-4 mr-2" />
            Nieuwe fiscale regels 2024
          </Badge>
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-8 leading-tight">
            Tax & Wealth Hub
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            De complete oplossing voor belastingadvies en vermogensopbouw voor ondernemers. 
            Van BV vs EMZ tot ETF-allocatie en vastgoedstrategieën.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white border-0 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" asChild>
              <Link href="/dashboard">
                Start gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/80 backdrop-blur-sm border-slate-300 text-slate-700 hover:bg-white/90 px-8 py-4 text-lg font-semibold" asChild>
              <Link href="/pricing">Bekijk prijzen</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative container mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Alles wat je nodig hebt voor fiscale optimalisatie
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Van calculators tot persoonlijk advies - alles onder één dak
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 hover:bg-white/80 transition-all duration-300 hover:scale-105 group shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-slate-800 text-xl">Smart Calculators</CardTitle>
              <CardDescription className="text-slate-600">
                BV vs EMZ, ETF-groei, vastgoed cashflow en crypto-allocatie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Scenario-vergelijking
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Gevoeligheidsanalyse
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  PDF-rapporten
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 hover:bg-white/80 transition-all duration-300 hover:scale-105 group shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-slate-800 text-xl">Document Management</CardTitle>
              <CardDescription className="text-slate-600">
                Upload en beheer je fiscale documenten veilig
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Veilige opslag
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Status tracking
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Aangifte check
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 hover:bg-white/80 transition-all duration-300 hover:scale-105 group shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-slate-800 text-xl">Expert Community</CardTitle>
              <CardDescription className="text-slate-600">
                Stel vragen en deel kennis met andere ondernemers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Q&A forum
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Expert antwoorden
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Nieuwe regels updates
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 hover:bg-white/80 transition-all duration-300 hover:scale-105 group shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-slate-800 text-xl">Compliance & Security</CardTitle>
              <CardDescription className="text-slate-600">
                AVG-compliant met bank-niveau beveiliging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  End-to-end encryptie
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  AVG-compliant
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Audit logging
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 hover:bg-white/80 transition-all duration-300 hover:scale-105 group shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-slate-800 text-xl">AI-Powered Insights</CardTitle>
              <CardDescription className="text-slate-600">
                Krijg gepersonaliseerde adviezen op basis van je situatie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  RAG-gebaseerde adviezen
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Scenario-optimalisatie
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Bronvermelding
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 hover:bg-white/80 transition-all duration-300 hover:scale-105 group shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-slate-800 text-xl">EU Vastgoed & Crypto</CardTitle>
              <CardDescription className="text-slate-600">
                Specialisatie in Europese vastgoed en crypto-educatie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  EU-landen support
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Crypto educatie
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Transparante affiliates
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="relative container mx-auto px-4 py-24 bg-slate-50/50">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Kies je abonnement
          </h2>
          <p className="text-xl text-slate-600">
            Van gratis tot volledig service
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white/90 transition-all duration-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-slate-800 text-2xl">Gratis</CardTitle>
              <CardDescription className="text-slate-600">Perfect om te beginnen</CardDescription>
              <div className="text-4xl font-bold text-slate-800 mt-4">€0</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  QuickScan Belasting
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  ETF basisallocatie
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  3 kennisbankartikelen
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Community lezen
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-100/80 to-slate-200/80 backdrop-blur-sm border-slate-300 hover:border-slate-400 transition-all duration-300 hover:scale-105 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-slate-600 to-slate-700 text-white px-4 py-1 text-sm font-semibold">
              Meest populair
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-slate-800 text-2xl">Pro</CardTitle>
              <CardDescription className="text-slate-600">Voor serieuze ondernemers</CardDescription>
              <div className="text-4xl font-bold text-slate-800 mt-4">€39<span className="text-lg font-normal">/maand</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Alles van Gratis
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Document upload
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Scenariovergelijking
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Expert Q&A
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Aangifte check (€149)
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white/90 transition-all duration-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-slate-800 text-2xl">Elite</CardTitle>
              <CardDescription className="text-slate-600">Volledig service</CardDescription>
              <div className="text-4xl font-bold text-slate-800 mt-4">€99<span className="text-lg font-normal">/maand</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Alles van Pro
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Aangifte indienen
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Video consult (kwartaal)
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Prioriteitssupport
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white border-0 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" asChild>
            <Link href="/pricing">Bekijk alle prijzen</Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Klaar om je fiscale situatie te optimaliseren?
          </h2>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Start vandaag nog met je gratis account en ontdek hoe je belastingen kunt optimaliseren.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white border-0 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" asChild>
            <Link href="/dashboard">
              Start gratis nu
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}