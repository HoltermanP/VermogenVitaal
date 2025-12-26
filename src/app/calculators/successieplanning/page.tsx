"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, ArrowRight, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateSuccessionPlanning, type SuccessionPlanningResult } from "@/lib/calculators/succession-planning"

export default function SuccessionPlanningPage() {
  const [formData, setFormData] = useState({
    currentAge: 60,
    totalEstate: 500000,
    beneficiaries: 2,
    desiredInheritance: 400000,
    yearsToTransfer: 10,
    annualGiftAmount: 12070,
    taxRate: 20
  })

  const [results, setResults] = useState<SuccessionPlanningResult | null>(null)

  const handleCalculate = () => {
    const result = calculateSuccessionPlanning({
      ...formData,
      taxRate: formData.taxRate / 100
    })
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
              <span className="text-gradient-financial">Successieplanning Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Plan overdracht vermogen aan volgende generatie
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/successieplanning" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Gegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="currentAge">Huidige Leeftijd</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    value={formData.currentAge}
                    onChange={(e) => setFormData({ ...formData, currentAge: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="totalEstate">Totaal Vermogen (€)</Label>
                  <Input
                    id="totalEstate"
                    type="number"
                    value={formData.totalEstate}
                    onChange={(e) => setFormData({ ...formData, totalEstate: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="beneficiaries">Aantal Begunstigden</Label>
                  <Input
                    id="beneficiaries"
                    type="number"
                    value={formData.beneficiaries}
                    onChange={(e) => setFormData({ ...formData, beneficiaries: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="desiredInheritance">Gewenste Erfenis (€)</Label>
                  <Input
                    id="desiredInheritance"
                    type="number"
                    value={formData.desiredInheritance}
                    onChange={(e) => setFormData({ ...formData, desiredInheritance: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="yearsToTransfer">Jaren voor Overdracht</Label>
                  <Input
                    id="yearsToTransfer"
                    type="number"
                    value={formData.yearsToTransfer}
                    onChange={(e) => setFormData({ ...formData, yearsToTransfer: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="annualGiftAmount">Jaarlijks Cadeau (€)</Label>
                  <Input
                    id="annualGiftAmount"
                    type="number"
                    value={formData.annualGiftAmount}
                    onChange={(e) => setFormData({ ...formData, annualGiftAmount: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="taxRate">Belastingtarief (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Successieplanning
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
                      <h3 className="font-semibold mb-3">Belastingen</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Erfbelasting:</span>
                          <span className="font-medium">€{Math.round(results.totalInheritanceTax).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cadeaubelasting:</span>
                          <span className="font-medium">€{Math.round(results.totalGiftTax).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Totale Belastingbesparing:</span>
                          <span className="font-semibold text-green-600">€{Math.round(results.totalTaxSavings).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold mb-3">Netto Overdracht</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Netto Erfenis:</span>
                          <span className="font-medium">€{Math.round(results.netInheritance).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Netto Cadeau:</span>
                          <span className="font-medium">€{Math.round(results.netGift).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold mb-3">Aanbeveling</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Aanbevolen Jaarlijks Cadeau:</span>
                          <span className="font-semibold text-gradient-financial">€{Math.round(results.recommendedAnnualGift).toLocaleString('nl-NL')}</span>
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
                    <p className="text-muted-foreground text-center">Klik op &quot;Bereken Successieplanning&quot; om resultaten te zien</p>
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
















