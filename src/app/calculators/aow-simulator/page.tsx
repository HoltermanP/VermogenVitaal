"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, ArrowRight, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateAOW, type AOWSimulatorInput } from "@/lib/calculators/aow-simulator"

export default function AOWSimulatorPage() {
  const [formData, setFormData] = useState<AOWSimulatorInput>({
    birthDate: "1970-01-01",
    workedYears: 42,
    hasPartner: false,
    residenceYears: 42
  })

  const [results, setResults] = useState<ReturnType<typeof calculateAOW> | null>(null)

  const handleCalculate = () => {
    const result = calculateAOW(formData)
    setResults(result)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              <span className="text-gradient-financial">AOW Simulator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bereken je AOW-uitkering gebaseerd op geboortedatum en werkhistorie
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/aow-simulator" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  Gegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="birthDate">Geboortedatum</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workedYears">Gewerkte Jaren</Label>
                    <Input
                      id="workedYears"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.workedYears}
                      onChange={(e) => setFormData({ ...formData, workedYears: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="residenceYears">Jaren in Nederland Gewoond</Label>
                    <Input
                      id="residenceYears"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.residenceYears}
                      onChange={(e) => setFormData({ ...formData, residenceYears: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasPartner"
                    checked={formData.hasPartner}
                    onChange={(e) => setFormData({ ...formData, hasPartner: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="hasPartner">Partner situatie meenemen</Label>
                </div>

                {formData.hasPartner && (
                  <div>
                    <Label htmlFor="partnerBirthDate">Partner Geboortedatum</Label>
                    <Input
                      id="partnerBirthDate"
                      type="date"
                      value={formData.partnerBirthDate || ""}
                      onChange={(e) => setFormData({ ...formData, partnerBirthDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                )}

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken AOW
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="text-foreground">Resultaten</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold mb-3">AOW Uitkering</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">AOW Leeftijd:</span>
                          <span className="font-medium">{results.aowAge} jaar</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Maandelijks:</span>
                          <span className="font-medium">€{Math.round(results.monthlyAOW).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Jaarlijks:</span>
                          <span className="font-medium">€{Math.round(results.annualAOW).toLocaleString('nl-NL')}</span>
                        </div>
                        {results.partnerAOW > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Partner AOW:</span>
                            <span className="font-medium">€{Math.round(results.partnerAOW).toLocaleString('nl-NL')}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Totaal AOW:</span>
                          <span className="font-semibold text-gradient-financial">€{Math.round(results.totalAOW).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

                    {results.reductionPercentage > 0 && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-3">Korting</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Kortingspercentage:</span>
                            <span className="font-medium text-red-600">{results.reductionPercentage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Kortingsbedrag:</span>
                            <span className="font-medium text-red-600">€{Math.round(results.reductionAmount).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Volledige AOW Leeftijd:</span>
                            <span className="font-medium">{results.fullAOWAge} jaar</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {results.advice.length > 0 && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-2">Inzichten</h3>
                        <ul className="space-y-1 text-sm">
                          {results.advice.map((item, idx) => (
                            <li key={idx} className="text-muted-foreground">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                    <p className="text-muted-foreground text-center">Klik op "Bereken AOW" om resultaten te zien</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button className="flex-1 gradient-financial text-white" asChild>
                    <Link href="/calculators">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Andere Calculator
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}