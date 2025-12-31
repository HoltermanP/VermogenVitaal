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
import { AlertCircle, Wallet, Plus, Edit, Trash2, Loader2, Bell, Search } from "lucide-react"
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

  // Haal portfolio items op
  const fetchPortfolio = async () => {
    try {
      const response = await fetch("/api/portfolio", {
        credentials: "include", // Zorg dat cookies worden meegestuurd
      })
      const data = await response.json()
      if (response.ok) {
        setPortfolio(data.portfolio || [])
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error)
      toast.error("Fout bij ophalen portefeuille")
    } finally {
      setLoading(false)
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
                    <TableHead>Alert</TableHead>
                    <TableHead>Notificatie</TableHead>
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.map((item) => (
                    <TableRow key={item.id}>
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
                            onClick={() => handleEditClick(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
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