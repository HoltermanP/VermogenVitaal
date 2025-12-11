"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, Target, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { calculateEarlyRetirement, type EarlyRetirementInput } from "@/lib/calculators/early-retirement"

export default function EarlyRetirementCalculatorPage() {
  const [formData, setFormData] = useState<EarlyRetirementInput>({
    currentAge: 35,
    desiredRetirementAge: 50,
    currentSavings: 100000,
    monthlySavings: 2000,
    expectedAnnualReturn: 7,
    annualExpenses: 40000,
    hasPartner: false,
    partnerIncome: 0,
    inflationRate: 2
  })

  const [results, setResults] = useState<ReturnType<typeof calculateEarlyRetirement> | null>(null)

  const handleCalculate = () => {
    const result = calculateEarlyRetirement(formData)
    setResults(result)
  }

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'challenging': return 'text-yellow-600'
      case 'unlikely': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              <span className="text-gradient-financial">Vroegpensioen Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bereken de kosten en haalbaarheid van vervroegd pensioen (FIRE)
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/vroegpensioen" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Calculator className="mr-3 h-6 w-6 text-primary" />
                  Invoer Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentAge">Huidige Leeftijd</Label>
                    <Input
                      id="currentAge"
                      type="number"
                      value={formData.currentAge}
                      onChange={(e) => setFormData({...formData, currentAge: Number(e.target.value)})}
                      placeholder="35"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desiredRetirementAge">Gewenste Pensioneringsleeftijd</Label>
                    <Input
                      id="desiredRetirementAge"
                      type="number"
                      value={formData.desiredRetirementAge}
                      onChange={(e) => setFormData({...formData, desiredRetirementAge: Number(e.target.value)})}
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentSavings">Huidige Spaargelden (€)</Label>
                    <Input
                      id="currentSavings"
                      type="number"
                      value={formData.currentSavings}
                      onChange={(e) => setFormData({...formData, currentSavings: Number(e.target.value)})}
                      placeholder="100000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlySavings">Maandelijkse Bijdrage (€)</Label>
                    <Input
                      id="monthlySavings"
                      type="number"
                      value={formData.monthlySavings}
                      onChange={(e) => setFormData({...formData, monthlySavings: Number(e.target.value)})}
                      placeholder="2000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedAnnualReturn">Verwacht Jaarlijks Rendement (%)</Label>
                    <Input
                      id="expectedAnnualReturn"
                      type="number"
                      step="0.1"
                      value={formData.expectedAnnualReturn}
                      onChange={(e) => setFormData({...formData, expectedAnnualReturn: Number(e.target.value)})}
                      placeholder="7"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualExpenses">Jaarlijkse Uitgaven (€)</Label>
                    <Input
                      id="annualExpenses"
                      type="number"
                      value={formData.annualExpenses}
                      onChange={(e) => setFormData({...formData, annualExpenses: Number(e.target.value)})}
                      placeholder="40000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inflationRate">Inflatie (%)</Label>
                    <Input
                      id="inflationRate"
                      type="number"
                      step="0.1"
                      value={formData.inflationRate}
                      onChange={(e) => setFormData({...formData, inflationRate: Number(e.target.value)})}
                      placeholder="2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerIncome">Partner Jaarinkomen (€)</Label>
                    <Input
                      id="partnerIncome"
                      type="number"
                      value={formData.partnerIncome}
                      onChange={(e) => setFormData({...formData, partnerIncome: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasPartner"
                    checked={formData.hasPartner}
                    onChange={(e) => setFormData({ ...formData, hasPartner: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="hasPartner">Partner situatie meenemen</Label>
                </div>

                <Button
                  onClick={handleCalculate}
                  className="w-full py-3 text-lg font-semibold gradient-financial text-white border-0 shadow-financial hover:shadow-financial-lg transition-all duration-300"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Bereken Vroegpensioen
                </Button>
              </CardContent>
            </Card>

            {results && (
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <TrendingUp className="mr-3 h-6 w-6 text-primary" />
                    Vroegpensioen Resultaten
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">FIRE Nummer</p>
                      <p className="text-2xl font-bold text-primary">€{Math.round(results.fireNumber).toLocaleString('nl-NL')}</p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Benodigd Kapitaal</p>
                      <p className="text-2xl font-bold text-primary">€{Math.round(results.requiredCapital).toLocaleString('nl-NL')}</p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Proj. Vermogen</p>
                      <p className="text-2xl font-bold text-primary">€{Math.round(results.projectedSavings).toLocaleString('nl-NL')}</p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Tijd tot FIRE</p>
                      <p className="text-2xl font-bold text-primary">{results.timeToFIRE.toFixed(1)} jaar</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-muted-foreground mb-1">Haalbaarheid</p>
                    <p className={`text-3xl font-bold capitalize ${getFeasibilityColor(results.feasibility)}`}>
                      {results.feasibility === 'excellent' ? 'Uitstekend' :
                       results.feasibility === 'good' ? 'Goed' :
                       results.feasibility === 'challenging' ? 'Uitdagend' : 'Onwaarschijnlijk'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Safe withdrawal rate: {results.safeWithdrawalRate}%
                    </p>
                  </div>

                  {results.shortfall > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-muted-foreground mb-1">Ontbrekend Kapitaal</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        €{Math.round(results.shortfall).toLocaleString('nl-NL')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Extra maandelijks sparen: €{Math.round(results.additionalMonthlySavings).toLocaleString('nl-NL')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {results && results.advice.length > 0 && (
            <div className="bg-accent/10 border border-primary/20 rounded-2xl p-8 hover:border-primary/40 hover:shadow-financial-lg transition-all duration-500 mb-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 gradient-financial rounded-xl flex items-center justify-center mr-4 shadow-financial">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  💡 Vroegpensioen Strategieën
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">FIRE Benaderingen</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="text-muted-foreground">• Lean FIRE: €{Math.round(results.leanFIRE).toLocaleString('nl-NL')} (lage kosten)</li>
                    <li className="text-muted-foreground">• Coast FIRE: €{Math.round(results.coastFIRE).toLocaleString('nl-NL')} (stop met sparen)</li>
                    <li className="text-muted-foreground">• Fat FIRE: €{Math.round(results.fatFIRE).toLocaleString('nl-NL')} (hoge kosten)</li>
                    <li className="text-muted-foreground">• Barista FIRE: Deel werk + passief inkomen</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Praktische Tips</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="text-muted-foreground">• Bouw eerst 6-12 maanden buffer op</li>
                    <li className="text-muted-foreground">• Diversifieer investeringen</li>
                    <li className="text-muted-foreground">• Overweeg side hustles voor extra inkomen</li>
                    <li className="text-muted-foreground">• Plan zorgverzekering zonder werkgever</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-lg mb-2">Persoonlijke Adviezen</h3>
                <ul className="space-y-1 text-sm">
                  {results.advice.map((item, idx) => (
                    <li key={idx} className="text-muted-foreground">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button className="flex-1 gradient-financial text-white" asChild>
              <Link href="/calculators">
                <ArrowRight className="h-4 w-4 mr-2" />
                Andere Calculator
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}