"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  fetchCongressionalTrades,
  parseAmount,
  formatAmount,
  formatTransactionType,
  type CongressionalTrade,
  type CongressionalTradesResponse,
} from "@/lib/congressional-trades"
import { TrendingUp, TrendingDown, RefreshCw, Search, DollarSign, LineChart, Users } from "lucide-react"
import { toast } from "sonner"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

type ReturnData = {
  date: string
  cumulativeReturn: number
  totalTrades: number
}

// Lijst van invloedrijke personen die kunnen worden getrackt
const INFLUENTIAL_PEOPLE = [
  { name: "Nancy Pelosi", description: "Voormalig Speaker of the House", party: "D", state: "CA" },
  { name: "Paul Pelosi", description: "Echtgenoot van Nancy Pelosi", party: "D", state: "CA" },
  { name: "Josh Gottheimer", description: "Representative (NJ-5)", party: "D", state: "NJ" },
  { name: "Tom Malinowski", description: "Voormalig Representative (NJ-7)", party: "D", state: "NJ" },
  { name: "Raja Krishnamoorthi", description: "Representative (IL-8)", party: "D", state: "IL" },
  { name: "John Yarmuth", description: "Voormalig Representative (KY-3)", party: "D", state: "KY" },
  { name: "Diana DeGette", description: "Representative (CO-1)", party: "D", state: "CO" },
  { name: "Ro Khanna", description: "Representative (CA-17)", party: "D", state: "CA" },
  { name: "Kathy Castor", description: "Representative (FL-14)", party: "D", state: "FL" },
  { name: "Tom Suozzi", description: "Representative (NY-3)", party: "D", state: "NY" },
  { name: "Rick Scott", description: "Senator (FL)", party: "R", state: "FL" },
  { name: "Tommy Tuberville", description: "Senator (AL)", party: "R", state: "AL" },
  { name: "Ralph Norman", description: "Representative (SC-5)", party: "R", state: "SC" },
  { name: "Dan Crenshaw", description: "Representative (TX-2)", party: "R", state: "TX" },
  { name: "Markwayne Mullin", description: "Senator (OK)", party: "R", state: "OK" },
  { name: "Kevin Hern", description: "Representative (OK-1)", party: "R", state: "OK" },
  { name: "Barry Loudermilk", description: "Representative (GA-11)", party: "R", state: "GA" },
  { name: "Brian Mast", description: "Representative (FL-21)", party: "R", state: "FL" },
  { name: "Michael McCaul", description: "Representative (TX-10)", party: "R", state: "TX" },
  { name: "Blake Moore", description: "Representative (UT-1)", party: "R", state: "UT" },
]

