"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, Download } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type CalculationResults = {
  emz: {
    profit: number
    tax: number
    netResult: number
  }
  bv: {
    profit: number
    corpTax: number
    salaryTax: number
    dividendTax: number
    netResult: number
  }
  recommendation: string
  difference: number
}

export default function BVvsEMZCalculatorPage() {
  const [formData, setFormData] = useState({
    revenue: 150000,
    costs: 25000,
    legalForm: "zzp",
    salary: 50000,
    dividend: 30000
  })

  const [results, setResults] = useState<CalculationResults | null>(null)

  const calculateComparison = () => {
    const { revenue, costs, salary, dividend } = formData
    const profit = revenue - costs

    // EMZ calculation
    const emzTax = calculateIncomeTax(profit)
    const emzNetResult = profit - emzTax

    // BV calculation
    const bvCorpTax = profit * 0.19 // 19% vennootschapsbelasting
    const bvAfterTax = profit - bvCorpTax
    const salaryTax = calculateIncomeTax(salary)
    const dividendTax = dividend * 0.26 // 26% dividendbelasting
    const bvNetResult = bvAfterTax - salaryTax - dividendTax

    const recommendation = bvNetResult > emzNetResult ? "BV" : "EMZ"
    const difference = Math.abs(bvNetResult - emzNetResult)

    setResults({
      emz: {
        profit,
        tax: emzTax,
        netResult: emzNetResult
      },
      bv: {
        profit,
        corpTax: bvCorpTax,
        salaryTax,
        dividendTax,
        netResult: bvNetResult
      },
      recommendation,
      difference
    })
  }

  const calculateIncomeTax = (income: number) => {
    // Simplified Dutch income tax calculation
    if (income <= 73031) {
      return income * 0.37
    } else {
      return 73031 * 0.37 + (income - 73031) * 0.495
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        {/* Financial grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3 animate-fade-in">
              <span className="text-gradient-financial">BV vs EMZ Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in delay-200">
              Bereken of een BV of EMZ voordeliger is voor jouw situatie
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-300">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3 shadow-financial">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  Jouw Situatie
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Vul je gegevens in voor een nauwkeurige berekening
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="revenue" className="text-foreground">Jaarlijkse Omzet</Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={formData.revenue}
                    onChange={(e) => handleInputChange('revenue', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="costs" className="text-foreground">Jaarlijkse Kosten</Label>
                  <Input
                    id="costs"
                    type="number"
                    value={formData.costs}
                    onChange={(e) => handleInputChange('costs', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="legal-form" className="text-foreground">Huidige Rechtsvorm</Label>
                  <Select value={formData.legalForm} onValueChange={(value) => handleInputChange('legalForm', value)}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Selecteer rechtsvorm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zzp">ZZP</SelectItem>
                      <SelectItem value="eenmanszaak">Eenmanszaak</SelectItem>
                      <SelectItem value="bv">BV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="salary" className="text-foreground">Gewenst Salaris (BV)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dividend" className="text-foreground">Dividend Uitkering (BV)</Label>
                  <Input
                    id="dividend"
                    type="number"
                    value={formData.dividend}
                    onChange={(e) => handleInputChange('dividend', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <Button className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" size="lg" onClick={calculateComparison}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Vergelijking
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-400">
              <CardHeader>
                <CardTitle className="text-foreground">Berekeningsresultaten</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Vergelijking tussen BV en EMZ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results ? (
                    <>
                      {/* EMZ Results */}
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                        <h3 className="font-semibold text-foreground mb-2">Eenmanszaak</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Winst:</span>
                            <span className="font-medium text-foreground">€{results.emz.profit.toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Inkomstenbelasting:</span>
                            <span className="font-medium text-foreground">€{Math.round(results.emz.tax).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between border-t border-primary/20 pt-2">
                            <span className="font-semibold text-foreground">Netto Resultaat:</span>
                            <span className="font-semibold text-gradient-financial">€{Math.round(results.emz.netResult).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>

                      {/* BV Results */}
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                        <h3 className="font-semibold text-foreground mb-2">BV</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Winst:</span>
                            <span className="font-medium text-foreground">€{results.bv.profit.toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vennootschapsbelasting:</span>
                            <span className="font-medium text-foreground">€{Math.round(results.bv.corpTax).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Inkomstenbelasting (salaris):</span>
                            <span className="font-medium text-foreground">€{Math.round(results.bv.salaryTax).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dividendbelasting:</span>
                            <span className="font-medium text-foreground">€{Math.round(results.bv.dividendTax).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between border-t border-primary/20 pt-2">
                            <span className="font-semibold text-foreground">Netto Resultaat:</span>
                            <span className="font-semibold text-gradient-financial">€{Math.round(results.bv.netResult).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                        <h3 className="font-semibold text-foreground mb-2">Aanbeveling</h3>
                        <p className="text-sm text-muted-foreground">
                          Een {results.recommendation} is in jouw situatie <span className="font-semibold text-gradient-financial">€{Math.round(results.difference).toLocaleString('nl-NL')}</span> voordeliger per jaar.
                          {results.recommendation === "BV" && " Overweeg wel de extra administratie en kosten."}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <p className="text-muted-foreground text-center">Klik op &quot;Bereken Vergelijking&quot; om resultaten te zien</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/reports/generate?type=bv-vs-emz')
                          const data = await response.json()
                          if (data.downloadUrl) {
                            window.open(data.downloadUrl, '_blank')
                          }
                        } catch (error) {
                          console.error('Error generating report:', error)
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Rapport
                    </Button>
                    <Button variant="outline" className="flex-1 border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300" asChild>
                      <Link href="/calculators">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Andere Calculator
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Information */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-500">
              <CardHeader>
                <CardTitle className="text-foreground">Eenmanszaak Voordelen</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="text-muted-foreground">• Eenvoudige administratie</li>
                  <li className="text-muted-foreground">• Geen startkapitaal vereist</li>
                  <li className="text-muted-foreground">• Directe toegang tot winst</li>
                  <li className="text-muted-foreground">• Lagere oprichtingskosten</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-600">
              <CardHeader>
                <CardTitle className="text-foreground">BV Voordelen</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="text-muted-foreground">• Lagere vennootschapsbelasting</li>
                  <li className="text-muted-foreground">• Beperkte aansprakelijkheid</li>
                  <li className="text-muted-foreground">• Flexibiliteit in salaris/dividend</li>
                  <li className="text-muted-foreground">• Professionele uitstraling</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}