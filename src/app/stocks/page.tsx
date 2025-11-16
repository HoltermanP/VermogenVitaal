"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown, RefreshCw, Activity, Search, Star, StarOff, X } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { toast } from "sonner"

type StockQuote = {
  symbol: string
  open: number
  high: number
  low: number
  price: number
  volume: number
  latestTradingDay: string
  previousClose: number
  change: number
  changePercent: number
}

type StockHistory = {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

type StockSearchResult = {
  symbol: string
  name: string
  exchange: string
  type: string
  market: string
}

type StockFavorite = {
  id: string
  symbol: string
  name: string
  exchange: string | null
  type: string | null
}

const PERIODS = [
  { value: "1D", label: "1 Dag" },
  { value: "1W", label: "1 Week" },
  { value: "1M", label: "1 Maand" },
  { value: "3M", label: "3 Maanden" },
  { value: "1Y", label: "1 Jaar" },
  { value: "ALL", label: "Alles" },
]

export default function StocksPage() {
  const { user, isLoaded } = useUser()
  const [selectedStock, setSelectedStock] = useState("ASML")
  const [selectedPeriod, setSelectedPeriod] = useState("1M")
  const [quote, setQuote] = useState<StockQuote | null>(null)
  const [history, setHistory] = useState<StockHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [favorites, setFavorites] = useState<StockFavorite[]>([])
  const [favoriteQuotes, setFavoriteQuotes] = useState<Record<string, StockQuote>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)

  // Laad quote voor geselecteerd aandeel
  const fetchQuote = async (symbol: string) => {
    try {
      const response = await fetch(`/api/stocks/quote?symbol=${symbol}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Fout bij ophalen koers")
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching quote:", error)
      throw error
    }
  }

  // Laad historische data
  const fetchHistory = async (symbol: string, period: string) => {
    try {
      const response = await fetch(
        `/api/stocks/history?symbol=${symbol}&period=${period}`
      )
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Fout bij ophalen historie")
      }
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error("Error fetching history:", error)
      throw error
    }
  }

  // Laad favorieten
  const loadFavorites = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return

    try {
      const response = await fetch("/api/stocks/favorites")
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
        
        // Laad quotes voor favorieten
        const quotes: Record<string, StockQuote> = {}
        const promises = data.favorites.map(async (fav: StockFavorite) => {
          try {
            const quoteData = await fetchQuote(fav.symbol)
            quotes[fav.symbol] = quoteData
          } catch (error) {
            console.error(`Error fetching quote for ${fav.symbol}:`, error)
          }
        })
        await Promise.all(promises)
        setFavoriteQuotes(quotes)
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
    }
  }

  // Zoek aandelen
  const searchStocks = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
      }
    } catch (error) {
      console.error("Error searching stocks:", error)
      toast.error("Fout bij zoeken")
    } finally {
      setSearching(false)
    }
  }

  // Voeg favoriet toe
  const addFavorite = async (stock: StockSearchResult) => {
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      toast.error("Log in om favorieten toe te voegen")
      return
    }

    try {
      const response = await fetch("/api/stocks/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          exchange: stock.exchange,
          type: stock.type,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setFavorites([...favorites, data.favorite])
        toast.success(`${stock.name} toegevoegd aan favorieten`)
        setSearchDialogOpen(false)
        setSearchQuery("")
      } else {
        const error = await response.json()
        toast.error(error.error || "Fout bij toevoegen favoriet")
      }
    } catch (error) {
      console.error("Error adding favorite:", error)
      toast.error("Fout bij toevoegen favoriet")
    }
  }

  // Verwijder favoriet
  const removeFavorite = async (symbol: string) => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return

    try {
      const response = await fetch(`/api/stocks/favorites?symbol=${symbol}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFavorites(favorites.filter((f) => f.symbol !== symbol))
        const newQuotes = { ...favoriteQuotes }
        delete newQuotes[symbol]
        setFavoriteQuotes(newQuotes)
        toast.success("Favoriet verwijderd")
      } else {
        toast.error("Fout bij verwijderen favoriet")
      }
    } catch (error) {
      console.error("Error removing favorite:", error)
      toast.error("Fout bij verwijderen favoriet")
    }
  }

  // Laad data voor geselecteerd aandeel
  const loadStockData = async (symbol: string, period: string) => {
    setLoading(true)
    try {
      const [quoteData, historyData] = await Promise.all([
        fetchQuote(symbol),
        fetchHistory(symbol, period),
      ])
      setQuote(quoteData)
      setHistory(historyData)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fout bij laden beursdata"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadStockData(selectedStock, selectedPeriod)
    if (isLoaded && user?.emailAddresses?.[0]?.emailAddress) {
      loadFavorites()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user])

  // Update bij wijziging van aandeel of periode
  useEffect(() => {
    if (selectedStock) {
      loadStockData(selectedStock, selectedPeriod)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStock, selectedPeriod])

  // Zoek debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchStocks(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Refresh functie
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        loadStockData(selectedStock, selectedPeriod),
        loadFavorites(),
      ])
      toast.success("Koersen bijgewerkt")
    } catch {
      toast.error("Fout bij bijwerken koersen")
    } finally {
      setRefreshing(false)
    }
  }

  // Check of aandeel favoriet is
  const isFavorite = (symbol: string) => {
    return favorites.some((f) => f.symbol === symbol)
  }

  // Format date voor grafiek
  const formatDate = (dateString: string, period: string) => {
    const date = new Date(dateString)
    if (period === "1D" || period === "1W") {
      return date.toLocaleTimeString("nl-NL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    }
    return date.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  // Haal naam op voor geselecteerd aandeel
  const getStockName = (symbol: string) => {
    const favorite = favorites.find((f) => f.symbol === symbol)
    if (favorite) return favorite.name
    
    const result = searchResults.find((r) => r.symbol === symbol)
    if (result) return result.name
    
    return symbol
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                Beurskoersen
              </h1>
              <p className="text-muted-foreground text-lg">
                Realtime koersen en koersontwikkeling
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Zoek Aandelen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Zoek Aandelen en ETF&apos;s</DialogTitle>
                    <DialogDescription>
                      Zoek naar alle beschikbare aandelen en ETF&apos;s wereldwijd
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Zoek op naam of symbool (bijv. Apple, AAPL, ASML)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {searching && (
                      <div className="flex items-center justify-center py-8">
                        <Skeleton className="h-8 w-full" />
                      </div>
                    )}
                    {!searching && searchResults.length > 0 && (
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {searchResults.map((result) => (
                          <div
                            key={result.symbol}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-foreground">
                                {result.symbol}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {result.name}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {result.exchange} • {result.type}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedStock(result.symbol)
                                  setSearchDialogOpen(false)
                                  setSearchQuery("")
                                }}
                              >
                                Selecteer
                              </Button>
                              {user?.emailAddresses?.[0]?.emailAddress && (
                                <Button
                                  size="sm"
                                  variant={isFavorite(result.symbol) ? "default" : "outline"}
                                  onClick={() => {
                                    if (isFavorite(result.symbol)) {
                                      removeFavorite(result.symbol)
                                    } else {
                                      addFavorite(result)
                                    }
                                  }}
                                >
                                  {isFavorite(result.symbol) ? (
                                    <Star className="h-4 w-4 fill-current" />
                                  ) : (
                                    <StarOff className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Geen resultaten gevonden
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Ververs
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Linker kolom - Favorieten */}
          <div className="lg:col-span-1 space-y-6">
            {user?.emailAddresses?.[0]?.emailAddress ? (
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="text-foreground">Mijn Favorieten</CardTitle>
                  <CardDescription>
                    Je opgeslagen aandelen en ETF&apos;s
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {favorites.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nog geen favorieten</p>
                      <p className="text-sm mt-2">Zoek en voeg aandelen toe</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {favorites.map((favorite) => {
                        const quote = favoriteQuotes[favorite.symbol]
                        const isSelected = selectedStock === favorite.symbol

                        return (
                          <div
                            key={favorite.id}
                            className={`p-4 rounded-xl border transition-all duration-300 ${
                              isSelected
                                ? "bg-primary/20 border-primary shadow-lg"
                                : "bg-accent/10 border-primary/20 hover:bg-accent/20 hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <button
                                onClick={() => setSelectedStock(favorite.symbol)}
                                className="flex-1 text-left"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="font-semibold text-foreground">
                                    {favorite.symbol}
                                  </div>
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">
                                  {favorite.name}
                                </div>
                                {quote ? (
                                  <div>
                                    <div className="font-bold text-foreground">
                                      ${quote.price.toFixed(2)}
                                    </div>
                                    <div
                                      className={`text-sm flex items-center gap-1 ${
                                        quote.change >= 0
                                          ? "text-green-500"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {quote.change >= 0 ? (
                                        <TrendingUp className="h-3 w-3" />
                                      ) : (
                                        <TrendingDown className="h-3 w-3" />
                                      )}
                                      {quote.changePercent.toFixed(2)}%
                                    </div>
                                  </div>
                                ) : (
                                  <Skeleton className="h-8 w-16" />
                                )}
                              </button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFavorite(favorite.symbol)}
                                className="ml-2"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="text-foreground">Favorieten</CardTitle>
                  <CardDescription>
                    Log in om favorieten op te slaan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Log in om je favoriete aandelen en ETF&apos;s op te slaan en direct te bekijken.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Aandeel selectie */}
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <CardTitle className="text-foreground">Huidig Aandeel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 border rounded-lg bg-accent/10">
                    <div className="font-semibold text-foreground">
                      {selectedStock}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getStockName(selectedStock)}
                    </div>
                  </div>
                  {user?.emailAddresses?.[0]?.emailAddress && !isFavorite(selectedStock) && quote && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        addFavorite({
                          symbol: selectedStock,
                          name: getStockName(selectedStock),
                          exchange: "",
                          type: "STOCK",
                          market: "",
                        })
                      }}
                    >
                      <StarOff className="h-4 w-4 mr-2" />
                      Toevoegen aan favorieten
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rechter kolom - Koersdetails en grafiek */}
          <div className="lg:col-span-2 space-y-6">
            {/* Koersdetails */}
            {loading && !quote ? (
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardContent className="pt-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ) : quote ? (
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-foreground text-2xl">
                        {getStockName(selectedStock)}
                      </CardTitle>
                      <CardDescription>
                        {quote.symbol}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {user?.emailAddresses?.[0]?.emailAddress && (
                        <Button
                          size="sm"
                          variant={isFavorite(selectedStock) ? "default" : "outline"}
                          onClick={() => {
                            if (isFavorite(selectedStock)) {
                              removeFavorite(selectedStock)
                            } else {
                              addFavorite({
                                symbol: selectedStock,
                                name: getStockName(selectedStock),
                                exchange: "",
                                type: "STOCK",
                                market: "",
                              })
                            }
                          }}
                        >
                          {isFavorite(selectedStock) ? (
                            <Star className="h-4 w-4 fill-current" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Badge
                        variant={quote.change >= 0 ? "default" : "destructive"}
                        className="text-lg px-4 py-2"
                      >
                        {quote.change >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-2" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-2" />
                        )}
                        ${quote.price.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Verandering</div>
                      <div
                        className={`text-lg font-semibold ${
                          quote.change >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {quote.change >= 0 ? "+" : ""}
                        {quote.change.toFixed(2)} (
                        {quote.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Open</div>
                      <div className="text-lg font-semibold text-foreground">
                        ${quote.open.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Hoog</div>
                      <div className="text-lg font-semibold text-foreground">
                        ${quote.high.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Laag</div>
                      <div className="text-lg font-semibold text-foreground">
                        ${quote.low.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Volume</div>
                      <div className="text-lg font-semibold text-foreground">
                        {quote.volume.toLocaleString("nl-NL")}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Vorige Sluiting
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        ${quote.previousClose.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Laatste Handel
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        {new Date(quote.latestTradingDay).toLocaleDateString(
                          "nl-NL"
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Grafiek */}
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Koersontwikkeling</CardTitle>
                  <Select
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODS.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-96 w-full" />
                ) : history.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={history}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(0.50 0.02 240)"
                        opacity={0.2}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="oklch(0.60 0 0)"
                        style={{ fontSize: "12px" }}
                        tickFormatter={(value) =>
                          formatDate(value, selectedPeriod)
                        }
                      />
                      <YAxis
                        stroke="oklch(0.60 0 0)"
                        style={{ fontSize: "12px" }}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.22 0.02 240)",
                          border: "1px solid oklch(0.32 0.025 250)",
                          borderRadius: "8px",
                          color: "oklch(0.98 0 0)",
                        }}
                        formatter={(value: number) => [
                          `$${value.toFixed(2)}`,
                          "Koers",
                        ]}
                        labelFormatter={(label) =>
                          new Date(label).toLocaleString("nl-NL")
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="close"
                        stroke="oklch(0.65 0.18 150)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-96 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Geen data beschikbaar</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
