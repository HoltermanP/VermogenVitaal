"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculatePensionNeed, type PensionNeedInput } from "@/lib/calculators/pension-need"

export default function PensionNeedCalculatorPage() {
  const [formData, setFormData] = useState<PensionNeedInput>({
    currentIncome: 50000,
    currentExpenses: 35000,
    desiredRetirementAge: 67,
    lifeExpectancy: 85,
    expectedInflation: 2,
    hasPartner: false,
    partnerIncome: 0,
    partnerExpenses: 0,
    desiredReplacementRatio: 70
  })

  const [results, setResults] = useState<ReturnType<typeof calculatePensionNeed> | null>(null)

  const handleCalculate = () => {
    const result = calculatePensionNeed(formData)
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
              Bereken hoeveel pensioen je nodig hebt om je huidige levensstijl te behouden
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
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  Gegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentIncome">Huidig Jaarinkomen</Label>
                    <Input
                      id="currentIncome"
                      type="number"
                      value={formData.currentIncome}
                      onChange={(e) => setFormData({ ...formData, currentIncome: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentExpenses">Jaarlijkse Uitgaven</Label>
                    <Input
                      id="currentExpenses"
                      type="number"
                      value={formData.currentExpenses}
                      onChange={(e) => setFormData({ ...formData, currentExpenses: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="desiredRetirementAge">Gewenste Pensioneringsleeftijd</Label>
                    <Input
                      id="desiredRetirementAge"
                      type="number"
                      value={formData.desiredRetirementAge}
                      onChange={(e) => setFormData({ ...formData, desiredRetirementAge: parseInt(e.target.value) || 67 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lifeExpectancy">Levensverwachting</Label>
                    <Input
                      id="lifeExpectancy"
                      type="number"
                      value={formData.lifeExpectancy}
                      onChange={(e) => setFormData({ ...formData, lifeExpectancy: parseInt(e.target.value) || 85 })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expectedInflation">Verwachte Inflatie (%)</Label>
                    <Input
                      id="expectedInflation"
                      type="number"
                      step="0.1"
                      value={formData.expectedInflation}
                      onChange={(e) => setFormData({ ...formData, expectedInflation: parseFloat(e.target.value) || 2 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="desiredReplacementRatio">Gewenst Vervangingspercentage (%)</Label>
                    <Select value={formData.desiredReplacementRatio.toString()} onValueChange={(value) => setFormData({ ...formData, desiredReplacementRatio: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60% (Bescheiden)</SelectItem>
                        <SelectItem value="70">70% (Standaard)</SelectItem>
                        <SelectItem value="80">80% (Ruim)</SelectItem>
                        <SelectItem value="100">100% (Luxueus)</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="partnerIncome">Partner Jaarinkomen</Label>
                      <Input
                        id="partnerIncome"
                        type="number"
                        value={formData.partnerIncome}
                        onChange={(e) => setFormData({ ...formData, partnerIncome: parseFloat(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="partnerExpenses">Partner Jaarlijkse Uitgaven</Label>
                      <Input
                        id="partnerExpenses"
                        type="number"
                        value={formData.partnerExpenses}
                        onChange={(e) => setFormData({ ...formData, partnerExpenses: parseFloat(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

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
                          <span className="text-muted-foreground">Jaarlijks Benodigd:</span>
                          <span className="font-medium">€{Math.round(results.requiredAnnualPension).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Maandelijks Benodigd:</span>
                          <span className="font-medium">€{Math.round(results.requiredMonthlyPension).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">AOW Supplement:</span>
                          <span className="font-medium">€{Math.round(results.aowSupplement).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Totaal Nodig:</span>
                          <span className="font-semibold text-gradient-financial">€{Math.round(results.totalRequiredPension).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

                    {results.partnerPensionNeeded > 0 && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-3">Partner Pensioen</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Extra voor Partner:</span>
                            <span className="font-medium">€{Math.round(results.partnerPensionNeeded).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold mb-3">Projecties</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gecorrigeerde Uitgaven:</span>
                          <span className="font-medium">€{Math.round(results.projectedExpenses).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Inflatie Impact:</span>
                          <span className="font-medium">{results.inflationAdjusted}%</span>
                        </div>
                      </div>
                    </div>

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
                    <p className="text-muted-foreground text-center">Klik op "Bereken Pensioenbehoefte" om resultaten te zien</p>
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