import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, TrendingUp, Home, Coins, ArrowRight, Sparkles, FileText } from "lucide-react"
import Link from "next/link"

export default function CalculatorsPage() {
  const calculators = [
    {
      id: "bv-vs-emz",
      title: "BV vs EMZ Calculator",
      description: "Bereken of een BV of EMZ voordeliger is voor jouw situatie",
      icon: Calculator,
      href: "/calculators/bv-vs-emz",
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700"
    },
    {
      id: "etf-growth",
      title: "ETF Groei Calculator",
      description: "Bereken de potentiële groei van je ETF beleggingen",
      icon: TrendingUp,
      href: "/calculators/etf",
      gradient: "from-emerald-500 to-emerald-600",
      hoverGradient: "from-emerald-600 to-emerald-700"
    },
    {
      id: "real-estate",
      title: "Vastgoed Cashflow Calculator",
      description: "Analyseer de cashflow van je vastgoed investeringen",
      icon: Home,
      href: "/calculators/real-estate",
      gradient: "from-violet-500 to-violet-600",
      hoverGradient: "from-violet-600 to-violet-700"
    },
    {
      id: "crypto-allocation",
      title: "Crypto Allocatie Calculator",
      description: "Bepaal de optimale allocatie voor je crypto portfolio",
      icon: Coins,
      href: "/calculators/crypto",
      gradient: "from-amber-500 to-amber-600",
      hoverGradient: "from-amber-600 to-amber-700"
    },
    {
      id: "dba-opdrachtomschrijving",
      title: "DBA Opdrachtomschrijving Generator",
      description: "Genereer een DBA-proof opdrachtomschrijving met behulp van AI",
      icon: FileText,
      href: "/calculators/dba-opdrachtomschrijving",
      gradient: "from-indigo-500 to-indigo-600",
      hoverGradient: "from-indigo-600 to-indigo-700"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Fiscale Calculators
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-fade-in delay-200">
              Gebruik onze professionele calculators om je fiscale optimalisatie te berekenen
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {calculators.map((calculator, index) => {
              const IconComponent = calculator.icon
              return (
                <Card key={calculator.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group hover:scale-105 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${calculator.gradient} rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/25`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-2xl group-hover:text-blue-300 transition-colors">{calculator.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-gray-300 text-lg group-hover:text-gray-200 transition-colors">
                      {calculator.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      asChild
                      className={`w-full bg-gradient-to-r ${calculator.gradient} hover:${calculator.hoverGradient} text-white border-0 py-3 text-lg font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40`}
                    >
                      <Link href={calculator.href}>
                        Start Berekenen
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mt-20 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 animate-fade-in delay-400">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-4 animate-pulse shadow-lg shadow-blue-500/25">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                💡 Pro Tip
              </h2>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              Gebruik meerdere calculators om een compleet beeld te krijgen van je fiscale situatie.
              De resultaten kunnen je helpen bij het maken van weloverwogen financiële beslissingen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}