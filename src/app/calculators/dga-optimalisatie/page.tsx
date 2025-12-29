"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, ArrowRight, Briefcase } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateDGAOptimization, type DGAOptimizationResult } from "@/lib/calculators/dga-optimization"

export default function DGAOptimizationCalculatorPage() {
  const [formData, setFormData] = useState({
    corporateProfit: 100000,
    desiredNetIncome: 50000,
    hasHolding: false,
    year: 2025 as 2025 | 2026
  })

  const [results, setResults] = useState<DGAOptimizationResult | null>(null)

  const handleCalculate = () => {
    const result = calculateDGAOptimization(formData)
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
              <span className="text-gradient-financial">DGA Salaris Optimalisatie Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bereken de meest gunstige verdeling tussen salaris en dividend op basis van je gewenste netto inkomen
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/dga-optimalisatie" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="corporateProfit">Winst BV</Label>
                  <Input
                    id="corporateProfit"
                    type="number"
                    value={formData.corporateProfit}
                    onChange={(e) => setFormData({ ...formData, corporateProfit: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="desiredNetIncome">Gewenst Netto Inkomen Privé</Label>
                  <Input
                    id="desiredNetIncome"
                    type="number"
                    value={formData.desiredNetIncome}
                    onChange={(e) => setFormData({ ...formData, desiredNetIncome: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Hoeveel wil je netto privé ontvangen?
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasHolding"
                    checked={formData.hasHolding}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasHolding: checked === true })}
                  />
                  <Label htmlFor="hasHolding" className="cursor-pointer">
                    Ik heb een holding BV
                  </Label>
                </div>

                <div>
                  <Label htmlFor="year">Jaar</Label>
                  <select
                    id="year"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) as 2025 | 2026 })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
                </div>

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Optimalisatie
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
                    {results.bestStrategy ? (
                      <>
                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                          <h3 className="font-semibold mb-3 text-green-600">Aanbevolen Strategie</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Strategie:</span>
                              <span className="font-medium">{results.bestStrategy.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Salaris:</span>
                              <span className="font-medium">€{Math.round(results.bestStrategy.salary).toLocaleString('nl-NL')}</span>
                            </div>
                            {results.bestStrategy.dividendToPrivate > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Dividend naar privé:</span>
                                <span className="font-medium">€{Math.round(results.bestStrategy.dividendToPrivate).toLocaleString('nl-NL')}</span>
                              </div>
                            )}
                            {results.bestStrategy.dividendToHolding > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Dividend naar holding:</span>
                                <span className="font-medium">€{Math.round(results.bestStrategy.dividendToHolding).toLocaleString('nl-NL')}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Vennootschapsbelasting:</span>
                              <span className="font-medium">€{Math.round(results.bestStrategy.corporateTax).toLocaleString('nl-NL')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Inkomstenbelasting:</span>
                              <span className="font-medium">€{Math.round(results.bestStrategy.salaryTax).toLocaleString('nl-NL')}</span>
                            </div>
                            {results.bestStrategy.dividendTax > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Dividendbelasting:</span>
                                <span className="font-medium">€{Math.round(results.bestStrategy.dividendTax).toLocaleString('nl-NL')}</span>
                              </div>
                            )}
                            <div className="flex justify-between border-t pt-2">
                              <span className="font-semibold">Totaal Belasting:</span>
                              <span className="font-semibold">€{Math.round(results.bestStrategy.totalTax).toLocaleString('nl-NL')}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="font-semibold">Netto Inkomen:</span>
                              <span className="font-semibold text-green-600">€{Math.round(results.bestStrategy.netIncome).toLocaleString('nl-NL')}</span>
                            </div>
                            {results.bestStrategy.remainingInBV > 0 && (
                              <div className="flex justify-between border-t pt-2">
                                <span className="text-muted-foreground">Resterend in BV:</span>
                                <span className="font-medium">€{Math.round(results.bestStrategy.remainingInBV).toLocaleString('nl-NL')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {results.strategies.length > 1 && (
                          <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                            <h3 className="font-semibold mb-3">Andere Strategieën</h3>
                            <div className="space-y-3">
                              {results.strategies
                                .filter(s => s !== results.bestStrategy)
                                .map((strategy, idx) => (
                                  <div key={idx} className="p-3 bg-background/50 rounded-lg border border-border">
                                    <div className="font-medium text-sm mb-2">{strategy.name}</div>
                                    <div className="text-xs space-y-1 text-muted-foreground">
                                      <div className="flex justify-between">
                                        <span>Salaris:</span>
                                        <span>€{Math.round(strategy.salary).toLocaleString('nl-NL')}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Totaal belasting:</span>
                                        <span>€{Math.round(strategy.totalTax).toLocaleString('nl-NL')}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Netto inkomen:</span>
                                        <span>€{Math.round(strategy.netIncome).toLocaleString('nl-NL')}</span>
                                      </div>
                                      {!strategy.isFeasible && (
                                        <div className="text-orange-500 text-xs mt-1">
                                          Niet haalbaar met gewenst netto inkomen
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                        <p className="text-orange-600 font-semibold">
                          Het gewenste netto inkomen is niet haalbaar met de huidige winst.
                        </p>
                      </div>
                    )}

                    {results.advice.length > 0 && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-2">Inzichten & Advies</h3>
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
                    <p className="text-muted-foreground text-center">Klik op &quot;Bereken Optimalisatie&quot; om resultaten te zien</p>
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
