"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, ArrowRight, Download, TrendingUp, PiggyBank } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"

type CalculationResults = {
  // Legacy comparison (kept for backward compatibility)
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
  validationError?: string
  // New investment scenario results
  investmentComparison: {
    bvScenario: {
      initialInvestment: number
      box3Tax: number
      finalValue: number
      dividendPayout: number
      dividendTax: number
      netPayout: number
      totalNetResult: number
    }
    emzScenario: {
      initialInvestment: number
      box3Tax: number
      finalValue: number
      netResult: number
    }
    recommendation: string
    difference: number
  }
}

export default function BVvsEMZCalculatorPage() {
  const [formData, setFormData] = useState({
    revenue: 150000,
    costs: 25000,
    legalForm: "zzp",
    salary: 50000,
    dividend: 30000,
    // New investment parameters
    investmentPeriod: 5, // years
    annualReturn: 7, // percentage
    otherAssets: 50000 // other assets for Box 3 calculation
  })

  const [results, setResults] = useState<CalculationResults | null>(null)

  const calculateComparison = () => {
    const { revenue, costs, salary, dividend, investmentPeriod, annualReturn, otherAssets } = formData
    const profit = revenue - costs

    // EMZ calculation (legacy)
    const emzTax = calculateIncomeTax(profit)
    const emzNetResult = profit - emzTax

    // BV calculation (legacy)
    const bvCorpTax = calculateCorporateTax(profit)
    const bvAfterTax = profit - bvCorpTax
    const salaryTax = calculateIncomeTax(salary)
    const dividendTax = dividend * 0.265 // 26.5% dividendbelasting

    // Validate that salary + dividend equals bvAfterTax
    let validationError: string | undefined
    const totalDistributed = salary + dividend
    if (Math.abs(totalDistributed - bvAfterTax) > 1) { // Allow small rounding differences
      validationError = `Salaris (€${salary.toLocaleString('nl-NL')}) + Dividend (€${dividend.toLocaleString('nl-NL')}) = €${totalDistributed.toLocaleString('nl-NL')} moet gelijk zijn aan de winst na vennootschapsbelasting (€${Math.round(bvAfterTax).toLocaleString('nl-NL')})`
    }

    const bvNetResult = (salary - salaryTax) + (dividend - dividendTax)

    const recommendation = bvNetResult > emzNetResult ? "BV" : "EMZ"
    const difference = Math.abs(bvNetResult - emzNetResult)

    // New investment scenario calculations
    const investmentComparison = calculateInvestmentScenarios(profit, bvCorpTax, investmentPeriod, annualReturn, otherAssets)

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
      difference,
      validationError,
      investmentComparison
    })
  }

  const calculateInvestmentScenarios = (profit: number, bvCorpTax: number, period: number, annualReturn: number, otherAssets: number) => {
    // BV Scenario: Profit stays in BV, invested, then dividend payout
    const bvInitialInvestment = profit - bvCorpTax
    let bvCurrentValue = bvInitialInvestment
    let bvTotalBox3Tax = 0

    // Calculate compound growth and Box 3 tax each year
    for (let year = 1; year <= period; year++) {
      // Box 3 tax on current value
      const box3Tax = calculateBox3Tax(bvCurrentValue, otherAssets)
      bvTotalBox3Tax += box3Tax

      // Growth after tax
      bvCurrentValue = bvCurrentValue * (1 + annualReturn / 100) - box3Tax
    }

    // Dividend payout at end
    const bvDividendPayout = bvCurrentValue
    const bvDividendTax = bvDividendPayout * 0.265
    const bvNetPayout = bvDividendPayout - bvDividendTax
    const bvTotalNetResult = bvNetPayout // This is the final amount available for personal use

    // EMZ Scenario: Profit goes to private, invested, stays private
    const emzInitialInvestment = profit - calculateIncomeTax(profit)
    let emzCurrentValue = emzInitialInvestment
    let emzTotalBox3Tax = 0

    // Calculate compound growth and Box 3 tax each year
    for (let year = 1; year <= period; year++) {
      // Box 3 tax on current value
      const box3Tax = calculateBox3Tax(emzCurrentValue, otherAssets)
      emzTotalBox3Tax += box3Tax

      // Growth after tax
      emzCurrentValue = emzCurrentValue * (1 + annualReturn / 100) - box3Tax
    }

    const emzNetResult = emzCurrentValue // Already private, no additional dividend tax

    const investmentRecommendation = bvTotalNetResult > emzNetResult ? "BV" : "EMZ"
    const investmentDifference = Math.abs(bvTotalNetResult - emzNetResult)

    return {
      bvScenario: {
        initialInvestment: bvInitialInvestment,
        box3Tax: bvTotalBox3Tax,
        finalValue: bvCurrentValue,
        dividendPayout: bvDividendPayout,
        dividendTax: bvDividendTax,
        netPayout: bvNetPayout,
        totalNetResult: bvTotalNetResult
      },
      emzScenario: {
        initialInvestment: emzInitialInvestment,
        box3Tax: emzTotalBox3Tax,
        finalValue: emzCurrentValue,
        netResult: emzNetResult
      },
      recommendation: investmentRecommendation,
      difference: investmentDifference
    }
  }

  const calculateIncomeTax = (income: number) => {
    // Dutch income tax calculation 2025
    if (income <= 75518) {
      return income * 0.3697
    } else {
      return 75518 * 0.3697 + (income - 75518) * 0.495
    }
  }

  const calculateCorporateTax = (profit: number) => {
    // Dutch corporate tax calculation 2025
    if (profit <= 200000) {
      return profit * 0.19
    } else {
      return 200000 * 0.19 + (profit - 200000) * 0.258
    }
  }

  const calculateBox3Tax = (assets: number, otherAssets: number = 0) => {
    // Dutch Box 3 tax calculation 2025
    // Heffingsvrije voet: €57.000 per persoon
    // Forfaitair rendement beleggingen: 6,17%
    // Belastingtarief: 36%

    const totalAssets = assets + otherAssets
    const taxableAssets = Math.max(0, totalAssets - 57000)

    // Forfaitair rendement op beleggingen
    const fictitiousReturn = taxableAssets * 0.0617

    // Belasting over fictief rendement
    return fictitiousReturn * 0.36
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
              <span className="text-gradient-financial">BV vs EMZ Beleggingscalculator</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in delay-200">
              Vergelijk BV vs eenmanszaak voor direct gebruik én voor beleggingsscenario&apos;s met Box 3 belasting
            </p>
          </div>

          {/* News Ticker - Compact */}
          <div className="mb-6">
            <NewsTicker pagePath="/calculators/bv-vs-emz" />
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

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Beleggingsscenario Parameters</h3>

                  <div>
                    <Label htmlFor="investment-period" className="text-foreground">Beleggingsperiode (jaren)</Label>
                    <Input
                      id="investment-period"
                      type="number"
                      value={formData.investmentPeriod}
                      onChange={(e) => handleInputChange('investmentPeriod', parseInt(e.target.value) || 1)}
                      className="mt-1"
                      min="1"
                      max="30"
                    />
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="annual-return" className="text-foreground">Jaarlijks Rendement (%)</Label>
                    <Input
                      id="annual-return"
                      type="number"
                      step="0.1"
                      value={formData.annualReturn}
                      onChange={(e) => handleInputChange('annualReturn', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="other-assets" className="text-foreground">Overige Bezittingen (Box 3)</Label>
                    <Input
                      id="other-assets"
                      type="number"
                      value={formData.otherAssets}
                      onChange={(e) => handleInputChange('otherAssets', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Andere bezittingen voor Box 3 belastingberekening</p>
                  </div>
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
                  Vergelijking tussen BV en EMZ scenario&apos;s
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="legacy" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="legacy" className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Direct Vergelijking
                    </TabsTrigger>
                    <TabsTrigger value="investment" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Beleggingsscenario
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="legacy" className="space-y-6">
                    {results ? (
                      <>
                        {results.validationError && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <h3 className="font-semibold text-red-800 mb-2">Validatie Fout</h3>
                            <p className="text-sm text-red-700">{results.validationError}</p>
                            <p className="text-sm text-red-600 mt-2">
                              Pas de salaris- en dividendbedragen aan zodat ze gelijk zijn aan de winst na vennootschapsbelasting.
                            </p>
                          </div>
                        )}

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
                  </TabsContent>

                  <TabsContent value="investment" className="space-y-6">
                    {results?.investmentComparison ? (
                      <>
                        {/* BV Investment Scenario */}
                        <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <PiggyBank className="h-4 w-4" />
                            BV-scenario: Beleggen in BV-holding
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Initiële investering:</span>
                              <span className="font-medium text-foreground">€{Math.round(results.investmentComparison.bvScenario.initialInvestment).toLocaleString('nl-NL')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Totale Box 3 belasting ({formData.investmentPeriod} jaar):</span>
                              <span className="font-medium text-foreground">€{Math.round(results.investmentComparison.bvScenario.box3Tax).toLocaleString('nl-NL')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Eindwaarde na {formData.investmentPeriod} jaar:</span>
                              <span className="font-medium text-foreground">€{Math.round(results.investmentComparison.bvScenario.finalValue).toLocaleString('nl-NL')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Dividenduitkering:</span>
                              <span className="font-medium text-foreground">€{Math.round(results.investmentComparison.bvScenario.dividendPayout).toLocaleString('nl-NL')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Dividendbelasting (26,5%):</span>
                              <span className="font-medium text-foreground">€{Math.round(results.investmentComparison.bvScenario.dividendTax).toLocaleString('nl-NL')}</span>
                            </div>
                            <div className="flex justify-between border-t border-primary/20 pt-2">
                              <span className="font-semibold text-foreground">Netto Eindresultaat:</span>
                              <span className="font-semibold text-gradient-financial">€{Math.round(results.investmentComparison.bvScenario.totalNetResult).toLocaleString('nl-NL')}</span>
                            </div>
                          </div>
                        </div>

                        {/* EMZ Investment Scenario */}
                        <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <PiggyBank className="h-4 w-4" />
                            EMZ-scenario: Beleggen in privé
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Initiële investering:</span>
                              <span className="font-medium text-foreground">€{Math.round(results.investmentComparison.emzScenario.initialInvestment).toLocaleString('nl-NL')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Totale Box 3 belasting ({formData.investmentPeriod} jaar):</span>
                              <span className="font-medium text-foreground">€{Math.round(results.investmentComparison.emzScenario.box3Tax).toLocaleString('nl-NL')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Eindwaarde na {formData.investmentPeriod} jaar:</span>
                              <span className="font-medium text-foreground">€{Math.round(results.investmentComparison.emzScenario.finalValue).toLocaleString('nl-NL')}</span>
                            </div>
                            <div className="flex justify-between border-t border-primary/20 pt-2">
                              <span className="font-semibold text-foreground">Netto Eindresultaat:</span>
                              <span className="font-semibold text-gradient-financial">€{Math.round(results.investmentComparison.emzScenario.netResult).toLocaleString('nl-NL')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Investment Recommendation */}
                        <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                          <h3 className="font-semibold text-foreground mb-2">Beleggingsaanbeveling</h3>
                          <p className="text-sm text-muted-foreground">
                            Over {formData.investmentPeriod} jaar beleggen is een {results.investmentComparison.recommendation} in jouw situatie <span className="font-semibold text-gradient-financial">€{Math.round(results.investmentComparison.difference).toLocaleString('nl-NL')}</span> voordeliger.
                            {results.investmentComparison.recommendation === "BV" && " De BV heeft echter extra dividendbelasting bij uitkering."}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <p className="text-muted-foreground text-center">Klik op &quot;Bereken Vergelijking&quot; om resultaten te zien</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex gap-3 mt-6">
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