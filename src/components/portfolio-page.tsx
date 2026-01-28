"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, Wallet, Plus, Edit, Trash2, Loader2, Bell, Search, RefreshCw } from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
} from "recharts"
import { useUser } from "@clerk/nextjs"
import { SignInDialog } from "@/components/auth-dialog"
import { toast } from "sonner"
import { ClerkErrorBoundary } from "@/components/clerk-error-boundary"

interface PortfolioItem {
  id: string
  symbol: string
  name: string
  exchange: string | null
  type: string | null
  quantity: number
  averagePrice: number | null
  alertThreshold: number | null
  lastPrice: number | null
  alertEnabled: boolean
  alertNotificationType: "EMAIL" | "WHATSAPP" | "BOTH"
  createdAt: string
  updatedAt: string
}

interface StockSearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
  market?: string
}

const EXCHANGES = [
  { value: "ALL", label: "Alle Beurzen" },
  { value: "AMS", label: "Amsterdam (AEX)" },
  { value: "NYQ", label: "New York Stock Exchange (NYSE)" },
  { value: "NMS", label: "NASDAQ" },
  { value: "LON", label: "London Stock Exchange (LSE)" },
  { value: "FRA", label: "Frankfurt (XETR)" },
  { value: "PAR", label: "Paris (Euronext)" },
  { value: "BRU", label: "Brussels (Euronext)" },
  { value: "TSE", label: "Tokyo Stock Exchange" },
  { value: "HKG", label: "Hong Kong Stock Exchange" },
  { value: "SIX", label: "Swiss Exchange (SIX)" },
]

// Controleer of Clerk beschikbaar is
function isClerkAvailable(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return !!publishableKey &&
         publishableKey !== 'pk_test_...' &&
         !publishableKey.includes('placeholder') &&
         !publishableKey.includes('dummy') &&
         publishableKey !== 'pk_test_dummy_key_for_development'
}

// Wrapper component die useUser altijd aanroept (voor React Hooks rules)
function PortfolioPageWithAuth() {
  const clerkAvailable = isClerkAvailable()
  const clerkData = useUser()

  // Als Clerk niet beschikbaar is, behandel als niet ingelogd
  if (!clerkAvailable) {
    return <PortfolioPage isLoaded={true} isSignedIn={false} user={null} />
  }

  return <PortfolioPage
    isLoaded={clerkData.isLoaded}
    isSignedIn={!!clerkData.user}
    user={clerkData.user || null}
  />
}

