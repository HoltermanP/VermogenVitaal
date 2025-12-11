"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, ArrowRight, Briefcase } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { calculateSelfEmployed, type SelfEmployedResult } from "@/lib/calculators/self-employed"

export default function SelfEmployedCalculatorPage() {
  const [formData, setFormData] = useState({
    profit: 50000,
    hoursWorked: 1300,
    partnerHours: 0,
    isStarter: false,
    yearsActive: 0
  })

  const [results, setResults] = useState<SelfEmployedResult | null>(null)

  const handleCalculate = () => {
    const result = calculateSelfEmployed(formData)
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
              <span className="text-gradient-financial">Zelfstandigenaftrek & MKB Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Controleer je recht op zelfstandigenaftrek, startersaftrek en MKB-winstvrijstelling
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/zelfstandigenaftrek" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  Ondernemersgegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="profit">Jaarlijkse Winst</Label>
                  <Input
                    id="profit"
                    type="number"
                    value={formData.profit}
                    onChange={(e) => setFormData({ ...formData, profit: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="hoursWorked">Uren Gewerkt (per jaar)</Label>
                  <Input
                    id="hoursWorked"
                    type="number"
                    value={formData.hoursWorked}
                    onChange={(e) => setFormData({ ...formData, hoursWorked: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum: 1.225 uur</p>
                </div>

                <div>
                  <Label htmlFor="partnerHours">Partner Uren (optioneel)</Label>
                  <Input
                    id="partnerHours"
                    type="number"
                    value={formData.partnerHours}
                    onChange={(e) => setFormData({ ...formData, partnerHours: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum: 800 uur</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isStarter"
                    checked={formData.isStarter}
                    onCheckedChange={(checked) => setFormData({ ...formData, isStarter: checked as boolean })}
                  />
                  <Label htmlFor="isStarter">Ik ben starter (eerste 5 jaar)</Label>
                </div>

                {formData.isStarter && (
                  <div>
                    <Label htmlFor="yearsActive">Aantal Jaar Actief</Label>
                    <Input
                      id="yearsActive"
                      type="number"
                      value={formData.yearsActive}
                      onChange={(e) => setFormData({ ...formData, yearsActive: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                      max={5}
                    />
                  </div>
                )}

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Controleer Recht
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
                      <h3 className="font-semibold mb-3">Urencriterium</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vereist:</span>
                          <span className="font-medium">{results.hoursCheck.required} uur</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gewerkt:</span>
                          <span className="font-medium">{results.hoursCheck.actual} uur</span>
                        </div>
                        {results.hoursCheck.partnerHours && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Partner:</span>
                            <span className="font-medium">{results.hoursCheck.partnerHours} uur</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Status:</span>
                          <span className={`font-semibold ${results.hoursCheck.qualifies ? 'text-green-600' : 'text-red-600'}`}>
                            {results.hoursCheck.qualifies ? '✓ Voldoet' : '✗ Voldoet niet'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold mb-3">Aftrekposten</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Zelfstandigenaftrek:</span>
                          <span className="font-medium">€{Math.round(results.deductions.selfEmployed).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Startersaftrek:</span>
                          <span className="font-medium">€{Math.round(results.deductions.starter).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">MKB-winstvrijstelling:</span>
                          <span className="font-medium">€{Math.round(results.deductions.mkbProfitExemption).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Totaal Aftrek:</span>
                          <span className="font-semibold text-gradient-financial">€{Math.round(results.deductions.total).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Belastingbesparing:</span>
                          <span className="font-medium text-green-600">€{Math.round(results.taxSavings).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

                    {results.advice.length > 0 && (
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                        <h3 className="font-semibold mb-2">Inzichten</h3>
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
                    <p className="text-muted-foreground text-center">Klik op &quot;Controleer Recht&quot; om resultaten te zien</p>
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

