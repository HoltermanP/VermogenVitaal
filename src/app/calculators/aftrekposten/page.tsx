"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, ArrowRight, Shield } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { checkDeductions, type DeductionsCheckerResult } from "@/lib/calculators/deductions-checker"

export default function DeductionsCheckerPage() {
  const [formData, setFormData] = useState({
    income: 50000,
    hasMortgage: false,
    mortgageInterest: undefined as number | undefined,
    isStudent: false,
    studyCosts: undefined as number | undefined,
    donates: false,
    donations: undefined as number | undefined,
    hasPension: false,
    pensionPremiums: undefined as number | undefined,
    isEntrepreneur: false,
    hoursWorked: undefined as number | undefined,
    isStarter: false,
    hasPartner: false,
    bothWorking: false
  })

  const [results, setResults] = useState<DeductionsCheckerResult | null>(null)

  const handleCalculate = () => {
    const result = checkDeductions(formData)
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
              <span className="text-gradient-financial">Aftrekposten Checker</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Controleer op welke aftrekposten je recht hebt
            </p>
          </div>

          <div className="mb-6">
            <NewsTicker pagePath="/calculators/aftrekposten" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  Jouw Situatie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="income">Jaarlijks Inkomen</Label>
                  <Input
                    id="income"
                    type="number"
                    value={formData.income}
                    onChange={(e) => setFormData({ ...formData, income: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasMortgage"
                    checked={formData.hasMortgage}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasMortgage: checked as boolean })}
                  />
                  <Label htmlFor="hasMortgage">Ik heb een hypotheek</Label>
                </div>
                {formData.hasMortgage && (
                  <div>
                    <Label htmlFor="mortgageInterest">Hypotheekrente (jaar)</Label>
                    <Input
                      id="mortgageInterest"
                      type="number"
                      value={formData.mortgageInterest ?? ''}
                      onChange={(e) => setFormData({ ...formData, mortgageInterest: e.target.value === '' ? undefined : parseFloat(e.target.value) || 0 })}
                      placeholder=""
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isStudent"
                    checked={formData.isStudent}
                    onCheckedChange={(checked) => setFormData({ ...formData, isStudent: checked as boolean })}
                  />
                  <Label htmlFor="isStudent">Ik ben student</Label>
                </div>
                {formData.isStudent && (
                  <div>
                    <Label htmlFor="studyCosts">Studiekosten</Label>
                    <Input
                      id="studyCosts"
                      type="number"
                      value={formData.studyCosts ?? ''}
                      onChange={(e) => setFormData({ ...formData, studyCosts: e.target.value === '' ? undefined : parseFloat(e.target.value) || 0 })}
                      placeholder=""
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="donates"
                    checked={formData.donates}
                    onCheckedChange={(checked) => setFormData({ ...formData, donates: checked as boolean })}
                  />
                  <Label htmlFor="donates">Ik geef aan goede doelen</Label>
                </div>
                {formData.donates && (
                  <div>
                    <Label htmlFor="donations">Giften (min €60)</Label>
                    <Input
                      id="donations"
                      type="number"
                      value={formData.donations ?? ''}
                      onChange={(e) => setFormData({ ...formData, donations: e.target.value === '' ? undefined : parseFloat(e.target.value) || 0 })}
                      placeholder=""
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPension"
                    checked={formData.hasPension}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasPension: checked as boolean })}
                  />
                  <Label htmlFor="hasPension">Ik bouw pensioen op</Label>
                </div>
                {formData.hasPension && (
                  <div>
                    <Label htmlFor="pensionPremiums">Pensioenpremies</Label>
                    <Input
                      id="pensionPremiums"
                      type="number"
                      value={formData.pensionPremiums ?? ''}
                      onChange={(e) => setFormData({ ...formData, pensionPremiums: e.target.value === '' ? undefined : parseFloat(e.target.value) || 0 })}
                      placeholder=""
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isEntrepreneur"
                    checked={formData.isEntrepreneur}
                    onCheckedChange={(checked) => setFormData({ ...formData, isEntrepreneur: checked as boolean })}
                  />
                  <Label htmlFor="isEntrepreneur">Ik ben ondernemer</Label>
                </div>
                {formData.isEntrepreneur && (
                  <>
                    <div>
                      <Label htmlFor="hoursWorked">Uren Gewerkt (per jaar)</Label>
                      <Input
                        id="hoursWorked"
                        type="number"
                        value={formData.hoursWorked ?? ''}
                        onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value === '' ? undefined : parseInt(e.target.value) || 0 })}
                        placeholder=""
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isStarter"
                        checked={formData.isStarter}
                        onCheckedChange={(checked) => setFormData({ ...formData, isStarter: checked as boolean })}
                      />
                      <Label htmlFor="isStarter">Ik ben starter</Label>
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPartner"
                    checked={formData.hasPartner}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasPartner: checked as boolean })}
                  />
                  <Label htmlFor="hasPartner">Ik heb een fiscale partner</Label>
                </div>
                {formData.hasPartner && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bothWorking"
                      checked={formData.bothWorking}
                      onCheckedChange={(checked) => setFormData({ ...formData, bothWorking: checked as boolean })}
                    />
                    <Label htmlFor="bothWorking">Beide werken</Label>
                  </div>
                )}

                <Button className="w-full gradient-financial text-white" size="lg" onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Controleer Aftrekposten
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
                      <h3 className="font-semibold mb-3">Overzicht</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aftrekposten Gevonden:</span>
                          <span className="font-medium">{results.qualifiesFor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Totaal Aftrek:</span>
                          <span className="font-medium">€{Math.round(results.totalDeductions).toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Geschatte Besparing:</span>
                          <span className="font-semibold text-green-600">€{Math.round(results.estimatedSavings).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold mb-3">Aftrekposten</h3>
                      <div className="space-y-3">
                        {results.deductions.map((deduction) => (
                          <div key={deduction.id} className={`p-3 rounded-lg border ${deduction.qualifies ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-sm">{deduction.name}</p>
                                <p className="text-xs text-muted-foreground">{deduction.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">Categorie: {deduction.category}</p>
                              </div>
                              <div className="text-right">
                                <p className={`font-semibold ${deduction.qualifies ? 'text-green-600' : 'text-red-600'}`}>
                                  {deduction.qualifies ? '✓' : '✗'}
                                </p>
                                <p className="text-sm">€{Math.round(deduction.amount).toLocaleString('nl-NL')}</p>
                              </div>
                            </div>
                            {deduction.reason && (
                              <p className="text-xs text-red-600 mt-2">{deduction.reason}</p>
                            )}
                          </div>
                        ))}
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
                    <p className="text-muted-foreground text-center">Klik op &quot;Controleer Aftrekposten&quot; om resultaten te zien</p>
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

