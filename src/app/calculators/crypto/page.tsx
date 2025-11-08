"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Coins, Calculator, Download, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type CryptoResults = {
  bitcoin: { percentage: number; amount: number }
  ethereum: { percentage: number; amount: number }
  altcoins: { percentage: number; amount: number }
  stablecoins: { percentage: number; amount: number }
  portfolioRisk: string
  expectedVolatility: string
  maxLoss: string
  box3Value: number
  wealthTax: number
}

export default function CryptoAllocationCalculatorPage() {
  const [formData, setFormData] = useState({
    totalInvestment: 10000,
    riskTolerance: "moderate",
    investmentHorizon: "medium",
    experience: "intermediate",
    preferredCoins: "major-coins"
  })

  const [results, setResults] = useState<CryptoResults | null>(null)

  const calculateAllocation = () => {
    const { totalInvestment, riskTolerance, investmentHorizon, experience, preferredCoins } = formData

    // Calculate allocation based on risk tolerance and preferences
    let bitcoin, ethereum, altcoins, stablecoins

    if (preferredCoins === "bitcoin-only") {
      bitcoin = 100
      ethereum = 0
      altcoins = 0
      stablecoins = 0
    } else if (preferredCoins === "major-coins") {
      if (riskTolerance === "conservative") {
        bitcoin = 60
        ethereum = 30
        altcoins = 5
        stablecoins = 5
      } else if (riskTolerance === "moderate") {
        bitcoin = 50
        ethereum = 30
        altcoins = 15
        stablecoins = 5
      } else { // aggressive
        bitcoin = 40
        ethereum = 25
        altcoins = 25
        stablecoins = 10
      }
    } else { // diversified
      if (riskTolerance === "conservative") {
        bitcoin = 40
        ethereum = 25
        altcoins = 20
        stablecoins = 15
      } else if (riskTolerance === "moderate") {
        bitcoin = 35
        ethereum = 25
        altcoins = 25
        stablecoins = 15
      } else { // aggressive
        bitcoin = 30
        ethereum = 20
        altcoins = 35
        stablecoins = 15
      }
    }

    // Calculate amounts
    const bitcoinAmount = (totalInvestment * bitcoin) / 100
    const ethereumAmount = (totalInvestment * ethereum) / 100
    const altcoinsAmount = (totalInvestment * altcoins) / 100
    const stablecoinsAmount = (totalInvestment * stablecoins) / 100

    // Risk assessment
    const portfolioRisk = riskTolerance === "conservative" ? "Laag" : 
                         riskTolerance === "moderate" ? "Gemiddeld" : "Hoog"
    
    const expectedVolatility = riskTolerance === "conservative" ? "30-50%" :
                              riskTolerance === "moderate" ? "50-70%" : "70-90%"

    const maxLoss = riskTolerance === "conservative" ? "-30%" :
                   riskTolerance === "moderate" ? "-50%" : "-70%"

    // Tax implications
    const box3Value = totalInvestment
    const wealthTax = box3Value * 0.02 // 2% wealth tax

    setResults({
      bitcoin: { percentage: bitcoin, amount: bitcoinAmount },
      ethereum: { percentage: ethereum, amount: ethereumAmount },
      altcoins: { percentage: altcoins, amount: altcoinsAmount },
      stablecoins: { percentage: stablecoins, amount: stablecoinsAmount },
      portfolioRisk,
      expectedVolatility,
      maxLoss,
      box3Value,
      wealthTax
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
              Crypto Allocatie Calculator
            </h1>
            <p className="text-lg text-gray-600">
              Bepaal de optimale allocatie voor je crypto portfolio
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="h-5 w-5 mr-2 text-orange-600" />
                  Portfolio Parameters
                </CardTitle>
                <CardDescription>
                  Configureer je crypto allocatie strategie
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="total-investment">Totale Investering</Label>
                  <Input
                    id="total-investment"
                    type="number"
                    value={formData.totalInvestment}
                    onChange={(e) => handleInputChange('totalInvestment', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="risk-tolerance">Risicotolerantie</Label>
                  <Select value={formData.riskTolerance} onValueChange={(value) => handleInputChange('riskTolerance', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecteer risicotolerantie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservatief (20% crypto)</SelectItem>
                      <SelectItem value="moderate">Gematigd (40% crypto)</SelectItem>
                      <SelectItem value="aggressive">Agressief (60% crypto)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="investment-horizon">Beleggingshorizon</Label>
                  <Select value={formData.investmentHorizon} onValueChange={(value) => handleInputChange('investmentHorizon', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecteer horizon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Kort (1-2 jaar)</SelectItem>
                      <SelectItem value="medium">Gemiddeld (3-5 jaar)</SelectItem>
                      <SelectItem value="long">Lang (5+ jaar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience">Ervaring</Label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecteer ervaringsniveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Gemiddeld</SelectItem>
                      <SelectItem value="advanced">Gevorderd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferred-coins">Voorkeur Coins</Label>
                  <Select value={formData.preferredCoins} onValueChange={(value) => handleInputChange('preferredCoins', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecteer voorkeur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bitcoin-only">Alleen Bitcoin</SelectItem>
                      <SelectItem value="major-coins">Grote Coins (BTC, ETH)</SelectItem>
                      <SelectItem value="diversified">Gediversifieerd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" size="lg" onClick={calculateAllocation}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Allocatie
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Aanbevolen Allocatie</CardTitle>
                <CardDescription>
                  Optimale verdeling voor jouw profiel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results ? (
                    <>
                      {/* Portfolio Breakdown */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Portfolio Verdeling</h3>

                        {/* Bitcoin */}
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Bitcoin (BTC)</span>
                            <span className="font-semibold">{results.bitcoin.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{width: `${results.bitcoin.percentage}%`}}></div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">€{Math.round(results.bitcoin.amount).toLocaleString('nl-NL')}</div>
                        </div>

                        {/* Ethereum */}
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Ethereum (ETH)</span>
                            <span className="font-semibold">{results.ethereum.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${results.ethereum.percentage}%`}}></div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">€{Math.round(results.ethereum.amount).toLocaleString('nl-NL')}</div>
                        </div>

                        {/* Altcoins */}
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Altcoins</span>
                            <span className="font-semibold">{results.altcoins.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{width: `${results.altcoins.percentage}%`}}></div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">€{Math.round(results.altcoins.amount).toLocaleString('nl-NL')}</div>
                        </div>

                        {/* Stablecoins */}
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Stablecoins</span>
                            <span className="font-semibold">{results.stablecoins.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: `${results.stablecoins.percentage}%`}}></div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">€{Math.round(results.stablecoins.amount).toLocaleString('nl-NL')}</div>
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h3 className="font-semibold text-yellow-900 mb-2">Risico Assessment</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Portfolio Risico:</span>
                            <span className="font-medium">{results.portfolioRisk}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Verwachte Volatiliteit:</span>
                            <span className="font-medium">{results.expectedVolatility}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Maximaal Verlies:</span>
                            <span className="font-medium text-red-600">{results.maxLoss}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tax Implications */}
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Fiscale Gevolgen</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Box 3 Waarde:</span>
                            <span>€{results.box3Value.toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vermogensbelasting:</span>
                            <span>€{Math.round(results.wealthTax).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Winst/Loss Tracking:</span>
                            <span className="text-green-600">Verplicht</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-center">Klik op "Bereken Allocatie" om resultaten te zien</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/reports/generate?type=crypto-allocation')
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

          {/* Crypto Tips */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Crypto Belegging Tips</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Diversificatie</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Spreid over verschillende coins</li>
                    <li>• Houd 10-20% in stablecoins</li>
                    <li>• Overweeg verschillende sectoren</li>
                    <li>• Herbalanceer regelmatig</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risicobeheer</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Investeer alleen wat je kunt verliezen</li>
                    <li>• Gebruik dollar-cost averaging</li>
                    <li>• Stel stop-losses in</li>
                    <li>• Houd emoties buiten de deur</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fiscale Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Houd alle transacties bij</li>
                    <li>• Gebruik FIFO methode</li>
                    <li>• Overweeg HODL strategie</li>
                    <li>• Plan belastingoptimalisatie</li>
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