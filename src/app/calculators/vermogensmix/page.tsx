"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, Target, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { calculateWealthAllocation, type WealthAllocationInput } from "@/lib/calculators/wealth-allocation"

export default function WealthAllocationCalculatorPage() {
  const [formData, setFormData] = useState<WealthAllocationInput>({
    riskTolerance: 'moderate',
    timeHorizon: 20,
    currentAge: 35,
    annualIncome: 50000,
    currentSavings: 100000,
    monthlySavings: 1000,
    goalAmount: 1000000,
    expectedMarketReturn: 7,
    inflationRate: 2
  })

  const [results, setResults] = useState<ReturnType<typeof calculateWealthAllocation> | null>(null)

  const handleCalculate = () => {
    const result = calculateWealthAllocation(formData)
    setResults(result)
  }

  const getRiskDescription = (risk: string) => {
    switch (risk) {
      case 'conservative': return 'Focus op kapitaalbehoud, lagere risico\'s'
      case 'moderate': return 'Balans tussen groei en risico'
      case 'aggressive': return 'Hoog groeipotentieel, hogere risico\'s'
      default: return ''
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
              <span className="text-gradient-financial">Vermogensmix Optimalisatie</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Vind de optimale verdeling tussen sparen en beleggen gebaseerd op je situatie
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/vermogensmix" />
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
                    <Label htmlFor="timeHorizon">Beleggingshorizon (jaren)</Label>
                    <Input
                      id="timeHorizon"
                      type="number"
                      value={formData.timeHorizon}
                      onChange={(e) => setFormData({...formData, timeHorizon: Number(e.target.value)})}
                      placeholder="20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskTolerance">Risicotolerantie</Label>
                  <Select value={formData.riskTolerance} onValueChange={(value: any) => setFormData({...formData, riskTolerance: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservatief - Lage risico's</SelectItem>
                      <SelectItem value="moderate">Gematigd - Balans</SelectItem>
                      <SelectItem value="aggressive">Offensief - Hoge risico's</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{getRiskDescription(formData.riskTolerance)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annualIncome">Jaarinkomen (€)</Label>
                    <Input
                      id="annualIncome"
                      type="number"
                      value={formData.annualIncome}
                      onChange={(e) => setFormData({...formData, annualIncome: Number(e.target.value)})}
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentSavings">Huidig Vermogen (€)</Label>
                    <Input
                      id="currentSavings"
                      type="number"
                      value={formData.currentSavings}
                      onChange={(e) => setFormData({...formData, currentSavings: Number(e.target.value)})}
                      placeholder="100000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlySavings">Maandelijkse Bijdrage (€)</Label>
                    <Input
                      id="monthlySavings"
                      type="number"
                      value={formData.monthlySavings}
                      onChange={(e) => setFormData({...formData, monthlySavings: Number(e.target.value)})}
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goalAmount">Doelbedrag (€)</Label>
                    <Input
                      id="goalAmount"
                      type="number"
                      value={formData.goalAmount}
                      onChange={(e) => setFormData({...formData, goalAmount: Number(e.target.value)})}
                      placeholder="1000000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedMarketReturn">Verwacht Rendement (%)</Label>
                    <Input
                      id="expectedMarketReturn"
                      type="number"
                      step="0.1"
                      value={formData.expectedMarketReturn}
                      onChange={(e) => setFormData({...formData, expectedMarketReturn: Number(e.target.value)})}
                      placeholder="7"
                    />
                  </div>
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
                </div>

                <Button
                  onClick={handleCalculate}
                  className="w-full py-3 text-lg font-semibold gradient-financial text-white border-0 shadow-financial hover:shadow-financial-lg transition-all duration-300"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Bereken Optimale Mix
                </Button>
              </CardContent>
            </Card>

            {results && (
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <TrendingUp className="mr-3 h-6 w-6 text-primary" />
                    Aanbevolen Vermogensmix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Verwacht Rendement</p>
                      <p className="text-3xl font-bold text-primary">{results.expectedReturn}%</p>
                      <p className="text-xs text-muted-foreground">per jaar</p>
                    </div>
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Verwacht Risico</p>
                      <p className="text-3xl font-bold text-primary">{results.expectedRisk}%</p>
                      <p className="text-xs text-muted-foreground">per jaar</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-muted-foreground mb-1">Strategie</p>
                    <p className="text-xl font-bold text-green-700">
                      {results.riskAdjustedAllocation}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Proj. Eindvermogen</p>
                      <p className="text-2xl font-bold text-primary">€{Math.round(results.projectedValue).toLocaleString('nl-NL')}</p>
                    </div>
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Tijd tot Doel</p>
                      <p className="text-2xl font-bold text-primary">{results.timeToGoal.toFixed(1)} jaar</p>
                    </div>
                  </div>

                  {results.shortfall > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-muted-foreground mb-1">Ontbrekend Kapitaal</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        €{Math.round(results.shortfall).toLocaleString('nl-NL')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Extra maandelijks: €{Math.round(results.monthlyRequired).toLocaleString('nl-NL')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {results && (
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl mb-8">
              <CardHeader>
                <CardTitle>Aanbevolen Allocatie</CardTitle>
                <CardDescription>
                  Optimale verdeling van je vermogen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Cash', value: results.recommendedAllocation.cash, color: '#10b981' },
                        { name: 'Obligaties', value: results.recommendedAllocation.bonds, color: '#3b82f6' },
                        { name: 'Aandelen', value: results.recommendedAllocation.stocks, color: '#f59e0b' },
                        { name: 'Alternatieven', value: results.recommendedAllocation.alternatives, color: '#8b5cf6' }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Allocatie']} />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{results.recommendedAllocation.cash}%</div>
                    <div className="text-sm text-muted-foreground">Cash/Sparen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{results.recommendedAllocation.bonds}%</div>
                    <div className="text-sm text-muted-foreground">Obligaties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{results.recommendedAllocation.stocks}%</div>
                    <div className="text-sm text-muted-foreground">Aandelen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{results.recommendedAllocation.alternatives}%</div>
                    <div className="text-sm text-muted-foreground">Alternatieven</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {results && results.advice.length > 0 && (
            <div className="bg-accent/10 border border-primary/20 rounded-2xl p-8 hover:border-primary/40 hover:shadow-financial-lg transition-all duration-500 mb-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 gradient-financial rounded-xl flex items-center justify-center mr-4 shadow-financial">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  💡 Vermogensbeheer Tips
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Implementatie</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="text-muted-foreground">• {results.rebalancingFrequency} herbalanceren</li>
                    <li className="text-muted-foreground">• Gebruik ETF's voor spreiding</li>
                    <li className="text-muted-foreground">• Automatische incasso voor consistentie</li>
                    {results.advice.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Alternatieven</h3>
                  <ul className="space-y-1 text-sm">
                    {results.alternatives.map((item, idx) => (
                      <li key={idx} className="text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
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