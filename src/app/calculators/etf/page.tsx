"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Calculator, Download, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

type ETFResults = {
  totalInvested: number
  totalValue: number
  profit: number
  yearlyBreakdown: Array<{ year: number; value: number }>
  year5: number
  year10: number
  year15: number
  year20: number
}

export default function ETFGrowthCalculatorPage() {
  const [formData, setFormData] = useState({
    initialAmount: 10000,
    monthlyContribution: 500,
    expectedReturn: 7,
    investmentPeriod: 20,
    riskProfile: "moderate"
  })

  const [results, setResults] = useState<ETFResults | null>(null)

  const calculateGrowth = () => {
    const { initialAmount, monthlyContribution, expectedReturn, investmentPeriod } = formData
    
    // Monthly return rate
    const monthlyReturn = expectedReturn / 100 / 12
    const totalMonths = investmentPeriod * 12
    
    // Calculate using monthly compounding for both initial amount and contributions
    let currentValue = initialAmount
    const yearlyBreakdown = [
      { year: 0, value: initialAmount } // Start with initial amount
    ]
    
    // Simulate month by month for accurate calculation
    for (let month = 1; month <= totalMonths; month++) {
      // Add monthly contribution at the beginning of each month
      currentValue += monthlyContribution
      
      // Apply monthly return
      currentValue *= (1 + monthlyReturn)
      
      // Record yearly values
      if (month % 12 === 0) {
        const year = month / 12
        yearlyBreakdown.push({
          year,
          value: Math.round(currentValue)
        })
      }
    }
    
    const totalValue = currentValue
    const totalInvested = initialAmount + (monthlyContribution * totalMonths)
    const profit = totalValue - totalInvested
    
    setResults({
      totalInvested,
      totalValue: Math.round(totalValue),
      profit: Math.round(profit),
      yearlyBreakdown,
      year5: yearlyBreakdown[4]?.value || 0,
      year10: yearlyBreakdown[9]?.value || 0,
      year15: yearlyBreakdown[14]?.value || 0,
      year20: yearlyBreakdown[19]?.value || 0
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
              <span className="text-gradient-financial">ETF Groei Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in delay-200">
              Bereken de potentiële groei van je ETF beleggingen
            </p>
          </div>

          {/* News Ticker - Compact */}
          <div className="mb-6">
            <NewsTicker pagePath="/calculators/etf" />
          </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Input Form */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-300">
                    <CardHeader>
                      <CardTitle className="flex items-center text-foreground">
                        <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3 shadow-financial">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        Beleggingsparameters
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Vul je beleggingsgegevens in voor een groeiprojectie
                      </CardDescription>
                    </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="initial-amount" className="text-foreground">Startbedrag</Label>
                  <Input
                    id="initial-amount"
                    type="text"
                    value={formData.initialAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '') // Alleen cijfers toestaan
                      if (value === '' || (!isNaN(parseInt(value)) && parseInt(value) >= 0)) {
                        handleInputChange('initialAmount', value === '' ? 0 : parseInt(value))
                      }
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="monthly-contribution" className="text-foreground">Maandelijkse Inleg</Label>
                  <Input
                    id="monthly-contribution"
                    type="text"
                    value={formData.monthlyContribution}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '') // Alleen cijfers toestaan
                      if (value === '' || (!isNaN(parseInt(value)) && parseInt(value) >= 0)) {
                        handleInputChange('monthlyContribution', value === '' ? 0 : parseInt(value))
                      }
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="expected-return" className="text-foreground">Verwachte Jaarlijkse Rendement (%)</Label>
                  <Input
                    id="expected-return"
                    type="text"
                    value={formData.expectedReturn}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '') // Alleen cijfers en punt toestaan
                      if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                        handleInputChange('expectedReturn', value === '' ? 0 : parseFloat(value))
                      }
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="investment-period" className="text-foreground">Beleggingsperiode (jaren)</Label>
                  <Input
                    id="investment-period"
                    type="text"
                    value={formData.investmentPeriod}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '') // Alleen cijfers toestaan
                      if (value === '' || (!isNaN(parseInt(value)) && parseInt(value) >= 1 && parseInt(value) <= 50)) {
                        handleInputChange('investmentPeriod', value === '' ? 0 : parseInt(value))
                      }
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="risk-profile" className="text-foreground">Risicoprofiel</Label>
                  <Select value={formData.riskProfile} onValueChange={(value) => handleInputChange('riskProfile', value)}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservatief (4-6%)</SelectItem>
                      <SelectItem value="moderate">Gematigd (6-8%)</SelectItem>
                      <SelectItem value="aggressive">Agressief (8-10%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" size="lg" onClick={calculateGrowth}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Groei
                </Button>
              </CardContent>
            </Card>

                  {/* Results */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-400">
                    <CardHeader>
                      <CardTitle className="text-foreground">Groeiprojectie</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        20-jarige ETF groeiprojectie
                      </CardDescription>
                    </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Summary */}
                  {results ? (
                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300">
                      <h3 className="font-semibold text-foreground mb-3">Eindresultaat</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Totaal Ingelegd:</span>
                          <span className="font-medium text-foreground">€{results.totalInvested.toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Verwachte Waarde:</span>
                          <span className="font-medium text-foreground">€{results.totalValue.toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t border-primary/20 pt-2">
                          <span className="font-semibold text-foreground">Winst:</span>
                          <span className="font-semibold text-gradient-financial">€{results.profit.toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <p className="text-muted-foreground text-center">Klik op &quot;Bereken Groei&quot; om resultaten te zien</p>
                    </div>
                  )}

                  {/* Yearly Breakdown */}
                  {results && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Jaarlijkse Ontwikkeling</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Na 5 jaar:</span>
                          <span className="text-foreground">€{results.year5.toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Na 10 jaar:</span>
                          <span className="text-foreground">€{results.year10.toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Na 15 jaar:</span>
                          <span className="text-foreground">€{results.year15.toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Na 20 jaar:</span>
                          <span className="font-semibold text-gradient-financial">€{results.year20.toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Growth Chart */}
                  {results && results.yearlyBreakdown && results.yearlyBreakdown.length > 0 ? (
                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl">
                      <h3 className="font-semibold text-foreground mb-4">Groeigrafiek</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart
                          data={results.yearlyBreakdown}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="oklch(0.65 0.18 150)" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="oklch(0.65 0.18 150)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.50 0.02 240)" opacity={0.2} />
                          <XAxis 
                            dataKey="year" 
                            stroke="oklch(0.60 0 0)"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `Jaar ${value}`}
                          />
                          <YAxis 
                            stroke="oklch(0.60 0 0)"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'oklch(0.22 0.02 240)',
                              border: '1px solid oklch(0.32 0.025 250)',
                              borderRadius: '8px',
                              color: 'oklch(0.98 0 0)'
                            }}
                            formatter={(value: number) => [`€${value.toLocaleString('nl-NL')}`, 'Waarde']}
                            labelFormatter={(label) => `Jaar ${label}`}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="oklch(0.65 0.18 150)"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="p-4 bg-accent/10 border border-primary/20 rounded-xl text-center hover:bg-accent/20 transition-all duration-300">
                      <p className="text-sm text-muted-foreground">
                        📈 Klik op &quot;Bereken Groei&quot; om de groeigrafiek te zien
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/reports/generate?type=etf-growth')
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

          {/* ETF Recommendations */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-foreground mb-8 animate-fade-in delay-500">
              <span className="text-gradient-financial">Aanbevolen ETF&apos;s</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 hover:scale-105 animate-fade-in delay-600">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">VWRL</CardTitle>
                  <CardDescription className="text-muted-foreground">Vanguard FTSE All-World UCITS</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kosten:</span>
                      <span className="text-foreground">0.22%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rendement (5j):</span>
                      <span className="text-foreground">8.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risico:</span>
                      <span className="text-foreground">Gemiddeld</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 hover:scale-105 animate-fade-in delay-700">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">IWDA</CardTitle>
                  <CardDescription className="text-muted-foreground">iShares Core MSCI World</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kosten:</span>
                      <span className="text-foreground">0.20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rendement (5j):</span>
                      <span className="text-foreground">7.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risico:</span>
                      <span className="text-foreground">Gemiddeld</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 hover:scale-105 animate-fade-in delay-800">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">EMIM</CardTitle>
                  <CardDescription className="text-muted-foreground">iShares Core MSCI EM IMI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kosten:</span>
                      <span className="text-foreground">0.18%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rendement (5j):</span>
                      <span className="text-foreground">6.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risico:</span>
                      <span className="text-foreground">Hoog</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}