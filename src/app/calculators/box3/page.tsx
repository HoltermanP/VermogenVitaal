"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, ArrowRight, PiggyBank } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateBox3, type Box3Result } from "@/lib/calculators/box3"

export default function Box3CalculatorPage() {
  const [formData, setFormData] = useState({
    bankSavings: 50000,
    investments: 30000,
    otherAssets: 0,
    debts: 0,
    hasPartner: false
  })

  const [results, setResults] = useState<Box3Result | null>(null)

  const handleCalculate = () => {
    const result = calculateBox3(formData)
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
              <span className="text-gradient-financial">Box 3 Vermogensbelasting Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bereken je box 3 belasting over vermogen (2025 regeling)
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/box3" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3">
                    <PiggyBank className="h-5 w-5 text-white" />
                  </div>
                  Vermogen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="bankSavings">Spaargeld</Label>
                  <Input
                    id="bankSavings"
                    type="number"
                    value={formData.bankSavings}
                    onChange={(e) => setFormData({ ...formData, bankSavings: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="investments">Beleggingen</Label>
                  <Input
                    id="investments"
                    type="number"
                    value={formData.investments}
                    onChange={(e) => setFormData({ ...formData, investments: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="otherAssets">Andere Bezittingen</Label>
                  <Input
                    id="otherAssets"
                    type="number"
                    value={formData.otherAssets}
                    onChange={(e) => setFormData({ ...formData, otherAssets: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="debts">Schulden</Label>
                  <Input
                    id="debts"
                    type="number"
                    value={formData.debts}
                    onChange={(e) => setFormData({ ...formData, debts: parseFloat(e.target.value) || 0 })}
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

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Box 3
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
                      <h3 className="font-semibold mb-3">Vermogen</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Spaargeld:</span>
                          <span className="font-medium">€{Math.round(results.assets.bankSavings).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Beleggingen:</span>
                          <span className="font-medium">€{Math.round(results.assets.investments).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Totaal Bezittingen:</span>
                          <span className="font-medium">€{Math.round(results.assets.total).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Schulden:</span>
                          <span className="font-medium">€{Math.round(results.debts).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Netto Vermogen:</span>
                          <span className="font-semibold">€{Math.round(results.netAssets).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold mb-3">Belasting</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Heffingsvrije Voet:</span>
                          <span className="font-medium">€{Math.round(results.taxFreeAmount).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Belastbaar Vermogen:</span>
                          <span className="font-medium">€{Math.round(results.taxableAssets).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Forfaitair Rendement:</span>
                          <span className="font-medium">€{Math.round(results.assumedReturns.total).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Box 3 Belasting:</span>
                          <span className="font-semibold text-gradient-financial">€{Math.round(results.box3Tax).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Effectief Tarief:</span>
                          <span className="font-medium">{results.effectiveRate.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                    <p className="text-muted-foreground text-center">Klik op &quot;Bereken Box 3&quot; om resultaten te zien</p>
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

