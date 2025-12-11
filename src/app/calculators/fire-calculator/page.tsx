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
import { calculateFIRE, type FIRECalculatorInput } from "@/lib/calculators/fire-calculator"

export default function FIRECalculatorPage() {
  const [formData, setFormData] = useState<FIRECalculatorInput>({
    annualExpenses: 40000,
    currentSavings: 100000,
    monthlySavings: 2000,
    expectedReturn: 7,
    safeWithdrawalRate: 4,
    currentAge: 30,
    desiredRetirementAge: 50,
    inflationRate: 2,
    riskProfile: 'moderate'
  })

  const [results, setResults] = useState<ReturnType<typeof calculateFIRE> | null>(null)

  const handleCalculate = () => {
    const result = calculateFIRE(formData)
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
              <span className="text-gradient-financial">FIRE Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bereken wanneer je financieel onafhankelijk kunt zijn (Financial Independence Retire Early)
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/fire-calculator" />
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
                    <Label htmlFor="annualExpenses">Jaarlijkse Uitgaven (€)</Label>
                    <Input
                      id="annualExpenses"
                      type="number"
                      value={formData.annualExpenses}
                      onChange={(e) => setFormData({...formData, annualExpenses: Number(e.target.value)})}
                      placeholder="40000"
                    />
                  </div>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="expectedReturn">Verwacht Rendement (%)</Label>
                    <Input
                      id="expectedReturn"
                      type="number"
                      step="0.1"
                      value={formData.expectedReturn}
                      onChange={(e) => setFormData({...formData, expectedReturn: Number(e.target.value)})}
                      placeholder="7"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentAge">Huidige Leeftijd</Label>
                    <Input
                      id="currentAge"
                      type="number"
                      value={formData.currentAge}
                      onChange={(e) => setFormData({...formData, currentAge: Number(e.target.value)})}
                      placeholder="30"
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
                    <Label htmlFor="safeWithdrawalRate">Safe Withdrawal Rate (%)</Label>
                    <Select value={formData.safeWithdrawalRate.toString()} onValueChange={(value) => setFormData({...formData, safeWithdrawalRate: Number(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3% (Conservatief)</SelectItem>
                        <SelectItem value="3.5">3.5% (Voorzichtig)</SelectItem>
                        <SelectItem value="4">4% (Standaard)</SelectItem>
                        <SelectItem value="4.5">4.5% (Offensief)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="riskProfile">Risicoprofiel</Label>
                    <Select value={formData.riskProfile} onValueChange={(value: any) => setFormData({...formData, riskProfile: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservatief</SelectItem>
                        <SelectItem value="moderate">Gematigd</SelectItem>
                        <SelectItem value="aggressive">Offensief</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleCalculate}
                  className="w-full py-3 text-lg font-semibold gradient-financial text-white border-0 shadow-financial hover:shadow-financial-lg transition-all duration-300"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Bereken FIRE Nummer
                </Button>
              </CardContent>
            </Card>

            {results && (
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <TrendingUp className="mr-3 h-6 w-6 text-primary" />
                    FIRE Resultaten
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">FIRE Nummer</p>
                      <p className="text-3xl font-bold text-primary">€{Math.round(results.fireNumber).toLocaleString('nl-NL')}</p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Huidige Voortgang</p>
                      <p className="text-3xl font-bold text-primary">{results.currentProgress}%</p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Tijd tot FIRE</p>
                      <p className="text-3xl font-bold text-primary">{results.timeToFIRE.toFixed(1)} jaar</p>
                    </div>
                    <div className={`bg-accent/10 p-4 rounded-lg`}>
                      <p className="text-sm text-muted-foreground">Haalbaarheid</p>
                      <p className={`text-3xl font-bold capitalize ${getFeasibilityColor(results.feasibility)}`}>
                        {results.feasibility === 'excellent' ? 'Uitstekend' :
                         results.feasibility === 'good' ? 'Goed' :
                         results.feasibility === 'challenging' ? 'Uitdagend' : 'Onwaarschijnlijk'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-muted-foreground mb-1">Safe Withdrawal Bedrag</p>
                    <p className="text-3xl font-bold text-green-700">
                      €{Math.round(results.safeWithdrawalAmount).toLocaleString('nl-NL')}/jaar
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      €{Math.round(results.safeWithdrawalAmount / 12).toLocaleString('nl-NL')}/maand
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-accent/10 p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Lean FIRE</p>
                      <p className="text-lg font-bold">€{Math.round(results.leanFIRE).toLocaleString('nl-NL')}</p>
                    </div>
                    <div className="bg-accent/10 p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Coast FIRE</p>
                      <p className="text-lg font-bold">€{Math.round(results.coastFIRE).toLocaleString('nl-NL')}</p>
                    </div>
                    <div className="bg-accent/10 p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Fat FIRE</p>
                      <p className="text-lg font-bold">€{Math.round(results.fatFIRE).toLocaleString('nl-NL')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {results && results.advice.length > 0 && (
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl mb-8">
              <CardHeader>
                <CardTitle>FIRE Inzichten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">💡 Advies</h3>
                    <ul className="space-y-1 text-sm">
                      {results.advice.slice(0, Math.ceil(results.advice.length / 2)).map((item, idx) => (
                        <li key={idx} className="text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">🎯 Strategieën</h3>
                    <ul className="space-y-1 text-sm">
                      <li className="text-muted-foreground">• Verhoog maandelijkse bijdragen voor sneller FIRE</li>
                      <li className="text-muted-foreground">• Overweeg side hustles voor extra inkomen</li>
                      <li className="text-muted-foreground">• Optimaliseer belastingdruk op inkomen</li>
                      <li className="text-muted-foreground">• Bouw emergency fund van 6-12 maanden</li>
                      {results.advice.slice(Math.ceil(results.advice.length / 2)).map((item, idx) => (
                        <li key={`extra-${idx}`} className="text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
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