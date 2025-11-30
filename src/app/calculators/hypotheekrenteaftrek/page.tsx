"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, Home } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateMortgageInterest, type MortgageInterestResult } from "@/lib/calculators/mortgage-interest"

export default function MortgageInterestCalculatorPage() {
  const [formData, setFormData] = useState({
    mortgageAmount: 300000,
    interestRate: 3.5,
    mortgageType: 'annuity' as 'annuity' | 'linear' | 'other',
    mortgageYear: 2020,
    hasPartner: false,
    income: 50000
  })

  const [results, setResults] = useState<MortgageInterestResult | null>(null)

  const handleCalculate = () => {
    const result = calculateMortgageInterest(formData)
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
              <span className="text-gradient-financial">Hypotheekrenteaftrek Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bereken je hypotheekrenteaftrek en netto maandlast
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/hypotheekrenteaftrek" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  Hypotheekgegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="mortgageAmount">Hypotheekbedrag</Label>
                  <Input
                    id="mortgageAmount"
                    type="number"
                    value={formData.mortgageAmount}
                    onChange={(e) => setFormData({ ...formData, mortgageAmount: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="interestRate">Rentepercentage</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="mortgageType">Hypotheektype</Label>
                  <Select value={formData.mortgageType} onValueChange={(value: 'annuity' | 'linear' | 'other') => setFormData({ ...formData, mortgageType: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annuity">Annuïteitenhypotheek</SelectItem>
                      <SelectItem value="linear">Lineaire hypotheek</SelectItem>
                      <SelectItem value="other">Andere hypotheek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="mortgageYear">Jaar Hypotheek</Label>
                  <Input
                    id="mortgageYear"
                    type="number"
                    value={formData.mortgageYear}
                    onChange={(e) => setFormData({ ...formData, mortgageYear: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="income">Jaarlijks Inkomen</Label>
                  <Input
                    id="income"
                    type="number"
                    value={formData.income}
                    onChange={(e) => setFormData({ ...formData, income: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Aftrek
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
                      <h3 className="font-semibold mb-3">Hypotheekrente</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Jaarlijkse Rente:</span>
                          <span className="font-medium">€{Math.round(results.annualInterest).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aftrekbare Rente:</span>
                          <span className="font-medium">€{Math.round(results.deductibleInterest).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Belastingbesparing:</span>
                          <span className="font-semibold text-green-600">€{Math.round(results.taxSavings).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold mb-3">Maandlasten</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bruto Maandlast:</span>
                          <span className="font-medium">€{Math.round(results.grossMonthlyPayment).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Netto Maandlast:</span>
                          <span className="font-semibold text-gradient-financial">€{Math.round(results.netMonthlyPayment).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Effectief Rente:</span>
                          <span className="font-medium">{results.effectiveRate.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                    <p className="text-muted-foreground text-center">Klik op &quot;Bereken Aftrek&quot; om resultaten te zien</p>
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

