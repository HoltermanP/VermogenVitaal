"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, Home, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateHouseSavings, type HouseSavingsInput } from "@/lib/calculators/house-savings"

export default function HouseSavingsCalculatorPage() {
  const [formData, setFormData] = useState<HouseSavingsInput>({
    currentHouseValue: 300000,
    targetHouseValue: 500000,
    timeHorizonYears: 10,
    currentSavings: 50000,
    monthlySavings: 1000,
    expectedReturn: 5,
    purpose: 'buy',
    downPaymentPercentage: 20,
    inflationRate: 3
  })

  const [results, setResults] = useState<ReturnType<typeof calculateHouseSavings> | null>(null)

  const handleCalculate = () => {
    const result = calculateHouseSavings(formData)
    setResults(result)
  }

  const getPurposeDescription = (purpose: string) => {
    switch (purpose) {
      case 'buy': return 'Nieuwe woning aankopen'
      case 'renovate': return 'Renovatie/verbouwing'
      case 'payoff': return 'Extra aflossen huidige hypotheek'
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
              <span className="text-gradient-financial">Huisdroom Sparen Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bereken spaarplan voor je droomhuis, verbouwing of extra aflossing
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/huisdroom-sparen" />
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
                    <Label htmlFor="currentHouseValue">Huidige Woningwaarde (€)</Label>
                    <Input
                      id="currentHouseValue"
                      type="number"
                      value={formData.currentHouseValue}
                      onChange={(e) => setFormData({ ...formData, currentHouseValue: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetHouseValue">Gewenste Woningwaarde (€)</Label>
                    <Input
                      id="targetHouseValue"
                      type="number"
                      value={formData.targetHouseValue}
                      onChange={(e) => setFormData({ ...formData, targetHouseValue: parseFloat(e.target.value) || 0 })}
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
                      <SelectItem value="buy">Nieuwe woning aankopen</SelectItem>
                      <SelectItem value="renovate">Renovatie/verbouwing</SelectItem>
                      <SelectItem value="payoff">Extra aflossen huidige hypotheek</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">{getPurposeDescription(formData.purpose)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeHorizonYears">Looptijd (jaren)</Label>
                    <Input
                      id="timeHorizonYears"
                      type="number"
                      value={formData.timeHorizonYears}
                      onChange={(e) => setFormData({ ...formData, timeHorizonYears: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="downPaymentPercentage">Eigen Geld (%)</Label>
                    <Select value={formData.downPaymentPercentage.toString()} onValueChange={(value) => setFormData({ ...formData, downPaymentPercentage: parseInt(value) })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10% (NHG mogelijk)</SelectItem>
                        <SelectItem value="20">20% (Standaard)</SelectItem>
                        <SelectItem value="30">30% (Voordelig)</SelectItem>
                        <SelectItem value="100">100% (Contant)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <Label htmlFor="monthlySavings">Maandelijkse Bijdrage (€)</Label>
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
                      onChange={(e) => setFormData({ ...formData, expectedReturn: parseFloat(e.target.value) || 5 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inflationRate">Huisprijs Inflatie (%)</Label>
                    <Input
                      id="inflationRate"
                      type="number"
                      step="0.1"
                      value={formData.inflationRate}
                      onChange={(e) => setFormData({ ...formData, inflationRate: parseFloat(e.target.value) || 3 })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Huisdroom Plan
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
                      <h3 className="font-semibold mb-3">Spaarplan Overzicht</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Benodigd Eigen Geld:</span>
                          <span className="font-medium">€{Math.round(results.requiredDownPayment).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Proj. Vermogen:</span>
                          <span className="font-medium">€{Math.round(results.projectedSavings).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shortfall:</span>
                          <span className="font-medium text-red-600">€{Math.round(results.shortfall).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Benodigd Maandelijks:</span>
                          <span className="font-medium">€{Math.round(results.monthlyRequired).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Tijd tot Doel:</span>
                          <span className="font-semibold text-gradient-financial">{results.timeToReachGoal.toFixed(1)} jaar</span>
                        </div>
                      </div>
                    </div>

                    {formData.purpose === 'buy' && results.mortgageAmount > 0 && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-3">Hypotheek Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hypotheekbedrag:</span>
                            <span className="font-medium">€{Math.round(results.mortgageAmount).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Maandelijkse Lasten:</span>
                            <span className="font-medium">€{Math.round(results.monthlyMortgagePayment).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Totale Kosten:</span>
                            <span className="font-medium">€{Math.round(results.totalCost).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold mb-3">Marktomstandigheden</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Huisprijs Inflatie Impact:</span>
                          <span className="font-medium">{results.inflationImpact}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Effectief Rendement:</span>
                          <span className="font-medium">{results.effectiveReturn.toFixed(1)}%</span>
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
                    <p className="text-muted-foreground text-center">Klik op "Bereken Huisdroom Plan" om resultaten te zien</p>
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