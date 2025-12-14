"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, ArrowRight, Shield } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateBuffer, type BufferCalculatorResult } from "@/lib/calculators/buffer-calculator"

export default function BufferCalculatorPage() {
  const [formData, setFormData] = useState({
    monthlyIncome: 3000,
    monthlyExpenses: 2000,
    employmentType: 'employee' as 'employee' | 'self-employed' | 'pensioner',
    dependents: 0,
    hasEmergencyFund: false
  })

  const [results, setResults] = useState<BufferCalculatorResult | null>(null)

  const handleCalculate = () => {
    const result = calculateBuffer(formData)
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
              <span className="text-gradient-financial">Buffer/Kapitaal Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bepaal de juiste financiële buffer voor noodgevallen
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/buffer-calculator" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  Gegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="monthlyIncome">Maandelijks Inkomen (€)</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData({ ...formData, monthlyIncome: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyExpenses">Maandelijks Uitgaven (€)</Label>
                  <Input
                    id="monthlyExpenses"
                    type="number"
                    value={formData.monthlyExpenses}
                    onChange={(e) => setFormData({ ...formData, monthlyExpenses: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="employmentType">Werkstatus</Label>
                  <Select value={formData.employmentType} onValueChange={(value: 'employee' | 'self-employed' | 'pensioner') => setFormData({ ...formData, employmentType: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Werknemer</SelectItem>
                      <SelectItem value="self-employed">Zelfstandige</SelectItem>
                      <SelectItem value="pensioner">Gepensioneerde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dependents">Aantal Afhankelijken</Label>
                  <Input
                    id="dependents"
                    type="number"
                    value={formData.dependents}
                    onChange={(e) => setFormData({ ...formData, dependents: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasEmergencyFund"
                    checked={formData.hasEmergencyFund}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasEmergencyFund: checked as boolean })}
                  />
                  <Label htmlFor="hasEmergencyFund">Ik heb al een noodfonds</Label>
                </div>

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Buffer
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
                      <h3 className="font-semibold mb-3">Aanbevolen Buffer</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Minimaal:</span>
                          <span className="font-medium">€{Math.round(results.minimumBuffer).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aanbevolen:</span>
                          <span className="font-medium text-gradient-financial">€{Math.round(results.recommendedBuffer).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Comfortabel:</span>
                          <span className="font-medium">€{Math.round(results.comfortableBuffer).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Maanden Gedekt:</span>
                          <span className="font-semibold">{results.monthsCovered.toFixed(1)} maanden</span>
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
                    <p className="text-muted-foreground text-center">Klik op &quot;Bereken Buffer&quot; om resultaten te zien</p>
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




