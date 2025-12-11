"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateChildrenSavings, type ChildrenSavingsInput } from "@/lib/calculators/children-savings"

export default function ChildrenSavingsCalculatorPage() {
  const [formData, setFormData] = useState<ChildrenSavingsInput>({
    childAge: 5,
    targetAge: 18,
    targetAmount: 50000,
    currentSavings: 0,
    monthlyContribution: 200,
    expectedReturn: 6,
    purpose: 'study',
    inflationRate: 2,
    taxFree: true
  })

  const [results, setResults] = useState<ReturnType<typeof calculateChildrenSavings> | null>(null)

  const handleCalculate = () => {
    const result = calculateChildrenSavings(formData)
    setResults(result)
  }

  const getPurposeDescription = (purpose: string) => {
    switch (purpose) {
      case 'study': return 'Studiekosten (€50.000 gemiddeld)'
      case 'starter': return 'Starterskapitaal (€30.000 gemiddeld)'
      case 'general': return 'Algemeen spaardoel (€20.000 gemiddeld)'
      default: return ''
    }
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
              <span className="text-gradient-financial">Sparen voor Kinderen</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Plan spaargeld voor studie, starterskapitaal of andere doelen voor je kinderen
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/sparen-kinderen" />
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
                    <Label htmlFor="childAge">Huidige Leeftijd Kind</Label>
                    <Input
                      id="childAge"
                      type="number"
                      min="0"
                      max="17"
                      value={formData.childAge}
                      onChange={(e) => setFormData({ ...formData, childAge: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetAge">Leeftijd bij Uitkering</Label>
                    <Input
                      id="targetAge"
                      type="number"
                      min="18"
                      max="30"
                      value={formData.targetAge}
                      onChange={(e) => setFormData({ ...formData, targetAge: parseInt(e.target.value) || 18 })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="purpose">Doel</Label>
                  <Select value={formData.purpose} onValueChange={(value: any) => setFormData({ ...formData, purpose: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">Studiekosten (€50.000)</SelectItem>
                      <SelectItem value="starter">Starterskapitaal (€30.000)</SelectItem>
                      <SelectItem value="general">Algemeen doel (€20.000)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">{getPurposeDescription(formData.purpose)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetAmount">Doelbedrag (€)</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentSavings">Huidige Spaargelden (€)</Label>
                    <Input
                      id="currentSavings"
                      type="number"
                      value={formData.currentSavings}
                      onChange={(e) => setFormData({ ...formData, currentSavings: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthlyContribution">Maandelijkse Bijdrage (€)</Label>
                    <Input
                      id="monthlyContribution"
                      type="number"
                      value={formData.monthlyContribution}
                      onChange={(e) => setFormData({ ...formData, monthlyContribution: parseFloat(e.target.value) || 0 })}
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
                      onChange={(e) => setFormData({ ...formData, expectedReturn: parseFloat(e.target.value) || 6 })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inflationRate">Inflatie (%)</Label>
                    <Input
                      id="inflationRate"
                      type="number"
                      step="0.1"
                      value={formData.inflationRate}
                      onChange={(e) => setFormData({ ...formData, inflationRate: parseFloat(e.target.value) || 2 })}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      id="taxFree"
                      checked={formData.taxFree}
                      onChange={(e) => setFormData({ ...formData, taxFree: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="taxFree">Spaarrekening voor kind (fiscaal voordeel)</Label>
                  </div>
                </div>

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Spaarschema
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
                      <h3 className="font-semibold mb-3">Spaarschema</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Benodigd Maandelijks:</span>
                          <span className="font-medium">€{Math.round(results.requiredMonthly).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Proj. Eindbedrag:</span>
                          <span className="font-medium">€{Math.round(results.projectedAmount).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Totale Bijdragen:</span>
                          <span className="font-medium">€{Math.round(results.totalContributions).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Totale Groei:</span>
                          <span className="font-medium text-green-600">€{Math.round(results.totalGrowth).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Jaren tot Doel:</span>
                          <span className="font-semibold text-gradient-financial">{results.yearsUntilGoal} jaar</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold mb-3">Financiële Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Inflatiegecorrigeerd Doel:</span>
                          <span className="font-medium">€{Math.round(results.inflationAdjustedTarget).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Effectief Rendement:</span>
                          <span className="font-medium">{results.effectiveReturn.toFixed(1)}%</span>
                        </div>
                        {results.taxSavings > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Belastingvoordeel:</span>
                            <span className="font-medium text-green-600">€{Math.round(results.taxSavings).toLocaleString('nl-NL')}</span>
                          </div>
                        )}
                        {results.shortfall > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Shortfall:</span>
                            <span className="font-medium text-red-600">€{Math.round(results.shortfall).toLocaleString('nl-NL')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {results.alternatives.length > 0 && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-2">Alternatieve Opties</h3>
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
                    <p className="text-muted-foreground text-center">Klik op "Bereken Spaarschema" om resultaten te zien</p>
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