export function PortfolioPage({ 
  isLoaded: propIsLoaded, 
  isSignedIn: propIsSignedIn, 
  user: propUser 
}: {
  isLoaded: boolean
  isSignedIn: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any
}) {
  const isLoaded = propIsLoaded
  const isSignedIn = propIsSignedIn
  const user = propUser
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    exchange: "",
    type: "",
    quantity: "",
    averagePrice: "",
    alertThreshold: "",
    alertNotificationType: "EMAIL" as "EMAIL" | "WHATSAPP" | "BOTH",
  })

  // User state voor WhatsApp nummer
  const [userWhatsappNumber, setUserWhatsappNumber] = useState<string | null>(null)
  const [showWhatsappDialog, setShowWhatsappDialog] = useState(false)
  const [whatsappInput, setWhatsappInput] = useState("")
  const [checkingAlerts, setCheckingAlerts] = useState(false)

  // Stock search state
  const [selectedExchange, setSelectedExchange] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1M")
  const [chartData, setChartData] = useState<Array<Record<string, unknown>>>([])
  const [chartLoading, setChartLoading] = useState(false)
  const [refreshingPrices, setRefreshingPrices] = useState(false)
  const [chartMode, setChartMode] = useState<"AGGREGATED" | "PER_SYMBOL">("AGGREGATED")
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)

  // Haal portfolio items op
  const fetchPortfolio = async () => {
    try {
      const response = await fetch("/api/portfolio", {
        credentials: "include", // Zorg dat cookies worden meegestuurd
      })
      const data = await response.json()
      if (response.ok) {
        const items = data.portfolio || []
        setPortfolio(items)
        // Haal direct de actuele koersen op voor de opgehaalde items
        fetchLatestPrices(items)
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error)
      toast.error("Fout bij ophalen portefeuille")
    } finally {
      setLoading(false)
    }
  }

  // Haal actuele prijzen op voor alle portfolio items en update lastPrice veld
  const fetchLatestPrices = async (items: PortfolioItem[]) => {
    if (!items || items.length === 0) return
    try {
      const updated = await Promise.all(
        items.map(async (item) => {
          try {
            const resp = await fetch(`/api/stocks/quote?symbol=${encodeURIComponent(item.symbol)}`)
            if (!resp.ok) return item
            const q = await resp.json()
            return {
              ...item,
              lastPrice: typeof q.price === "number" ? q.price : item.lastPrice,
            }
          } catch (e) {
            console.error("Error fetching quote for", item.symbol, e)
            return item
          }
        })
      )
      setPortfolio(updated)
    } catch (e) {
      console.error("Error fetching latest prices:", e)
    }
  }

  // Haal gebruiker data op
  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user", {
        credentials: "include", // Zorg dat cookies worden meegestuurd
      })
      if (response.ok) {
        const data = await response.json()
        setUserWhatsappNumber(data.whatsappNumber || null)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      fetchPortfolio()
      fetchUserData()
    } else {
      setLoading(false)
    }
  }, [isLoaded, isSignedIn, user])

  // Fetch en aggregeer historische data voor trendgrafiek (ondersteunt geaggregeerd en per-aandeel)
  const fetchAggregatedHistory = async (items: PortfolioItem[], period: string) => {
    if (!items || items.length === 0) {
      setChartData([])
      return
    }

    setChartLoading(true)
    try {
      // Map symbol -> quantity (in case duplicates)
      const symbolToQuantity: Record<string, number> = {}
      items.forEach((it) => {
        const sym = it.symbol
        symbolToQuantity[sym] = (symbolToQuantity[sym] || 0) + (it.quantity || 0)
      })

      const symbols = Object.keys(symbolToQuantity)

      const responses = await Promise.all(
        symbols.map((sym) =>
          fetch(`/api/stocks/history?symbol=${encodeURIComponent(sym)}&period=${encodeURIComponent(period)}`)
            .then((r) => (r.ok ? r.json() : null))
            .catch((_) => null)
        )
      )

      // date -> { total, sym1: val, sym2: val, ... }
      const dateMap: Record<string, Record<string, number>> = {}
      responses.forEach((res, idx) => {
        if (!res || !res.data) return
        const sym = symbols[idx]
        const qty = symbolToQuantity[sym] || 0
        res.data.forEach((point: { date: string; close: number }) => {
          if (point.close == null) return
          const dateKey = point.date.split("T")[0]
          if (!dateMap[dateKey]) dateMap[dateKey] = {}
          const value = (point.close || 0) * qty
          dateMap[dateKey][sym] = (dateMap[dateKey][sym] || 0) + value
          dateMap[dateKey]["total"] = (dateMap[dateKey]["total"] || 0) + value
        })
      })

      const aggregated = Object.keys(dateMap)
        .map((date) => ({ date, ...dateMap[date] }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setChartData(aggregated as unknown as Array<{ date: string; value: number }>)
    } catch (error) {
      console.error("Error fetching aggregated history:", error)
    } finally {
      setChartLoading(false)
    }
  }

  useEffect(() => {
    // herlaad grafiek wanneer portfolio of periode verandert
    if (portfolio.length > 0) {
      fetchAggregatedHistory(portfolio, selectedPeriod)
    } else {
      setChartData([])
    }
  }, [portfolio, selectedPeriod])

  // Handmatige refresh: haalt actuele koersen en update grafiek
  const handleRefresh = async () => {
    if (portfolio.length === 0) return
    setRefreshingPrices(true)
    try {
      await fetchLatestPrices(portfolio)
      await fetchAggregatedHistory(portfolio, selectedPeriod)
      toast.success("Koersen en grafiek bijgewerkt")
    } catch (error) {
      console.error("Error refreshing prices:", error)
      toast.error("Fout bij bijwerken koersen")
    } finally {
      setRefreshingPrices(false)
    }
  }

  // Sluit zoekresultaten wanneer er buiten wordt geklikt
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.stock-search-container')) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Reset form
  const resetForm = () => {
    setFormData({
      symbol: "",
      name: "",
      exchange: "",
      type: "",
      quantity: "",
      averagePrice: "",
      alertThreshold: "",
      alertNotificationType: "EMAIL",
    })
    setEditingItem(null)
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
    setSelectedExchange("ALL")
  }

  // Zoek aandelen
  const searchStocks = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`, {
        credentials: "include", // Zorg dat cookies worden meegestuurd
      })
      if (response.ok) {
        const data = await response.json()
        let results = data.results || []
        
        // Filter op beurs als er een geselecteerd is
        if (selectedExchange !== "ALL") {
          results = results.filter((result: StockSearchResult) => 
            result.exchange === selectedExchange
          )
        }
        
        setSearchResults(results)
        setShowSearchResults(results.length > 0)
      }
    } catch (error) {
      console.error("Error searching stocks:", error)
      toast.error("Fout bij zoeken")
    } finally {
      setIsSearching(false)
    }
  }, [selectedExchange])

  // Filter zoekresultaten wanneer beurs verandert
  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchStocks(searchQuery)
    }
  }, [selectedExchange, searchQuery, searchStocks])

  // Selecteer een aandeel uit de zoekresultaten
  const selectStock = (stock: StockSearchResult) => {
    setFormData({
      ...formData,
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange || "",
      type: stock.type || "STOCK",
    })
    setSearchQuery(stock.name)
    setShowSearchResults(false)
  }

  // Open dialog voor toevoegen
  const handleAddClick = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  // Open dialog voor bewerken
  const handleEditClick = (item: PortfolioItem) => {
    setEditingItem(item)
    setFormData({
      symbol: item.symbol,
      name: item.name,
      exchange: item.exchange || "",
      type: item.type || "",
      quantity: item.quantity.toString(),
      averagePrice: item.averagePrice?.toString() || "",
      alertThreshold: item.alertThreshold?.toString() || "",
      alertNotificationType: item.alertNotificationType || "EMAIL",
    })
    setIsDialogOpen(true)
  }

  // Sla WhatsApp nummer op
  const handleSaveWhatsapp = async () => {
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Zorg dat cookies worden meegestuurd
        body: JSON.stringify({ whatsappNumber: whatsappInput || null }),
      })

      if (response.ok) {
        const data = await response.json()
        setUserWhatsappNumber(data.whatsappNumber || null)
        setShowWhatsappDialog(false)
        setWhatsappInput("")
        toast.success("WhatsApp nummer opgeslagen")
      } else {
        const data = await response.json()
        toast.error(data.error || "Fout bij opslaan")
      }
    } catch (error) {
      console.error("Error saving WhatsApp number:", error)
      toast.error("Fout bij opslaan WhatsApp nummer")
    }
  }

  // Check alerts handmatig
  const handleCheckAlerts = async () => {
    setCheckingAlerts(true)
    try {
      const response = await fetch("/api/portfolio/check-alerts", {
        method: "POST",
        credentials: "include", // Zorg dat cookies worden meegestuurd
      })

      if (response.ok) {
        const data = await response.json()
        if (data.alerts && data.alerts.length > 0) {
          toast.success(`${data.alerts.length} alert(s) gevonden en notificaties verzonden`)
        } else {
          toast.info("Geen nieuwe alerts gevonden")
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Fout bij controleren alerts")
      }
    } catch (error) {
      console.error("Error checking alerts:", error)
      toast.error("Fout bij controleren alerts")
    } finally {
      setCheckingAlerts(false)
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
        credentials: "include", // Zorg dat cookies worden meegestuurd
      })

      if (response.ok) {
        toast.success("Item verwijderd")
        fetchPortfolio()
      } else {
        const data = await response.json()
        toast.error(data.error || "Fout bij verwijderen")
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error("Fout bij verwijderen item")
    }
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validatie: bij nieuw item moet er een aandeel geselecteerd zijn
    if (!editingItem && (!formData.symbol || !formData.name)) {
      toast.error("Selecteer eerst een aandeel uit de zoekresultaten")
      return
    }
    
    setSubmitting(true)

    try {
      const payload = {
        symbol: formData.symbol.trim().toUpperCase(),
        name: formData.name.trim(),
        exchange: formData.exchange || null,
        type: formData.type || null,
        quantity: parseFloat(formData.quantity),
        averagePrice: formData.averagePrice ? parseFloat(formData.averagePrice) : null,
        alertThreshold: formData.alertThreshold ? parseFloat(formData.alertThreshold) : null,
        alertNotificationType: formData.alertNotificationType,
      }

      if (editingItem) {
        // Update bestaand item
        const response = await fetch(`/api/portfolio/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Zorg dat cookies worden meegestuurd
          body: JSON.stringify({
            quantity: payload.quantity,
            averagePrice: payload.averagePrice,
            alertThreshold: payload.alertThreshold,
            alertEnabled: payload.alertThreshold !== null,
            alertNotificationType: payload.alertNotificationType,
          }),
        })

        if (response.ok) {
          toast.success("Item bijgewerkt")
          setIsDialogOpen(false)
          resetForm()
          fetchPortfolio()
        } else {
          const data = await response.json()
          toast.error(data.error || "Fout bij bijwerken")
        }
      } else {
        // Voeg nieuw item toe
        const response = await fetch("/api/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Zorg dat cookies worden meegestuurd
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          toast.success("Item toegevoegd")
          setIsDialogOpen(false)
          resetForm()
          fetchPortfolio()
        } else {
          const data = await response.json()
          toast.error(data.error || "Fout bij toevoegen")
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Fout bij opslaan")
    } finally {
      setSubmitting(false)
    }
  }

  // Als nog aan het laden, toon loading state
  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground">Laden...</div>
          </div>
        </div>
      </div>
    )
  }

  // Als niet ingelogd, toon inlog boodschap
  if (!isSignedIn || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Portfolio Tracking</h1>
            <p className="text-lg text-muted-foreground">
              Beheer je beleggingen en volg je rendement
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Inloggen vereist
              </CardTitle>
              <CardDescription>
                Portfolio tracking is alleen beschikbaar voor ingelogde gebruikers.
                Log in om je portefeuille te beheren en je beleggingen te volgen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Volg je aandelen en ETF&apos;s</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Realtime prijs updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Rendement analyse</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Prijs alerts</span>
                </div>
              </div>
              <SignInDialog
                trigger={
                  <Button className="w-full">
                    Inloggen om te beginnen
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Als ingelogd, toon portfolio functionaliteit
  // Bereken totale waarde (aantal × actuele koers)
  const totalPortfolioValue = portfolio.reduce((sum, item) => {
    const price = item.lastPrice ?? 0
    const qty = item.quantity ?? 0
    return sum + price * qty
  }, 0)

  // Totale aanschafwaarde (sum van hoeveelheid × gemiddelde aankoopprijs)
  const totalPurchaseCost = portfolio.reduce((sum, item) => {
    const avg = item.averagePrice ?? 0
    const qty = item.quantity ?? 0
    return sum + avg * qty
  }, 0)

  const purchaseDiffPercent = totalPurchaseCost > 0 ? ((totalPortfolioValue - totalPurchaseCost) / totalPurchaseCost) * 100 : 0

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(value)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio Tracking</h1>
            <p className="text-lg text-muted-foreground">
              Beheer je beleggingen en volg je rendement
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCheckAlerts}
              disabled={checkingAlerts || portfolio.length === 0}
            >
              {checkingAlerts ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Controleren...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Check Alerts
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshingPrices || portfolio.length === 0}
            >
              {refreshingPrices ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Bijwerken...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh prijzen
                </>
              )}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Belegging toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Belegging bewerken" : "Nieuwe belegging toevoegen"}
                  </DialogTitle>
                  <DialogDescription>
                    Voeg een aandeel of ETF toe aan je portefeuille
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {!editingItem && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="exchange-select">Beurs (optioneel)</Label>
                        <Select
                          value={selectedExchange}
                          onValueChange={(value) => {
                            setSelectedExchange(value)
                            if (searchQuery.length >= 2) {
                              searchStocks(searchQuery)
                            }
                          }}
                        >
                          <SelectTrigger id="exchange-select">
                            <SelectValue placeholder="Selecteer beurs" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXCHANGES.map((exchange) => (
                              <SelectItem key={exchange.value} value={exchange.value}>
                                {exchange.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Filter aandelen op beurs (optioneel)
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stock-search">Zoek aandeel *</Label>
                        <div className="relative stock-search-container">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="stock-search"
                            placeholder="Zoek op naam of symbool (bijv. Apple, AAPL, ASML)"
                            value={searchQuery}
                            onChange={(e) => {
                              const query = e.target.value
                              setSearchQuery(query)
                              searchStocks(query)
                            }}
                            onFocus={() => {
                              if (searchResults.length > 0) {
                                setShowSearchResults(true)
                              }
                            }}
                            className="pl-10"
                          />
                          {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {showSearchResults && searchResults.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                              {searchResults.map((result) => (
                                <div
                                  key={result.symbol}
                                  className="px-4 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                                  onClick={() => selectStock(result)}
                                >
                                  <div className="font-medium">{result.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {result.symbol} • {result.exchange} • {result.type}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Begin met typen om aandelen te zoeken. Selecteer een aandeel om automatisch in te vullen.
                        </p>
                      </div>
                    </>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="symbol">Symbool *</Label>
                    <Input
                      id="symbol"
                      placeholder="Bijv. AAPL, ASML.AS"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      required
                      disabled={!!editingItem}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Naam *</Label>
                    <Input
                      id="name"
                      placeholder="Bijv. Apple Inc., ASML Holding"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={!!editingItem}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="exchange">Beurs</Label>
                      <Input
                        id="exchange"
                        placeholder="Bijv. NASDAQ, AMS"
                        value={formData.exchange}
                        onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                        disabled={!!editingItem}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                        disabled={!!editingItem}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Selecteer type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STOCK">Aandeel</SelectItem>
                          <SelectItem value="ETF">ETF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Hoeveelheid *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Bijv. 10"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="averagePrice">Gemiddelde aankoopprijs</Label>
                    <Input
                      id="averagePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Bijv. 150.50"
                      value={formData.averagePrice}
                      onChange={(e) => setFormData({ ...formData, averagePrice: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="alertThreshold">Alert drempel (%)</Label>
                    <Input
                      id="alertThreshold"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Bijv. 5.0 voor 5%"
                      value={formData.alertThreshold}
                      onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                    />
                  </div>
                  {formData.alertThreshold && (
                    <div className="grid gap-2">
                      <Label htmlFor="alertNotificationType">Notificatie type</Label>
                      <Select
                        value={formData.alertNotificationType}
                        onValueChange={(value: "EMAIL" | "WHATSAPP" | "BOTH") => {
                          setFormData({ ...formData, alertNotificationType: value })
                          if ((value === "WHATSAPP" || value === "BOTH") && !userWhatsappNumber) {
                            setShowWhatsappDialog(true)
                          }
                        }}
                      >
                        <SelectTrigger id="alertNotificationType">
                          <SelectValue placeholder="Selecteer type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMAIL">Email</SelectItem>
                          <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                          <SelectItem value="BOTH">Beide</SelectItem>
                        </SelectContent>
                      </Select>
                      {(formData.alertNotificationType === "WHATSAPP" || formData.alertNotificationType === "BOTH") && !userWhatsappNumber && (
                        <p className="text-sm text-muted-foreground">
                          Je moet eerst een WhatsApp nummer instellen in je profiel.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                    }}
                    disabled={submitting}
                  >
                    Annuleren
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingItem ? "Bijwerken" : "Toevoegen"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* WhatsApp nummer dialog */}
          <Dialog open={showWhatsappDialog} onOpenChange={setShowWhatsappDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>WhatsApp nummer instellen</DialogTitle>
                <DialogDescription>
                  Voer je WhatsApp nummer in om meldingen via WhatsApp te ontvangen. 
                  Format: +31612345678 (inclusief landcode)
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="whatsappNumber">WhatsApp nummer</Label>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    placeholder="+31612345678"
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowWhatsappDialog(false)
                    setWhatsappInput("")
                  }}
                >
                  Annuleren
                </Button>
                <Button type="button" onClick={handleSaveWhatsapp}>
                  Opslaan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Je Portefeuille</CardTitle>
            <CardDescription>
              Hier zie je al je beleggingen en hun prestaties
            </CardDescription>
          </CardHeader>
          <CardContent>
            {portfolio.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Totaal portefeuillewaarde:</div>
                    <div className="text-xs text-muted-foreground">
                      Aanschafwaarde: {formatCurrency(totalPurchaseCost)} • Verschil:{" "}
                      <span className={purchaseDiffPercent >= 0 ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                        {purchaseDiffPercent >= 0 ? "+" : ""}{purchaseDiffPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xl font-semibold">
                    {formatCurrency(totalPortfolioValue)}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">Trendgrafiek</div>
                    <div className="flex items-center gap-2">
                      <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1D">1D</SelectItem>
                          <SelectItem value="1W">1W</SelectItem>
                          <SelectItem value="1M">1M</SelectItem>
                          <SelectItem value="3M">3M</SelectItem>
                          <SelectItem value="1Y">1Y</SelectItem>
                          <SelectItem value="ALL">ALL</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={chartMode} onValueChange={(v) => setChartMode(v as "AGGREGATED" | "PER_SYMBOL")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AGGREGATED">Geaggregeerd</SelectItem>
                          <SelectItem value="PER_SYMBOL">Per aandeel</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedSymbol && (
                        <div className="flex items-center gap-2">
                          <div className="text-sm">Geselecteerd: <span className="font-medium">{selectedSymbol}</span></div>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedSymbol(null); setChartMode("AGGREGATED") }}>
                            Reset
                          </Button>
                        </div>
                      )}
                      {chartLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-md border">
                    {chartData.length === 0 && !chartLoading ? (
                      <div className="text-sm text-muted-foreground">Geen data beschikbaar voor de geselecteerde periode.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.07} />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(v) => {
                            try {
                              return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v)
                            } catch {
                              return v.toString()
                            }
                          }} />
                          <RechartTooltip formatter={(value: any, name: any) => [formatCurrency(Number(value || 0)), name || "Waarde"]} labelFormatter={(label) => label} />
                          <Legend />
                          {chartMode === "AGGREGATED" ? (
                            <Area type="monotone" dataKey="total" name="Totaal" stroke="#3b82f6" fill="rgba(59,130,246,0.12)" />
                          ) : (
                            (() => {
                              const first = chartData[0] || {}
                              let symbolKeys = Object.keys(first).filter(k => k !== "date" && k !== "total")
                              if (selectedSymbol) {
                                symbolKeys = symbolKeys.filter(k => k === selectedSymbol)
                              }
                              const colors = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#ef4444", "#06b6d4", "#f59e0b", "#6366f1"]
                              return symbolKeys.map((sym, idx) => (
                                <Area key={sym} type="monotone" dataKey={sym} name={sym} stroke={colors[idx % colors.length]} fill={`${colors[idx % colors.length]}22`} stackId="a" />
                              ))
                            })()
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </>
            )}
            {portfolio.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Je portefeuille is nog leeg.</p>
                <p className="text-sm mt-2">Voeg je eerste belegging toe om te beginnen.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbool</TableHead>
                    <TableHead>Naam</TableHead>
                    <TableHead>Beurs</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Hoeveelheid</TableHead>
                    <TableHead>Gem. prijs</TableHead>
                    <TableHead>Laatste koers</TableHead>
                    <TableHead>Δ t.o.v. aankoop</TableHead>
                    <TableHead>Waarde</TableHead>
                    <TableHead>Alert</TableHead>
                    <TableHead>Notificatie</TableHead>
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.map((item) => (
                    <TableRow
                      key={item.id}
                      onClick={() => {
                        // toggle selection: click same symbol again to clear
                        setSelectedSymbol(prev => prev === item.symbol ? null : item.symbol)
                        setChartMode("PER_SYMBOL")
                      }}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">{item.symbol}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.exchange || "-"}</TableCell>
                      <TableCell>{item.type || "-"}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {item.averagePrice
                          ? `€${item.averagePrice.toFixed(2)}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.lastPrice !== null && item.lastPrice !== undefined
                          ? formatCurrency(item.lastPrice)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.averagePrice ? (() => {
                          const last = item.lastPrice ?? 0
                          const avg = item.averagePrice ?? 0
                          const pct = avg > 0 ? ((last - avg) / avg) * 100 : 0
                          const formatted = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`
                          return (
                            <span className={pct >= 0 ? "text-green-600" : "text-destructive"}>
                              {formatted}
                            </span>
                          )
                        })() : "-"}
                      </TableCell>
                      <TableCell>
                        {item.lastPrice !== null && item.lastPrice !== undefined
                          ? formatCurrency((item.lastPrice ?? 0) * (item.quantity ?? 0))
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.alertThreshold
                          ? `${item.alertThreshold}%`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.alertThreshold ? (
                          <span className="text-sm">
                            {item.alertNotificationType === "EMAIL" && "📧 Email"}
                            {item.alertNotificationType === "WHATSAPP" && "💬 WhatsApp"}
                            {item.alertNotificationType === "BOTH" && "📧💬 Beide"}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleEditClick(item) }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Export wrapper die error handling heeft
export function PortfolioPageWrapper() {
  return (
    <ClerkErrorBoundary>
      <PortfolioPageWithAuth />
    </ClerkErrorBoundary>
  )
}