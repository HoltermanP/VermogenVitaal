"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { FileText, Sparkles, Download, ArrowLeft, Loader2, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"

const TOTAL_STEPS = 6

export default function DBAOpdrachtomschrijvingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Stap 1: Basisgegevens
    opdrachtgever: "",
    opdrachtgeverAdres: "",
    opdrachtgeverKvK: "",
    opdrachtgeverBtw: "",
    opdrachtnemer: "",
    opdrachtnemerAdres: "",
    opdrachtnemerKvK: "",
    opdrachtnemerBtw: "",
    
    // Stap 2: Opdracht
    werkzaamheden: "",
    resultaat: "",
    deliverables: "",
    startdatum: "",
    einddatum: "",
    duur: "",
    locatie: "",
    
    // Stap 3: Financieel
    tarief: "",
    tariefType: "per_project" as "per_uur" | "per_project" | "vast_bedrag" | "variabel",
    betalingsvoorwaarden: "",
    facturatie: "",
    
    // Stap 4: Zelfstandigheid indicatoren
    eigenGereedschap: false,
    eigenMiddelen: false,
    eigenRisico: false,
    geenGezagsverhouding: false,
    geenExclusiviteit: false,
    vrijeWerktijden: false,
    eigenVerantwoordelijkheid: false,
    eigenKosten: false,
    eigenWerkruimte: false,
    
    // Stap 5: Juridisch
    intellectueelEigendom: "opdrachtgever" as "opdrachtgever" | "opdrachtnemer" | "gedeeld",
    aansprakelijkheid: "",
    verzekering: "",
    geheimhouding: true,
    geheimhoudingDuur: "",
    beëindiging: "",
    opzegtermijn: "",
    geschillenbeslechting: "rechter" as "rechter" | "arbitrage" | "bemiddeling",
    
    // Stap 6: Overig
    bijzondereVoorwaarden: "",
    overmacht: "",
    wijzigingen: "",
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    contract: string
    generatedAt: string
    disclaimer: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (error) setError(null)
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.opdrachtgever.trim() !== "" &&
               formData.opdrachtgeverAdres.trim() !== "" &&
               formData.opdrachtnemer.trim() !== "" &&
               formData.opdrachtnemerAdres.trim() !== ""
      case 2:
        return formData.werkzaamheden.trim().length >= 20 &&
               formData.resultaat.trim().length >= 10 &&
               formData.deliverables.trim().length >= 10 &&
               formData.startdatum.trim() !== "" &&
               formData.duur.trim() !== ""
      case 3:
        return formData.tarief.trim() !== "" &&
               formData.tariefType !== undefined
      case 4:
        // Minimaal 5 van de 9 zelfstandigheid indicatoren moeten waar zijn
        const indicators = [
          formData.eigenGereedschap,
          formData.eigenMiddelen,
          formData.eigenRisico,
          formData.geenGezagsverhouding,
          formData.geenExclusiviteit,
          formData.vrijeWerktijden,
          formData.eigenVerantwoordelijkheid,
          formData.eigenKosten,
          formData.eigenWerkruimte
        ]
        return indicators.filter(Boolean).length >= 5
      case 5:
        return formData.intellectueelEigendom !== undefined &&
               formData.geschillenbeslechting !== undefined
      case 6:
        return true // Optioneel
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
      setError(null)
    } else {
      setError("Vul alle verplichte velden in voordat je doorgaat.")
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/dba/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Er is een fout opgetreden bij het genereren van het contract")
      }

      setResult(data)
      setCurrentStep(TOTAL_STEPS + 1) // Ga naar resultaat stap
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is een onbekende fout opgetreden")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!result) return

    const content = `DBA PROOF OPDACHTOVEREENKOMST

${result.contract}

---
Gegenereerd op: ${new Date(result.generatedAt).toLocaleString('nl-NL')}
${result.disclaimer}
`

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dba-contract-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const progress = (currentStep / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4 text-muted-foreground hover:text-foreground">
              <Link href="/calculators">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar Calculators
              </Link>
            </Button>
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 gradient-financial rounded-2xl flex items-center justify-center mr-4 shadow-financial">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 animate-fade-in">
                  <span className="text-gradient-financial">DBA Proof Contract Generator</span>
                </h1>
                <p className="text-lg text-muted-foreground animate-fade-in delay-200">
                  Genereer een volledig, DBA-proof opdrachtovereenkomst met behulp van AI
                </p>
              </div>
            </div>
          </div>

          {/* News Ticker - Compact */}
          <div className="mb-6">
            <NewsTicker pagePath="/calculators/dba-opdrachtomschrijving" />
          </div>

          {/* Progress Bar */}
          {currentStep <= TOTAL_STEPS && (
            <Card className="mb-6 bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Stap {currentStep} van {TOTAL_STEPS}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(progress)}% voltooid
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>
          )}

          {/* Form Steps */}
          {!result && currentStep <= TOTAL_STEPS && (
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3 shadow-financial">
                    <span className="text-white font-bold">{currentStep}</span>
                  </div>
                  {currentStep === 1 && "Basisgegevens"}
                  {currentStep === 2 && "Opdracht Details"}
                  {currentStep === 3 && "Financiële Afspraken"}
                  {currentStep === 4 && "Zelfstandigheid Indicatoren"}
                  {currentStep === 5 && "Juridische Bepalingen"}
                  {currentStep === 6 && "Overige Voorwaarden"}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {currentStep === 1 && "Vul de gegevens van beide partijen in"}
                  {currentStep === 2 && "Beschrijf de opdracht, resultaat en deliverables"}
                  {currentStep === 3 && "Geef de financiële afspraken op"}
                  {currentStep === 4 && "Beantwoord vragen over zelfstandigheid (belangrijk voor DBA)"}
                  {currentStep === 5 && "Stel juridische bepalingen vast"}
                  {currentStep === 6 && "Voeg eventuele bijzondere voorwaarden toe"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stap 1: Basisgegevens */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Opdrachtgever</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="opdrachtgever" className="text-foreground">
                            Naam <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="opdrachtgever"
                            value={formData.opdrachtgever}
                            onChange={(e) => handleInputChange('opdrachtgever', e.target.value)}
                            className="mt-1"
                            placeholder="Naam van de opdrachtgever"
                          />
                        </div>
                        <div>
                          <Label htmlFor="opdrachtgeverAdres" className="text-foreground">
                            Adres <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            id="opdrachtgeverAdres"
                            value={formData.opdrachtgeverAdres}
                            onChange={(e) => handleInputChange('opdrachtgeverAdres', e.target.value)}
                            className="mt-1"
                            placeholder="Straat, huisnummer, postcode, plaats"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="opdrachtgeverKvK" className="text-foreground">
                              KvK nummer (optioneel)
                            </Label>
                            <Input
                              id="opdrachtgeverKvK"
                              value={formData.opdrachtgeverKvK}
                              onChange={(e) => handleInputChange('opdrachtgeverKvK', e.target.value)}
                              className="mt-1"
                              placeholder="12345678"
                            />
                          </div>
                          <div>
                            <Label htmlFor="opdrachtgeverBtw" className="text-foreground">
                              BTW nummer (optioneel)
                            </Label>
                            <Input
                              id="opdrachtgeverBtw"
                              value={formData.opdrachtgeverBtw}
                              onChange={(e) => handleInputChange('opdrachtgeverBtw', e.target.value)}
                              className="mt-1"
                              placeholder="NL123456789B01"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Opdrachtnemer</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="opdrachtnemer" className="text-foreground">
                            Naam <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="opdrachtnemer"
                            value={formData.opdrachtnemer}
                            onChange={(e) => handleInputChange('opdrachtnemer', e.target.value)}
                            className="mt-1"
                            placeholder="Naam van de opdrachtnemer"
                          />
                        </div>
                        <div>
                          <Label htmlFor="opdrachtnemerAdres" className="text-foreground">
                            Adres <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            id="opdrachtnemerAdres"
                            value={formData.opdrachtnemerAdres}
                            onChange={(e) => handleInputChange('opdrachtnemerAdres', e.target.value)}
                            className="mt-1"
                            placeholder="Straat, huisnummer, postcode, plaats"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="opdrachtnemerKvK" className="text-foreground">
                              KvK nummer (optioneel)
                            </Label>
                            <Input
                              id="opdrachtnemerKvK"
                              value={formData.opdrachtnemerKvK}
                              onChange={(e) => handleInputChange('opdrachtnemerKvK', e.target.value)}
                              className="mt-1"
                              placeholder="12345678"
                            />
                          </div>
                          <div>
                            <Label htmlFor="opdrachtnemerBtw" className="text-foreground">
                              BTW nummer (optioneel)
                            </Label>
                            <Input
                              id="opdrachtnemerBtw"
                              value={formData.opdrachtnemerBtw}
                              onChange={(e) => handleInputChange('opdrachtnemerBtw', e.target.value)}
                              className="mt-1"
                              placeholder="NL123456789B01"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stap 2: Opdracht */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="werkzaamheden" className="text-foreground">
                        Werkzaamheden <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="werkzaamheden"
                        value={formData.werkzaamheden}
                        onChange={(e) => handleInputChange('werkzaamheden', e.target.value)}
                        className="mt-1 min-h-32"
                        placeholder="Beschrijf in detail welke werkzaamheden uitgevoerd moeten worden (minimaal 20 tekens)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.werkzaamheden.length} / 20 tekens (minimum)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="resultaat" className="text-foreground">
                        Resultaat <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="resultaat"
                        value={formData.resultaat}
                        onChange={(e) => handleInputChange('resultaat', e.target.value)}
                        className="mt-1 min-h-24"
                        placeholder="Wat is het gewenste resultaat van de opdracht?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="deliverables" className="text-foreground">
                        Deliverables <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="deliverables"
                        value={formData.deliverables}
                        onChange={(e) => handleInputChange('deliverables', e.target.value)}
                        className="mt-1 min-h-24"
                        placeholder="Welke concrete deliverables worden opgeleverd? (bijv. rapport, website, software, etc.)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startdatum" className="text-foreground">
                          Startdatum <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="startdatum"
                          type="date"
                          value={formData.startdatum}
                          onChange={(e) => handleInputChange('startdatum', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="einddatum" className="text-foreground">
                          Einddatum (optioneel)
                        </Label>
                        <Input
                          id="einddatum"
                          type="date"
                          value={formData.einddatum}
                          onChange={(e) => handleInputChange('einddatum', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="duur" className="text-foreground">
                        Duur <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="duur"
                        value={formData.duur}
                        onChange={(e) => handleInputChange('duur', e.target.value)}
                        className="mt-1"
                        placeholder="Bijv. 3 maanden, 6 weken, projectperiode"
                      />
                    </div>

                    <div>
                      <Label htmlFor="locatie" className="text-foreground">
                        Locatie (optioneel)
                      </Label>
                      <Input
                        id="locatie"
                        value={formData.locatie}
                        onChange={(e) => handleInputChange('locatie', e.target.value)}
                        className="mt-1"
                        placeholder="Bijv. Amsterdam, Remote, Hybride"
                      />
                    </div>
                  </div>
                )}

                {/* Stap 3: Financieel */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="tarief" className="text-foreground">
                        Tarief <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="tarief"
                        value={formData.tarief}
                        onChange={(e) => handleInputChange('tarief', e.target.value)}
                        className="mt-1"
                        placeholder="Bijv. €75 per uur, €5000 per project"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tariefType" className="text-foreground">
                        Tarief type <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.tariefType}
                        onValueChange={(value: "per_uur" | "per_project" | "vast_bedrag" | "variabel") => 
                          handleInputChange('tariefType', value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per_uur">Per uur</SelectItem>
                          <SelectItem value="per_project">Per project</SelectItem>
                          <SelectItem value="vast_bedrag">Vast bedrag</SelectItem>
                          <SelectItem value="variabel">Variabel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="betalingsvoorwaarden" className="text-foreground">
                        Betalingsvoorwaarden (optioneel)
                      </Label>
                      <Textarea
                        id="betalingsvoorwaarden"
                        value={formData.betalingsvoorwaarden}
                        onChange={(e) => handleInputChange('betalingsvoorwaarden', e.target.value)}
                        className="mt-1 min-h-20"
                        placeholder="Bijv. 30 dagen na factuurdatum, vooruitbetaling, etc."
                      />
                    </div>

                    <div>
                      <Label htmlFor="facturatie" className="text-foreground">
                        Facturatie (optioneel)
                      </Label>
                      <Textarea
                        id="facturatie"
                        value={formData.facturatie}
                        onChange={(e) => handleInputChange('facturatie', e.target.value)}
                        className="mt-1 min-h-20"
                        placeholder="Bijv. Maandelijks, per milestone, na oplevering"
                      />
                    </div>
                  </div>
                )}

                {/* Stap 4: Zelfstandigheid Indicatoren */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-4">
                      <p className="text-sm text-foreground">
                        <strong>Belangrijk voor DBA:</strong> Beantwoord deze vragen om aan te tonen dat er sprake is van een opdracht en niet van een arbeidsrelatie. Minimaal 5 van de 9 indicatoren moeten waar zijn.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'eigenGereedschap', label: 'Opdrachtnemer gebruikt eigen gereedschap/middelen' },
                        { key: 'eigenMiddelen', label: 'Opdrachtnemer heeft eigen middelen (laptop, software, etc.)' },
                        { key: 'eigenRisico', label: 'Opdrachtnemer draagt eigen risico' },
                        { key: 'geenGezagsverhouding', label: 'Er is geen gezagsverhouding (geen directe aansturing)' },
                        { key: 'geenExclusiviteit', label: 'Geen exclusiviteit (opdrachtnemer kan andere opdrachten aannemen)' },
                        { key: 'vrijeWerktijden', label: 'Opdrachtnemer werkt in vrije werktijden' },
                        { key: 'eigenVerantwoordelijkheid', label: 'Opdrachtnemer heeft eigen verantwoordelijkheid' },
                        { key: 'eigenKosten', label: 'Opdrachtnemer draagt eigen kosten' },
                        { key: 'eigenWerkruimte', label: 'Opdrachtnemer heeft eigen werkruimte' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                          <Checkbox
                            id={item.key}
                            checked={formData[item.key as keyof typeof formData] as boolean}
                            onCheckedChange={(checked) => handleInputChange(item.key, checked === true)}
                          />
                          <Label htmlFor={item.key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
                            {item.label}
                          </Label>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Aangevinkt: {[
                          formData.eigenGereedschap,
                          formData.eigenMiddelen,
                          formData.eigenRisico,
                          formData.geenGezagsverhouding,
                          formData.geenExclusiviteit,
                          formData.vrijeWerktijden,
                          formData.eigenVerantwoordelijkheid,
                          formData.eigenKosten,
                          formData.eigenWerkruimte
                        ].filter(Boolean).length} van 9 indicatoren
                      </p>
                    </div>
                  </div>
                )}

                {/* Stap 5: Juridisch */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="intellectueelEigendom" className="text-foreground mb-2 block">
                        Intellectueel eigendom <span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup
                        value={formData.intellectueelEigendom}
                        onValueChange={(value: "opdrachtgever" | "opdrachtnemer" | "gedeeld") => 
                          handleInputChange('intellectueelEigendom', value)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="opdrachtgever" id="ie-opdrachtgever" />
                          <Label htmlFor="ie-opdrachtgever" className="cursor-pointer">Opdrachtgever</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="opdrachtnemer" id="ie-opdrachtnemer" />
                          <Label htmlFor="ie-opdrachtnemer" className="cursor-pointer">Opdrachtnemer</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="gedeeld" id="ie-gedeeld" />
                          <Label htmlFor="ie-gedeeld" className="cursor-pointer">Gedeeld</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="aansprakelijkheid" className="text-foreground">
                        Aansprakelijkheid (optioneel)
                      </Label>
                      <Textarea
                        id="aansprakelijkheid"
                        value={formData.aansprakelijkheid}
                        onChange={(e) => handleInputChange('aansprakelijkheid', e.target.value)}
                        className="mt-1 min-h-20"
                        placeholder="Specifieke aansprakelijkheidsbepalingen"
                      />
                    </div>

                    <div>
                      <Label htmlFor="verzekering" className="text-foreground">
                        Verzekering (optioneel)
                      </Label>
                      <Textarea
                        id="verzekering"
                        value={formData.verzekering}
                        onChange={(e) => handleInputChange('verzekering', e.target.value)}
                        className="mt-1 min-h-20"
                        placeholder="Bijv. Aansprakelijkheidsverzekering, beroepsaansprakelijkheid"
                      />
                    </div>

                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id="geheimhouding"
                        checked={formData.geheimhouding}
                        onCheckedChange={(checked) => handleInputChange('geheimhouding', checked === true)}
                      />
                      <div className="flex-1">
                        <Label htmlFor="geheimhouding" className="text-sm font-medium leading-none cursor-pointer">
                          Geheimhoudingsplicht
                        </Label>
                        {formData.geheimhouding && (
                          <div className="mt-2">
                            <Input
                              value={formData.geheimhoudingDuur}
                              onChange={(e) => handleInputChange('geheimhoudingDuur', e.target.value)}
                              placeholder="Duur (bijv. 2 jaar na beëindiging)"
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="beëindiging" className="text-foreground">
                        Beëindiging (optioneel)
                      </Label>
                      <Textarea
                        id="beëindiging"
                        value={formData.beëindiging}
                        onChange={(e) => handleInputChange('beëindiging', e.target.value)}
                        className="mt-1 min-h-20"
                        placeholder="Voorwaarden voor beëindiging"
                      />
                    </div>

                    <div>
                      <Label htmlFor="opzegtermijn" className="text-foreground">
                        Opzegtermijn (optioneel)
                      </Label>
                      <Input
                        id="opzegtermijn"
                        value={formData.opzegtermijn}
                        onChange={(e) => handleInputChange('opzegtermijn', e.target.value)}
                        className="mt-1"
                        placeholder="Bijv. 1 maand, 2 weken"
                      />
                    </div>

                    <div>
                      <Label htmlFor="geschillenbeslechting" className="text-foreground mb-2 block">
                        Geschillenbeslechting <span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup
                        value={formData.geschillenbeslechting}
                        onValueChange={(value: "rechter" | "arbitrage" | "bemiddeling") => 
                          handleInputChange('geschillenbeslechting', value)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="rechter" id="gb-rechter" />
                          <Label htmlFor="gb-rechter" className="cursor-pointer">Rechter</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="arbitrage" id="gb-arbitrage" />
                          <Label htmlFor="gb-arbitrage" className="cursor-pointer">Arbitrage</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bemiddeling" id="gb-bemiddeling" />
                          <Label htmlFor="gb-bemiddeling" className="cursor-pointer">Bemiddeling</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}

                {/* Stap 6: Overig */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="bijzondereVoorwaarden" className="text-foreground">
                        Bijzondere voorwaarden (optioneel)
                      </Label>
                      <Textarea
                        id="bijzondereVoorwaarden"
                        value={formData.bijzondereVoorwaarden}
                        onChange={(e) => handleInputChange('bijzondereVoorwaarden', e.target.value)}
                        className="mt-1 min-h-24"
                        placeholder="Eventuele bijzondere voorwaarden of afspraken"
                      />
                    </div>

                    <div>
                      <Label htmlFor="overmacht" className="text-foreground">
                        Overmacht (optioneel)
                      </Label>
                      <Textarea
                        id="overmacht"
                        value={formData.overmacht}
                        onChange={(e) => handleInputChange('overmacht', e.target.value)}
                        className="mt-1 min-h-20"
                        placeholder="Bepalingen over overmacht"
                      />
                    </div>

                    <div>
                      <Label htmlFor="wijzigingen" className="text-foreground">
                        Wijzigingen (optioneel)
                      </Label>
                      <Textarea
                        id="wijzigingen"
                        value={formData.wijzigingen}
                        onChange={(e) => handleInputChange('wijzigingen', e.target.value)}
                        className="mt-1 min-h-20"
                        placeholder="Hoe kunnen wijzigingen worden doorgevoerd?"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Vorige
                  </Button>
                  {currentStep < TOTAL_STEPS ? (
                    <Button
                      className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300"
                      onClick={nextStep}
                    >
                      Volgende
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleGenerate}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Contract genereren...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Genereer Contract
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                  Gegenereerd Contract
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  DBA-proof opdrachtovereenkomst gegenereerd met AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-accent/10 border border-primary/20 rounded-lg">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                        {result.contract}
                      </pre>
                    </div>
                  </div>

                  <div className="p-4 bg-accent/10 border border-primary/20 rounded-lg">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Disclaimer:</strong> {result.disclaimer}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download als TXT
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                      onClick={() => {
                        setResult(null)
                        setCurrentStep(1)
                        setError(null)
                      }}
                    >
                      Opnieuw
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Information Card */}
          {!result && (
            <Card className="mt-8 bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-foreground">Over DBA Proof Contracten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Een DBA-proof opdrachtovereenkomst is essentieel om duidelijk te maken dat er sprake is van een opdracht en niet van een arbeidsrelatie. 
                    Dit helpt om problemen met de Belastingdienst te voorkomen.
                  </p>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Belangrijke elementen:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Resultaatgerichte beschrijving van de werkzaamheden</li>
                      <li>Duidelijke zelfstandigheid van de opdrachtnemer</li>
                      <li>Geen gezagsverhouding of vaste werktijden</li>
                      <li>Eigen verantwoordelijkheid en middelen</li>
                      <li>Geen exclusiviteit</li>
                      <li>Volledige juridische bepalingen</li>
                    </ul>
                  </div>
                  <p className="text-sm italic">
                    Let op: Deze tool genereert een richtlijn. Raadpleeg altijd een juridisch adviseur voor definitieve goedkeuring.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
