"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, Calculator, Download, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type RealEstateResults = {
  grossRent: number
  vacancy: number
  netRent: number
  totalCosts: number
  netCashflow: number
  roi: number
  box3Tax: number
  netAfterTax: number
}

export default function RealEstateCalculatorPage() {
  const [formData, setFormData] = useState({
    purchasePrice: 300000,
    monthlyRent: 1500,
    monthlyCosts: 300,
    propertyTax: 1200,
    maintenance: 2000,
    location: "netherlands"
  })

  const [results, setResults] = useState<RealEstateResults | null>(null)

  const calculateCashflow = () => {
    const { purchasePrice, monthlyRent, monthlyCosts, propertyTax, maintenance } = formData
    
    // Annual calculations
    const annualRent = monthlyRent * 12
    const vacancyRate = 0.05 // 5% vacancy
    const netRent = annualRent * (1 - vacancyRate)
    const annualCosts = monthlyCosts * 12
    const totalAnnualCosts = annualCosts + propertyTax + maintenance
    
    const netCashflow = netRent - totalAnnualCosts
    const roi = (netCashflow / purchasePrice) * 100
    
    // Tax implications (simplified)
    const box3Tax = purchasePrice * 0.006 // 0.6% box 3 tax
    const netAfterTax = netCashflow - box3Tax

    setResults({
      grossRent: annualRent,
      vacancy: annualRent * vacancyRate,
      netRent,
      totalCosts: totalAnnualCosts,
      netCashflow,
      roi,
      box3Tax,
      netAfterTax
    })
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
              Vastgoed Cashflow Calculator
            </h1>
            <p className="text-lg text-gray-600">
              Analyseer de cashflow van je vastgoed investeringen
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-purple-600" />
                  Vastgoed Gegevens
                </CardTitle>
                <CardDescription>
                  Vul de gegevens van je vastgoed investering in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="purchase-price">Aankoopprijs</Label>
                  <Input
                    id="purchase-price"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => handleInputChange('purchasePrice', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="monthly-rent">Maandelijkse Huur</Label>
                  <Input
                    id="monthly-rent"
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) => handleInputChange('monthlyRent', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="monthly-costs">Maandelijkse Kosten</Label>
                  <Input
                    id="monthly-costs"
                    type="number"
                    value={formData.monthlyCosts}
                    onChange={(e) => handleInputChange('monthlyCosts', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="property-tax">Onroerende Zaak Belasting</Label>
                  <Input
                    id="property-tax"
                    type="number"
                    value={formData.propertyTax}
                    onChange={(e) => handleInputChange('propertyTax', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maintenance">Onderhoudsreserve</Label>
                  <Input
                    id="maintenance"
                    type="number"
                    value={formData.maintenance}
                    onChange={(e) => handleInputChange('maintenance', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Locatie</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecteer locatie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="netherlands">Nederland</SelectItem>
                      <SelectItem value="belgium">België</SelectItem>
                      <SelectItem value="germany">Duitsland</SelectItem>
                      <SelectItem value="spain">Spanje</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" size="lg" onClick={calculateCashflow}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Cashflow
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Cashflow Analyse</CardTitle>
                <CardDescription>
                  Jaarlijkse financiële overzicht
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results ? (
                    <>
                      {/* Income */}
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Inkomsten</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Bruto Huur (jaar):</span>
                            <span className="font-medium">€{results.grossRent.toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Leegstand (5%):</span>
                            <span className="font-medium">€-{Math.round(results.vacancy).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">Netto Huur:</span>
                            <span className="font-semibold text-green-600">€{Math.round(results.netRent).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Expenses */}
                      <div className="p-4 bg-red-50 rounded-lg">
                        <h3 className="font-semibold text-red-900 mb-3">Uitgaven</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Maandelijkse Kosten:</span>
                            <span className="font-medium">€{(formData.monthlyCosts * 12).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>OZB:</span>
                            <span className="font-medium">€{formData.propertyTax.toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Onderhoud:</span>
                            <span className="font-medium">€{formData.maintenance.toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Verzekering:</span>
                            <span className="font-medium">€300</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">Totaal Uitgaven:</span>
                            <span className="font-semibold text-red-600">€{Math.round(results.totalCosts).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Net Result */}
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">Netto Resultaat</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Netto Cashflow:</span>
                            <span className="font-semibold text-green-600">€{Math.round(results.netCashflow).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rendement op Investering:</span>
                            <span className="font-semibold text-green-600">{results.roi.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cash-on-Cash Return:</span>
                            <span className="font-semibold text-green-600">{results.roi.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Tax Implications */}
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h3 className="font-semibold text-yellow-900 mb-2">Fiscale Gevolgen</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Box 3 Belasting:</span>
                            <span>€{Math.round(results.box3Tax).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Netto Na Belasting:</span>
                            <span className="font-semibold text-green-600">€{Math.round(results.netAfterTax).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-center">Klik op &quot;Bereken Cashflow&quot; om resultaten te zien</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/reports/generate?type=real-estate')
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

          {/* Tips */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vastgoed Tips</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cashflow Optimalisatie</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Houd rekening met leegstand (5-10%)</li>
                    <li>• Reserveer 1-2% voor onderhoud</li>
                    <li>• Overweeg huurverhogingen</li>
                    <li>• Optimaliseer belastingaftrek</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fiscale Voordelen</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Hypotheekrente aftrekbaar</li>
                    <li>• Onderhoudskosten aftrekbaar</li>
                    <li>• Afschrijving mogelijk</li>
                    <li>• Box 3 belasting over waarde</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}