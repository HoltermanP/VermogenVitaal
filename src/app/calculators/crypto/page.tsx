"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Coins, Calculator, Download, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"

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
    const { totalInvestment, riskTolerance, preferredCoins } = formData

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 animate-fade-in">
              <span className="text-gradient-financial">Crypto Allocatie Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in delay-200">
              Bepaal de optimale allocatie voor je crypto portfolio
            </p>
          </div>

          {/* News Ticker - Compact */}
          <div className="mb-6">
            <NewsTicker pagePath="/calculators/crypto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3 shadow-financial">
                    <Coins className="h-5 w-5 text-white" />
                  </div>
                  Portfolio Parameters
                </CardTitle>
                <CardDescription className="text-muted-foreground">
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

                <Button className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" size="lg" onClick={calculateAllocation}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Allocatie
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-foreground">Aanbevolen Allocatie</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Optimale verdeling voor jouw profiel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results ? (
                    <>
                      {/* Portfolio Breakdown */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Portfolio Verdeling</h3>

                        {/* Bitcoin */}
                        <div className="p-3 bg-accent/10 border border-primary/20 rounded-lg hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-foreground">Bitcoin (BTC)</span>
                            <span className="font-semibold text-gradient-financial">{results.bitcoin.percentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="gradient-financial h-2 rounded-full" style={{width: `${results.bitcoin.percentage}%`}}></div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">€{Math.round(results.bitcoin.amount).toLocaleString('nl-NL')}</div>
                        </div>

                        {/* Ethereum */}
                        <div className="p-3 bg-accent/10 border border-primary/20 rounded-lg hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-foreground">Ethereum (ETH)</span>
                            <span className="font-semibold text-gradient-financial">{results.ethereum.percentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="gradient-financial h-2 rounded-full" style={{width: `${results.ethereum.percentage}%`}}></div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">€{Math.round(results.ethereum.amount).toLocaleString('nl-NL')}</div>
                        </div>

                        {/* Altcoins */}
                        <div className="p-3 bg-accent/10 border border-primary/20 rounded-lg hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-foreground">Altcoins</span>
                            <span className="font-semibold text-gradient-financial">{results.altcoins.percentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="gradient-financial h-2 rounded-full" style={{width: `${results.altcoins.percentage}%`}}></div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">€{Math.round(results.altcoins.amount).toLocaleString('nl-NL')}</div>
                        </div>

                        {/* Stablecoins */}
                        <div className="p-3 bg-accent/10 border border-primary/20 rounded-lg hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-foreground">Stablecoins</span>
                            <span className="font-semibold text-gradient-financial">{results.stablecoins.percentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="gradient-success h-2 rounded-full" style={{width: `${results.stablecoins.percentage}%`}}></div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">€{Math.round(results.stablecoins.amount).toLocaleString('nl-NL')}</div>
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-lg hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                        <h3 className="font-semibold text-foreground mb-2">Risico Assessment</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Portfolio Risico:</span>
                            <span className="font-medium text-foreground">{results.portfolioRisk}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Verwachte Volatiliteit:</span>
                            <span className="font-medium text-foreground">{results.expectedVolatility}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Maximaal Verlies:</span>
                            <span className="font-medium text-destructive">{results.maxLoss}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tax Implications */}
                      <div className="p-4 bg-accent/10 border border-primary/20 rounded-lg hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                        <h3 className="font-semibold text-foreground mb-2">Fiscale Gevolgen</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Box 3 Waarde:</span>
                            <span className="text-foreground">€{results.box3Value.toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vermogensbelasting:</span>
                            <span className="text-foreground">€{Math.round(results.wealthTax).toLocaleString('nl-NL')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Winst/Loss Tracking:</span>
                            <span className="text-primary">Verplicht</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-lg">
                      <p className="text-muted-foreground text-center">Klik op &quot;Bereken Allocatie&quot; om resultaten te zien</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300"
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

          {/* Crypto Tips */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 animate-fade-in delay-300">
              <span className="text-gradient-financial">Crypto Belegging Tips</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-foreground">Diversificatie</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="text-muted-foreground">• Spreid over verschillende coins</li>
                    <li className="text-muted-foreground">• Houd 10-20% in stablecoins</li>
                    <li className="text-muted-foreground">• Overweeg verschillende sectoren</li>
                    <li className="text-muted-foreground">• Herbalanceer regelmatig</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-foreground">Risicobeheer</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="text-muted-foreground">• Investeer alleen wat je kunt verliezen</li>
                    <li className="text-muted-foreground">• Gebruik dollar-cost averaging</li>
                    <li className="text-muted-foreground">• Stel stop-losses in</li>
                    <li className="text-muted-foreground">• Houd emoties buiten de deur</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-foreground">Fiscale Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="text-muted-foreground">• Houd alle transacties bij</li>
                    <li className="text-muted-foreground">• Gebruik FIFO methode</li>
                    <li className="text-muted-foreground">• Overweeg HODL strategie</li>
                    <li className="text-muted-foreground">• Plan belastingoptimalisatie</li>
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