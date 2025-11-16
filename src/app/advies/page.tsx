import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TaxChatbot } from "@/components/tax-chatbot"
import { 
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { taxTopics2025 } from "@/lib/tax-info-2025"

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
              <span className="text-gradient-financial">Belastingadviezen & Tips 2025</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in delay-200">
              Actuele belastingadviezen, tips en optimalisatiestrategieën voor het belastingjaar 2025
            </p>
          </div>

          {/* Belangrijke wijzigingen */}
          <div className="mb-12">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Belangrijke Wijzigingen 2025
                </CardTitle>
                <CardDescription>
                  Nieuwe regels en wijzigingen die van belang zijn voor het belastingjaar 2025
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {belangrijkeWijzigingen.map((wijziging, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50"
                    >
                      {wijziging.type === "info" && <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />}
                      {wijziging.type === "warning" && <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />}
                      {wijziging.type === "success" && <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />}
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{wijziging.title}</h3>
                        <p className="text-sm text-muted-foreground">{wijziging.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Belastingonderwerpen Overzicht */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Alle Belastingonderwerpen 2025</h2>
            <p className="text-muted-foreground mb-8">
              Klik op een onderwerp om uitgebreide informatie te bekijken
            </p>
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Chatbot */}
            <div className="lg:col-span-1">
              <TaxChatbot />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-12">
            <Card className="bg-accent/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Belangrijke opmerking</h3>
                    <p className="text-sm text-muted-foreground">
                      De informatie op deze pagina is bedoeld als algemene richtlijn en kan niet worden beschouwd als 
                      persoonlijk belastingadvies. Belastingregels kunnen complex zijn en zijn afhankelijk van je 
                      individuele situatie. Voor persoonlijk advies raden we aan om een gecertificeerd belastingadviseur 
                      te raadplegen. De chatbot geeft algemene informatie en kan geen vervanging zijn voor professioneel advies.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

