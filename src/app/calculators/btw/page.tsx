"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, ArrowRight, Receipt } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateBTW, type BTWResult } from "@/lib/calculators/btw"

export default function BTWCalculatorPage() {
  const [formData, setFormData] = useState({
    amount: 1000,
    rate: 'high' as 'high' | 'low' | 'zero',
    calculation: 'incl' as 'incl' | 'excl' | 'refund',
    isSmallBusiness: false,
    annualTurnover: 0
  })

  const [results, setResults] = useState<BTWResult | null>(null)

  const handleCalculate = () => {
    const result = calculateBTW(formData)
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
              <span className="text-gradient-financial">BTW Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bereken BTW inclusief/exclusief of BTW-teruggaaf
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/btw" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3">
                    <Receipt className="h-5 w-5 text-white" />
                  </div>
                  BTW Berekening
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="calculation">Berekening Type</Label>
                  <Select value={formData.calculation} onValueChange={(value: 'incl' | 'excl' | 'refund') => setFormData({ ...formData, calculation: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incl">Bedrag Inclusief BTW</SelectItem>
                      <SelectItem value="excl">Bedrag Exclusief BTW</SelectItem>
                      <SelectItem value="refund">BTW Teruggaaf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Bedrag</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="rate">BTW Tarief</Label>
                  <Select value={formData.rate} onValueChange={(value: 'high' | 'low' | 'zero') => setFormData({ ...formData, rate: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">21% (Algemeen)</SelectItem>
                      <SelectItem value="low">9% (Verlaagd)</SelectItem>
                      <SelectItem value="zero">0% (Nultarief)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isSmallBusiness"
                    checked={formData.isSmallBusiness}
                    onCheckedChange={(checked) => setFormData({ ...formData, isSmallBusiness: checked as boolean })}
                  />
                  <Label htmlFor="isSmallBusiness">Kleineondernemersregeling</Label>
                </div>

                {formData.isSmallBusiness && (
                  <div>
                    <Label htmlFor="annualTurnover">Jaarlijkse Omzet</Label>
                    <Input
                      id="annualTurnover"
                      type="number"
                      value={formData.annualTurnover}
                      onChange={(e) => setFormData({ ...formData, annualTurnover: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                )}

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken BTW
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
                      <h3 className="font-semibold mb-3">BTW Berekening</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bedrag Exclusief BTW:</span>
                          <span className="font-medium">€{results.amountExcl.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">BTW ({results.ratePercentage}):</span>
                          <span className="font-medium">€{results.btwAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Bedrag Inclusief BTW:</span>
                          <span className="font-semibold text-gradient-financial">€{results.amountIncl.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    {results.refund !== undefined && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-3">BTW Teruggaaf</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">BTW Teruggaaf:</span>
                            <span className="font-semibold text-green-600">€{Math.round(results.refund).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {results.smallBusinessExemption && (
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <p className="text-sm text-green-600">Je komt in aanmerking voor de kleineondernemersregeling</p>
                      </div>
                    )}

                    {results.advice.length > 0 && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-2">Informatie</h3>
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
                    <p className="text-muted-foreground text-center">Klik op &quot;Bereken BTW&quot; om resultaten te zien</p>
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

