import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  BookOpen
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { taxTopics2025 } from "@/lib/tax-info-2025"
import { NewsTicker } from "@/components/news-ticker"

export default function AdviesPage() {
  const belangrijkeWijzigingen = [
    {
      title: "Aanpassing belastingtarieven",
      description: "De tarieven voor inkomstenbelasting zijn licht aangepast voor 2025.",
      type: "info"
    },
    {
      title: "Nieuwe regels voor thuiswerkers",
      description: "Er zijn nieuwe regels voor de aftrek van thuiswerkkosten. Controleer of je hier recht op hebt.",
      type: "warning"
    },
    {
      title: "Duurzaamheidsinvesteringen",
      description: "Extra fiscale voordelen voor duurzame investeringen in 2025. Overweeg groene investeringen.",
      type: "success"
    }
  ]

  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    green: "bg-green-500/10 text-green-600 border-green-500/20",
    orange: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    teal: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    pink: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    cyan: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              <span className="text-gradient-financial">Financiële & Belastingondersteuning</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in delay-200">
              Actuele ondersteuning, tips en optimalisatiestrategieën voor financiën en belastingen in 2025
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Vraag Finn rechtsonder voor persoonlijk advies</span>
            </div>
          </div>

          {/* News Ticker - Compact */}
          <div className="mb-8">
            <NewsTicker pagePath="/advies" />
          </div>

          {/* Main Content - Symmetrische Grid Layout */}
          <div className="space-y-8">
            {/* Belangrijke wijzigingen - Symmetrische Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {belangrijkeWijzigingen.map((wijziging, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {wijziging.type === "info" && <Info className="h-6 w-6 text-blue-500 flex-shrink-0" />}
                      {wijziging.type === "warning" && <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0" />}
                      {wijziging.type === "success" && <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />}
                      <CardTitle className="text-lg">{wijziging.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{wijziging.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Feature Cards - Symmetrische Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/20">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Financiële Planning</CardTitle>
                  </div>
                  <CardDescription>
                    Strategieën voor vermogensopbouw en financiële optimalisatie
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Investeringsstrategieën
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Pensioenplanning
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Vermogensopbouw
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-accent/20">
                      <Shield className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <CardTitle>Belastingoptimalisatie</CardTitle>
                  </div>
                  <CardDescription>
                    Maximale fiscale voordelen en belastingbesparing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
                      Aftrekposten optimaliseren
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
                      Fiscale constructies
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
                      Regelgeving 2025
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Belastingonderwerpen Overzicht */}
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Alle Belastingonderwerpen 2025
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Klik op een onderwerp om uitgebreide informatie te bekijken. Gebruik Finn rechtsonder voor persoonlijk advies.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {taxTopics2025.map((topic) => {
                    const IconComponent = topic.icon
                    const colorClass = colorMap[topic.color] || colorMap.blue
                    return (
                      <Link key={topic.id} href={`/advies/${topic.id}`}>
                        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 h-full cursor-pointer group">
                          <CardHeader>
                            <div className="flex items-start gap-4">
                              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${colorClass} group-hover:scale-110 transition-transform`}>
                                <IconComponent className="h-7 w-7" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-foreground mb-2 group-hover:text-primary transition-colors">
                                  {topic.title}
                                </CardTitle>
                                <Badge variant="secondary" className="mb-2">
                                  {topic.category}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                              {topic.shortDescription}
                            </p>
                            <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                              Lees meer
                              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>

            {/* Disclaimer - Centered */}
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-lg">Belangrijke opmerking</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        De informatie op deze pagina is bedoeld als algemene richtlijn en kan niet worden beschouwd als 
                        persoonlijke belastingondersteuning. Belastingregels kunnen complex zijn en zijn afhankelijk van je 
                        individuele situatie. Voor persoonlijke begeleiding raden we aan om een gecertificeerd belastingadviseur 
                        te raadplegen. Finn, onze AI-assistent, geeft algemene informatie en kan geen vervanging zijn voor professionele begeleiding.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

