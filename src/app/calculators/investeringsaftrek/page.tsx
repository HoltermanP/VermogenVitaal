"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateInvestmentDeduction, type InvestmentDeductionResult } from "@/lib/calculators/investment-deduction"

export default function InvestmentDeductionCalculatorPage() {
  const [formData, setFormData] = useState({
    investmentAmount: 50000,
    investmentType: 'mia' as 'mia' | 'eia' | 'kia' | 'vamil',
    environmentalCategory: 'category1' as 'category1' | 'category2' | 'category3',
    energyCategory: 'category1' as 'category1' | 'category2' | 'category3'
  })

  const [results, setResults] = useState<InvestmentDeductionResult | null>(null)

  const handleCalculate = () => {
    const result = calculateInvestmentDeduction(formData)
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
              <span className="text-gradient-financial">Investeringsaftrek Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bereken MIA, EIA, KIA en VAMIL voordelen
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/investeringsaftrek" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Investering
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="investmentAmount">Investeringsbedrag</Label>
                  <Input
                    id="investmentAmount"
                    type="number"
                    value={formData.investmentAmount}
                    onChange={(e) => setFormData({ ...formData, investmentAmount: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="investmentType">Type Investeringsaftrek</Label>
                  <Select value={formData.investmentType} onValueChange={(value: 'mia' | 'eia' | 'kia' | 'vamil') => setFormData({ ...formData, investmentType: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mia">MIA (Milieu-investeringsaftrek)</SelectItem>
                      <SelectItem value="eia">EIA (Energie-investeringsaftrek)</SelectItem>
                      <SelectItem value="kia">KIA (Kleinschaligheidsinvesteringsaftrek)</SelectItem>
                      <SelectItem value="vamil">VAMIL (Willekeurige afschrijving)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.investmentType === 'mia' && (
                  <div>
                    <Label htmlFor="environmentalCategory">Milieu Categorie</Label>
                    <Select value={formData.environmentalCategory} onValueChange={(value: 'category1' | 'category2' | 'category3') => setFormData({ ...formData, environmentalCategory: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="category1">Categorie 1 (36%)</SelectItem>
                        <SelectItem value="category2">Categorie 2 (27%)</SelectItem>
                        <SelectItem value="category3">Categorie 3 (13%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.investmentType === 'eia' && (
                  <div>
                    <Label htmlFor="energyCategory">Energie Categorie</Label>
                    <Select value={formData.energyCategory} onValueChange={(value: 'category1' | 'category2' | 'category3') => setFormData({ ...formData, energyCategory: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="category1">Categorie 1 (45.5%)</SelectItem>
                        <SelectItem value="category2">Categorie 2 (36%)</SelectItem>
                        <SelectItem value="category3">Categorie 3 (27%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

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
                      <h3 className="font-semibold mb-3">Investeringsaftrek</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Investeringsbedrag:</span>
                          <span className="font-medium">€{Math.round(results.investmentAmount).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium">{results.deduction.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Percentage:</span>
                          <span className="font-medium">{(results.deduction.percentage * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Aftrekbedrag:</span>
                          <span className="font-semibold text-gradient-financial">€{Math.round(results.deduction.amount).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold mb-3">Belastingvoordeel</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Belastingbesparing:</span>
                          <span className="font-medium text-green-600">€{Math.round(results.taxSavings).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Netto Kosten:</span>
                          <span className="font-semibold">€{Math.round(results.netCost).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

                    {results.canCombine && (
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <p className="text-sm text-green-600">MIA/EIA kunnen gecombineerd worden met VAMIL</p>
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

