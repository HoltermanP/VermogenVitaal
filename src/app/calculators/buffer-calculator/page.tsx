"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, Shield, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateEmergencyFund, type EmergencyFundInput } from "@/lib/calculators/emergency-fund"

export default function EmergencyFundCalculatorPage() {
  const [formData, setFormData] = useState<EmergencyFundInput>({
    monthlyExpenses: 3000,
    desiredMonths: 6,
    currentSavings: 5000,
    monthlySavings: 500,
    expectedReturn: 3,
    riskTolerance: 'medium',
    hasStableIncome: true,
    hasPartner: false,
    dependents: 0
  })

  const [results, setResults] = useState<ReturnType<typeof calculateEmergencyFund> | null>(null)

  const handleCalculate = () => {
    const result = calculateEmergencyFund(formData)
    setResults(result)
  }

  const getCoverageColor = (months: number, recommended: number) => {
    if (months >= recommended) return 'text-green-600'
    if (months >= recommended * 0.5) return 'text-yellow-600'
    return 'text-red-600'
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
              <span className="text-gradient-financial">Buffer/Kapitaal Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bepaal de juiste financiële buffer voor noodgevallen en onvoorziene omstandigheden
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/buffer-calculator" />
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
                    <Label htmlFor="monthlyExpenses">Maandelijkse Uitgaven</Label>
                    <Input
                      id="monthlyExpenses"
                      type="number"
                      value={formData.monthlyExpenses}
                      onChange={(e) => setFormData({ ...formData, monthlyExpenses: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="desiredMonths">Gewenste Maanden Buffer</Label>
                    <Select value={formData.desiredMonths.toString()} onValueChange={(value) => setFormData({ ...formData, desiredMonths: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 maanden (Minimum)</SelectItem>
                        <SelectItem value="6">6 maanden (Standaard)</SelectItem>
                        <SelectItem value="9">9 maanden (Ruim)</SelectItem>
                        <SelectItem value="12">12 maanden (Zeer ruim)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentSavings">Huidige Buffer</Label>
                    <Input
                      id="currentSavings"
                      type="number"
                      value={formData.currentSavings}
                      onChange={(e) => setFormData({ ...formData, currentSavings: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlySavings">Maandelijks Sparen</Label>
                    <Input
                      id="monthlySavings"
                      type="number"
                      value={formData.monthlySavings}
                      onChange={(e) => setFormData({ ...formData, monthlySavings: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <Label htmlFor="dependents">Aantal Afhankelijkheden</Label>
                    <Select value={formData.dependents.toString()} onValueChange={(value) => setFormData({ ...formData, dependents: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Geen</SelectItem>
                        <SelectItem value="1">1 persoon</SelectItem>
                        <SelectItem value="2">2 personen</SelectItem>
                        <SelectItem value="3">3+ personen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasStableIncome"
                      checked={formData.hasStableIncome}
                      onChange={(e) => setFormData({ ...formData, hasStableIncome: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="hasStableIncome">Stabiel inkomen</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasPartner"
                      checked={formData.hasPartner}
                      onChange={(e) => setFormData({ ...formData, hasPartner: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="hasPartner">Partner</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="riskTolerance">Risicotolerantie</Label>
                  <Select value={formData.riskTolerance} onValueChange={(value: any) => setFormData({ ...formData, riskTolerance: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Laag - Focus op beschikbaarheid</SelectItem>
                      <SelectItem value="medium">Gemiddeld - Balans tussen rente en risico</SelectItem>
                      <SelectItem value="high">Hoog - Hogere rente acceptabel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Bufferbehoefte
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
                      <h3 className="font-semibold mb-3">Buffer Advies</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aanbevolen Buffer:</span>
                          <span className="font-medium">€{Math.round(results.recommendedAmount).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Huidige Dekking:</span>
                          <span className={`font-medium ${getCoverageColor(results.currentCoverage, results.riskAdjustedMonths)}`}>
                            {results.currentCoverage} maanden
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shortfall:</span>
                          <span className="font-medium text-red-600">€{Math.round(results.shortfall).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Aanbevolen Maanden:</span>
                          <span className="font-semibold text-gradient-financial">{results.riskAdjustedMonths} maanden</span>
                        </div>
                      </div>
                    </div>

                    {results.shortfall > 0 && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-3">Opbouw Plan</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tijd tot Volledige Buffer:</span>
                            <span className="font-medium">{results.timeToBuild.toFixed(1)} maanden</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Benodigd Maandelijks:</span>
                            <span className="font-medium">€{Math.round(results.monthlyRequired).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold mb-3">Investering Suggestie</h3>
                      <p className="text-sm text-muted-foreground">{results.investmentSuggestion}</p>
                    </div>

                    {results.alternatives.length > 0 && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-2">Alternatieven</h3>
                        <ul className="space-y-1 text-sm">
                          {results.alternatives.map((item, idx) => (
                            <li key={idx} className="text-muted-foreground">• {item}</li>
                          ))}
                        </ul>
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
                    <p className="text-muted-foreground text-center">Klik op "Bereken Bufferbehoefte" om resultaten te zien</p>
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