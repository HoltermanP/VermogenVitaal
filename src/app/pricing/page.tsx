import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Sparkles, Brain, Zap, Bot } from "lucide-react"

export default function PricingPage() {
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
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <Sparkles className="mr-2 h-3 w-3" />
            Kies je abonnement
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            <span className="text-gradient-financial">Eenvoudige prijzen</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in delay-200">
            Start gratis en upgrade naar Premium wanneer je klaar bent voor alle functionaliteiten
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {/* Gratis */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-300">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Gratis</CardTitle>
              <CardDescription className="text-muted-foreground">Voor iedereen toegankelijk zonder account</CardDescription>
              <div className="text-4xl font-bold mt-4 text-gradient-financial">€0</div>
              <p className="text-sm text-muted-foreground">gratis toegankelijk</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Alle calculators bekijken</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Beurskoersen bekijken</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Kennisbank artikelen lezen</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Community lezen & reageren</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Portfolio tracking (basis)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Geen AI functionaliteiten</span>
                </li>
              </ul>
              <Button className="w-full border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300" variant="outline" asChild>
                <Link href="/auth/signin">Start gratis</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Premium */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary border-2 relative shadow-financial-lg hover:shadow-financial-lg transition-all duration-500 animate-fade-in delay-400 group">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 gradient-financial text-white shadow-financial">
              Meest populair
            </Badge>
            <CardHeader>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors">Premium</CardTitle>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/50 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI-Powered
                </Badge>
              </div>
              <CardDescription className="text-muted-foreground">
                Alle functionaliteiten met <strong className="text-purple-400">AI-powered</strong> intelligentie
              </CardDescription>
              <div className="text-4xl font-bold mt-4 text-gradient-financial">€19,95</div>
              <p className="text-sm text-muted-foreground">per maand</p>
              <Badge variant="secondary" className="mt-2 bg-green-500/20 text-green-400 border-green-500/50">
                30 dagen gratis proefperiode bij aanmelden
              </Badge>
            </CardHeader>
            <CardContent>
              {/* AI Features Highlight */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-purple-400" />
                  <h4 className="font-semibold text-foreground">AI-Powered Functionaliteiten</h4>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Bot className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground"><strong className="text-foreground">AI Document Analyse:</strong> Automatische analyse van fiscale documenten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground"><strong className="text-foreground">Intelligente AI-samenvattingen:</strong> Intelligente samenvattingen met bronvermelding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground"><strong className="text-foreground">AI Deep Research:</strong> Uitgebreide AI-onderzoek rapporten voor aandelen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground"><strong className="text-foreground">AI Expert Q&A:</strong> Chat met AI-expert voor fiscale vragen</span>
                  </li>
                </ul>
              </div>

              {/* Other Features */}
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3 text-sm">Overige Premium Features:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">Alles van Gratis</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">Uitgebreide calculators</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">PDF export</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">Onbeperkte kennisbank</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">Community posten</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">Scenariovergelijking met dossiers</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">Portfolio tracking</span>
                  </li>
                </ul>
              </div>
              <Button className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
                <Link href="/auth/signin">Start gratis proefperiode</Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Geen creditcard nodig voor proefperiode. Annuleer op elk moment.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 animate-fade-in delay-700">
              Veelgestelde vragen
            </h2>
            <p className="text-lg text-muted-foreground animate-fade-in delay-800">
              Alles wat je moet weten over onze abonnementen
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left text-foreground">
                      Hoe werkt de gratis proefperiode?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        Wanneer je je aanmeldt, krijg je automatisch 30 dagen gratis toegang tot alle functionaliteiten inclusief AI features.
                        Gedurende deze periode heb je maximaal 10 AI aanroepen beschikbaar. Na de proefperiode kun je kiezen om door te gaan met Premium (€19,95/maand) voor onbeperkte AI toegang, of terug te gaan naar de gratis versie zonder AI.
                        Je kunt op elk moment tijdens de proefperiode annuleren zonder kosten.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left text-foreground">
                      Kan ik mijn abonnement opzeggen?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        Ja, je kunt je abonnement op elk moment opzeggen via je account pagina. 
                        Je behoudt toegang tot het einde van je betaalperiode of proefperiode.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left text-foreground">
                      Wat gebeurt er met mijn data bij opzegging?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        Je data blijft 30 dagen bewaard na opzegging. Daarna wordt deze veilig verwijderd 
                        volgens onze AVG-richtlijnen.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left text-foreground">
                      Zijn er verborgen kosten?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        Nee, alle prijzen zijn inclusief BTW. Er zijn geen verborgen kosten of setup fees.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-left text-foreground">
                      Kan ik functionaliteiten gebruiken zonder account?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        Ja! Alle calculators, beurskoersen, kennisbank artikelen en community features zijn volledig toegankelijk zonder account.
                        Alleen AI-gedreven functionaliteiten vereisen een account met proefperiode of Premium abonnement.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-6">
                    <AccordionTrigger className="text-left text-foreground">
                      Wat gebeurt er na mijn gratis proefperiode?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        Na 30 dagen wordt je account automatisch omgezet naar de gratis versie. Je behoudt toegang tot alle niet-AI functionaliteiten,
                        maar AI features zoals Deep Research rapporten worden niet meer beschikbaar. Je kunt op elk moment upgraden naar Premium
                        om onbeperkte AI toegang te behouden.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Separator className="mb-12 max-w-2xl mx-auto bg-slate-700" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 animate-fade-in delay-1100">
            Klaar om te beginnen?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto animate-fade-in delay-1200">
            Start vandaag nog met je gratis account en ontdek hoe je belastingen kunt optimaliseren.
          </p>
          <Button size="lg" className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
            <Link href="/auth/signin">Start gratis nu</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
