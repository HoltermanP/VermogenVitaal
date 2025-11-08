"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, Download } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type CalculationResults = {
  emz: {
    profit: number
    tax: number
    netResult: number
  }
  bv: {
    profit: number
    corpTax: number
    salaryTax: number
    dividendTax: number
    netResult: number
  }
  recommendation: string
  difference: number
}

export default function BVvsEMZCalculatorPage() {
  const [formData, setFormData] = useState({
    revenue: 150000,
    costs: 25000,
    legalForm: "zzp",
    salary: 50000,
    dividend: 30000
  })

  const [results, setResults] = useState<CalculationResults | null>(null)

  const calculateComparison = () => {
    const { revenue, costs, salary, dividend } = formData
    const profit = revenue - costs

    // EMZ calculation
    const emzTax = calculateIncomeTax(profit)
    const emzNetResult = profit - emzTax

    // BV calculation
    const bvCorpTax = profit * 0.19 // 19% vennootschapsbelasting
    const bvAfterTax = profit - bvCorpTax
    const salaryTax = calculateIncomeTax(salary)
    const dividendTax = dividend * 0.26 // 26% dividendbelasting
    const bvNetResult = bvAfterTax - salaryTax - dividendTax

    const recommendation = bvNetResult > emzNetResult ? "BV" : "EMZ"
    const difference = Math.abs(bvNetResult - emzNetResult)

    setResults({
      emz: {
        profit,
        tax: emzTax,
        netResult: emzNetResult
      },
      bv: {
        profit,
        corpTax: bvCorpTax,
        salaryTax,
        dividendTax,
        netResult: bvNetResult
      },
      recommendation,
      difference
    })
  }

  const calculateIncomeTax = (income: number) => {
    // Simplified Dutch income tax calculation
    if (income <= 73031) {
      return income * 0.37
    } else {
      return 73031 * 0.37 + (income - 73031) * 0.495
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              BV vs EMZ Calculator
            </h1>
            <p className="text-lg text-gray-600">
              Bereken of een BV of EMZ voordeliger is voor jouw situatie
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-blue-600" />
                  Jouw Situatie
                </CardTitle>
                <CardDescription>
                  Vul je gegevens in voor een nauwkeurige berekening
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="revenue">Jaarlijkse Omzet</Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={formData.revenue}
                    onChange={(e) => handleInputChange('revenue', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="costs">Jaarlijkse Kosten</Label>
                  <Input
                    id="costs"
                    type="number"
                    value={formData.costs}
                    onChange={(e) => handleInputChange('costs', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="legal-form">Huidige Rechtsvorm</Label>
                  <Select value={formData.legalForm} onValueChange={(value) => handleInputChange('legalForm', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecteer rechtsvorm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zzp">ZZP</SelectItem>
                      <SelectItem value="eenmanszaak">Eenmanszaak</SelectItem>
                      <SelectItem value="bv">BV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="salary">Gewenst Salaris (BV)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dividend">Dividend Uitkering (BV)</Label>
                  <Input
                    id="dividend"
                    type="number"
                    value={formData.dividend}
                    onChange={(e) => handleInputChange('dividend', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <Button className="w-full" size="lg" onClick={calculateComparison}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Vergelijking
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Berekeningsresultaten</CardTitle>
                <CardDescription>
                  Vergelijking tussen BV en EMZ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results ? (
                    <>
                      {/* EMZ Results */}
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Eenmanszaak</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Winst:</span>
                            <span className="font-medium">€{results.emz.profit.toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Inkomstenbelasting:</span>
                            <span className="font-medium">€{Math.round(results.emz.tax).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">Netto Resultaat:</span>
                            <span className="font-semibold text-green-600">€{Math.round(results.emz.netResult).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>

                      {/* BV Results */}
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-2">BV</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Winst:</span>
                            <span className="font-medium">€{results.bv.profit.toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vennootschapsbelasting:</span>
                            <span className="font-medium">€{Math.round(results.bv.corpTax).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Inkomstenbelasting (salaris):</span>
                            <span className="font-medium">€{Math.round(results.bv.salaryTax).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Dividendbelasting:</span>
                            <span className="font-medium">€{Math.round(results.bv.dividendTax).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">Netto Resultaat:</span>
                            <span className="font-semibold text-green-600">€{Math.round(results.bv.netResult).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h3 className="font-semibold text-yellow-900 mb-2">Aanbeveling</h3>
                        <p className="text-sm text-yellow-800">
                          Een {results.recommendation} is in jouw situatie €{Math.round(results.difference).toLocaleString('nl-NL')} voordeliger per jaar.
                          {results.recommendation === "BV" && " Overweeg wel de extra administratie en kosten."}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-center">Klik op "Bereken Vergelijking" om resultaten te zien</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/reports/generate?type=bv-vs-emz')
                          const data = await response.json()
                          if (data.downloadUrl) {
                            window.open(data.downloadUrl, '_blank')
                          }
                        } catch (error) {
                          console.error('Error generating report:', error)
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Rapport
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href="/calculators">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Andere Calculator
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Information */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Eenmanszaak Voordelen</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Eenvoudige administratie</li>
                  <li>• Geen startkapitaal vereist</li>
                  <li>• Directe toegang tot winst</li>
                  <li>• Lagere oprichtingskosten</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>BV Voordelen</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Lagere vennootschapsbelasting</li>
                  <li>• Beperkte aansprakelijkheid</li>
                  <li>• Flexibiliteit in salaris/dividend</li>
                  <li>• Professionele uitstraling</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}