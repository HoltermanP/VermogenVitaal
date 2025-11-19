import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, TrendingUp, Home, Coins, ArrowRight, Sparkles, FileText } from "lucide-react"
import Link from "next/link"
import { NewsTicker } from "@/components/news-ticker"

export default function CalculatorsPage() {
  const calculators = [
    {
      id: "bv-vs-emz",
      title: "BV vs EMZ Calculator",
      description: "Bereken of een BV of EMZ voordeliger is voor jouw situatie",
      icon: Calculator,
      href: "/calculators/bv-vs-emz",
      gradient: "from-slate-600 to-slate-700",
      hoverGradient: "from-slate-600 to-slate-700"
    },
    {
      id: "etf-growth",
      title: "ETF Groei Calculator",
      description: "Bereken de potentiële groei van je ETF beleggingen",
      icon: TrendingUp,
      href: "/calculators/etf",
      gradient: "from-slate-600 to-slate-700",
      hoverGradient: "from-slate-600 to-slate-700"
    },
    {
      id: "real-estate",
      title: "Vastgoed Cashflow Calculator",
      description: "Analyseer de cashflow van je vastgoed investeringen",
      icon: Home,
      href: "/calculators/real-estate",
      gradient: "from-slate-600 to-slate-700",
      hoverGradient: "from-slate-600 to-slate-700"
    },
    {
      id: "crypto-allocation",
      title: "Crypto Allocatie Calculator",
      description: "Bepaal de optimale allocatie voor je crypto portfolio",
      icon: Coins,
      href: "/calculators/crypto",
      gradient: "from-slate-600 to-slate-700",
      hoverGradient: "from-slate-600 to-slate-700"
    },
    {
      id: "dba-opdrachtomschrijving",
      title: "DBA Opdrachtomschrijving Generator",
      description: "Genereer een DBA-proof opdrachtomschrijving met behulp van AI",
      icon: FileText,
      href: "/calculators/dba-opdrachtomschrijving",
      gradient: "from-slate-600 to-slate-700",
      hoverGradient: "from-slate-600 to-slate-700"
    }
  ]

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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              <span className="text-gradient-financial">Fiscale Calculators</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in delay-200">
              Gebruik onze professionele calculators om je fiscale optimalisatie te berekenen
            </p>
          </div>

          {/* News Ticker - Compact */}
          <div className="mb-6">
            <NewsTicker pagePath="/calculators" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {calculators.map((calculator, index) => {
              const IconComponent = calculator.icon
              return (
                <Card key={calculator.id} className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 group hover:scale-105 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 gradient-financial rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-financial">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground text-2xl group-hover:text-primary transition-colors">{calculator.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-muted-foreground text-lg group-hover:text-foreground transition-colors">
                      {calculator.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      asChild
                      className="w-full py-3 text-lg font-semibold gradient-financial text-white border-0 shadow-financial hover:shadow-financial-lg transition-all duration-300"
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

          <div className="mt-20 bg-accent/10 border border-primary/20 rounded-2xl p-8 hover:border-primary/40 hover:shadow-financial-lg transition-all duration-500 animate-fade-in delay-400">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 gradient-financial rounded-xl flex items-center justify-center mr-4 shadow-financial">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                💡 Pro Tip
              </h2>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Gebruik meerdere calculators om een compleet beeld te krijgen van je fiscale situatie.
              De resultaten kunnen je helpen bij het maken van weloverwogen financiële beslissingen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}