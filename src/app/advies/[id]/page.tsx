import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  AlertCircle, 
  Info,
  CheckCircle2,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { getTaxTopicById, getRelatedTopics } from "@/lib/tax-info-2025"
import { notFound } from "next/navigation"

interface TaxTopicPageProps {
  params: Promise<{ id: string }>
}

export default async function TaxTopicPage({ params }: TaxTopicPageProps) {
  const { id } = await params
  const topic = getTaxTopicById(id)
  
  if (!topic) {
    notFound()
  }

  const relatedTopics = getRelatedTopics(id)
  const IconComponent = topic.icon

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

  const colorClass = colorMap[topic.color] || colorMap.blue

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/advies" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Terug naar overzicht
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${colorClass}`}>
                <IconComponent className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <Badge variant="secondary" className="mb-2">
                  {topic.category}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                  {topic.title}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {topic.shortDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          {topic.importantNotes && topic.importantNotes.length > 0 && (
            <Card className="bg-accent/10 border-primary/20 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Belangrijke opmerkingen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topic.importantNotes.map((note, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{note}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Sections */}
          <div className="space-y-6 mb-12">
            {topic.sections.map((section, index) => (
              <Card 
                key={index}
                className="bg-card/80 backdrop-blur-sm border-border shadow-xl"
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {section.important && (
                      <Badge variant="destructive" className="text-xs">
                        Belangrijk
                      </Badge>
                    )}
                    <CardTitle className="text-2xl">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                  
                  {section.subsections && section.subsections.length > 0 && (
                    <div className="space-y-4">
                      <Separator />
                      {section.subsections.map((subsection, subIndex) => (
                        <div key={subIndex} className="space-y-2">
                          <h4 className="font-semibold text-foreground text-lg">
                            {subsection.title}
                          </h4>
                          <p className="text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/20">
                            {subsection.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Related Topics */}
          {relatedTopics.length > 0 && (
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Gerelateerde onderwerpen
                </CardTitle>
                <CardDescription>
                  Bekijk ook deze gerelateerde belastingonderwerpen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {relatedTopics.map((relatedTopic) => {
                    const RelatedIcon = relatedTopic.icon
                    const relatedColorClass = colorMap[relatedTopic.color] || colorMap.blue
                    return (
                      <Link key={relatedTopic.id} href={`/advies/${relatedTopic.id}`}>
                        <Card className="bg-muted/50 hover:bg-muted border-border transition-all duration-300 cursor-pointer group">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${relatedColorClass} group-hover:scale-110 transition-transform`}>
                                <RelatedIcon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {relatedTopic.title}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {relatedTopic.shortDescription}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <Card className="bg-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Belangrijke opmerking</h3>
                  <p className="text-sm text-muted-foreground">
                    De informatie op deze pagina is bedoeld als algemene richtlijn en kan niet worden beschouwd als 
                    persoonlijke belastingondersteuning. Belastingregels kunnen complex zijn en zijn afhankelijk van je 
                    individuele situatie. Voor persoonlijke begeleiding raden we aan om een gecertificeerd belastingadviseur 
                    te raadplegen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

