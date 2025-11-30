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
import { CheckCircle } from "lucide-react"

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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            <span className="text-gradient-financial">Kies je abonnement</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in delay-200">
            Van gratis tot volledig service - kies wat bij je past
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Gratis */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-300">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Gratis</CardTitle>
              <CardDescription className="text-muted-foreground">Perfect om te beginnen</CardDescription>
              <div className="text-4xl font-bold mt-4 text-gradient-financial">€0</div>
              <p className="text-sm text-muted-foreground">per maand</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">QuickScan Belasting (5 min)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">ETF basisallocatie</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Vastgoed quick cashflow</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Crypto-risicoprofiel (educatief)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">3 kennisbankartikelen</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Community lezen & reageren</span>
                </li>
              </ul>
              <Button className="w-full border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300" variant="outline" asChild>
                <Link href="/auth/signin">Start gratis</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Basic */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-400">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Basic</CardTitle>
              <CardDescription className="text-muted-foreground">Voor startende ondernemers</CardDescription>
              <div className="text-4xl font-bold mt-4 text-gradient-financial">€12</div>
              <p className="text-sm text-muted-foreground">per maand</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Alles van Gratis</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Uitgebreide calculators</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">PDF export</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">RAG-samenvattingen</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Onbeperkte kennisbank</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Community posten</span>
                </li>
              </ul>
              <Button className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
                <Link href="/auth/signin">Start Basic</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary border-2 relative shadow-financial-lg hover:shadow-financial-lg transition-all duration-500 animate-fade-in delay-500 group">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 gradient-financial text-white shadow-financial">
              Meest populair
            </Badge>
            <CardHeader>
              <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors">Pro</CardTitle>
              <CardDescription className="text-muted-foreground">Voor serieuze ondernemers</CardDescription>
              <div className="text-4xl font-bold mt-4 text-gradient-financial">€39</div>
              <p className="text-sm text-muted-foreground">per maand</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Alles van Basic</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Persoonlijke dossieronboarding</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Document upload</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Scenariovergelijking met dossiers</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Async Q&A met expert</span>
                </li>
              </ul>
              <Button className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
                <Link href="/auth/signin">Start Pro</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Elite */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-600 group">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors">Elite</CardTitle>
              <CardDescription className="text-muted-foreground">Volledig service</CardDescription>
              <div className="text-4xl font-bold mt-4 text-gradient-premium">€99</div>
              <p className="text-sm text-muted-foreground">per maand</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Alles van Pro</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Prioriteitssupport</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">Persoonlijke begeleider</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3" />
                  <span className="text-muted-foreground">White-label rapporten</span>
                </li>
              </ul>
              <Button className="w-full gradient-premium text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
                <Link href="/auth/signin">Start Elite</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Add-ons */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 animate-fade-in delay-700">
              Add-ons
            </h2>
            <p className="text-lg text-muted-foreground animate-fade-in delay-800">
              Extra services voor Pro en Elite gebruikers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-700">
              <CardHeader>
                <CardTitle className="text-foreground">Fiscale Optimalisatie Check</CardTitle>
                <CardDescription className="text-muted-foreground">Laat je fiscale situatie analyseren en optimaliseren</CardDescription>
                <div className="text-3xl font-bold mt-4 text-gradient-financial">€99</div>
                <p className="text-sm text-muted-foreground">per dossier</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-muted-foreground">Volledige fiscale analyse</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-muted-foreground">Optimalisatie suggesties</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-muted-foreground">Expert feedback en tips</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-muted-foreground">48u response tijd</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-800">
              <CardHeader>
                <CardTitle className="text-foreground">Premium Document Analyse</CardTitle>
                <CardDescription className="text-muted-foreground">Diepgaande AI-analyse van je documenten</CardDescription>
                <div className="text-3xl font-bold mt-4 text-gradient-financial">€49</div>
                <p className="text-sm text-muted-foreground">per document</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-muted-foreground">AI-powered document analyse</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-muted-foreground">Fiscale inzichten en risico&apos;s</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-muted-foreground">Gedetailleerd rapport</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-muted-foreground">24u response tijd</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-900">
              <CardHeader>
                <CardTitle className="text-foreground">Due Diligence Vastgoed</CardTitle>
                <CardDescription className="text-muted-foreground">Professionele vastgoed analyse</CardDescription>
                <div className="text-3xl font-bold mt-4 text-gradient-financial">€299</div>
                <p className="text-sm text-muted-foreground">per pand</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-muted-foreground">Financiële analyse</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-muted-foreground">Marktonderzoek</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-muted-foreground">Risico assessment</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span className="text-muted-foreground">Investeringsondersteuning</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 animate-fade-in delay-900">
              Veelgestelde vragen
            </h2>
            <p className="text-lg text-muted-foreground animate-fade-in delay-1000">
              Alles wat je moet weten over onze abonnementen
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left text-foreground">
                      Kan ik mijn abonnement opzeggen?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        Ja, je kunt je abonnement op elk moment opzeggen via je account pagina. 
                        Je behoudt toegang tot het einde van je betaalperiode.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
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
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left text-foreground">
                      Zijn er verborgen kosten?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        Nee, alle prijzen zijn inclusief BTW. Add-ons zoals Fiscale Optimalisatie Check, 
                        Premium Document Analyse en Due Diligence Vastgoed zijn extra kosten.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left text-foreground">
                      Kan ik upgraden of downgraden?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        Ja, je kunt op elk moment upgraden of downgraden. Wijzigingen gaan 
                        direct in en je betaalt/ontvangt het verschil.
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
