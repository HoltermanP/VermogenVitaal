"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Medal, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type StockQuote = {
  symbol: string
  price: number
  changePercent: number
  volume: number
  previousClose: number
}

type Top3Stock = {
  symbol: string
  name: string
  quote: StockQuote
  score: number
  reasons: string[]
  rank: number
}

type DailyTop3Response = {
  date: string
  top3: Top3Stock[]
}

type DailyTop3Props = {
  selectedCurrency?: "EUR" | "USD"
  eurToUsdRate?: number
}

export function DailyTop3({ selectedCurrency = "EUR", eurToUsdRate = 1.10 }: DailyTop3Props) {
  const [data, setData] = useState<DailyTop3Response | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper functie om prijzen te converteren en formatteren
  const formatPrice = (price: number, decimals: number = 2): string => {
    const convertedPrice = selectedCurrency === "EUR" ? price / eurToUsdRate : price
    const symbol = selectedCurrency === "EUR" ? "€" : "$"
    return `${symbol}${convertedPrice.toFixed(decimals)}`
  }

  useEffect(() => {
    const fetchTop3 = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/stocks/daily-top-3")
        if (!response.ok) {
          throw new Error("Fout bij ophalen dag-top 3")
        }
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        console.error("Error fetching daily top 3:", err)
        setError(err instanceof Error ? err.message : "Onbekende fout")
      } finally {
        setLoading(false)
      }
    }

    fetchTop3()
  }, [])

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl mb-8">
        <CardHeader>
          <CardTitle className="text-foreground text-2xl flex items-center gap-2">
            <Medal className="h-6 w-6 text-primary" />
            Dag-Top 3 Beleggingsproducten (Korte Termijn)
          </CardTitle>
          <CardDescription>
            De beste korte termijn beleggingskansen van vandaag
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data || data.top3.length === 0) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl mb-8">
        <CardHeader>
          <CardTitle className="text-foreground text-2xl flex items-center gap-2">
            <Medal className="h-6 w-6 text-primary" />
            Dag-Top 3 Beleggingsproducten (Korte Termijn)
          </CardTitle>
          <CardDescription>
            De beste korte termijn beleggingskansen van vandaag
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {error || "Geen data beschikbaar"}
          </p>
        </CardContent>
      </Card>
    )
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-white"
      default:
        return "bg-muted"
    }
  }

  const getRankIcon = (rank: number) => {
    return <Medal className="h-5 w-5" />
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground text-2xl flex items-center gap-2">
              <Medal className="h-6 w-6 text-primary" />
              Dag-Top 3 Beleggingsproducten (Korte Termijn)
            </CardTitle>
            <CardDescription className="mt-1">
              De beste korte termijn beleggingskansen van vandaag - Bijgewerkt: {new Date(data.date).toLocaleDateString('nl-NL')}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4" />
            Vernieuwen
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.top3.map((stock) => (
            <div
              key={stock.symbol}
              className="p-4 bg-accent/10 border border-primary/20 rounded-xl hover:bg-accent/20 hover:border-primary/40 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Rank Badge */}
                  <div
                    className={`${getRankColor(stock.rank)} w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg`}
                  >
                    {stock.rank}
                  </div>

                  {/* Stock Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg">
                        {stock.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {stock.symbol}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span>{formatPrice(stock.quote.price)}</span>
                      <span
                        className={`flex items-center gap-1 font-medium ${
                          stock.quote.changePercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stock.quote.changePercent >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {stock.quote.changePercent >= 0 ? "+" : ""}
                        {stock.quote.changePercent.toFixed(2)}%
                      </span>
                      <span className="text-xs">
                        Score: {stock.score.toFixed(1)}/100
                      </span>
                    </div>
                    {/* Reasons */}
                    {stock.reasons.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          Belangrijkste factoren:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          {stock.reasons.slice(0, 3).map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-primary mr-1">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300 flex-shrink-0"
                  asChild
                >
                  <Link
                    href={`/stocks?symbol=${stock.symbol}`}
                    className="flex items-center gap-1"
                  >
                    <span>Bekijk</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Link naar stocks pagina */}
        <div className="mt-6 pt-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full text-primary hover:text-primary/80 hover:bg-primary/10"
            asChild
          >
            <Link href="/stocks" className="flex items-center justify-center gap-2">
              <span>Bekijk alle beleggingsproducten</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

