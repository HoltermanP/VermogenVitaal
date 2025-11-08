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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4 text-gray-300 hover:text-white">
              <Link href="/calculators">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar Calculators
              </Link>
            </Button>
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/25">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  DBA Proof Opdrachtomschrijving Generator
                </h1>
                <p className="text-lg text-gray-300">
                  Genereer een professionele, DBA-proof opdrachtomschrijving met behulp van AI
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-400" />
                  Opdrachtgegevens
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Vul de gegevens in over de opdracht
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="opdrachtgever" className="text-gray-200">
                    Opdrachtgever <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="opdrachtgever"
                    value={formData.opdrachtgever}
                    onChange={(e) => handleInputChange('opdrachtgever', e.target.value)}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                    placeholder="Naam van de opdrachtgever"
                  />
                </div>

                <div>
                  <Label htmlFor="opdrachtnemer" className="text-gray-200">
                    Opdrachtnemer <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="opdrachtnemer"
                    value={formData.opdrachtnemer}
                    onChange={(e) => handleInputChange('opdrachtnemer', e.target.value)}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                    placeholder="Naam van de opdrachtnemer"
                  />
                </div>

                <div>
                  <Label htmlFor="werkzaamheden" className="text-gray-200">
                    Werkzaamheden <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="werkzaamheden"
                    value={formData.werkzaamheden}
                    onChange={(e) => handleInputChange('werkzaamheden', e.target.value)}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white min-h-32"
                    placeholder="Beschrijf de werkzaamheden die uitgevoerd moeten worden (minimaal 10 tekens)"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {formData.werkzaamheden.length} / 10 tekens (minimum)
                  </p>
                </div>

                <div>
                  <Label htmlFor="duur" className="text-gray-200">
                    Duur <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="duur"
                    value={formData.duur}
                    onChange={(e) => handleInputChange('duur', e.target.value)}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                    placeholder="Bijv. 3 maanden, 6 weken, projectperiode"
                  />
                </div>

                <div>
                  <Label htmlFor="tarief" className="text-gray-200">
                    Tarief (optioneel)
                  </Label>
                  <Input
                    id="tarief"
                    value={formData.tarief}
                    onChange={(e) => handleInputChange('tarief', e.target.value)}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                    placeholder="Bijv. €75 per uur, €5000 per project"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startdatum" className="text-gray-200">
                      Startdatum (optioneel)
                    </Label>
                    <Input
                      id="startdatum"
                      type="date"
                      value={formData.startdatum}
                      onChange={(e) => handleInputChange('startdatum', e.target.value)}
                      className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="einddatum" className="text-gray-200">
                      Einddatum (optioneel)
                    </Label>
                    <Input
                      id="einddatum"
                      type="date"
                      value={formData.einddatum}
                      onChange={(e) => handleInputChange('einddatum', e.target.value)}
                      className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="locatie" className="text-gray-200">
                    Locatie (optioneel)
                  </Label>
                  <Input
                    id="locatie"
                    value={formData.locatie}
                    onChange={(e) => handleInputChange('locatie', e.target.value)}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                    placeholder="Bijv. Amsterdam, Remote, Hybride"
                  />
                </div>

                <div>
                  <Label htmlFor="specifiekeEisen" className="text-gray-200">
                    Specifieke eisen (optioneel)
                  </Label>
                  <Textarea
                    id="specifiekeEisen"
                    value={formData.specifiekeEisen}
                    onChange={(e) => handleInputChange('specifiekeEisen', e.target.value)}
                    className="mt-1 bg-slate-700/50 border-slate-600 text-white min-h-24"
                    placeholder="Specifieke eisen, voorwaarden of bijzonderheden"
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 py-3 text-lg font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Gegenereerde Opdrachtomschrijving</CardTitle>
                <CardDescription className="text-gray-300">
                  DBA-proof opdrachtomschrijving gegenereerd met AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-200 font-sans leading-relaxed">
                          {result.opdrachtomschrijving}
                        </pre>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-xs text-yellow-300 leading-relaxed">
                        <strong>Disclaimer:</strong> {result.disclaimer}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download als TXT
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
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
                  <div className="p-8 bg-slate-700/30 rounded-lg border border-slate-600 border-dashed">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">
                        Vul het formulier in en klik op "Genereer Opdrachtomschrijving" om een DBA-proof opdrachtomschrijving te maken
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Information Card */}
          <Card className="mt-8 bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Over DBA Proof Opdrachtomschrijvingen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-300">
                <p>
                  Een DBA-proof opdrachtomschrijving is essentieel om duidelijk te maken dat er sprake is van een opdracht en niet van een arbeidsrelatie. 
                  Dit helpt om problemen met de Belastingdienst te voorkomen.
                </p>
                <div>
                  <h3 className="font-semibold text-white mb-2">Belangrijke elementen:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Resultaatgerichte beschrijving van de werkzaamheden</li>
                    <li>Duidelijke zelfstandigheid van de opdrachtnemer</li>
                    <li>Geen gezagsverhouding of vaste werktijden</li>
                    <li>Eigen verantwoordelijkheid en middelen</li>
                    <li>Geen exclusiviteit</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-400 italic">
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

