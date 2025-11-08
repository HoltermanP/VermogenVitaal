import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, X } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kies je abonnement
          </h1>
          <p className="text-lg text-gray-600">
            Van gratis tot volledig service - kies wat bij je past
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Gratis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Gratis</CardTitle>
              <CardDescription>Perfect om te beginnen</CardDescription>
              <div className="text-4xl font-bold">€0</div>
              <p className="text-sm text-gray-500">per maand</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>QuickScan Belasting (5 min)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>ETF basisallocatie</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Vastgoed quick cashflow</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Crypto-risicoprofiel (educatief)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>3 kennisbankartikelen</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Community lezen & reageren</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/auth/signin">Start gratis</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Basic */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Basic</CardTitle>
              <CardDescription>Voor startende ondernemers</CardDescription>
              <div className="text-4xl font-bold">€12</div>
              <p className="text-sm text-gray-500">per maand</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Alles van Gratis</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Uitgebreide calculators</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>PDF export</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>RAG-samenvattingen</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Onbeperkte kennisbank</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Community posten</span>
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/auth/signin">Start Basic</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="border-blue-500 border-2 relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
              Meest populair
            </Badge>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>Voor serieuze ondernemers</CardDescription>
              <div className="text-4xl font-bold">€39</div>
              <p className="text-sm text-gray-500">per maand</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Alles van Basic</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Persoonlijke dossieronboarding</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Document upload</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Scenariovergelijking met dossiers</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Async Q&A met expert</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Aangifte-check (€149 add-on)</span>
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/auth/signin">Start Pro</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Elite */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Elite</CardTitle>
              <CardDescription>Volledig service</CardDescription>
              <div className="text-4xl font-bold">€99</div>
              <p className="text-sm text-gray-500">per maand</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Alles van Pro</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Aangifte indienen/afhandelen</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>1 video-consult per kwartaal</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Prioriteitssupport</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Persoonlijke adviseur</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>White-label rapporten</span>
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/auth/signin">Start Elite</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Add-ons */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Add-ons
            </h2>
            <p className="text-lg text-gray-600">
              Extra services voor Pro en Elite gebruikers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Aangifte Check</CardTitle>
                <CardDescription>Laat je aangifte controleren door een expert</CardDescription>
                <div className="text-3xl font-bold">€149</div>
                <p className="text-sm text-gray-500">per dossier</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Volledige controle van je aangifte</li>
                  <li>• Expert feedback en tips</li>
                  <li>• Optimalisatie suggesties</li>
                  <li>• 48u response tijd</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Due Diligence Vastgoed</CardTitle>
                <CardDescription>Professionele vastgoed analyse</CardDescription>
                <div className="text-3xl font-bold">€299</div>
                <p className="text-sm text-gray-500">per pand</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Financiële analyse</li>
                  <li>• Marktonderzoek</li>
                  <li>• Risico assessment</li>
                  <li>• Investeringsadvies</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Veelgestelde vragen
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Kan ik mijn abonnement opzeggen?</h3>
              <p className="text-gray-600">
                Ja, je kunt je abonnement op elk moment opzeggen via je account pagina. 
                Je behoudt toegang tot het einde van je betaalperiode.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Wat gebeurt er met mijn data bij opzegging?</h3>
              <p className="text-gray-600">
                Je data blijft 30 dagen bewaard na opzegging. Daarna wordt deze veilig verwijderd 
                volgens onze AVG-richtlijnen.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Zijn er verborgen kosten?</h3>
              <p className="text-gray-600">
                Nee, alle prijzen zijn inclusief BTW. Alleen add-ons zoals aangifte-check 
                zijn extra kosten.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Kan ik upgraden of downgraden?</h3>
              <p className="text-gray-600">
                Ja, je kunt op elk moment upgraden of downgraden. Wijzigingen gaan 
                direct in en je betaalt/ontvangt het verschil.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Klaar om te beginnen?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start vandaag nog met je gratis account
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/signin">Start gratis nu</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
