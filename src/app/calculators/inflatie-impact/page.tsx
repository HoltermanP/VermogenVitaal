"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { calculateInflationImpact, type InflationImpactInput } from "@/lib/calculators/inflation-impact"

export default function InflationImpactCalculatorPage() {
  const [formData, setFormData] = useState<InflationImpactInput>({
    currentAmount: 100000,
    timeHorizon: 20,
    expectedInflation: 2,
    investmentReturn: 5,
    purpose: 'savings',
    adjustmentStrategy: 'none'
  })

  const [results, setResults] = useState<ReturnType<typeof calculateInflationImpact> | null>(null)

  const handleCalculate = () => {
    const result = calculateInflationImpact(formData)
    setResults(result)
  }

  const getPurposeDescription = (purpose: string) => {
    switch (purpose) {
      case 'savings': return 'Spaargeld voor later gebruik'
      case 'pension': return 'Pensioenopbouw'
      case 'investment': return 'Beleggingsportefeuille'
      case 'general': return 'Algemeen doel'
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
              <span className="text-gradient-financial">Inflatie Impact Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Toon de erosie van koopkracht door inflatie en effectief rendement
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/inflatie-impact" />
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
                    <Label htmlFor="currentAmount">Huidig Bedrag (€)</Label>
                    <Input
                      id="currentAmount"
                      type="number"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData({...formData, currentAmount: Number(e.target.value)})}
                      placeholder="100000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeHorizon">Looptijd (jaren)</Label>
                    <Input
                      id="timeHorizon"
                      type="number"
                      value={formData.timeHorizon}
                      onChange={(e) => setFormData({...formData, timeHorizon: Number(e.target.value)})}
                      placeholder="20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedInflation">Verwachte Inflatie (%)</Label>
                    <Input
                      id="expectedInflation"
                      type="number"
                      step="0.1"
                      value={formData.expectedInflation}
                      onChange={(e) => setFormData({...formData, expectedInflation: Number(e.target.value)})}
                      placeholder="2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="investmentReturn">Verwacht Rendement (%)</Label>
                    <Input
                      id="investmentReturn"
                      type="number"
                      step="0.1"
                      value={formData.investmentReturn}
                      onChange={(e) => setFormData({...formData, investmentReturn: Number(e.target.value)})}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Doel</Label>
                  <Select value={formData.purpose} onValueChange={(value: any) => setFormData({...formData, purpose: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Spaargeld</SelectItem>
                      <SelectItem value="pension">Pensioen</SelectItem>
                      <SelectItem value="investment">Beleggingen</SelectItem>
                      <SelectItem value="general">Algemeen</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{getPurposeDescription(formData.purpose)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adjustmentStrategy">Aanpassingsstrategie</Label>
                  <Select value={formData.adjustmentStrategy} onValueChange={(value: any) => setFormData({...formData, adjustmentStrategy: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Geen aanpassing</SelectItem>
                      <SelectItem value="partial">Gedeeltelijke compensatie</SelectItem>
                      <SelectItem value="full">Volledige compensatie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCalculate}
                  className="w-full py-3 text-lg font-semibold gradient-financial text-white border-0 shadow-financial hover:shadow-financial-lg transition-all duration-300"
                >
                  <TrendingDown className="mr-2 h-5 w-5" />
                  Bereken Inflatie Impact
                </Button>
              </CardContent>
            </Card>

            {results && (
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <TrendingUp className="mr-3 h-6 w-6 text-primary" />
                    Inflatie Analyse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Nominaal Eindbedrag</p>
                      <p className="text-2xl font-bold text-primary">€{Math.round(results.futureValue).toLocaleString('nl-NL')}</p>
                    </div>
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Reële Koopkracht</p>
                      <p className="text-2xl font-bold text-primary">€{Math.round(results.purchasingPower).toLocaleString('nl-NL')}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-muted-foreground mb-1">Koopkracht Erosie</p>
                    <p className="text-3xl font-bold text-red-700">
                      {results.inflationErosion}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Break-even rendement: {results.breakEvenReturn}% nodig
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Effectief Rendement</p>
                      <p className={`text-2xl font-bold ${results.realReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {results.realReturn.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Benodigde Aanpassing</p>
                      <p className="text-2xl font-bold text-primary">€{Math.round(results.requiredAdjustment).toLocaleString('nl-NL')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {results && results.yearlyBreakdown.length > 0 && (
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl mb-8">
              <CardHeader>
                <CardTitle>Koopkracht Ontwikkeling</CardTitle>
                <CardDescription>
                  Nominaal vs reëel vermogen over de tijd
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.yearlyBreakdown}>
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
                        formatter={(value: number) => [new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value), '']}
                        labelFormatter={(label) => `Jaar ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="nominalValue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Nominaal"
                      />
                      <Line
                        type="monotone"
                        dataKey="realValue"
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Reële waarde"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-center space-x-6 mt-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                    <span className="text-sm">Nominaal bedrag</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-red-600 mr-2" style={{height: '2px'}}></div>
                    <span className="text-sm">Reële koopkracht</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {results && results.advice.length > 0 && (
            <div className="bg-accent/10 border border-primary/20 rounded-2xl p-8 hover:border-primary/40 hover:shadow-financial-lg transition-all duration-500 mb-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 gradient-financial rounded-xl flex items-center justify-center mr-4 shadow-financial">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  💡 Inflatie Bescherming
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Beschermingsstrategieën</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="text-muted-foreground">• Inflatiegekoppelde obligaties (ILBs)</li>
                    <li className="text-muted-foreground">• Vastgoed investeringen</li>
                    <li className="text-muted-foreground">• Commodities en grondstoffen</li>
                    <li className="text-muted-foreground">• Aandelen met sterke balans</li>
                    <li className="text-muted-foreground">• Regelmatige herbelegging</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Persoonlijke Inzichten</h3>
                  <ul className="space-y-1 text-sm">
                    {results.advice.map((item, idx) => (
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