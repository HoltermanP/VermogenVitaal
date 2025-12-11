"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Calculator, Target, DollarSign } from "lucide-react"
import { useState } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

type CompoundResults = {
  principal: number
  totalContributions: number
  totalInterest: number
  finalAmount: number
  yearlyBreakdown: Array<{
    year: number
    balance: number
    interest: number
    contributions: number
  }>
}

export default function CompoundInterestCalculatorPage() {
  const [formData, setFormData] = useState({
    principal: 10000,
    annualInterestRate: 7,
    years: 10,
    compoundingFrequency: "12", // monthly
    monthlyContribution: 0
  })

  const [results, setResults] = useState<CompoundResults | null>(null)

  const calculateCompoundInterest = () => {
    const { principal, annualInterestRate, years, monthlyContribution } = formData

    let balance = principal
    let totalContributions = principal
    let totalInterest = 0

    const yearlyBreakdown = []

    // Calculate year by year breakdown
    for (let year = 0; year <= years; year++) {
      if (year > 0) {
        // Calculate growth for this year
        const yearInterest = balance * (annualInterestRate / 100)
        const yearContributions = monthlyContribution * 12

        balance = balance * Math.pow(1 + (annualInterestRate / 100), 1) + yearContributions
        totalContributions += yearContributions
        totalInterest += yearInterest
      }

      yearlyBreakdown.push({
        year,
        balance: Math.round(balance),
        interest: year === 0 ? 0 : Math.round(balance - totalContributions),
        contributions: Math.round(totalContributions)
      })
    }

    setResults({
      principal,
      totalContributions,
      totalInterest: Math.round(totalInterest),
      finalAmount: Math.round(balance),
      yearlyBreakdown
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 gradient-financial rounded-2xl flex items-center justify-center mr-6 shadow-financial">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  Compound Interest Calculator
                </h1>
                <p className="text-xl text-muted-foreground">
                  Bereken de kracht van rente-op-rente effect
                </p>
              </div>
            </div>
          </div>

          {/* News Ticker */}
          <div className="mb-8">
            <NewsTicker pagePath="/calculators/compound-interest" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Input Form */}
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Calculator className="mr-3 h-6 w-6 text-primary" />
                  Invoer Parameters
                </CardTitle>
                <CardDescription>
                  Vul je investeringsgegevens in om de compound interest te berekenen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="principal">Beginkapitaal (€)</Label>
                    <Input
                      id="principal"
                      type="number"
                      value={formData.principal}
                      onChange={(e) => setFormData({...formData, principal: Number(e.target.value)})}
                      placeholder="10000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualInterestRate">Jaarlijkse rente (%)</Label>
                    <Input
                      id="annualInterestRate"
                      type="number"
                      step="0.1"
                      value={formData.annualInterestRate}
                      onChange={(e) => setFormData({...formData, annualInterestRate: Number(e.target.value)})}
                      placeholder="7"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="years">Looptijd (jaren)</Label>
                    <Input
                      id="years"
                      type="number"
                      value={formData.years}
                      onChange={(e) => setFormData({...formData, years: Number(e.target.value)})}
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyContribution">Maandelijkse bijdrage (€)</Label>
                    <Input
                      id="monthlyContribution"
                      type="number"
                      value={formData.monthlyContribution}
                      onChange={(e) => setFormData({...formData, monthlyContribution: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compoundingFrequency">Compound frequentie</Label>
                  <Select value={formData.compoundingFrequency} onValueChange={(value) => setFormData({...formData, compoundingFrequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Jaarlijks</SelectItem>
                      <SelectItem value="2">Halfjaarlijks</SelectItem>
                      <SelectItem value="4">Kwartaalelijks</SelectItem>
                      <SelectItem value="12">Maandelijks</SelectItem>
                      <SelectItem value="365">Dagelijks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={calculateCompoundInterest}
                  className="w-full py-3 text-lg font-semibold gradient-financial text-white border-0 shadow-financial hover:shadow-financial-lg transition-all duration-300"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Bereken Compound Interest
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {results && (
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <DollarSign className="mr-3 h-6 w-6 text-primary" />
                    Resultaten
                  </CardTitle>
                  <CardDescription>
                    Overzicht van je compound interest berekening
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Beginkapitaal</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(results.principal)}</p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Totale bijdragen</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(results.totalContributions)}</p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Totale rente</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(results.totalInterest)}</p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Eindbedrag</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(results.finalAmount)}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-muted-foreground mb-1">Rendement</p>
                    <p className="text-3xl font-bold text-green-700">
                      {((results.finalAmount / results.principal - 1) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {((results.finalAmount / results.principal) ** (1 / formData.years) - 1).toFixed(2)}% gemiddeld per jaar
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chart */}
          {results && (
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl mb-8">
              <CardHeader>
                <CardTitle>Groeicurve</CardTitle>
                <CardDescription>
                  Ontwikkeling van je investering over de tijd
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={results.yearlyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="year"
                        label={{ value: 'Jaren', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis
                        tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                        label={{ value: 'Bedrag (€)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Bedrag']}
                        labelFormatter={(label) => `Jaar ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pro Tips */}
          <div className="bg-accent/10 border border-primary/20 rounded-2xl p-8 hover:border-primary/40 hover:shadow-financial-lg transition-all duration-500">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 gradient-financial rounded-xl flex items-center justify-center mr-4 shadow-financial">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                💡 Compound Interest Feiten
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Wat is compound interest?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Compound interest is rente-op-rente. Je verdient rente over je oorspronkelijke investering én over de rente die je al hebt verdiend.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Waarom is tijd belangrijk?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Door vroeg te beginnen met beleggen, kun je profiteren van het rente-op-rente effect. Elke dag dat je wacht, mis je potentiële groei.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Regelmatig bijdragen</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Regelmatige maandelijkse bijdragen kunnen je eindbedrag aanzienlijk verhogen door consistentie en compound interest.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Realistische verwachtingen</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Historisch gezien levert de aandelenmarkt gemiddeld 7-10% per jaar. Gebruik dit als richtlijn voor je verwachtingen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}