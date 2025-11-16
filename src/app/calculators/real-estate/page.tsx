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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        {/* Financial grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3 animate-fade-in">
              <span className="text-gradient-financial">Vastgoed Cashflow Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in delay-200">
              Analyseer de cashflow van je vastgoed investeringen
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-300">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3 shadow-financial">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  Vastgoed Gegevens
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Vul de gegevens van je vastgoed investering in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="purchase-price" className="text-foreground">Aankoopprijs</Label>
                  <Input
                    id="purchase-price"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => handleInputChange('purchasePrice', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="monthly-rent" className="text-foreground">Maandelijkse Huur</Label>
                  <Input
                    id="monthly-rent"
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) => handleInputChange('monthlyRent', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="monthly-costs" className="text-foreground">Maandelijkse Kosten</Label>
                  <Input
                    id="monthly-costs"
                    type="number"
                    value={formData.monthlyCosts}
                    onChange={(e) => handleInputChange('monthlyCosts', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="property-tax" className="text-foreground">Onroerende Zaak Belasting</Label>
                  <Input
                    id="property-tax"
                    type="number"
                    value={formData.propertyTax}
                    onChange={(e) => handleInputChange('propertyTax', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maintenance" className="text-foreground">Onderhoudsreserve</Label>
                  <Input
                    id="maintenance"
                    type="number"
                    value={formData.maintenance}
                    onChange={(e) => handleInputChange('maintenance', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-foreground">Locatie</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                    <SelectTrigger className="mt-1 w-full">
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

                <Button className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" size="lg" onClick={calculateCashflow}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Cashflow
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-400">
              <CardHeader>
                <CardTitle className="text-foreground">Cashflow Analyse</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Jaarlijkse financiële overzicht
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results ? (
                    <>
                      {/* Income */}
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                        <h3 className="font-semibold text-foreground mb-3">Inkomsten</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bruto Huur (jaar):</span>
                            <span className="font-medium text-foreground">€{results.grossRent.toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Leegstand (5%):</span>
                            <span className="font-medium text-foreground">€-{Math.round(results.vacancy).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between border-t border-primary/20 pt-2">
                            <span className="font-semibold text-foreground">Netto Huur:</span>
                            <span className="font-semibold text-gradient-financial">€{Math.round(results.netRent).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Expenses */}
                      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl hover:bg-destructive/20 transition-all duration-300">
                        <h3 className="font-semibold text-destructive mb-3">Uitgaven</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Maandelijkse Kosten:</span>
                            <span className="font-medium text-foreground">€{(formData.monthlyCosts * 12).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">OZB:</span>
                            <span className="font-medium text-foreground">€{formData.propertyTax.toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Onderhoud:</span>
                            <span className="font-medium text-foreground">€{formData.maintenance.toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Verzekering:</span>
                            <span className="font-medium text-foreground">€300</span>
                          </div>
                          <div className="flex justify-between border-t border-destructive/30 pt-2">
                            <span className="font-semibold text-foreground">Totaal Uitgaven:</span>
                            <span className="font-semibold text-destructive">€{Math.round(results.totalCosts).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Net Result */}
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                        <h3 className="font-semibold text-foreground mb-3">Netto Resultaat</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Netto Cashflow:</span>
                            <span className="font-semibold text-gradient-financial">€{Math.round(results.netCashflow).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rendement op Investering:</span>
                            <span className="font-semibold text-gradient-financial">{results.roi.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cash-on-Cash Return:</span>
                            <span className="font-semibold text-gradient-financial">{results.roi.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Tax Implications */}
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                        <h3 className="font-semibold text-foreground mb-2">Fiscale Gevolgen</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Box 3 Belasting:</span>
                            <span className="text-foreground">€{Math.round(results.box3Tax).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Netto Na Belasting:</span>
                            <span className="font-semibold text-gradient-financial">€{Math.round(results.netAfterTax).toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <p className="text-muted-foreground text-center">Klik op &quot;Bereken Cashflow&quot; om resultaten te zien</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300"
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
                    <Button variant="outline" className="flex-1 border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300" asChild>
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
            <h2 className="text-2xl font-bold text-foreground mb-6 animate-fade-in delay-500">
              <span className="text-gradient-financial">Vastgoed Tips</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-500">
                <CardHeader>
                  <CardTitle className="text-foreground">Cashflow Optimalisatie</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="text-muted-foreground">• Houd rekening met leegstand (5-10%)</li>
                    <li className="text-muted-foreground">• Reserveer 1-2% voor onderhoud</li>
                    <li className="text-muted-foreground">• Overweeg huurverhogingen</li>
                    <li className="text-muted-foreground">• Optimaliseer belastingaftrek</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-600">
                <CardHeader>
                  <CardTitle className="text-foreground">Fiscale Voordelen</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="text-muted-foreground">• Hypotheekrente aftrekbaar</li>
                    <li className="text-muted-foreground">• Onderhoudskosten aftrekbaar</li>
                    <li className="text-muted-foreground">• Afschrijving mogelijk</li>
                    <li className="text-muted-foreground">• Box 3 belasting over waarde</li>
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