"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculatePensionOptimization, type PensionOptimizationInput } from "@/lib/calculators/pension-optimization"

export default function PensionOptimizationCalculatorPage() {
  const [formData, setFormData] = useState<PensionOptimizationInput>({
    age: 35,
    annualIncome: 50000,
    taxBracket: '37%',
    investmentAmount: 10000,
    expectedReturn: 7,
    timeHorizon: 30,
    riskProfile: 'moderate'
  })

  const [results, setResults] = useState<ReturnType<typeof calculatePensionOptimization> | null>(null)

  const handleCalculate = () => {
    const result = calculatePensionOptimization(formData)
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
              <span className="text-gradient-financial">Pensioenoptimalisatie Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Vergelijk lijfrente vs pensioenfonds en vind de fiscaal voordeligste optie
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/pensioen-optimalisatie" />
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
                    <Label htmlFor="age">Leeftijd</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                      placeholder="35"
                    />
                  </div>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxBracket">Belastingtarief</Label>
                    <Select value={formData.taxBracket} onValueChange={(value: any) => setFormData({...formData, taxBracket: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="32%">32% (Eerste schijf)</SelectItem>
                        <SelectItem value="37%">37% (Tweede schijf)</SelectItem>
                        <SelectItem value="45%">45% (Derde schijf)</SelectItem>
                        <SelectItem value="49%">49% (Vierde schijf)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="investmentAmount">Inlegbedrag (€)</Label>
                    <Input
                      id="investmentAmount"
                      type="number"
                      value={formData.investmentAmount}
                      onChange={(e) => setFormData({...formData, investmentAmount: Number(e.target.value)})}
                      placeholder="10000"
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
                      placeholder="7"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeHorizon">Looptijd (jaren)</Label>
                    <Input
                      id="timeHorizon"
                      type="number"
                      value={formData.timeHorizon}
                      onChange={(e) => setFormData({...formData, timeHorizon: Number(e.target.value)})}
                      placeholder="30"
                    />
                  </div>
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

                <Button
                  onClick={handleCalculate}
                  className="w-full py-3 text-lg font-semibold gradient-financial text-white border-0 shadow-financial hover:shadow-financial-lg transition-all duration-300"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Vergelijk Opties
                </Button>
              </CardContent>
            </Card>

            {results && (
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <TrendingUp className="mr-3 h-6 w-6 text-primary" />
                    Vergelijking Resultaten
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3">Lijfrente Optie</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Netto Kosten:</span>
                          <span className="font-medium">€{Math.round(results.lijfrenteOption.netCost).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Belastingvoordeel:</span>
                          <span className="font-medium text-green-600">€{Math.round(results.lijfrenteOption.taxSavings).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Proj. Eindwaarde:</span>
                          <span className="font-medium">€{Math.round(results.lijfrenteOption.projectedValue).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Effectief Rendement:</span>
                          <span className="font-medium">{results.lijfrenteOption.effectiveReturn.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-accent/10 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3">Pensioenfonds Optie</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Netto Kosten:</span>
                          <span className="font-medium">€{Math.round(results.pensionFundOption.netCost).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Belastingvoordeel:</span>
                          <span className="font-medium text-green-600">€{Math.round(results.pensionFundOption.taxSavings).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Proj. Eindwaarde:</span>
                          <span className="font-medium">€{Math.round(results.pensionFundOption.projectedValue).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Effectief Rendement:</span>
                          <span className="font-medium">{results.pensionFundOption.effectiveReturn.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-muted-foreground mb-1">Aanbevolen Optie</p>
                    <p className="text-3xl font-bold text-green-700">
                      {results.recommendedOption === 'lijfrente' ? 'Lijfrente' :
                       results.recommendedOption === 'pensioenfonds' ? 'Pensioenfonds' : 'Beide opties'}
                    </p>
                    {results.difference > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Verschil: €{Math.round(results.difference).toLocaleString('nl-NL')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {results && results.advice.length > 0 && (
            <div className="bg-accent/10 border border-primary/20 rounded-2xl p-8 hover:border-primary/40 hover:shadow-financial-lg transition-all duration-500 mb-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 gradient-financial rounded-xl flex items-center justify-center mr-4 shadow-financial">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  💡 Optimalisatie Tips
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Lijfrente Voordelen</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="text-muted-foreground">• Direct fiscaal voordeel bij inleg</li>
                    <li className="text-muted-foreground">• Voordelig bij hoge belastingdruk</li>
                    <li className="text-muted-foreground">• Uitkering belast tegen 20%</li>
                    <li className="text-muted-foreground">• Meer flexibiliteit in opbouw</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Pensioenfonds Voordelen</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="text-muted-foreground">• Fiscaal uitgesteld opbouwen</li>
                    <li className="text-muted-foreground">• Lage kosten door schaalgrootte</li>
                    <li className="text-muted-foreground">• Professioneel vermogensbeheer</li>
                    <li className="text-muted-foreground">• Uitkering progressief belast</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-lg mb-2">Persoonlijke Inzichten</h3>
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