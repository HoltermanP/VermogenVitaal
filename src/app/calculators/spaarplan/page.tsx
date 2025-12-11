"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, PiggyBank, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { calculateSavingPlan, type SavingPlanInput } from "@/lib/calculators/saving-plan"

export default function SavingPlanCalculatorPage() {
  const [formData, setFormData] = useState<SavingPlanInput>({
    monthlyContribution: 500,
    targetAmount: 50000,
    currentSavings: 0,
    timeHorizonYears: 10,
    expectedReturn: 5,
    riskLevel: 'moderate',
    inflationRate: 2
  })

  const [results, setResults] = useState<ReturnType<typeof calculateSavingPlan> | null>(null)

  const handleCalculate = () => {
    const result = calculateSavingPlan(formData)
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              <span className="text-gradient-financial">Spaarplan Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Plan je spaardoelen met realistische rentepercentages en tijdschema's
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/spaarplan" />
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
                    <Label htmlFor="monthlyContribution">Maandelijkse Bijdrage (€)</Label>
                    <Input
                      id="monthlyContribution"
                      type="number"
                      value={formData.monthlyContribution}
                      onChange={(e) => setFormData({...formData, monthlyContribution: Number(e.target.value)})}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Doelbedrag (€)</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({...formData, targetAmount: Number(e.target.value)})}
                      placeholder="50000"
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
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeHorizonYears">Looptijd (jaren)</Label>
                    <Input
                      id="timeHorizonYears"
                      type="number"
                      value={formData.timeHorizonYears}
                      onChange={(e) => setFormData({...formData, timeHorizonYears: Number(e.target.value)})}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedReturn">Verwacht Rendement (%)</Label>
                    <Input
                      id="expectedReturn"
                      type="number"
                      step="0.1"
                      value={formData.expectedReturn}
                      onChange={(e) => setFormData({...formData, expectedReturn: Number(e.target.value)})}
                      placeholder="5"
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

                <div className="space-y-2">
                  <Label htmlFor="riskLevel">Risiconiveau</Label>
                  <Select value={formData.riskLevel} onValueChange={(value: any) => setFormData({...formData, riskLevel: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservatief (2-3% rendement)</SelectItem>
                      <SelectItem value="moderate">Gematigd (4-6% rendement)</SelectItem>
                      <SelectItem value="aggressive">Offensief (6-8% rendement)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCalculate}
                  className="w-full py-3 text-lg font-semibold gradient-financial text-white border-0 shadow-financial hover:shadow-financial-lg transition-all duration-300"
                >
                  <PiggyBank className="mr-2 h-5 w-5" />
                  Bereken Spaarschema
                </Button>
              </CardContent>
            </Card>

            {results && (
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <TrendingUp className="mr-3 h-6 w-6 text-primary" />
                    Spaarschema Resultaten
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Eindbedrag</p>
                      <p className="text-2xl font-bold text-primary">€{Math.round(results.finalAmount).toLocaleString('nl-NL')}</p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Totale Bijdragen</p>
                      <p className="text-2xl font-bold text-primary">€{Math.round(results.totalContributions).toLocaleString('nl-NL')}</p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Totale Rente</p>
                      <p className="text-2xl font-bold text-green-600">€{Math.round(results.totalInterest).toLocaleString('nl-NL')}</p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Tijd tot Doel</p>
                      <p className="text-2xl font-bold text-primary">{results.timeToReachGoal.toFixed(1)} jaar</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-muted-foreground mb-1">Effectief Rendement</p>
                    <p className="text-3xl font-bold text-green-700">
                      {results.effectiveReturn}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Na inflatiecorrectie van {results.inflationAdjustment}%
                    </p>
                  </div>

                  {results.monthlyRequired > formData.monthlyContribution && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-muted-foreground mb-1">Benodigd Maandelijks</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        €{Math.round(results.monthlyRequired).toLocaleString('nl-NL')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Om doel in {formData.timeHorizonYears} jaar te bereiken
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
                <CardTitle>Groeicurve</CardTitle>
                <CardDescription>
                  Ontwikkeling van je spaargeld over de tijd
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={results.yearlyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="year"
                        label={{ value: 'Jaren', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis
                        tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                        label={{ value: 'Bedrag (€)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        formatter={(value: number) => [new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value), 'Bedrag']}
                        labelFormatter={(label) => `Jaar ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {results && results.advice.length > 0 && (
            <div className="bg-accent/10 border border-primary/20 rounded-2xl p-8 hover:border-primary/40 hover:shadow-financial-lg transition-all duration-500 mb-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 gradient-financial rounded-xl flex items-center justify-center mr-4 shadow-financial">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  💡 Spaartips
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Strategieën</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="text-muted-foreground">• Automatische incasso voor consistente bijdragen</li>
                    <li className="text-muted-foreground">• Maandelijkse evaluatie en bijstelling</li>
                    <li className="text-muted-foreground">• Beloningen bij mijlpalen bereiken</li>
                    {results.advice.slice(0, 2).map((item, idx) => (
                      <li key={idx} className="text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Optimalisatie</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="text-muted-foreground">• Vergelijk spaarrentes regelmatig</li>
                    <li className="text-muted-foreground">• Overweeg deposito voor hogere rente</li>
                    <li className="text-muted-foreground">• Automatische renteherbelegging</li>
                    {results.advice.slice(2).map((item, idx) => (
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