"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"

// Dynamic rendering wordt afgehandeld door de layout

// Controleer of Clerk beschikbaar is
function isClerkAvailable(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return !!publishableKey &&
         publishableKey !== 'pk_test_...' &&
         !publishableKey.includes('placeholder') &&
         !publishableKey.includes('dummy')
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Bell, 
  BellOff,
  RefreshCw,
  AlertCircle,
  Wallet
} from "lucide-react"
import { toast } from "sonner"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

type PortfolioItem = {
  id: string
  symbol: string
  name: string
  exchange: string | null
  type: string | null
  quantity: number
  averagePrice: number | null
  alertThreshold: number | null
  lastPrice: number | null
  lastAlertAt: string | null
  alertEnabled: boolean
  createdAt: string
  updatedAt: string
}

type StockQuote = {
  symbol: string
  price: number
  change: number
  changePercent: number
}

type PortfolioHistoryData = {
  date: string
  value: number
}

type PortfolioReturnData = {
  date: string
  return: number
  returnPercent: number
}

export default function PortfolioPage() {
  // Controleer of Clerk beschikbaar is
  const isClerkEnabled = isClerkAvailable()

  // Hook altijd aanroepen, maar alleen gebruiken als Clerk beschikbaar is
  const { user, isLoaded } = useUser()
  const effectiveUser = isClerkEnabled ? user : null
  const effectiveIsLoaded = isClerkEnabled ? isLoaded : true
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string; exchange: string; type: string }>>([])
  const [searching, setSearching] = useState(false)
  const [historyData, setHistoryData] = useState<PortfolioHistoryData[]>([])
  const [returnData, setReturnData] = useState<PortfolioReturnData[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyPeriod, setHistoryPeriod] = useState("1Y")

  // Form state
  const [formSymbol, setFormSymbol] = useState("")
  const [formName, setFormName] = useState("")
  const [formExchange, setFormExchange] = useState("")
  const [formType, setFormType] = useState("")
  const [formQuantity, setFormQuantity] = useState("")
  const [formAveragePrice, setFormAveragePrice] = useState("")
  const [formAlertThreshold, setFormAlertThreshold] = useState("")

  // Laad portfolio
  const loadPortfolio = async () => {
    try {
      const response = await fetch("/api/portfolio")
      if (response.ok) {
        const data = await response.json()
        setPortfolio(data.portfolio || [])
        
        // Haal quotes op voor alle items
        if (data.portfolio && data.portfolio.length > 0) {
          loadQuotes(data.portfolio)
          loadPortfolioHistory()
        } else {
          setHistoryData([])
          setReturnData([])
        }
      }
    } catch (error) {
      console.error("Error loading portfolio:", error)
      toast.error("Fout bij laden portefeuille")
    } finally {
      setLoading(false)
    }
  }

  // Laad historische portfolio data
  const loadPortfolioHistory = async () => {
    const currentPortfolio = portfolio.length > 0 ? portfolio : []
    if (currentPortfolio.length === 0) {
      setHistoryData([])
      setReturnData([])
      return
    }

    setHistoryLoading(true)
    try {
      const response = await fetch(`/api/portfolio/history?period=${historyPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setHistoryData(data.totalValue || [])
        setReturnData(data.totalReturn || [])
      }
    } catch (error) {
      console.error("Error loading portfolio history:", error)
    } finally {
      setHistoryLoading(false)
    }
  }

  // Haal quotes op voor alle portfolio items
  const loadQuotes = async (items: PortfolioItem[]) => {
    const quotePromises = items.map(async (item) => {
      try {
        const response = await fetch(`/api/stocks/quote?symbol=${encodeURIComponent(item.symbol)}`)
        if (response.ok) {
          const quote = await response.json()
          return { symbol: item.symbol, quote }
        }
      } catch (error) {
        console.error(`Error fetching quote for ${item.symbol}:`, error)
      }
      return null
    })

    const results = await Promise.all(quotePromises)
    const quotesMap: Record<string, StockQuote> = {}
    
    results.forEach((result) => {
      if (result && result.quote) {
        quotesMap[result.symbol] = result.quote
      }
    })

    setQuotes(quotesMap)
  }

  // Check voor alerts
  const checkAlerts = async () => {
    try {
      const response = await fetch("/api/portfolio/check-alerts", {
        method: "POST",
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.alerts && data.alerts.length > 0) {
          data.alerts.forEach((alert: { symbol: string; name: string; changePercent: number; type: 'gain' | 'loss' }) => {
            const message = `${alert.name} (${alert.symbol}) is ${Math.abs(alert.changePercent).toFixed(2)}% ${alert.type === 'gain' ? 'gestegen' : 'gedaald'}`
            if (alert.type === 'gain') {
              toast.success(message, { duration: 10000 })
            } else {
              toast.error(message, { duration: 10000 })
            }
          })
        }
      }
    } catch (error) {
      console.error("Error checking alerts:", error)
    }
  }

  // Zoek stocks
  const searchStocks = async (query: string) => {
    if (!query || query.length < 2) {
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
    } finally {
      setSearching(false)
    }
  }

  // Voeg item toe
  const handleAdd = async () => {
    if (!formSymbol || !formName || !formQuantity) {
      toast.error("Vul alle verplichte velden in")
      return
    }

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: formSymbol,
          name: formName,
          exchange: formExchange || null,
          type: formType || null,
          quantity: parseFloat(formQuantity),
          averagePrice: formAveragePrice ? parseFloat(formAveragePrice) : null,
          alertThreshold: formAlertThreshold ? parseFloat(formAlertThreshold) : null,
        }),
      })

      if (response.ok) {
        toast.success("Item toegevoegd aan portefeuille")
        setAddDialogOpen(false)
        resetForm()
        loadPortfolio()
      } else {
        const error = await response.json()
        toast.error(error.error || "Fout bij toevoegen item")
      }
    } catch (error) {
      console.error("Error adding item:", error)
      toast.error("Fout bij toevoegen item")
    }
  }

  // Update item
  const handleUpdate = async () => {
    if (!editingItem) return

    try {
      const response = await fetch(`/api/portfolio/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: formQuantity ? parseFloat(formQuantity) : undefined,
          averagePrice: formAveragePrice ? parseFloat(formAveragePrice) : null,
          alertThreshold: formAlertThreshold ? parseFloat(formAlertThreshold) : null,
        }),
      })

      if (response.ok) {
        toast.success("Item bijgewerkt")
        setEditDialogOpen(false)
        setEditingItem(null)
        resetForm()
        loadPortfolio()
      } else {
        const error = await response.json()
        toast.error(error.error || "Fout bij bijwerken item")
      }
    } catch (error) {
      console.error("Error updating item:", error)
      toast.error("Fout bij bijwerken item")
    }
  }

  // Verwijder item
  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je dit item wilt verwijderen?")) {
      return
    }

    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Item verwijderd")
        loadPortfolio()
      } else {
        const error = await response.json()
        toast.error(error.error || "Fout bij verwijderen item")
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error("Fout bij verwijderen item")
    }
  }

  // Toggle alert
  const handleToggleAlert = async (item: PortfolioItem) => {
    try {
      const response = await fetch(`/api/portfolio/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertEnabled: !item.alertEnabled,
        }),
      })

      if (response.ok) {
        toast.success(`Alerts ${!item.alertEnabled ? 'ingeschakeld' : 'uitgeschakeld'}`)
        loadPortfolio()
      }
    } catch (error) {
      console.error("Error toggling alert:", error)
      toast.error("Fout bij wijzigen alert instelling")
    }
  }

  // Reset form
  const resetForm = () => {
    setFormSymbol("")
    setFormName("")
    setFormExchange("")
    setFormType("")
    setFormQuantity("")
    setFormAveragePrice("")
    setFormAlertThreshold("")
    setSearchQuery("")
    setSearchResults([])
  }

  // Open edit dialog
  const openEditDialog = (item: PortfolioItem) => {
    setEditingItem(item)
    setFormQuantity(item.quantity.toString())
    setFormAveragePrice(item.averagePrice?.toString() || "")
    setFormAlertThreshold(item.alertThreshold?.toString() || "")
    setEditDialogOpen(true)
  }

  // Bereken totale waarde
  const calculateTotalValue = () => {
    return portfolio.reduce((total, item) => {
      const quote = quotes[item.symbol]
      if (quote) {
        return total + (quote.price * item.quantity)
      }
      return total
    }, 0)
  }

  // Bereken totaal rendement
  const calculateTotalReturn = () => {
    return portfolio.reduce((total, item) => {
      const quote = quotes[item.symbol]
      if (quote && item.averagePrice) {
        const currentValue = quote.price * item.quantity
        const costBasis = item.averagePrice * item.quantity
        return total + (currentValue - costBasis)
      }
      return total
    }, 0)
  }

  useEffect(() => {
    if (effectiveIsLoaded && effectiveUser) {
      loadPortfolio()
      
      // Check alerts elke 5 minuten
      const alertInterval = setInterval(() => {
        checkAlerts()
      }, 5 * 60 * 1000)

      // Check direct bij laden
      const initialCheck = setTimeout(() => {
        checkAlerts()
      }, 2000)

      return () => {
        clearInterval(alertInterval)
        clearTimeout(initialCheck)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveIsLoaded, effectiveUser])

  useEffect(() => {
    if (portfolio.length > 0) {
      loadPortfolioHistory()
    } else {
      setHistoryData([])
      setReturnData([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyPeriod, portfolio.length])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchStocks(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!effectiveUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Log in om je portefeuille te bekijken
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalValue = calculateTotalValue()
  const totalReturn = calculateTotalReturn()
  const totalReturnPercent = portfolio.reduce((sum, item) => {
    const quote = quotes[item.symbol]
    if (quote && item.averagePrice) {
      return sum + ((quote.price - item.averagePrice) / item.averagePrice * 100)
    }
    return sum
  }, 0) / (portfolio.length || 1)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mijn Portefeuille</h1>
          <p className="text-muted-foreground mt-1">
            Beheer je investeringen en ontvang meldingen bij prijsveranderingen
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setRefreshing(true)
              loadPortfolio().then(() => {
                checkAlerts()
                setRefreshing(false)
              })
            }}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Verversen
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Item toevoegen aan portefeuille</DialogTitle>
                <DialogDescription>
                  Voeg een aandeel of ETF toe aan je portefeuille
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Zoek aandeel of ETF</Label>
                  <Input
                    id="search"
                    placeholder="Zoek op naam of symbool..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searching && <p className="text-sm text-muted-foreground mt-1">Zoeken...</p>}
                  {searchResults.length > 0 && (
                    <div className="mt-2 border rounded-md max-h-48 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result.symbol}
                          className="p-2 hover:bg-accent cursor-pointer"
                          onClick={() => {
                            setFormSymbol(result.symbol)
                            setFormName(result.name)
                            setFormExchange(result.exchange)
                            setFormType(result.type)
                            setSearchQuery("")
                            setSearchResults([])
                          }}
                        >
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {result.symbol} • {result.exchange}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="symbol">Symbool *</Label>
                  <Input
                    id="symbol"
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value.toUpperCase())}
                    placeholder="Bijv. ASML, AAPL"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Naam *</Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Volledige naam"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exchange">Beurs</Label>
                    <Input
                      id="exchange"
                      value={formExchange}
                      onChange={(e) => setFormExchange(e.target.value)}
                      placeholder="Bijv. AMS, NASDAQ"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Input
                      id="type"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      placeholder="STOCK of ETF"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="quantity">Hoeveelheid *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    placeholder="Aantal stuks"
                  />
                </div>
                <div>
                  <Label htmlFor="averagePrice">Gemiddelde aankoopprijs</Label>
                  <Input
                    id="averagePrice"
                    type="number"
                    step="0.01"
                    value={formAveragePrice}
                    onChange={(e) => setFormAveragePrice(e.target.value)}
                    placeholder="Optioneel"
                  />
                </div>
                <div>
                  <Label htmlFor="alertThreshold">Alert drempel (%)</Label>
                  <Input
                    id="alertThreshold"
                    type="number"
                    step="0.1"
                    value={formAlertThreshold}
                    onChange={(e) => setFormAlertThreshold(e.target.value)}
                    placeholder="Bijv. 5 voor 5% stijging/daling"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Ontvang een melding bij deze percentage verandering
                  </p>
                </div>
                <Button onClick={handleAdd} className="w-full">
                  Toevoegen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overzicht statistieken */}
      {portfolio.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Waarde</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{totalValue.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Rendement</CardTitle>
              {totalReturn >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalReturn >= 0 ? '+' : ''}€{totalReturn.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalReturnPercent >= 0 ? '+' : ''}{totalReturnPercent.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aantal Posities</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolio.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grafieken */}
      {portfolio.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-end mb-4">
            <Tabs value={historyPeriod} onValueChange={setHistoryPeriod}>
              <TabsList>
                <TabsTrigger value="1M">1M</TabsTrigger>
                <TabsTrigger value="3M">3M</TabsTrigger>
                <TabsTrigger value="6M">6M</TabsTrigger>
                <TabsTrigger value="1Y">1Y</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Totale Waarde Grafiek */}
            <Card>
              <CardHeader>
                <CardTitle>Totale Waarde Over Tijd</CardTitle>
                <CardDescription>Ontwikkeling van je totale portefeuille waarde</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : historyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return date.toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' })
                        }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`€${value.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Waarde']}
                        labelFormatter={(value) => {
                          const date = new Date(value)
                          return date.toLocaleDateString('nl-NL', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        dot={false}
                        name="Totale Waarde"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Geen historische data beschikbaar
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rendement Grafiek */}
            <Card>
              <CardHeader>
                <CardTitle>Rendement Over Tijd</CardTitle>
                <CardDescription>Ontwikkeling van je totale rendement</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : returnData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={returnData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return date.toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' })
                        }}
                      />
                      <YAxis 
                        yAxisId="left"
                        tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        tickFormatter={(value) => `${value.toFixed(1)}%`}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => {
                          if (name === 'return') {
                            return [`€${value.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Rendement']
                          }
                          return [`${value.toFixed(2)}%`, 'Rendement %']
                        }}
                        labelFormatter={(value) => {
                          const date = new Date(value)
                          return date.toLocaleDateString('nl-NL', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="return" 
                        stroke={totalReturn >= 0 ? "#16a34a" : "#dc2626"} 
                        strokeWidth={2}
                        dot={false}
                        name="Rendement (€)"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="returnPercent" 
                        stroke={totalReturn >= 0 ? "#22c55e" : "#ef4444"} 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Rendement (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    {portfolio.some(item => item.averagePrice) 
                      ? "Geen historische data beschikbaar"
                      : "Voeg gemiddelde aankoopprijzen toe om rendement te zien"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Portfolio tabel */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ) : portfolio.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Geen items in je portefeuille</h3>
              <p className="text-muted-foreground mb-4">
                Voeg je eerste aandeel of ETF toe om te beginnen
              </p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Item toevoegen
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Portefeuille Items</CardTitle>
            <CardDescription>
              Overzicht van al je investeringen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbool</TableHead>
                  <TableHead>Naam</TableHead>
                  <TableHead>Hoeveelheid</TableHead>
                  <TableHead>Huidige Prijs</TableHead>
                  <TableHead>Huidige Waarde</TableHead>
                  <TableHead>Rendement</TableHead>
                  <TableHead>Alert</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.map((item) => {
                  const quote = quotes[item.symbol]
                  const currentValue = quote ? quote.price * item.quantity : null
                  const returnValue = quote && item.averagePrice 
                    ? (quote.price - item.averagePrice) * item.quantity 
                    : null
                  const returnPercent = quote && item.averagePrice
                    ? ((quote.price - item.averagePrice) / item.averagePrice) * 100
                    : null

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.symbol}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity.toLocaleString('nl-NL')}</TableCell>
                      <TableCell>
                        {quote ? (
                          <div className="flex items-center gap-2">
                            <span>€{quote.price.toFixed(2)}</span>
                            {quote.changePercent !== 0 && (
                              <Badge variant={quote.changePercent > 0 ? "default" : "destructive"} className="text-xs">
                                {quote.changePercent > 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {currentValue ? (
                          <span>€{currentValue.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {returnValue !== null && returnPercent !== null ? (
                          <div className={`flex items-center gap-2 ${returnValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <span>
                              {returnValue >= 0 ? '+' : ''}€{returnValue.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs">
                              ({returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(2)}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.alertEnabled && item.alertThreshold ? (
                            <Badge variant="outline" className="text-xs">
                              {item.alertThreshold}%
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Uit
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleAlert(item)}
                          >
                            {item.alertEnabled ? (
                              <Bell className="h-4 w-4" />
                            ) : (
                              <BellOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Item bewerken</DialogTitle>
            <DialogDescription>
              Wijzig de hoeveelheid, gemiddelde prijs of alert drempel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-quantity">Hoeveelheid</Label>
              <Input
                id="edit-quantity"
                type="number"
                step="0.01"
                value={formQuantity}
                onChange={(e) => setFormQuantity(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-averagePrice">Gemiddelde aankoopprijs</Label>
              <Input
                id="edit-averagePrice"
                type="number"
                step="0.01"
                value={formAveragePrice}
                onChange={(e) => setFormAveragePrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-alertThreshold">Alert drempel (%)</Label>
              <Input
                id="edit-alertThreshold"
                type="number"
                step="0.1"
                value={formAlertThreshold}
                onChange={(e) => setFormAlertThreshold(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdate} className="w-full">
              Opslaan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

