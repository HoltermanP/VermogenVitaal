"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Calculator, Download, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-3 animate-fade-in">
              ETF Groei Calculator
            </h1>
            <p className="text-lg text-gray-300 animate-fade-in delay-200">
              Bereken de potentiële groei van je ETF beleggingen
            </p>
          </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Input Form */}
                  <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 animate-fade-in delay-300">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <TrendingUp className="h-5 w-5 mr-2 text-emerald-400" />
                        Beleggingsparameters
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Vul je beleggingsgegevens in voor een groeiprojectie
                      </CardDescription>
                    </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="initial-amount" className="text-white">Startbedrag</Label>
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
                    className="mt-1 text-white placeholder:text-transparent"
                  />
                </div>

                <div>
                  <Label htmlFor="monthly-contribution" className="text-white">Maandelijkse Inleg</Label>
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
                    className="mt-1 text-white placeholder:text-transparent"
                  />
                </div>

                <div>
                  <Label htmlFor="expected-return" className="text-white">Verwachte Jaarlijkse Rendement (%)</Label>
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
                    className="mt-1 text-white placeholder:text-transparent"
                  />
                </div>

                <div>
                  <Label htmlFor="investment-period" className="text-white">Beleggingsperiode (jaren)</Label>
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
                    className="mt-1 text-white placeholder:text-transparent"
                  />
                </div>

                <div>
                  <Label htmlFor="risk-profile" className="text-white">Risicoprofiel</Label>
                  <Select value={formData.riskProfile} onValueChange={(value) => handleInputChange('riskProfile', value)}>
                    <SelectTrigger className="mt-1 text-white w-full [&>span]:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservatief (4-6%)</SelectItem>
                      <SelectItem value="moderate">Gematigd (6-8%)</SelectItem>
                      <SelectItem value="aggressive">Agressief (8-10%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" size="lg" onClick={calculateGrowth}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Bereken Groei
                </Button>
              </CardContent>
            </Card>

                  {/* Results */}
                  <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 animate-fade-in delay-400">
                    <CardHeader>
                      <CardTitle className="text-white">Groeiprojectie</CardTitle>
                      <CardDescription className="text-gray-300">
                        20-jarige ETF groeiprojectie
                      </CardDescription>
                    </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Summary */}
                  {results ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all duration-300">
                      <h3 className="font-semibold text-emerald-300 mb-3">Eindresultaat</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Totaal Ingelegd:</span>
                          <span className="font-medium text-white">€{results.totalInvested.toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Verwachte Waarde:</span>
                          <span className="font-medium text-white">€{results.totalValue.toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between border-t border-emerald-500/30 pt-2">
                          <span className="font-semibold text-white">Winst:</span>
                          <span className="font-semibold text-emerald-400">€{results.profit.toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-xl">
                      <p className="text-gray-400 text-center">Klik op "Bereken Groei" om resultaten te zien</p>
                    </div>
                  )}

                  {/* Yearly Breakdown */}
                  {results && (
                    <div>
                      <h3 className="font-semibold text-white mb-3">Jaarlijkse Ontwikkeling</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Na 5 jaar:</span>
                          <span className="text-white">€{results.year5.toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Na 10 jaar:</span>
                          <span className="text-white">€{results.year10.toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Na 15 jaar:</span>
                          <span className="text-white">€{results.year15.toLocaleString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Na 20 jaar:</span>
                          <span className="font-semibold text-emerald-400">€{results.year20.toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Growth Chart */}
                  {results && results.yearlyBreakdown && results.yearlyBreakdown.length > 0 ? (
                    <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-xl">
                      <h3 className="font-semibold text-white mb-4">Groeigrafiek</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart
                          data={results.yearlyBreakdown}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                          <XAxis 
                            dataKey="year" 
                            stroke="#94a3b8"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `Jaar ${value}`}
                          />
                          <YAxis 
                            stroke="#94a3b8"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1e293b',
                              border: '1px solid #475569',
                              borderRadius: '8px',
                              color: '#f1f5f9'
                            }}
                            formatter={(value: number) => [`€${value.toLocaleString('nl-NL')}`, 'Waarde']}
                            labelFormatter={(label) => `Jaar ${label}`}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-center hover:bg-slate-700 transition-all duration-300">
                      <p className="text-sm text-gray-400">
                        📈 Klik op "Bereken Groei" om de groeigrafiek te zien
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
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
                    <Button variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-blue-500/50 hover:text-blue-300 transition-all duration-300" asChild>
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
            <h2 className="text-3xl font-bold text-white mb-8 animate-fade-in delay-500">Aanbevolen ETF's</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-105 animate-fade-in delay-600">
                <CardHeader>
                  <CardTitle className="text-lg text-white">VWRL</CardTitle>
                  <CardDescription className="text-gray-300">Vanguard FTSE All-World UCITS</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Kosten:</span>
                      <span className="text-white">0.22%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Rendement (5j):</span>
                      <span className="text-white">8.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Risico:</span>
                      <span className="text-white">Gemiddeld</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-105 animate-fade-in delay-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">IWDA</CardTitle>
                  <CardDescription className="text-gray-300">iShares Core MSCI World</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Kosten:</span>
                      <span className="text-white">0.20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Rendement (5j):</span>
                      <span className="text-white">7.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Risico:</span>
                      <span className="text-white">Gemiddeld</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-105 animate-fade-in delay-800">
                <CardHeader>
                  <CardTitle className="text-lg text-white">EMIM</CardTitle>
                  <CardDescription className="text-gray-300">iShares Core MSCI EM IMI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Kosten:</span>
                      <span className="text-white">0.18%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Rendement (5j):</span>
                      <span className="text-white">6.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Risico:</span>
                      <span className="text-white">Hoog</span>
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