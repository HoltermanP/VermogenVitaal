"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, Download, ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateIncomeTax, type IncomeTaxResult } from "@/lib/calculators/income-tax"

export default function IncomeTaxCalculatorPage() {
  const [formData, setFormData] = useState({
    income: 50000,
    partnerIncome: undefined as number | undefined,
    mortgageInterest: undefined as number | undefined,
    studyCosts: undefined as number | undefined,
    donations: undefined as number | undefined,
    pensionPremiums: undefined as number | undefined,
    age: 35,
    hasPartner: false,
    bothWorking: false
  })

  const [results, setResults] = useState<IncomeTaxResult | null>(null)

  const handleCalculate = () => {
    const result = calculateIncomeTax(formData)
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
              <span className="text-gradient-financial">Inkomstenbelasting Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bereken je inkomstenbelasting met heffingskortingen en aftrekposten
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/inkomstenbelasting" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Jouw Gegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPartner"
                    checked={formData.hasPartner}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasPartner: checked as boolean })}
                  />
                  <Label htmlFor="hasPartner">Ik heb een fiscale partner</Label>
                </div>

                {formData.hasPartner && (
                  <>
                    <div>
                      <Label htmlFor="partnerIncome">Partner Inkomen</Label>
                      <Input
                        id="partnerIncome"
                        type="number"
                        value={formData.partnerIncome ?? ''}
                        onChange={(e) => setFormData({ ...formData, partnerIncome: e.target.value === '' ? undefined : parseFloat(e.target.value) || 0 })}
                        placeholder=""
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bothWorking"
                        checked={formData.bothWorking}
                        onCheckedChange={(checked) => setFormData({ ...formData, bothWorking: checked as boolean })}
                      />
                      <Label htmlFor="bothWorking">Beide werken</Label>
                    </div>
                  </>
                )}

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
                  <Label htmlFor="mortgageInterest">Hypotheekrente (jaar)</Label>
                  <Input
                    id="mortgageInterest"
                    type="number"
                    value={formData.mortgageInterest ?? ''}
                    onChange={(e) => setFormData({ ...formData, mortgageInterest: e.target.value === '' ? undefined : parseFloat(e.target.value) || 0 })}
                    placeholder=""
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="studyCosts">Studiekosten</Label>
                  <Input
                    id="studyCosts"
                    type="number"
                    value={formData.studyCosts ?? ''}
                    onChange={(e) => setFormData({ ...formData, studyCosts: e.target.value === '' ? undefined : parseFloat(e.target.value) || 0 })}
                    placeholder=""
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="donations">Giften (min €60)</Label>
                  <Input
                    id="donations"
                    type="number"
                    value={formData.donations ?? ''}
                    onChange={(e) => setFormData({ ...formData, donations: e.target.value === '' ? undefined : parseFloat(e.target.value) || 0 })}
                    placeholder=""
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="pensionPremiums">Pensioenpremies</Label>
                  <Input
                    id="pensionPremiums"
                    type="number"
                    value={formData.pensionPremiums ?? ''}
                    onChange={(e) => setFormData({ ...formData, pensionPremiums: e.target.value === '' ? undefined : parseFloat(e.target.value) || 0 })}
                    placeholder=""
                    className="mt-1"
                  />
                </div>

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Belasting
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
                      <h3 className="font-semibold mb-3">Belastingoverzicht</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bruto Inkomen:</span>
                          <span className="font-medium">€{Math.round(results.grossIncome).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aftrekposten:</span>
                          <span className="font-medium">€{Math.round(results.deductions.total).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Belastbaar Inkomen:</span>
                          <span className="font-medium">€{Math.round(results.taxableIncome).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Inkomstenbelasting:</span>
                          <span className="font-medium">€{Math.round(results.incomeTax.total).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Heffingskortingen:</span>
                          <span className="font-medium text-green-600">-€{Math.round(results.taxCredits.total).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Netto Inkomen:</span>
                          <span className="font-semibold text-gradient-financial">€{Math.round(results.netIncome).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold mb-3">Tarieven</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Effectief Tarief:</span>
                          <span className="font-medium">{results.effectiveRate.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Marginaal Tarief:</span>
                          <span className="font-medium">{results.marginalRate.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                    <p className="text-muted-foreground text-center">Klik op &quot;Bereken Belasting&quot; om resultaten te zien</p>
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

