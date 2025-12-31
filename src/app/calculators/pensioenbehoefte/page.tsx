"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, ArrowRight, Target } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculatePensionNeed, type PensionNeedResult } from "@/lib/calculators/pension-need"

export default function PensionNeedCalculatorPage() {
  const [formData, setFormData] = useState({
    currentAge: 35,
    retirementAge: 67,
    currentIncome: 50000,
    desiredReplacementRate: 70,
    lifeExpectancy: 85,
    inflationRate: 2,
    expectedReturn: 5
  })

  const [results, setResults] = useState<PensionNeedResult | null>(null)

  const handleCalculate = () => {
    const result = calculatePensionNeed({
      ...formData,
      desiredReplacementRate: formData.desiredReplacementRate / 100,
      inflationRate: formData.inflationRate / 100,
      expectedReturn: formData.expectedReturn / 100
    })
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
              <span className="text-gradient-financial">Pensioenbehoefte Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bepaal hoeveel pensioen je nodig hebt om je levensstijl te behouden
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/pensioenbehoefte" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Gegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="currentAge">Huidige Leeftijd</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    value={formData.currentAge}
                    onChange={(e) => setFormData({ ...formData, currentAge: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="retirementAge">Gewenste Pensioenleeftijd</Label>
                  <Input
                    id="retirementAge"
                    type="number"
                    value={formData.retirementAge}
                    onChange={(e) => setFormData({ ...formData, retirementAge: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="currentIncome">Huidig Jaarlijks Inkomen (€)</Label>
                  <Input
                    id="currentIncome"
                    type="number"
                    value={formData.currentIncome}
                    onChange={(e) => setFormData({ ...formData, currentIncome: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="desiredReplacementRate">Vervangingsratio (%)</Label>
                  <Input
                    id="desiredReplacementRate"
                    type="number"
                    value={formData.desiredReplacementRate}
                    onChange={(e) => setFormData({ ...formData, desiredReplacementRate: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Percentage van huidig inkomen (bijv. 70%)</p>
                </div>

                <div>
                  <Label htmlFor="lifeExpectancy">Verwachte Levensverwachting</Label>
                  <Input
                    id="lifeExpectancy"
                    type="number"
                    value={formData.lifeExpectancy}
                    onChange={(e) => setFormData({ ...formData, lifeExpectancy: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="inflationRate">Verwachte Inflatie (%)</Label>
                  <Input
                    id="inflationRate"
                    type="number"
                    step="0.1"
                    value={formData.inflationRate}
                    onChange={(e) => setFormData({ ...formData, inflationRate: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="expectedReturn">Verwacht Rendement (%)</Label>
                  <Input
                    id="expectedReturn"
                    type="number"
                    step="0.1"
                    value={formData.expectedReturn}
                    onChange={(e) => setFormData({ ...formData, expectedReturn: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Pensioenbehoefte
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
                      <h3 className="font-semibold mb-3">Pensioenbehoefte</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Jaarlijks Pensioen:</span>
                          <span className="font-medium">€{Math.round(results.annualPensionNeed).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Maandelijks Pensioen:</span>
                          <span className="font-medium">€{Math.round(results.monthlyPensionNeed).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Totale Behoefte:</span>
                          <span className="font-medium">€{Math.round(results.totalPensionNeed).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold mb-3">Benodigd Vermogen</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Benodigd bij Pensioen:</span>
                          <span className="font-medium">€{Math.round(results.requiredSavings).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Maandelijks Sparen:</span>
                          <span className="font-semibold text-gradient-financial">€{Math.round(results.monthlySavingsNeeded).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

                    {results.advice.length > 0 && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-2">Advies</h3>
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
                    <p className="text-muted-foreground text-center">Klik op &quot;Bereken Pensioenbehoefte&quot; om resultaten te zien</p>
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
