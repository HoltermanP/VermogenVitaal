"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, ArrowRight, Download, TrendingUp, Building2, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateBvVsPrivateInvestment, type BvVsPrivateInvestmentResult } from "@/lib/calculators/bv-vs-private-investment"

export default function BvVsPrivateInvestmentCalculatorPage() {
  const [formData, setFormData] = useState({
    annualIncome: 100000,
    expectedReturn: 7,
    holdingPeriod: 10,
    hasPartner: false
  })

  const [results, setResults] = useState<BvVsPrivateInvestmentResult | null>(null)

  const handleCalculate = () => {
    const result = calculateBvVsPrivateInvestment(formData)
    setResults(result)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3 animate-fade-in">
              <span className="text-gradient-financial">BV vs Eenmanszaak Beleggen Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in delay-200">
              Vergelijk rendementen tussen beleggen via BV (na VPB + dividendbelasting) versus eenmanszaak (na inkomstenbelasting + Box 3)
            </p>
          </div>

          {/* News Ticker - Compact */}
          <div className="mb-6">
            <NewsTicker pagePath="/calculators/bv-vs-prive" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-300">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3 shadow-financial">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  Beleggingsgegevens
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Vul je jaarlijkse inkomen in voor een realistische vergelijking tussen BV en eenmanszaak
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="annual-income" className="text-foreground">Jaarlijkse winst/inkomen</Label>
                  <Input
                    id="annual-income"
                    type="number"
                    value={formData.annualIncome}
                    onChange={(e) => setFormData({ ...formData, annualIncome: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                    placeholder="€100.000"
                  />
                </div>

                <div>
                  <Label htmlFor="expected-return" className="text-foreground">Verwacht Jaarlijks Rendement (%)</Label>
                  <Input
                    id="expected-return"
                    type="number"
                    step="0.1"
                    value={formData.expectedReturn}
                    onChange={(e) => setFormData({ ...formData, expectedReturn: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                    placeholder="7.0"
                  />
                </div>

                <div>
                  <Label htmlFor="holding-period" className="text-foreground">Beleggingshorizon (jaren)</Label>
                  <Input
                    id="holding-period"
                    type="number"
                    value={formData.holdingPeriod}
                    onChange={(e) => setFormData({ ...formData, holdingPeriod: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                    placeholder="10"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-partner"
                    checked={formData.hasPartner}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasPartner: checked as boolean })}
                  />
                  <Label htmlFor="has-partner">Ik heb een fiscale partner</Label>
                </div>

                <Button className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Vergelijk Opties
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-400">
              <CardHeader>
                <CardTitle className="text-foreground">Vergelijkingsresultaten</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Vergelijking tussen beleggen via eenmanszaak (na inkomstenbelasting) en BV (na VPB + dividendbelasting)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results ? (
                    <>
                      {/* Private Investment Results */}
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                        <div className="flex items-center mb-3">
                          <User className="h-5 w-5 text-primary mr-2" />
                          <h3 className="font-semibold text-foreground">Privé Beleggen</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Eindwaarde portfolio:</span>
                            <span className="font-medium text-foreground">{formatCurrency(results.private.finalValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Totaal belegd:</span>
                            <span className="font-medium text-foreground">{formatCurrency(results.private.finalValue - results.private.totalReturn)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Beleggingsrendement:</span>
                            <span className="font-medium text-foreground">{formatCurrency(results.private.totalReturn)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Box 3 belasting:</span>
                            <span className="font-medium text-red-600">-{formatCurrency(results.private.box3TaxPaid)}</span>
                          </div>
                          <div className="flex justify-between border-t border-primary/20 pt-2">
                            <span className="font-semibold text-foreground">Netto rendement:</span>
                            <span className="font-semibold text-gradient-financial">{formatCurrency(results.private.netReturn)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Effectief belastingtarief:</span>
                            <span className="font-medium">{results.private.effectiveTaxRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* BV Investment Results */}
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                        <div className="flex items-center mb-3">
                          <Building2 className="h-5 w-5 text-primary mr-2" />
                          <h3 className="font-semibold text-foreground">Beleggen via BV</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Eindwaarde portfolio:</span>
                            <span className="font-medium text-foreground">{formatCurrency(results.bv.finalValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Totaal belegd:</span>
                            <span className="font-medium text-foreground">{formatCurrency(results.bv.finalValue - results.bv.totalReturn)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Beleggingsrendement:</span>
                            <span className="font-medium text-foreground">{formatCurrency(results.bv.totalReturn)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vennootschapsbelasting:</span>
                            <span className="font-medium text-red-600">-{formatCurrency(results.bv.corpTaxPaid)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dividendbelasting:</span>
                            <span className="font-medium text-red-600">-{formatCurrency(results.bv.dividendTaxPaid)}</span>
                          </div>
                          <div className="flex justify-between border-t border-primary/20 pt-2">
                            <span className="font-semibold text-foreground">Netto rendement:</span>
                            <span className="font-semibold text-gradient-financial">{formatCurrency(results.bv.netReturn)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Effectief belastingtarief:</span>
                            <span className="font-medium">{results.bv.effectiveTaxRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className={`p-4 border rounded-xl transition-all duration-300 ${
                        results.comparison.recommendation === 'bv'
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-blue-500/10 border-blue-500/30'
                      }`}>
                        <h3 className="font-semibold text-foreground mb-2 flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Aanbeveling
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {results.comparison.recommendation === 'bv' ? 'Beleggen via BV' : 'Privé beleggen'} levert
                          <span className="font-semibold text-gradient-financial">
                            {' '}{formatCurrency(Math.abs(results.comparison.difference))}
                          </span>
                          {' '}{results.comparison.recommendation === 'bv' ? 'meer' : 'minder'} netto rendement op.
                        </p>
                        {results.comparison.percentageDifference !== 0 && (
                          <p className="text-sm text-muted-foreground">
                            Dit is een verschil van {Math.abs(results.comparison.percentageDifference).toFixed(1)}%.
                          </p>
                        )}
                      </div>

                      {/* Advice */}
                      {results.advice.length > 0 && (
                        <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                          <h3 className="font-semibold mb-2">💡 Inzichten</h3>
                          <ul className="space-y-1 text-sm">
                            {results.advice.map((item, idx) => (
                              <li key={idx} className="text-muted-foreground">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <p className="text-muted-foreground text-center">Klik op &quot;Vergelijk Opties&quot; om resultaten te zien</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/reports/generate?type=bv-vs-private-investment')
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
                <CardTitle className="text-foreground">Eenmanszaak Beleggen</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="text-muted-foreground">• Eerst inkomstenbelasting betalen (37% + 4.5% gemeente)</li>
                  <li className="text-muted-foreground">• Vervolgens Box 3 belasting over beleggingsrendement</li>
                  <li className="text-muted-foreground">• Eenvoudiger administratie</li>
                  <li className="text-muted-foreground">• Lagere opstartkosten</li>
                  <li className="text-muted-foreground">• Directe toegang tot vermogen</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-600">
              <CardHeader>
                <CardTitle className="text-foreground">BV Beleggen</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="text-muted-foreground">• Vennootschapsbelasting 25.9% over bedrijfsresultaat</li>
                  <li className="text-muted-foreground">• Dividendbelasting 26.5% bij uitkering</li>
                  <li className="text-muted-foreground">• Beperkte aansprakelijkheid</li>
                  <li className="text-muted-foreground">• Mogelijkheid tot salaris/dividend optimalisatie</li>
                  <li className="text-muted-foreground">• Professionele uitstraling en fiscale planning</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

