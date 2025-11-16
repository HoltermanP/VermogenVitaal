"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Sparkles, Download, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function DBAOpdrachtomschrijvingPage() {
  const [formData, setFormData] = useState({
    opdrachtgever: "",
    opdrachtnemer: "",
    werkzaamheden: "",
    duur: "",
    tarief: "",
    startdatum: "",
    einddatum: "",
    locatie: "",
    specifiekeEisen: ""
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    opdrachtomschrijving: string
    generatedAt: string
    disclaimer: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Reset error when user starts typing
    if (error) setError(null)
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
        throw new Error(data.error || "Er is een fout opgetreden bij het genereren van de opdrachtomschrijving")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is een onbekende fout opgetreden")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!result) return

    const content = `DBA PROOF OPDACHTOMSCHRIJVING

${result.opdrachtomschrijving}

---
Gegenereerd op: ${new Date(result.generatedAt).toLocaleString('nl-NL')}
${result.disclaimer}
`

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dba-opdrachtomschrijving-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const isFormValid = formData.opdrachtgever.trim() !== "" && 
                      formData.opdrachtnemer.trim() !== "" && 
                      formData.werkzaamheden.trim().length >= 10 && 
                      formData.duur.trim() !== ""

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
                  <span className="text-gradient-financial">DBA Proof Opdrachtomschrijving Generator</span>
                </h1>
                <p className="text-lg text-muted-foreground animate-fade-in delay-200">
                  Genereer een professionele, DBA-proof opdrachtomschrijving met behulp van AI
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3 shadow-financial">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  Opdrachtgegevens
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Vul de gegevens in over de opdracht
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="opdrachtgever" className="text-foreground">
                    Opdrachtgever <span className="text-destructive">*</span>
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
                  <Label htmlFor="opdrachtnemer" className="text-foreground">
                    Opdrachtnemer <span className="text-destructive">*</span>
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
                  <Label htmlFor="werkzaamheden" className="text-foreground">
                    Werkzaamheden <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="werkzaamheden"
                    value={formData.werkzaamheden}
                    onChange={(e) => handleInputChange('werkzaamheden', e.target.value)}
                    className="mt-1 min-h-32"
                    placeholder="Beschrijf de werkzaamheden die uitgevoerd moeten worden (minimaal 10 tekens)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.werkzaamheden.length} / 10 tekens (minimum)
                  </p>
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
                  <Label htmlFor="tarief" className="text-foreground">
                    Tarief (optioneel)
                  </Label>
                  <Input
                    id="tarief"
                    value={formData.tarief}
                    onChange={(e) => handleInputChange('tarief', e.target.value)}
                    className="mt-1"
                    placeholder="Bijv. €75 per uur, €5000 per project"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startdatum" className="text-foreground">
                      Startdatum (optioneel)
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

                <div>
                  <Label htmlFor="specifiekeEisen" className="text-foreground">
                    Specifieke eisen (optioneel)
                  </Label>
                  <Textarea
                    id="specifiekeEisen"
                    value={formData.specifiekeEisen}
                    onChange={(e) => handleInputChange('specifiekeEisen', e.target.value)}
                    className="mt-1 min-h-24"
                    placeholder="Specifieke eisen, voorwaarden of bijzonderheden"
                  />
                </div>

                <Button
                  className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleGenerate}
                  disabled={!isFormValid || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Genereren...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Genereer Opdrachtomschrijving
                    </>
                  )}
                </Button>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-foreground">Gegenereerde Opdrachtomschrijving</CardTitle>
                <CardDescription className="text-muted-foreground">
                  DBA-proof opdrachtomschrijving gegenereerd met AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-lg">
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                          {result.opdrachtomschrijving}
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
                          setError(null)
                        }}
                      >
                        Opnieuw
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-accent/10 border border-primary/20 rounded-lg border-dashed">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Vul het formulier in en klik op &quot;Genereer Opdrachtomschrijving&quot; om een DBA-proof opdrachtomschrijving te maken
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Information Card */}
          <Card className="mt-8 bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
            <CardHeader>
              <CardTitle className="text-foreground">Over DBA Proof Opdrachtomschrijvingen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Een DBA-proof opdrachtomschrijving is essentieel om duidelijk te maken dat er sprake is van een opdracht en niet van een arbeidsrelatie. 
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
                  </ul>
                </div>
                <p className="text-sm italic">
                  Let op: Deze tool genereert een richtlijn. Raadpleeg altijd een juridisch adviseur voor definitieve goedkeuring.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

