"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, ArrowRight, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateSavingsChildren, type SavingsChildrenResult } from "@/lib/calculators/savings-children"

export default function SavingsChildrenPage() {
  const [formData, setFormData] = useState({
    childAge: 5,
    goalAge: 18,
    goalAmount: 50000,
    currentSavings: 5000,
    monthlyContribution: 200,
    expectedReturn: 4
  })

  const [results, setResults] = useState<SavingsChildrenResult | null>(null)

  const handleCalculate = () => {
    const result = calculateSavingsChildren({
      ...formData,
      expectedReturn: formData.expectedReturn / 100
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
              <span className="text-gradient-financial">Sparen voor Kinderen</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Plan spaargeld voor studiekosten of starterskapitaal
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/sparen-kinderen" />
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
                  <Label htmlFor="childAge">Huidige Leeftijd Kind</Label>
                  <Input
                    id="childAge"
                    type="number"
                    value={formData.childAge}
                    onChange={(e) => setFormData({ ...formData, childAge: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="goalAge">Doelleeftijd (bijv. 18 voor studie)</Label>
                  <Input
                    id="goalAge"
                    type="number"
                    value={formData.goalAge}
                    onChange={(e) => setFormData({ ...formData, goalAge: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="goalAmount">Spaardoel (€)</Label>
                  <Input
                    id="goalAmount"
                    type="number"
                    value={formData.goalAmount}
                    onChange={(e) => setFormData({ ...formData, goalAmount: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="currentSavings">Huidige Spaargeld (€)</Label>
                  <Input
                    id="currentSavings"
                    type="number"
                    value={formData.currentSavings}
                    onChange={(e) => setFormData({ ...formData, currentSavings: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyContribution">Maandelijkse Inleg (€)</Label>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    value={formData.monthlyContribution}
                    onChange={(e) => setFormData({ ...formData, monthlyContribution: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="expectedReturn">Verwacht Rendement (%)</Label>
                  <Input
                    id="expectedReturn"
                    type="number"
                    step="0.1"
                    value={formData.expectedReturn}
                    onChange={(e) => setFormData({ ...formData, expectedReturn: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Spaarplan
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
                      <h3 className="font-semibold mb-3">Spaarresultaat</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Jaren tot Doel:</span>
                          <span className="font-medium">{results.yearsToGoal} jaar</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Totaal Ingelegd:</span>
                          <span className="font-medium">€{Math.round(results.totalContributed).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Totale Rente:</span>
                          <span className="font-medium text-green-600">€{Math.round(results.totalInterest).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Eindbedrag:</span>
                          <span className="font-semibold text-gradient-financial">€{Math.round(results.finalAmount).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

                    {results.monthlyNeeded > 0 && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-3">Om Doel te Bereiken</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">Benodigde Maandelijkse Inleg:</span>
                            <span className="font-semibold text-gradient-financial">€{Math.round(results.monthlyNeeded).toLocaleString('nl-NL')}</span>
                          </div>
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
                    <p className="text-muted-foreground text-center">Klik op &quot;Bereken Spaarplan&quot; om resultaten te zien</p>
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











