"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components.ui/button"
import { Input } from "@/components.ui/input"
import { Label } from "@/components.ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components.ui/select"
import { Calculator, ArrowRight, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateSuccessionPlanning, type SuccessionPlanningInput } from "@/lib/calculators/succession-planning"

export default function SuccessionPlanningCalculatorPage() {
  const [formData, setFormData] = useState<SuccessionPlanningInput>({
    totalWealth: 1000000,
    heirs: [
      { name: "Kind 1", relationship: "child", age: 25 },
      { name: "Partner", relationship: "partner", age: 35 }
    ],
    desiredTiming: 'death',
    taxOptimization: true,
    businessOwnership: false,
    realEstate: true
  })

  const [results, setResults] = useState<ReturnType<typeof calculateSuccessionPlanning> | null>(null)

  const handleCalculate = () => {
    const result = calculateSuccessionPlanning(formData)
    setResults(result)
  }

  const addHeir = () => {
    setFormData({
      ...formData,
      heirs: [...formData.heirs, { name: "", relationship: "child", age: 18 }]
    })
  }

  const updateHeir = (index: number, field: string, value: any) => {
    const updatedHeirs = [...formData.heirs]
    updatedHeirs[index] = { ...updatedHeirs[index], [field]: value }
    setFormData({ ...formData, heirs: updatedHeirs })
  }

  const removeHeir = (index: number) => {
    setFormData({
      ...formData,
      heirs: formData.heirs.filter((_, i) => i !== index)
    })
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
              <span className="text-gradient-financial">Successieplanning Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Plan de overdracht van je vermogen en minimaliseer erfbelasting
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/successieplanning" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Calculator className="mr-3 h-6 w-6 text-primary" />
                  Vermogen & Erfgenamen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="totalWealth">Totaal Vermogen (€)</Label>
                  <Input
                    id="totalWealth"
                    type="number"
                    value={formData.totalWealth}
                    onChange={(e) => setFormData({...formData, totalWealth: Number(e.target.value)})}
                    placeholder="1000000"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Erfgenamen</Label>
                  {formData.heirs.map((heir, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 p-3 bg-accent/5 rounded-lg">
                      <div>
                        <Input
                          placeholder="Naam"
                          value={heir.name}
                          onChange={(e) => updateHeir(index, 'name', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Select value={heir.relationship} onValueChange={(value) => updateHeir(index, 'relationship', value)}>
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="partner">Partner</SelectItem>
                            <SelectItem value="child">Kind</SelectItem>
                            <SelectItem value="parent">Ouder</SelectItem>
                            <SelectItem value="sibling">Broer/Zus</SelectItem>
                            <SelectItem value="other">Anders</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Leeftijd"
                          value={heir.age}
                          onChange={(e) => updateHeir(index, 'age', Number(e.target.value))}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex items-center">
                        {formData.heirs.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeHeir(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addHeir} className="w-full">
                    + Erfgenaam Toevoegen
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desiredTiming">Gewenste Timing</Label>
                  <Select value={formData.desiredTiming} onValueChange={(value: any) => setFormData({...formData, desiredTiming: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Direct (schenken)</SelectItem>
                      <SelectItem value="retirement">Bij pensionering</SelectItem>
                      <SelectItem value="death">Bij overlijden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="taxOptimization"
                      checked={formData.taxOptimization}
                      onChange={(e) => setFormData({ ...formData, taxOptimization: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="taxOptimization">Belastingoptimalisatie</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="businessOwnership"
                      checked={formData.businessOwnership}
                      onChange={(e) => setFormData({ ...formData, businessOwnership: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="businessOwnership">Bedrijfseigendom</Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="realEstate"
                    checked={formData.realEstate}
                    onChange={(e) => setFormData({ ...formData, realEstate: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="realEstate">Onroerend Goed</Label>
                </div>

                <Button
                  onClick={handleCalculate}
                  className="w-full py-3 text-lg font-semibold gradient-financial text-white border-0 shadow-financial hover:shadow-financial-lg transition-all duration-300"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Bereken Successieplan
                </Button>
              </CardContent>
            </Card>

            {results && (
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <TrendingUp className="mr-3 h-6 w-6 text-primary" />
                    Successie Resultaten
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Totaal Vermogen</p>
                      <p className="text-2xl font-bold text-primary">€{Math.round(results.totalInheritance).toLocaleString('nl-NL')}</p>
                    </div>
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Erfbelasting</p>
                      <p className="text-2xl font-bold text-red-600">€{Math.round(results.inheritanceTax).toLocaleString('nl-NL')}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-muted-foreground mb-1">Netto Erfdeel</p>
                    <p className="text-3xl font-bold text-green-700">
                      €{Math.round(results.netInheritance).toLocaleString('nl-NL')}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Belastingbesparing: €{Math.round(results.taxSavings).toLocaleString('nl-NL')}
                    </p>
                  </div>

                  <div className="p-4 bg-accent/10 rounded-lg">
                    <h3 className="font-semibold mb-3">Aanbevolen Strategie</h3>
                    <p className="text-sm text-muted-foreground">{results.recommendedStrategy}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {results && results.perHeir.length > 0 && (
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl mb-8">
              <CardHeader>
                <CardTitle>Verdeling per Erfgenaam</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {results.perHeir.map((heir, index) => (
                    <div key={index} className="p-4 bg-accent/5 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3">{heir.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Bruto Erfdeel:</span>
                          <span className="font-medium">€{Math.round(heir.grossAmount).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Belasting:</span>
                          <span className="font-medium text-red-600">€{Math.round(heir.taxAmount).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Netto Erfdeel:</span>
                          <span className="font-semibold text-green-600">€{Math.round(heir.netAmount).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results && results.timeline.length > 0 && (
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl mb-8">
              <CardHeader>
                <CardTitle>Implementatie Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.timeline.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results && results.alternatives.length > 0 && (
            <div className="bg-accent/10 border border-primary/20 rounded-2xl p-8 hover:border-primary/40 hover:shadow-financial-lg transition-all duration-500 mb-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 gradient-financial rounded-xl flex items-center justify-center mr-4 shadow-financial">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  💡 Successie Optimalisatie
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Alternatieve Strategieën</h3>
                  <ul className="space-y-1 text-sm">
                    {results.alternatives.map((item, idx) => (
                      <li key={idx} className="text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Belangrijke Inzichten</h3>
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