export default function PelosiTradesPage() {
  const [selectedPolitician, setSelectedPolitician] = useState("Nancy Pelosi")
  const [trades, setTrades] = useState<CongressionalTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTicker, setSearchTicker] = useState("")
  const [filteredTrades, setFilteredTrades] = useState<CongressionalTrade[]>([])
  const [returnData, setReturnData] = useState<ReturnData[]>([])
  const [loadingReturns, setLoadingReturns] = useState(false)
  const [dataSource, setDataSource] = useState<string>("")
  const [dataTimestamp, setDataTimestamp] = useState<number>(0)

  useEffect(() => {
    loadTrades()
  }, [selectedPolitician])

  useEffect(() => {
    if (trades.length > 0) {
      calculateReturns()
    }
  }, [trades])

  useEffect(() => {
    if (searchTicker.trim() === "") {
      setFilteredTrades(trades)
    } else {
      const filtered = trades.filter((trade) =>
        trade.ticker?.toLowerCase().includes(searchTicker.toLowerCase()) ||
        trade.company?.toLowerCase().includes(searchTicker.toLowerCase())
      )
      setFilteredTrades(filtered)
    }
  }, [searchTicker, trades])

  const loadTrades = async () => {
    if (refreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetchCongressionalTrades(selectedPolitician, 200)
      setTrades(response.trades)
      setFilteredTrades(response.trades)
      setDataSource(response.dataSource || "Onbekend")
      setDataTimestamp(response.dataTimestamp || Date.now())
      
      if (response.trades.length === 0) {
        if (response.warning) {
          toast.warning(response.warning)
        } else {
          toast.warning("Geen trades gevonden. De API is mogelijk tijdelijk niet beschikbaar.")
        }
      } else if (refreshing) {
        toast.success("Data bijgewerkt")
      }
    } catch (error) {
      console.error("Error loading trades:", error)
      const errorMessage = error instanceof Error ? error.message : "Onbekende fout"
      toast.error(`Fout bij laden van trades: ${errorMessage}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const calculateReturns = async () => {
    setLoadingReturns(true)
    try {
      // Filter alleen purchases met geldige tickers
      const purchases = trades.filter(
        (t) =>
          t.transactionType?.toLowerCase().includes("purchase") &&
          t.ticker &&
          t.ticker.trim() !== "" &&
          t.transactionDate
      )

      if (purchases.length === 0) {
        setReturnData([])
        return
      }

      // Haal huidige prijzen op voor alle unieke tickers
      const uniqueTickers = Array.from(new Set(purchases.map((t) => t.ticker).filter(Boolean)))
      const pricePromises = uniqueTickers.map(async (ticker) => {
        try {
          const response = await fetch(`/api/stocks/quote?symbol=${encodeURIComponent(ticker)}`)
          if (!response.ok) return null
          const data = await response.json()
          return { ticker, price: data.price }
        } catch {
          return null
        }
      })

      const priceResults = await Promise.all(pricePromises)
      const priceMap = new Map<string, number>()
      priceResults.forEach((result) => {
        if (result && result.price) {
          priceMap.set(result.ticker, result.price)
        }
      })

      // Haal historische prijzen op per unieke ticker (batch requests)
      const historyPromises = uniqueTickers.map(async (ticker) => {
        try {
          const response = await fetch(
            `/api/stocks/history?symbol=${encodeURIComponent(ticker)}&period=1y`
          )
          if (!response.ok) return null
          const data = await response.json()
          return { ticker, history: data.history || [] }
        } catch {
          return null
        }
      })

      const historyResults = await Promise.all(historyPromises)
      const historyMap = new Map<string, any[]>()
      historyResults.forEach((result) => {
        if (result && result.history.length > 0) {
          historyMap.set(result.ticker, result.history)
        }
      })

      // Bereken rendement voor elke trade
      const tradesWithPrices = purchases
        .map((trade) => {
          if (!trade.ticker || !trade.transactionDate) return null

          const currentPrice = priceMap.get(trade.ticker)
          if (!currentPrice) return null

          const history = historyMap.get(trade.ticker)
          if (!history || history.length === 0) return null

          try {
            // Zoek de dichtstbijzijnde datum voor de transactiedatum
            const transactionDate = new Date(trade.transactionDate)
            const sortedHistory = history
              .map((h: any) => ({
                date: new Date(h.date),
                close: h.close,
              }))
              .sort(
                (a: any, b: any) =>
                  Math.abs(a.date.getTime() - transactionDate.getTime()) -
                  Math.abs(b.date.getTime() - transactionDate.getTime())
              )

            const transactionPrice = sortedHistory[0]?.close || currentPrice
            const returnPercent = ((currentPrice - transactionPrice) / transactionPrice) * 100

            return {
              date: trade.transactionDate,
              ticker: trade.ticker,
              transactionPrice,
              currentPrice,
              returnPercent,
              amount: parseAmount(trade.amount) || 0,
            }
          } catch {
            return null
          }
        })
        .filter((t): t is NonNullable<typeof t> => t !== null)

      const validTrades = tradesWithPrices.filter((t): t is NonNullable<typeof t> => t !== null)

      // Groepeer per maand en bereken cumulatief rendement
      const monthlyData = new Map<string, { totalReturn: number; count: number }>()

      validTrades.forEach((trade) => {
        const date = new Date(trade.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        const weightedReturn = (trade.returnPercent * trade.amount) / 100

        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { totalReturn: 0, count: 0 })
        }

        const monthData = monthlyData.get(monthKey)!
        monthData.totalReturn += weightedReturn
        monthData.count += 1
      })

      // Converteer naar array en sorteer op datum
      const returnDataArray: ReturnData[] = Array.from(monthlyData.entries())
        .map(([date, data]) => ({
          date,
          cumulativeReturn: data.totalReturn,
          totalTrades: data.count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Bereken cumulatief rendement
      let cumulative = 0
      const cumulativeData = returnDataArray.map((item) => {
        cumulative += item.cumulativeReturn
        return {
          ...item,
          cumulativeReturn: cumulative,
        }
      })

      setReturnData(cumulativeData)
    } catch (error) {
      console.error("Error calculating returns:", error)
      setReturnData([])
    } finally {
      setLoadingReturns(false)
    }
  }

  // Bereken statistieken
  const stats = {
    totalTrades: filteredTrades.length,
    purchases: filteredTrades.filter((t) =>
      t.transactionType?.toLowerCase().includes("purchase")
    ).length,
    sales: filteredTrades.filter((t) =>
      t.transactionType?.toLowerCase().includes("sale")
    ).length,
    uniqueTickers: new Set(filteredTrades.map((t) => t.ticker)).size,
  }

  // Bereken totale waarde (indien beschikbaar)
  const totalValue = filteredTrades.reduce((sum, trade) => {
    const amount = parseAmount(trade.amount)
    return sum + (amount || 0)
  }, 0)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const selectedPerson = INFLUENTIAL_PEOPLE.find(p => p.name === selectedPolitician) || INFLUENTIAL_PEOPLE[0]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Congressional Stock Trades</h1>
          <p className="text-muted-foreground mt-1">
            Overzicht van recente aandelenhandel door invloedrijke politici (House Stock Watcher)
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={selectedPolitician} onValueChange={setSelectedPolitician}>
            <SelectTrigger className="w-[280px]">
              <Users className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Selecteer persoon" />
            </SelectTrigger>
            <SelectContent>
              {INFLUENTIAL_PEOPLE.map((person) => (
                <SelectItem key={person.name} value={person.name}>
                  <div className="flex flex-col">
                    <span className="font-medium">{person.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {person.description} ({person.party}-{person.state})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={loadTrades}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Verversen
          </Button>
        </div>
      </div>

      {/* Geselecteerde persoon info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{selectedPerson.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedPerson.description} • {selectedPerson.party}-{selectedPerson.state}
              </p>
            </div>
            <Badge variant={selectedPerson.party === "D" ? "default" : "destructive"}>
              {selectedPerson.party}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Statistieken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrades}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aankopen</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.purchases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verkopen</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.sales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unieke Tickers</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueTickers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Rendements Chart */}
      {returnData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Rendement Over Tijd
            </CardTitle>
            <CardDescription>
              Cumulatief geschat rendement op basis van aankopen en huidige marktprijzen voor {selectedPerson.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingReturns ? (
              <div className="h-[400px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={returnData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.50 0.02 240)" opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    stroke="oklch(0.60 0 0)"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => {
                      const [year, month] = value.split("-")
                      return `${month}/${year.slice(2)}`
                    }}
                  />
                  <YAxis
                    stroke="oklch(0.60 0 0)"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Cumulatief Rendement"]}
                    labelFormatter={(label) => {
                      const [year, month] = label.split("-")
                      const monthNames = [
                        "Januari",
                        "Februari",
                        "Maart",
                        "April",
                        "Mei",
                        "Juni",
                        "Juli",
                        "Augustus",
                        "September",
                        "Oktober",
                        "November",
                        "December",
                      ]
                      return `${monthNames[parseInt(month) - 1]} ${year}`
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cumulativeReturn"
                    stroke="oklch(0.65 0.18 150)"
                    strokeWidth={2}
                    dot={{ fill: "oklch(0.65 0.18 150)", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Cumulatief Rendement"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Zoek functionaliteit */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Zoek op Ticker of Bedrijf</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Zoek
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Zoek op ticker (bijv. AAPL) of bedrijfsnaam..."
                  value={searchTicker}
                  onChange={(e) => setSearchTicker(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            {searchTicker && (
              <Button
                variant="outline"
                onClick={() => setSearchTicker("")}
              >
                Wissen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trades tabel */}
      <Card>
        <CardHeader>
          <CardTitle>Trades Overzicht</CardTitle>
          <CardDescription>
            {filteredTrades.length === trades.length
              ? `Toont alle ${trades.length} trades`
              : `Toont ${filteredTrades.length} van ${trades.length} trades`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTrades.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchTicker
                  ? "Geen trades gevonden voor deze zoekopdracht"
                  : "Geen trades gevonden"}
              </p>
              {trades.length === 0 && !loading && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg max-w-2xl mx-auto">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Let op:</strong> De congressional trades API's zijn momenteel niet publiek toegankelijk.
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                    <strong>Oplossingen:</strong>
                  </p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 list-disc list-inside space-y-1">
                    <li>
                      <strong>PoliAPI (aanbevolen):</strong> Registreer op{" "}
                      <a href="https://www.poliapi.com" target="_blank" rel="noopener noreferrer" className="underline">
                        poliapi.com
                      </a>{" "}
                      en voeg je API key toe aan <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">.env</code> als{" "}
                      <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">POLIAPI_API_KEY</code>
                    </li>
                    <li>
                      Bezoek{" "}
                      <a href="https://housestockwatcher.com" target="_blank" rel="noopener noreferrer" className="underline">
                        housestockwatcher.com
                      </a>{" "}
                      voor de meest recente data
                    </li>
                    <li>
                      In development modus worden mock trades getoond voor testen
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Symbool</TableHead>
                    <TableHead>Bedrijf</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Bedrag</TableHead>
                    <TableHead>Disclosure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrades.map((trade, index) => {
                    const isPurchase = trade.transactionType
                      ?.toLowerCase()
                      .includes("purchase")
                    const isSale = trade.transactionType?.toLowerCase().includes("sale")

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          {trade.transactionDate
                            ? new Date(trade.transactionDate).toLocaleDateString("nl-NL", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {trade.ticker || "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {trade.company || trade.assetDescription || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              isPurchase
                                ? "default"
                                : isSale
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="flex items-center gap-1 w-fit"
                          >
                            {isPurchase ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : isSale ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : null}
                            {formatTransactionType(trade.transactionType || "Unknown")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatAmount(trade.amount)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {trade.disclosureDate
                            ? new Date(trade.disclosureDate).toLocaleDateString("nl-NL", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info footer */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Congressional trading data wordt gepubliceerd volgens de STOCK Act. 
              Trades worden getoond voor: <strong>{selectedPerson.name}</strong>
            </p>
            {dataSource && (
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Data bron:</span>
                  <Badge variant="outline" className="font-medium">
                    {dataSource}
                  </Badge>
                </div>
                {dataTimestamp > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Laatst bijgewerkt:</span>
                    <span className="font-medium">
                      {new Date(dataTimestamp).toLocaleString("nl-NL", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-muted-foreground">
                      ({Math.round((Date.now() - dataTimestamp) / 1000 / 60)} minuten geleden)
                    </span>
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
              Data afkomstig van verschillende bronnen. Zie{" "}
              <a
                href="https://housestockwatcher.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                housestockwatcher.com
              </a>{" "}
              voor meer informatie.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

