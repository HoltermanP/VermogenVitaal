import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, TrendingUp, Home, Coins, ArrowRight, Sparkles, PiggyBank, FileText, Briefcase, Building2, Receipt, Shield, Banknote, Users, Wallet, Target } from "lucide-react"
import Link from "next/link"
import { NewsTicker } from "@/components/news-ticker"

export default function CalculatorsPage() {
  const categories = [
    {
      id: "belasting",
      name: "Belasting Calculators",
      icon: Banknote,
      description: "Fiscale belasting berekeningen voor particulieren en ondernemers",
      calculators: [
        {
          id: "inkomstenbelasting",
          title: "Inkomstenbelasting Calculator",
          description: "Bereken je inkomstenbelasting met heffingskortingen en aftrekposten",
          icon: TrendingUp,
          href: "/calculators/inkomstenbelasting"
        },
        {
          id: "box3",
          title: "Box 3 Vermogensbelasting",
          description: "Bereken box 3 belasting over vermogen (2025 regeling)",
          icon: PiggyBank,
          href: "/calculators/box3"
        },
        {
          id: "arbeidskorting",
          title: "Arbeidskorting Calculator",
          description: "Bereken je arbeidskorting op basis van je inkomen",
          icon: TrendingUp,
          href: "/calculators/arbeidskorting"
        },
        {
          id: "dividendbelasting",
          title: "Dividendbelasting Calculator",
          description: "Bereken dividendbelasting en netto dividend",
          icon: Briefcase,
          href: "/calculators/dividendbelasting"
        },
        {
          id: "vennootschapsbelasting",
          title: "Vennootschapsbelasting Calculator",
          description: "Bereken vennootschapsbelasting met MKB-winstvrijstelling en innovatiebox",
          icon: Building2,
          href: "/calculators/vennootschapsbelasting"
        },
        {
          id: "btw",
          title: "BTW Calculator",
          description: "Bereken BTW inclusief/exclusief of BTW-teruggaaf",
          icon: Receipt,
          href: "/calculators/btw"
        }
      ]
    },
    {
      id: "ondernemen",
      name: "Ondernemen & ZZP",
      icon: Briefcase,
      description: "Specialistische calculators voor ondernemers en zelfstandigen",
      calculators: [
        {
          id: "zelfstandigenaftrek",
          title: "Zelfstandigenaftrek & MKB",
          description: "Controleer je recht op zelfstandigenaftrek, startersaftrek en MKB-winstvrijstelling",
          icon: Briefcase,
          href: "/calculators/zelfstandigenaftrek"
        },
        {
          id: "dga-optimalisatie",
          title: "DGA Salaris Optimalisatie",
          description: "Optimaliseer de verhouding tussen salaris en dividend voor DGA's",
          icon: Users,
          href: "/calculators/dga-optimalisatie"
        },
        {
          id: "investeringsaftrek",
          title: "Investeringsaftrek Calculator",
          description: "Bereken MIA, EIA, KIA en VAMIL voordelen",
          icon: TrendingUp,
          href: "/calculators/investeringsaftrek"
        },
        {
          id: "fiscale-reserve",
          title: "Fiscale Reserve Calculator",
          description: "Bereken FOR en investeringsreserve voordelen",
          icon: PiggyBank,
          href: "/calculators/fiscale-reserve"
        }
      ]
    },
    {
      id: "wonen",
      name: "Wonen & Hypotheek",
      icon: Home,
      description: "Calculators voor woningbezitters en hypotheekberekeningen",
      calculators: [
        {
          id: "hypotheekrenteaftrek",
          title: "Hypotheekrenteaftrek Calculator",
          description: "Bereken je hypotheekrenteaftrek en netto maandlast",
          icon: Home,
          href: "/calculators/hypotheekrenteaftrek"
        },
        {
          id: "eigenwoningforfait",
          title: "Eigenwoningforfait Calculator",
          description: "Bereken eigenwoningforfait en netto voordeel hypotheekrenteaftrek",
          icon: Home,
          href: "/calculators/eigenwoningforfait"
        }
      ]
    },
    {
      id: "pensioen-planning",
      name: "Pensioen Planning",
      icon: Wallet,
      description: "Uitgebreide tools voor pensioenplanning en AOW-berekeningen",
      calculators: [
        {
          id: "pensioen",
          title: "Pensioen Jaarruimte Calculator",
          description: "Bereken je jaarruimte en reserveringsruimte voor pensioenopbouw",
          icon: FileText,
          href: "/calculators/pensioen"
        },
        {
          id: "pensioenbehoefte",
          title: "Pensioenbehoefte Calculator",
          description: "Bepaal hoeveel pensioen je nodig hebt om je levensstijl te behouden",
          icon: Calculator,
          href: "/calculators/pensioenbehoefte"
        },
        {
          id: "aow-simulator",
          title: "AOW Simulator",
          description: "Bereken je AOW-uitkering gebaseerd op geboortedatum en werkhistorie",
          icon: Users,
          href: "/calculators/aow-simulator"
        },
        {
          id: "pensioen-optimalisatie",
          title: "Pensioenoptimalisatie Calculator",
          description: "Vergelijk lijfrente vs pensioenfonds en fiscale voordelen",
          icon: TrendingUp,
          href: "/calculators/pensioen-optimalisatie"
        },
        {
          id: "vroegpensioen",
          title: "Vroegpensioen Calculator",
          description: "Bereken kosten en mogelijkheden van vervroegd pensioen",
          icon: Target,
          href: "/calculators/vroegpensioen"
        }
      ]
    },
    {
      id: "sparen-buffer",
      name: "Sparen & Buffer",
      icon: PiggyBank,
      description: "Calculators voor spaardoelen, financiële buffers en vermogensopbouw",
      calculators: [
        {
          id: "spaarplan",
          title: "Spaarplan Calculator",
          description: "Plan je spaardoelen met realistische rentepercentages",
          icon: PiggyBank,
          href: "/calculators/spaarplan"
        },
        {
          id: "buffer-calculator",
          title: "Buffer/Kapitaal Calculator",
          description: "Bepaal de juiste financiële buffer voor noodgevallen",
          icon: Shield,
          href: "/calculators/buffer-calculator"
        },
        {
          id: "sparen-kinderen",
          title: "Sparen voor Kinderen",
          description: "Plan spaargeld voor studiekosten of starterskapitaal",
          icon: Users,
          href: "/calculators/sparen-kinderen"
        },
        {
          id: "huisdroom-sparen",
          title: "Huisdroom Sparen Calculator",
          description: "Bereken spaarplan voor koopsom, verbouwing of aflossing",
          icon: Home,
          href: "/calculators/huisdroom-sparen"
        }
      ]
    },
    {
      id: "vermogensopbouw",
      name: "Vermogensopbouw",
      icon: Target,
      description: "Langetermijn planning voor financiële onafhankelijkheid en successie",
      calculators: [
        {
          id: "fire-calculator",
          title: "FIRE Calculator",
          description: "Bereken wanneer je financieel onafhankelijk kunt zijn",
          icon: Target,
          href: "/calculators/fire-calculator"
        },
        {
          id: "vermogensmix",
          title: "Vermogensmix Optimalisatie",
          description: "Vind optimale verdeling tussen sparen en beleggen",
          icon: TrendingUp,
          href: "/calculators/vermogensmix"
        },
        {
          id: "successieplanning",
          title: "Successieplanning Calculator",
          description: "Plan overdracht vermogen aan volgende generatie",
          icon: Users,
          href: "/calculators/successieplanning"
        },
        {
          id: "inflatie-impact",
          title: "Inflatie Impact Calculator",
          description: "Toon erosie van koopkracht door inflatie",
          icon: TrendingUp,
          href: "/calculators/inflatie-impact"
        }
      ]
    },
    {
      id: "beleggen",
      name: "Beleggen & Investeren",
      icon: Target,
      description: "Investeringscalculators voor verschillende asset classes",
      calculators: [
        {
          id: "bv-vs-prive",
          title: "BV vs Privé Beleggen",
          description: "Vergelijk rendementen tussen beleggen in privé versus via een BV",
          icon: Calculator,
          href: "/calculators/bv-vs-prive"
        },
        {
          id: "etf-growth",
          title: "ETF Groei Calculator",
          description: "Bereken de potentiële groei van je ETF beleggingen",
          icon: TrendingUp,
          href: "/calculators/etf"
        },
        {
          id: "compound-interest",
          title: "Compound Interest Calculator",
          description: "Bereken de kracht van rente-op-rente effect",
          icon: TrendingUp,
          href: "/calculators/compound-interest"
        },
        {
          id: "real-estate",
          title: "Vastgoed Cashflow Calculator",
          description: "Analyseer de cashflow van je vastgoed investeringen",
          icon: Home,
          href: "/calculators/real-estate"
        },
        {
          id: "crypto-allocation",
          title: "Crypto Allocatie Calculator",
          description: "Bepaal de optimale allocatie voor je crypto portfolio",
          icon: Coins,
          href: "/calculators/crypto"
        }
      ]
    },
    {
      id: "hulpmiddelen",
      name: "Hulpmiddelen",
      icon: Shield,
      description: "Handige tools en checkers voor fiscale optimalisatie",
      calculators: [
        {
          id: "aftrekposten",
          title: "Aftrekposten Checker",
          description: "Controleer op welke aftrekposten je recht hebt",
          icon: Shield,
          href: "/calculators/aftrekposten"
        }
      ]
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
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              <span className="text-gradient-financial">Fiscale Calculators</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in delay-200">
              Gebruik onze professionele calculators om je fiscale optimalisatie te berekenen
            </p>
          </div>

          {/* News Ticker - Compact */}
          <div className="mb-8">
            <NewsTicker pagePath="/calculators" />
          </div>

          <Tabs defaultValue="belasting" className="w-full">
            <TabsList className="flex w-full h-auto p-1.5 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl mb-8 overflow-x-auto">
              {categories.map((category) => {
                const IconComponent = category.icon
                // Korte namen voor compacte weergave
                const shortNames: Record<string, string> = {
                  "Belasting Calculators": "Belasting",
                  "Ondernemen & ZZP": "Ondernemen",
                  "Wonen & Hypotheek": "Wonen",
                  "Pensioen Planning": "Pensioen",
                  "Sparen & Buffer": "Sparen",
                  "Vermogensopbouw": "Vermogen",
                  "Beleggen & Investeren": "Beleggen",
                  "Hulpmiddelen": "Tools"
                }
                const displayName = shortNames[category.name] || category.name
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 h-auto min-w-[80px] flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 rounded-lg"
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs font-medium text-center leading-tight whitespace-nowrap">{displayName}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {categories.map((category, categoryIndex) => (
              <TabsContent key={category.id} value={category.id} className="space-y-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 gradient-financial rounded-2xl flex items-center justify-center mr-4 shadow-financial">
                      <category.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">{category.name}</h2>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {category.description}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.calculators.map((calculator, calculatorIndex) => {
                    const IconComponent = calculator.icon
                    const animationDelay = (categoryIndex * 200) + (calculatorIndex * 100)
                    return (
                      <Card key={calculator.id} className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 group hover:scale-105 animate-fade-in" style={{ animationDelay: `${animationDelay}ms` }}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center mb-6">
                            <div className="w-16 h-16 gradient-financial rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-financial">
                              <IconComponent className="h-8 w-8 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-foreground text-xl group-hover:text-primary transition-colors">{calculator.title}</CardTitle>
                            </div>
                          </div>
                          <CardDescription className="text-muted-foreground text-base group-hover:text-foreground transition-colors">
                            {calculator.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            asChild
                            className="w-full py-3 text-base font-semibold gradient-financial text-white border-0 shadow-financial hover:shadow-financial-lg transition-all duration-300"
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
              </TabsContent>
            ))}
          </Tabs>

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