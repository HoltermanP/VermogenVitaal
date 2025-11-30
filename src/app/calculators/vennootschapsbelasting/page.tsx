"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, ArrowRight, Building2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateCorporateTax, type CorporateTaxResult } from "@/lib/calculators/corporate-tax"

export default function CorporateTaxCalculatorPage() {
  const [formData, setFormData] = useState({
    profit: 150000,
    useMKBExemption: true,
    useInnovationBox: false,
    innovationProfit: 0
  })

  const [results, setResults] = useState<CorporateTaxResult | null>(null)

  const handleCalculate = () => {
    const result = calculateCorporateTax(formData)
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
              <span className="text-gradient-financial">Vennootschapsbelasting Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bereken vennootschapsbelasting met MKB-winstvrijstelling en innovatiebox
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/vennootschapsbelasting" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  BV Gegevens
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useMKBExemption"
                    checked={formData.useMKBExemption}
                    onCheckedChange={(checked) => setFormData({ ...formData, useMKBExemption: checked as boolean })}
                  />
                  <Label htmlFor="useMKBExemption">Gebruik MKB-winstvrijstelling</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useInnovationBox"
                    checked={formData.useInnovationBox}
                    onCheckedChange={(checked) => setFormData({ ...formData, useInnovationBox: checked as boolean })}
                  />
                  <Label htmlFor="useInnovationBox">Gebruik Innovatiebox</Label>
                </div>

                {formData.useInnovationBox && (
                  <div>
                    <Label htmlFor="innovationProfit">Innovatie Winst (max €350k)</Label>
                    <Input
                      id="innovationProfit"
                      type="number"
                      value={formData.innovationProfit}
                      onChange={(e) => setFormData({ ...formData, innovationProfit: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                )}

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken VPB
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
                      <h3 className="font-semibold mb-3">Vennootschapsbelasting</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bruto Winst:</span>
                          <span className="font-medium">€{Math.round(results.grossProfit).toLocaleString('nl-NL')}</span>
                        </div>
                        {results.mkbExemption > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">MKB-winstvrijstelling:</span>
                            <span className="font-medium text-green-600">-€{Math.round(results.mkbExemption).toLocaleString('nl-NL')}</span>
                          </div>
                        )}
                        {results.innovationBoxExemption > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Innovatiebox Besparing:</span>
                            <span className="font-medium text-green-600">-€{Math.round(results.innovationBoxExemption).toLocaleString('nl-NL')}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Belastbare Winst:</span>
                          <span className="font-medium">€{Math.round(results.taxableProfit).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">VPB Schijf 1 (19%):</span>
                          <span className="font-medium">€{Math.round(results.corporateTax.bracket1).toLocaleString('nl-NL')}</span>
                        </div>
                        {results.corporateTax.bracket2 > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">VPB Schijf 2 (25.8%):</span>
                            <span className="font-medium">€{Math.round(results.corporateTax.bracket2).toLocaleString('nl-NL')}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Totaal VPB:</span>
                          <span className="font-semibold">€{Math.round(results.corporateTax.total).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Effectief Tarief:</span>
                          <span className="font-medium">{results.effectiveRate.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Netto Winst:</span>
                          <span className="font-semibold text-gradient-financial">€{Math.round(results.netProfit).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

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
                    <p className="text-muted-foreground text-center">Klik op &quot;Bereken VPB&quot; om resultaten te zien</p>
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

