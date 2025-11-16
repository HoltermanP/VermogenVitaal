import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function DisclaimerPage() {
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
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
          <CardHeader>
            <CardTitle className="text-3xl text-foreground animate-fade-in">
              <span className="text-gradient-financial">Disclaimer</span>
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground animate-fade-in delay-200">
              Laatste update: 1 januari 2024
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Algemene bepalingen</h2>
              <p className="text-muted-foreground mb-4">
                De informatie op deze website is uitsluitend bedoeld voor educatieve doeleinden en vormt 
                geen persoonlijk financieel, fiscaal of juridisch advies. Tax & Wealth Hub is geen 
                geregistreerde financiële dienstverlener en biedt geen geautoriseerd financieel advies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Geen advies</h2>
              <p className="text-muted-foreground mb-4">
                Alle calculators, tools, artikelen en andere content op deze website zijn bedoeld voor 
                algemene informatieve doeleinden. Ze zijn niet bedoeld als vervanging voor professioneel 
                financieel, fiscaal of juridisch advies dat is afgestemd op uw specifieke situatie.
              </p>
              <p className="text-muted-foreground mb-4">
                Raadpleeg altijd een gekwalificeerde adviseur voordat u financiële beslissingen neemt 
                op basis van informatie van deze website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Nauwkeurigheid van informatie</h2>
              <p className="text-muted-foreground mb-4">
                Hoewel wij ernaar streven om de informatie op deze website actueel en nauwkeurig te houden, 
                kunnen wij geen garantie geven over de volledigheid, nauwkeurigheid of actualiteit van 
                de informatie. Fiscale wetgeving en regels kunnen regelmatig wijzigen.
              </p>
              <p className="text-muted-foreground mb-4">
                Het is uw verantwoordelijkheid om de meest recente fiscale regels en wetgeving te 
                raadplegen voordat u beslissingen neemt.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Risico&apos;s</h2>
              <p className="text-muted-foreground mb-4">
                Alle financiële investeringen en beslissingen brengen risico&apos;s met zich mee. Het verleden 
                is geen garantie voor de toekomst. Waarden kunnen stijgen en dalen, en u kunt uw 
                geïnvesteerde kapitaal verliezen.
              </p>
              <p className="text-muted-foreground mb-4">
                Wij adviseren u om alleen te investeren met geld dat u zich kunt veroorloven te verliezen 
                en om uw risico&apos;s te spreiden.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Aansprakelijkheid</h2>
              <p className="text-muted-foreground mb-4">
                Tax & Wealth Hub, haar medewerkers, partners en affiliates zijn niet aansprakelijk voor 
                enige directe, indirecte, incidentele, speciale of gevolgschade die voortvloeit uit het 
                gebruik van deze website of de informatie daarop.
              </p>
              <p className="text-muted-foreground mb-4">
                Dit omvat, maar is niet beperkt tot, verlies van winst, data of andere immateriële 
                verliezen, zelfs als wij op de hoogte waren van de mogelijkheid van dergelijke schade.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Externe links</h2>
              <p className="text-muted-foreground mb-4">
                Deze website kan links bevatten naar externe websites. Wij zijn niet verantwoordelijk 
                voor de inhoud, privacybeleid of praktijken van deze externe websites.
              </p>
              <p className="text-muted-foreground mb-4">
                Het gebruik van externe links is op eigen risico. Wij adviseren u om het privacybeleid 
                en de voorwaarden van externe websites te raadplegen.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Affiliate programma&apos;s</h2>
              <p className="text-muted-foreground mb-4">
                Tax & Wealth Hub kan deelnemen aan affiliate programma&apos;s. Dit betekent dat wij een 
                commissie kunnen ontvangen wanneer u via onze links producten of diensten aanschaft.
              </p>
              <p className="text-muted-foreground mb-4">
                Alle affiliate relaties worden transparant vermeld. Onze aanbevelingen zijn gebaseerd 
                op onze eigen onderzoek en ervaring, niet op affiliate commissies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Wijzigingen</h2>
              <p className="text-muted-foreground mb-4">
                Wij behouden ons het recht voor om deze disclaimer op elk moment te wijzigen zonder 
                voorafgaande kennisgeving. Het is uw verantwoordelijkheid om deze disclaimer regelmatig 
                te controleren op wijzigingen.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Toepasselijk recht</h2>
              <p className="text-muted-foreground mb-4">
                Deze disclaimer wordt beheerst door het Nederlandse recht. Eventuele geschillen worden 
                voorgelegd aan de bevoegde rechtbank in Nederland.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Contact</h2>
              <p className="text-muted-foreground mb-4">
                Voor vragen over deze disclaimer kunt u contact met ons opnemen via:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>E-mail: legal@taxwealthhub.nl</li>
                <li>Telefoon: +31 (0)20 123 4567</li>
                <li>Adres: Keizersgracht 123, 1015 CJ Amsterdam</li>
              </ul>
            </section>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Belangrijke opmerking</AlertTitle>
              <AlertDescription>
                Deze disclaimer vormt een integraal onderdeel van onze algemene voorwaarden. 
                Door gebruik te maken van deze website gaat u akkoord met alle bepalingen in deze disclaimer.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
