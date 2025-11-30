"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, PiggyBank } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateFiscalReserve, type FiscalReserveResult } from "@/lib/calculators/fiscal-reserve"

export default function FiscalReserveCalculatorPage() {
  const [formData, setFormData] = useState({
    profit: 100000,
    age: 40,
    reserveType: 'for' as 'for' | 'investment' | 'both',
    investmentReserveAmount: 0,
    yearsUntilRetirement: 25
  })

  const [results, setResults] = useState<FiscalReserveResult | null>(null)

  const handleCalculate = () => {
    const result = calculateFiscalReserve(formData)
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
              <span className="text-gradient-financial">Fiscale Reserve Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bereken FOR en investeringsreserve voordelen
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/fiscale-reserve" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3">
                    <PiggyBank className="h-5 w-5 text-white" />
                  </div>
                  Reserve Gegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="profit">Jaarlijkse Winst</Label>
                  <Input
                    id="profit"
                    type="number"
                    value={formData.profit}
                    onChange={(e) => setFormData({ ...formData, profit: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="age">Leeftijd</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="reserveType">Type Reserve</Label>
                  <Select value={formData.reserveType} onValueChange={(value: 'for' | 'investment' | 'both') => setFormData({ ...formData, reserveType: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="for">FOR (Fiscale Oudedagsreserve)</SelectItem>
                      <SelectItem value="investment">Investeringsreserve</SelectItem>
                      <SelectItem value="both">Beide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.reserveType === 'investment' || formData.reserveType === 'both') && (
                  <div>
                    <Label htmlFor="investmentReserveAmount">Investeringsreserve Bedrag</Label>
                    <Input
                      id="investmentReserveAmount"
                      type="number"
                      value={formData.investmentReserveAmount}
                      onChange={(e) => setFormData({ ...formData, investmentReserveAmount: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                )}

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Reserve
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
                    {results.for.available && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-3">FOR (Fiscale Oudedagsreserve)</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Maximum:</span>
                            <span className="font-medium">€{Math.round(results.for.maxAmount).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Aanbevolen:</span>
                            <span className="font-medium">€{Math.round(results.for.recommendedAmount).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">Belastinguitstel:</span>
                            <span className="font-semibold text-green-600">€{Math.round(results.for.taxDeferral).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {results.investment.available && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-3">Investeringsreserve</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bedrag:</span>
                            <span className="font-medium">€{Math.round(results.investment.amount).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">Belastinguitstel:</span>
                            <span className="font-semibold text-green-600">€{Math.round(results.investment.taxDeferral).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {results.totalTaxDeferral > 0 && (
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <h3 className="font-semibold mb-3 text-green-600">Totaal Belastinguitstel</h3>
                        <div className="text-2xl font-bold text-green-600">
                          €{Math.round(results.totalTaxDeferral).toLocaleString('nl-NL')}
                        </div>
                      </div>
                    )}

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
                    <p className="text-muted-foreground text-center">Klik op &quot;Bereken Reserve&quot; om resultaten te zien</p>
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

