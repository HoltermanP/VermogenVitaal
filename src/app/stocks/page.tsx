"use client"

import { useState, useEffect, Suspense } from "react"
import { useUser } from "@clerk/nextjs"
import type { User } from "@clerk/backend"

// Dynamic rendering wordt afgehandeld door de layout

// Controleer of Clerk beschikbaar is
function isClerkAvailable(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return !!publishableKey &&
         publishableKey !== 'pk_test_...' &&
         !publishableKey.includes('placeholder') &&
         !publishableKey.includes('dummy')
}

// Hook wrapper om Clerk hooks alleen aan te roepen als Clerk beschikbaar is
function useClerkUser() {
  // Altijd useUser aanroepen voor consistente React Hook volgorde
  const clerkData = useUser()

  // Als Clerk niet beschikbaar is, retourneer dummy data maar hook is al aangeroepen
  const clerkAvailable = isClerkAvailable()
  if (!clerkAvailable) {
    return { user: null, isLoaded: true }
  }

  return { user: clerkData.user || null, isLoaded: clerkData.isLoaded }
}
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { TrendingUp, TrendingDown, RefreshCw, Activity, Search, Star, StarOff, X, ArrowUp, ArrowDown, Minus, FileText, Loader2 } from "lucide-react"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from "recharts"
import { toast } from "sonner"
import { NewsTicker } from "@/components/news-ticker"
import { DailyTop3 } from "@/components/daily-top-3"
import ReactMarkdown from "react-markdown"
import { 
  detectAllPatterns, 
  getPatternName, 
  getPatternExplanation,
  getPatternTrend,
  type Pattern, 
  // type PatternType // Voor toekomstig gebruik 
} from "@/lib/technical-patterns"

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

function StocksPageContent() {
  // Hook altijd aanroepen voor consistente React Hook volgorde
  const { user, isLoaded } = useClerkUser()
  const effectiveUser = user
  const effectiveIsLoaded = isLoaded
  const searchParams = useSearchParams()
  const [selectedStock, setSelectedStock] = useState("ASML")

  // Helper functie om aandeel te selecteren en naar chart te scrollen
  const selectStock = (symbol: string) => {
    setSelectedStock(symbol)
    // Scroll naar de grafiek sectie
    setTimeout(() => {
      const chartSection = document.getElementById('chart-section')
      if (chartSection) {
        chartSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }, 100)
  }
  const [selectedPeriod, setSelectedPeriod] = useState("1M")
  const [quote, setQuote] = useState<StockQuote | null>(null)
  const [history, setHistory] = useState<StockHistory[]>([])
  const [analysisHistory, setAnalysisHistory] = useState<StockHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalyses, setAiAnalyses] = useState<Record<string, { analysis: string, loading: boolean, aiEnhanced: boolean, scoreExplanation?: string, score?: number }>>({})
  const [fundamentals, setFundamentals] = useState<Record<string, unknown> | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [favorites, setFavorites] = useState<StockFavorite[]>([])
  const [favoriteQuotes, setFavoriteQuotes] = useState<Record<string, StockQuote>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState<string>("ALL")
  const [addFavoriteDialogOpen, setAddFavoriteDialogOpen] = useState(false)
  const [favoriteSearchQuery, setFavoriteSearchQuery] = useState("")
  const [favoriteSearchResults, setFavoriteSearchResults] = useState<StockSearchResult[]>([])
  const [favoriteSearching, setFavoriteSearching] = useState(false)
  const [showCandlestick, setShowCandlestick] = useState(true)
  const [showLine, setShowLine] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [generatingDeepResearch, setGeneratingDeepResearch] = useState(false)
  const [showPatterns, setShowPatterns] = useState(false)
  const [hiddenPatternIds, setHiddenPatternIds] = useState<Set<number>>(new Set())
  const [detectedPatterns, setDetectedPatterns] = useState<Pattern[]>([])
  const [gainers, setGainers] = useState<Array<{ symbol: string; name: string; price: number; change: number; changePercent: number; volume: number }>>([])
  const [losers, setLosers] = useState<Array<{ symbol: string; name: string; price: number; change: number; changePercent: number; volume: number }>>([])
  const [loadingGainersLosers, setLoadingGainersLosers] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<"EUR" | "USD">("EUR")
  
  // Wisselkoers EUR/USD (kan later worden uitgebreid met een echte API)
  const EUR_TO_USD_RATE = 1.10
  
  // Helper functie om prijzen te converteren en formatteren
  const formatPrice = (price: number, decimals: number = 2): string => {
    const convertedPrice = selectedCurrency === "EUR" ? price / EUR_TO_USD_RATE : price
    const symbol = selectedCurrency === "EUR" ? "€" : "$"
    return `${symbol}${convertedPrice.toFixed(decimals)}`
  }
  
  // Helper functie om alleen de geconverteerde prijs te krijgen (zonder symbool)
  const convertPrice = (price: number): number => {
    return selectedCurrency === "EUR" ? price / EUR_TO_USD_RATE : price
  }
  
  // Helper functie voor tekstuele prijsweergave (gebruikt in analyses)
  const formatPriceText = (price: number, decimals: number = 2): string => {
    const convertedPrice = convertPrice(price)
    const symbol = selectedCurrency === "EUR" ? "€" : "$"
    return `${symbol}${convertedPrice.toFixed(decimals)}`
  }

  // Technische analyse functies
  const calculateSMA = (data: StockHistory[], period: number): number[] => {
    const sma: number[] = []
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        sma.push(NaN)
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, item) => acc + item.close, 0)
        sma.push(sum / period)
      }
    }
    return sma
  }

  const calculateEMA = (data: StockHistory[], period: number): number[] => {
    const ema: number[] = []
    const multiplier = 2 / (period + 1)
    
    // Start met SMA voor eerste waarde
    if (data.length >= period) {
      const firstSMA = data.slice(0, period).reduce((acc, item) => acc + item.close, 0) / period
      ema.push(firstSMA)
      
      for (let i = period; i < data.length; i++) {
        const prevEMA = ema[ema.length - 1]
        const currentPrice = data[i].close
        const newEMA = (currentPrice - prevEMA) * multiplier + prevEMA
        ema.push(newEMA)
      }
    }
    
    // Voeg NaN toe voor eerste period-1 waarden
    const result = new Array(data.length - ema.length).fill(NaN).concat(ema)
    return result
  }

  const calculateRSI = (data: StockHistory[], period: number = 14): number[] => {
    const rsi: number[] = []
    const changes: number[] = []
    
    // Bereken prijsveranderingen
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i].close - data[i - 1].close)
    }
    
    // Bereken RSI
    for (let i = 0; i < data.length; i++) {
      if (i < period) {
        rsi.push(NaN)
      } else {
        const periodChanges = changes.slice(i - period, i)
        const gains = periodChanges.filter(c => c > 0).reduce((sum, c) => sum + c, 0) / period
        const losses = Math.abs(periodChanges.filter(c => c < 0).reduce((sum, c) => sum + c, 0)) / period
        
        if (losses === 0) {
          rsi.push(100)
        } else {
          const rs = gains / losses
          rsi.push(100 - (100 / (1 + rs)))
        }
      }
    }
    
    return rsi
  }

  const calculateMACD = (data: StockHistory[]): { macd: number[], signal: number[], histogram: number[] } => {
    const ema12 = calculateEMA(data, 12)
    const ema26 = calculateEMA(data, 26)
    
    const macd: number[] = []
    for (let i = 0; i < data.length; i++) {
      if (isNaN(ema12[i]) || isNaN(ema26[i])) {
        macd.push(NaN)
      } else {
        macd.push(ema12[i] - ema26[i])
      }
    }
    
    // Signal line (EMA van MACD)
    const macdData = macd.map((val) => ({ close: isNaN(val) ? 0 : val } as StockHistory))
    const signal = calculateEMA(macdData, 9)
    
    // Histogram
    const histogram: number[] = []
    for (let i = 0; i < data.length; i++) {
      if (isNaN(macd[i]) || isNaN(signal[i])) {
        histogram.push(NaN)
      } else {
        histogram.push(macd[i] - signal[i])
      }
    }
    
    return { macd, signal, histogram }
  }

  const getSupportResistance = (data: StockHistory[]): { support: number, resistance: number, levels: number[] } => {
    if (data.length === 0) return { support: 0, resistance: 0, levels: [] }
    
    // Basis support/resistance
    const prices = data.map(d => [d.low, d.high]).flat()
    const support = Math.min(...prices)
    const resistance = Math.max(...prices)
    
    // Geavanceerde support/resistance levels (pivot points en belangrijke prijsniveaus)
    const levels: number[] = []
    const recent = data.slice(-60) // Laatste 60 dagen
    
    // Vind lokale minima en maxima (pivot points)
    for (let i = 2; i < recent.length - 2; i++) {
      const price = recent[i].close
      const prev2 = recent[i - 2].close
      const prev1 = recent[i - 1].close
      const next1 = recent[i + 1].close
      const next2 = recent[i + 2].close
      
      // Lokale minimum (support)
      if (price < prev2 && price < prev1 && price < next1 && price < next2) {
        levels.push(price)
      }
      
      // Lokale maximum (resistance)
      if (price > prev2 && price > prev1 && price > next1 && price > next2) {
        levels.push(price)
      }
    }
    
    // Sorteer en filter duplicaten (binnen 2% van elkaar)
    const sortedLevels = levels.sort((a, b) => a - b)
    const filteredLevels: number[] = []
    for (const level of sortedLevels) {
      if (filteredLevels.length === 0 || Math.abs(level - filteredLevels[filteredLevels.length - 1]) / filteredLevels[filteredLevels.length - 1] > 0.02) {
        filteredLevels.push(level)
      }
    }
    
    return { support, resistance, levels: filteredLevels.slice(-5) } // Laatste 5 belangrijke levels
  }

  const getTrendAnalysis = (data: StockHistory[]): { trend: string, strength: string } => {
    if (data.length < 20) return { trend: "Onbekend", strength: "Onvoldoende data" }
    
    const recent = data.slice(-20)
    const firstPrice = recent[0].close
    const lastPrice = recent[recent.length - 1].close
    const change = ((lastPrice - firstPrice) / firstPrice) * 100
    
    let trend = "Neutraal"
    let strength = "Zwak"
    
    if (change > 5) {
      trend = "Stijgend"
      strength = change > 15 ? "Sterk" : "Matig"
    } else if (change < -5) {
      trend = "Dalend"
      strength = change < -15 ? "Sterk" : "Matig"
    }
    
    return { trend, strength }
  }

  // Nieuwe functies voor uitgebreide technische analyse
  const calculateBollingerBands = (data: StockHistory[], period: number = 20, stdDev: number = 2): { upper: number[], middle: number[], lower: number[] } => {
    const sma = calculateSMA(data, period)
    const upper: number[] = []
    const middle = sma
    const lower: number[] = []
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upper.push(NaN)
        lower.push(NaN)
      } else {
        const slice = data.slice(i - period + 1, i + 1)
        const mean = sma[i]
        const variance = slice.reduce((sum, item) => sum + Math.pow(item.close - mean, 2), 0) / period
        const standardDeviation = Math.sqrt(variance)
        
        upper.push(mean + (stdDev * standardDeviation))
        lower.push(mean - (stdDev * standardDeviation))
      }
    }
    
    return { upper, middle, lower }
  }

  const calculateATR = (data: StockHistory[], period: number = 14): number[] => {
    const atr: number[] = []
    const trueRanges: number[] = []
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high
      const low = data[i].low
      const prevClose = data[i - 1].close
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      )
      trueRanges.push(tr)
    }
    
    // Eerste ATR is SMA van eerste period true ranges
    if (trueRanges.length >= period) {
      const firstATR = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period
      atr.push(NaN) // Voor eerste data punt
      atr.push(firstATR)
      
      // Rest is EMA van true ranges
      // const multiplier = 1 / period // Voor toekomstig gebruik
      for (let i = period + 1; i < data.length; i++) {
        const prevATR = atr[atr.length - 1]
        const currentTR = trueRanges[i - 1]
        const newATR = (prevATR * (period - 1) + currentTR) / period
        atr.push(newATR)
      }
    }
    
    // Voeg NaN toe voor eerste period punten
    const result = new Array(data.length - atr.length).fill(NaN).concat(atr)
    return result
  }

  const analyzeVolume = (data: StockHistory[]): { trend: string, strength: string, avgVolume: number } => {
    if (data.length < 20) return { trend: "Onbekend", strength: "Onvoldoende data", avgVolume: 0 }
    
    const recent = data.slice(-20)
    const older = data.slice(-40, -20)
    
    const recentAvg = recent.reduce((sum, d) => sum + d.volume, 0) / recent.length
    const olderAvg = older.length > 0 ? older.reduce((sum, d) => sum + d.volume, 0) / older.length : recentAvg
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100
    
    let trend = "Neutraal"
    let strength = "Zwak"
    
    if (change > 20) {
      trend = "Stijgend"
      strength = change > 50 ? "Sterk" : "Matig"
    } else if (change < -20) {
      trend = "Dalend"
      strength = change < -50 ? "Sterk" : "Matig"
    }
    
    return { trend, strength, avgVolume: recentAvg }
  }

  const calculateStochastic = (data: StockHistory[], kPeriod: number = 14, dPeriod: number = 3): { k: number[], d: number[] } => {
    const k: number[] = []
    const d: number[] = []
    
    for (let i = kPeriod - 1; i < data.length; i++) {
      const period = data.slice(i - kPeriod + 1, i + 1)
      const highest = Math.max(...period.map(p => p.high))
      const lowest = Math.min(...period.map(p => p.low))
      const currentClose = data[i].close
      
      if (highest === lowest) {
        k.push(50)
      } else {
        k.push(((currentClose - lowest) / (highest - lowest)) * 100)
      }
    }
    
    // Voeg NaN toe voor eerste period-1 waarden
    const kPadded = new Array(kPeriod - 1).fill(NaN).concat(k)
    
    // Bereken D (SMA van K)
    for (let i = dPeriod - 1; i < kPadded.length; i++) {
      const periodK = kPadded.slice(i - dPeriod + 1, i + 1).filter(v => !isNaN(v))
      if (periodK.length === dPeriod) {
        d.push(periodK.reduce((sum, val) => sum + val, 0) / dPeriod)
      } else {
        d.push(NaN)
      }
    }
    
    const dPadded = new Array(kPadded.length - d.length).fill(NaN).concat(d)
    
    return { k: kPadded, d: dPadded }
  }

  const calculateOBV = (data: StockHistory[]): number[] => {
    const obv: number[] = []
    let cumulativeOBV = 0
    
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        obv.push(data[i].volume)
        cumulativeOBV = data[i].volume
      } else {
        if (data[i].close > data[i - 1].close) {
          cumulativeOBV += data[i].volume
        } else if (data[i].close < data[i - 1].close) {
          cumulativeOBV -= data[i].volume
        } else {
          // Geen verandering
        }
        obv.push(cumulativeOBV)
      }
    }
    
    return obv
  }

  const calculateADX = (data: StockHistory[], period: number = 14): number[] => {
    // Vereenvoudigde ADX berekening
    const adx: number[] = []
    const trs: number[] = []
    const plusDMs: number[] = []
    const minusDMs: number[] = []
    
    // Bereken True Range, +DM en -DM
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high
      const low = data[i].low
      const prevHigh = data[i - 1].high
      const prevLow = data[i - 1].low
      const prevClose = data[i - 1].close
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      )
      trs.push(tr)
      
      const plusDM = high > prevHigh ? high - prevHigh : 0
      const minusDM = low < prevLow ? prevLow - low : 0
      
      plusDMs.push(plusDM)
      minusDMs.push(minusDM)
    }
    
    // Bereken smoothed values en ADX
    for (let i = period - 1; i < trs.length; i++) {
      const periodTRs = trs.slice(i - period + 1, i + 1)
      const periodPlusDMs = plusDMs.slice(i - period + 1, i + 1)
      const periodMinusDMs = minusDMs.slice(i - period + 1, i + 1)
      
      const avgTR = periodTRs.reduce((sum, tr) => sum + tr, 0) / period
      const avgPlusDM = periodPlusDMs.reduce((sum, dm) => sum + dm, 0) / period
      const avgMinusDM = periodMinusDMs.reduce((sum, dm) => sum + dm, 0) / period
      
      const plusDI = avgTR > 0 ? (avgPlusDM / avgTR) * 100 : 0
      const minusDI = avgTR > 0 ? (avgMinusDM / avgTR) * 100 : 0
      
      const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100
      adx.push(dx)
    }
    
    // Voeg NaN toe voor eerste period-1 waarden
    return new Array(period).fill(NaN).concat(adx)
  }

  const detectDivergences = (
    data: StockHistory[],
    rsi: number[],
    macd: { macd: number[], signal: number[], histogram: number[] }
  ): { rsiDivergence: string, macdDivergence: string, volumeDivergence: string } => {
    if (data.length < 30) {
      return { rsiDivergence: "Onvoldoende data", macdDivergence: "Onvoldoende data", volumeDivergence: "Onvoldoende data" }
    }
    
    // Analyseer laatste 30 punten voor divergenties
    const recent = data.slice(-30)
    const recentRSI = rsi.slice(-30)
    const recentMACD = macd.macd.slice(-30)
    const recentPrices = recent.map(d => d.close)
    const recentVolumes = recent.map(d => d.volume)
    
    // Vind lokale hoogtepunten en dieptepunten
    const priceHighs: number[] = []
    const priceLows: number[] = []
    const rsiHighs: number[] = []
    const rsiLows: number[] = []
    
    for (let i = 2; i < recent.length - 2; i++) {
      // Prijs hoogtepunten
      if (recentPrices[i] > recentPrices[i - 1] && recentPrices[i] > recentPrices[i + 1] &&
          recentPrices[i] > recentPrices[i - 2] && recentPrices[i] > recentPrices[i + 2]) {
        priceHighs.push(i)
      }
      // Prijs dieptepunten
      if (recentPrices[i] < recentPrices[i - 1] && recentPrices[i] < recentPrices[i + 1] &&
          recentPrices[i] < recentPrices[i - 2] && recentPrices[i] < recentPrices[i + 2]) {
        priceLows.push(i)
      }
      
      // RSI hoogtepunten
      if (!isNaN(recentRSI[i]) && recentRSI[i] > recentRSI[i - 1] && recentRSI[i] > recentRSI[i + 1]) {
        rsiHighs.push(i)
      }
      // RSI dieptepunten
      if (!isNaN(recentRSI[i]) && recentRSI[i] < recentRSI[i - 1] && recentRSI[i] < recentRSI[i + 1]) {
        rsiLows.push(i)
      }
    }
    
    // Detecteer bearish divergentie (prijs stijgt, RSI daalt)
    let rsiDivergence = "Geen divergentie"
    if (priceHighs.length >= 2 && rsiHighs.length >= 2) {
      const lastPriceHigh = recentPrices[priceHighs[priceHighs.length - 1]]
      const prevPriceHigh = recentPrices[priceHighs[priceHighs.length - 2]]
      const lastRSIHigh = recentRSI[rsiHighs[rsiHighs.length - 1]]
      const prevRSIHigh = recentRSI[rsiHighs[rsiHighs.length - 2]]
      
      if (lastPriceHigh > prevPriceHigh && lastRSIHigh < prevRSIHigh) {
        rsiDivergence = "Bearish divergentie gedetecteerd (prijs stijgt, RSI daalt) - mogelijk verzwakking"
      } else if (lastPriceHigh < prevPriceHigh && lastRSIHigh > prevRSIHigh) {
        rsiDivergence = "Bullish divergentie gedetecteerd (prijs daalt, RSI stijgt) - mogelijk versterking"
      }
    }
    
    // MACD divergentie
    let macdDivergence = "Geen divergentie"
    if (priceHighs.length >= 2) {
      const lastPriceHigh = recentPrices[priceHighs[priceHighs.length - 1]]
      const prevPriceHigh = recentPrices[priceHighs[priceHighs.length - 2]]
      const lastMACDHigh = recentMACD[priceHighs[priceHighs.length - 1]]
      const prevMACDHigh = recentMACD[priceHighs[priceHighs.length - 2]]
      
      if (!isNaN(lastMACDHigh) && !isNaN(prevMACDHigh)) {
        if (lastPriceHigh > prevPriceHigh && lastMACDHigh < prevMACDHigh) {
          macdDivergence = "Bearish MACD divergentie - momentum verzwakt"
        } else if (lastPriceHigh < prevPriceHigh && lastMACDHigh > prevMACDHigh) {
          macdDivergence = "Bullish MACD divergentie - momentum versterkt"
        }
      }
    }
    
    // Volume divergentie
    let volumeDivergence = "Geen divergentie"
    if (priceHighs.length >= 2) {
      const lastPriceHigh = recentPrices[priceHighs[priceHighs.length - 1]]
      const prevPriceHigh = recentPrices[priceHighs[priceHighs.length - 2]]
      const lastVolume = recentVolumes[priceHighs[priceHighs.length - 1]]
      const prevVolume = recentVolumes[priceHighs[priceHighs.length - 2]]
      
      if (lastPriceHigh > prevPriceHigh && lastVolume < prevVolume) {
        volumeDivergence = "Bearish volume divergentie - stijging zonder volume ondersteuning"
      } else if (lastPriceHigh < prevPriceHigh && lastVolume > prevVolume) {
        volumeDivergence = "Bullish volume divergentie - daling met hoog volume (mogelijk capitulatie)"
      }
    }
    
    return { rsiDivergence, macdDivergence, volumeDivergence }
  }

  const analyzePriceAction = (data: StockHistory[]): { momentum: string, volatility: string, priceChange: number, trendStrength: string } => {
    if (data.length < 10) return { momentum: "Onbekend", volatility: "Onvoldoende data", priceChange: 0, trendStrength: "Onvoldoende data" }
    
    const recent = data.slice(-10)
    const firstPrice = recent[0].close
    const lastPrice = recent[recent.length - 1].close
    const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100
    
    // Bereken volatiliteit (standaarddeviatie van dagelijkse returns)
    const returns = []
    for (let i = 1; i < recent.length; i++) {
      const return_ = ((recent[i].close - recent[i - 1].close) / recent[i - 1].close) * 100
      returns.push(return_)
    }
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    const volatilityValue = Math.sqrt(variance)
    
    // Bereken trend sterkte (consistentie van beweging)
    const upDays = returns.filter(r => r > 0).length
    const downDays = returns.filter(r => r < 0).length
    const trendStrength = upDays > downDays * 1.5 ? "Sterk opwaarts" :
                         downDays > upDays * 1.5 ? "Sterk neerwaarts" :
                         Math.abs(upDays - downDays) <= 2 ? "Zwak/consolidatie" : "Gemengd"
    
    let momentum = "Neutraal"
    if (priceChange > 3) momentum = "Positief"
    else if (priceChange < -3) momentum = "Negatief"
    
    let volatility = "Laag"
    if (volatilityValue > 3) volatility = "Hoog"
    else if (volatilityValue > 1.5) volatility = "Gemiddeld"
    
    return { momentum, volatility, priceChange, trendStrength }
  }

  // Bereken score (0-10) op basis van alle indicatoren
  const calculateScore = (
    data: StockHistory[],
    sma20: number[],
    sma50: number[],
    sma200: number[],
    ema12: number[],
    ema200: number[],
    rsi: number[],
    macd: { macd: number[], signal: number[], histogram: number[] },
    bollinger: { upper: number[], middle: number[], lower: number[] },
    stochastic: { k: number[], d: number[] },
    adx: number[],
    obv: number[],
    divergences: { rsiDivergence: string, macdDivergence: string, volumeDivergence: string },
    volumeAnalysis: { trend: string, strength: string, avgVolume: number },
    priceAction: { momentum: string, volatility: string, priceChange: number, trendStrength: string },
    support: number,
    resistance: number
  ): number => {
    if (data.length < 50) return 5 // Neutrale score bij onvoldoende data
    
    const currentPrice = data[data.length - 1].close
    const currentRSI = rsi[rsi.length - 1]
    const currentSMA20 = sma20[sma20.length - 1]
    const currentSMA50 = sma50[sma50.length - 1]
    const currentSMA200 = sma200[sma200.length - 1]
    const currentEMA12 = ema12[ema12.length - 1]
    const currentEMA200 = ema200[ema200.length - 1]
    const currentMACD = macd.macd[macd.macd.length - 1]
    const currentSignal = macd.signal[macd.signal.length - 1]
    const currentHistogram = macd.histogram[macd.histogram.length - 1]
    const currentStochK = stochastic.k[stochastic.k.length - 1]
    const currentADX = adx[adx.length - 1]
    const currentOBV = obv[obv.length - 1]
    const prevOBV = obv.length > 1 ? obv[obv.length - 2] : currentOBV
    
    let score = 5.0 // Start met neutrale score
    
    // Moving Averages (gewicht: 1.5)
    if (!isNaN(currentSMA20) && !isNaN(currentSMA50) && !isNaN(currentSMA200)) {
      if (currentPrice > currentSMA20 && currentPrice > currentSMA50 && currentPrice > currentSMA200) {
        score += 0.5
      } else if (currentPrice < currentSMA20 && currentPrice < currentSMA50 && currentPrice < currentSMA200) {
        score -= 0.5
      }
      
      if (currentSMA20 > currentSMA50 && currentSMA50 > currentSMA200) {
        score += 0.5 // Gouden kruis structuur
      } else if (currentSMA20 < currentSMA50 && currentSMA50 < currentSMA200) {
        score -= 0.5 // Doodskruis structuur
      }
      
      if (currentEMA12 > currentEMA200) {
        score += 0.5
      } else {
        score -= 0.5
      }
    }
    
    // RSI (gewicht: 1.0)
    if (!isNaN(currentRSI)) {
      if (currentRSI > 70) {
        score -= 0.8 // Overgekocht
      } else if (currentRSI < 30) {
        score += 0.8 // Oververkocht (koopkans)
      } else if (currentRSI > 50 && currentRSI < 70) {
        score += 0.3 // Gezonde bullish zone
      } else if (currentRSI > 30 && currentRSI < 50) {
        score -= 0.3 // Bearish zone
      }
    }
    
    // MACD (gewicht: 1.0)
    if (!isNaN(currentMACD) && !isNaN(currentSignal)) {
      if (currentMACD > currentSignal) {
        score += 0.5
        if (currentHistogram > 0 && macd.histogram.length >= 2) {
          const prevHistogram = macd.histogram[macd.histogram.length - 2]
          if (currentHistogram > prevHistogram) {
            score += 0.3 // Stijgende histogram
          }
        }
      } else {
        score -= 0.5
        if (currentHistogram < 0 && macd.histogram.length >= 2) {
          const prevHistogram = macd.histogram[macd.histogram.length - 2]
          if (currentHistogram < prevHistogram) {
            score -= 0.3 // Dalende histogram
          }
        }
      }
    }
    
    // Stochastic (gewicht: 0.5)
    if (!isNaN(currentStochK)) {
      if (currentStochK > 80) {
        score -= 0.4 // Overgekocht
      } else if (currentStochK < 20) {
        score += 0.4 // Oververkocht
      }
    }
    
    // ADX Trend Sterkte (gewicht: 0.8)
    if (!isNaN(currentADX)) {
      if (currentADX > 25) {
        // Sterke trend - bonus als trend bullish is
        if (currentPrice > currentSMA20 && currentSMA20 > currentSMA50) {
          score += 0.5
        } else if (currentPrice < currentSMA20 && currentSMA20 < currentSMA50) {
          score -= 0.5
        }
      } else if (currentADX < 20) {
        score -= 0.2 // Zwakke trend
      }
    }
    
    // Volume (OBV) (gewicht: 0.7)
    if (currentOBV > prevOBV) {
      score += 0.4
    } else if (currentOBV < prevOBV) {
      score -= 0.4
    }
    
    if (volumeAnalysis.trend === "Stijgend") {
      if (priceAction.momentum === "Positief") {
        score += 0.3 // Volume ondersteunt stijging
      } else {
        score -= 0.3 // Volume bij daling (distributie)
      }
    }
    
    // Bollinger Bands (gewicht: 0.5)
    const currentBBUpper = bollinger.upper[bollinger.upper.length - 1]
    const currentBBLower = bollinger.lower[bollinger.lower.length - 1]
    if (!isNaN(currentBBUpper) && !isNaN(currentBBLower)) {
      if (currentPrice > currentBBUpper) {
        score -= 0.3 // Overgekocht
      } else if (currentPrice < currentBBLower) {
        score += 0.3 // Oververkocht
      }
    }
    
    // Divergenties (gewicht: 0.8)
    if (divergences.rsiDivergence.includes("Bearish")) {
      score -= 0.5
    } else if (divergences.rsiDivergence.includes("Bullish")) {
      score += 0.5
    }
    
    if (divergences.macdDivergence.includes("Bearish")) {
      score -= 0.4
    } else if (divergences.macdDivergence.includes("Bullish")) {
      score += 0.4
    }
    
    if (divergences.volumeDivergence.includes("Bearish")) {
      score -= 0.3
    } else if (divergences.volumeDivergence.includes("Bullish")) {
      score += 0.3
    }
    
    // Prijs momentum (gewicht: 0.5)
    if (priceAction.momentum === "Positief") {
      score += 0.3
    } else if (priceAction.momentum === "Negatief") {
      score -= 0.3
    }
    
    // Support/Resistance positie (gewicht: 0.3)
    const priceRange = resistance - support
    if (priceRange > 0) {
      const pricePosition = (currentPrice - support) / priceRange
      if (pricePosition > 0.8) {
        score -= 0.2 // Dicht bij resistance
      } else if (pricePosition < 0.2) {
        score += 0.2 // Dicht bij support
      }
    }
    
    // Limiteer score tussen 0 en 10
    return Math.max(0, Math.min(10, Math.round(score * 10) / 10))
  }

  // Genereer ondersteuning op basis van score
  const getAdvice = (score: number): { text: string, icon: typeof TrendingUp, color: string } => {
    if (score >= 8.5) {
      return { 
        text: "Zeer Positief", 
        icon: TrendingUp, 
        color: "text-green-500" 
      }
    } else if (score >= 7) {
      return { 
        text: "Positief", 
        icon: ArrowUp, 
        color: "text-green-400" 
      }
    } else if (score >= 6) {
      return { 
        text: "Licht Positief", 
        icon: ArrowUp, 
        color: "text-green-300" 
      }
    } else if (score >= 4) {
      return { 
        text: "Neutraal", 
        icon: Minus, 
        color: "text-yellow-500" 
      }
    } else if (score >= 3) {
      return { 
        text: "Licht Negatief", 
        icon: ArrowDown, 
        color: "text-orange-400" 
      }
    } else if (score >= 1.5) {
      return { 
        text: "Negatief", 
        icon: ArrowDown, 
        color: "text-red-400" 
      }
    } else {
      return { 
        text: "Zeer Negatief", 
        icon: TrendingDown, 
        color: "text-red-500" 
      }
    }
  }

  const generateTechnicalAnalysis = (
    data: StockHistory[],
    sma20: number[],
    sma50: number[],
    ema12: number[],
    rsi: number[],
    macd: { macd: number[], signal: number[], histogram: number[] },
    bollinger: { upper: number[], middle: number[], lower: number[] },
    atr: number[],
    support: number,
    resistance: number,
    levels: number[]
  ): {
    veryShortTerm: string
    shortTerm: string
    mediumTerm: string
    longTerm: string
    veryLongTerm: string
    veryShortTermScore: number
    shortTermScore: number
    mediumTermScore: number
    longTermScore: number
    veryLongTermScore: number
    overallScore: number
  } => {
    if (data.length < 50) {
      const insufficient = "Onvoldoende historische data beschikbaar voor een betrouwbare analyse."
      return {
        veryShortTerm: insufficient,
        shortTerm: insufficient,
        mediumTerm: insufficient,
        longTerm: insufficient,
        veryLongTerm: insufficient,
        veryShortTermScore: 5,
        shortTermScore: 5,
        mediumTermScore: 5,
        longTermScore: 5,
        veryLongTermScore: 5,
        overallScore: 5
      }
    }

    // Bereken aanvullende indicatoren
    const sma200 = calculateSMA(data, 200)
    const ema200 = calculateEMA(data, 200)
    const stochastic = calculateStochastic(data, 14, 3)
    const obv = calculateOBV(data)
    const adx = calculateADX(data, 14)
    const divergences = detectDivergences(data, rsi, macd)

    const currentPrice = data[data.length - 1].close
    const currentRSI = rsi[rsi.length - 1]
    const currentSMA20 = sma20[sma20.length - 1]
    const currentSMA50 = sma50[sma50.length - 1]
    const currentSMA200 = sma200[sma200.length - 1]
    const currentEMA12 = ema12[ema12.length - 1]
    const currentEMA200 = ema200[ema200.length - 1]
    const currentMACD = macd.macd[macd.macd.length - 1]
    const currentSignal = macd.signal[macd.signal.length - 1]
    const currentHistogram = macd.histogram[macd.histogram.length - 1]
    const currentBBUpper = bollinger.upper[bollinger.upper.length - 1]
    const currentBBLower = bollinger.lower[bollinger.lower.length - 1]
    const currentBBMiddle = bollinger.middle[bollinger.middle.length - 1]
    // const currentATR = atr[atr.length - 1] // Voor toekomstig gebruik
    const currentStochK = stochastic.k[stochastic.k.length - 1]
    // const currentStochD = stochastic.d[stochastic.d.length - 1] // Voor toekomstig gebruik
    const currentADX = adx[adx.length - 1]
    
    // Analyseer OBV trend
    const obvRecent = obv.slice(-20)
    const obvOlder = obv.slice(-40, -20)
    const obvTrend = obvRecent.length > 0 && obvOlder.length > 0 
      ? (obvRecent[obvRecent.length - 1] > obvOlder[obvOlder.length - 1] ? "Stijgend" : "Dalend")
      : "Neutraal"
    
    const volumeAnalysis = analyzeVolume(data)
    const priceAction = analyzePriceAction(data)
    
    // Analyseer trend richting en sterkte (uitgebreid)
    const priceVsSMA20 = currentPrice > currentSMA20
    const priceVsSMA50 = currentPrice > currentSMA50
    const priceVsSMA200 = !isNaN(currentSMA200) && currentPrice > currentSMA200
    const sma20VsSMA50 = currentSMA20 > currentSMA50
    const sma50VsSMA200 = !isNaN(currentSMA200) && currentSMA50 > currentSMA200
    const priceVsEMA12 = currentPrice > currentEMA12
    const priceVsEMA200 = !isNaN(currentEMA200) && currentPrice > currentEMA200
    const macdBullish = currentMACD > currentSignal
    const macdHistogramRising = macd.histogram.length >= 2 && macd.histogram[macd.histogram.length - 1] > macd.histogram[macd.histogram.length - 2]
    const rsiOverbought = !isNaN(currentRSI) && currentRSI > 70
    const rsiOversold = !isNaN(currentRSI) && currentRSI < 30
    // const rsiNeutral = !isNaN(currentRSI) && currentRSI >= 40 && currentRSI <= 60 // Voor toekomstig gebruik
    const stochOverbought = !isNaN(currentStochK) && currentStochK > 80
    const stochOversold = !isNaN(currentStochK) && currentStochK < 20
    const priceNearBBUpper = !isNaN(currentBBUpper) && currentPrice > currentBBUpper * 0.98
    const priceNearBBLower = !isNaN(currentBBLower) && currentPrice < currentBBLower * 1.02
    const priceInBBMiddle = !isNaN(currentBBMiddle) && currentPrice > currentBBLower * 1.02 && currentPrice < currentBBUpper * 0.98
    const strongTrend = !isNaN(currentADX) && currentADX > 25
    const weakTrend = !isNaN(currentADX) && currentADX < 20
    
    // Bepaal algemene trend (uitgebreid met meer signalen)
    const bullishSignals = [
      priceVsSMA20, priceVsSMA50, priceVsSMA200, 
      sma20VsSMA50, sma50VsSMA200,
      priceVsEMA12, priceVsEMA200, 
      macdBullish, macdHistogramRising,
      obvTrend === "Stijgend"
    ].filter(Boolean).length
    
    // const bearishSignals = 10 - bullishSignals // Voor toekomstig gebruik
    const isBullish = bullishSignals >= 6
    const isStrongBullish = bullishSignals >= 8 && strongTrend
    
    // Zeer korte termijn (komende dagen tot een week) - Uitgebreide analyse
    let veryShortTerm = ""
    
    // Analyseer alle signalen voor zeer korte termijn
    const vstSignals: string[] = []
    
    if (rsiOverbought && stochOverbought && priceNearBBUpper) {
      vstSignals.push("Sterk overgekocht signaal: zowel RSI als Stochastic staan in overgekochte zone, en de prijs raakt de bovenste Bollinger Band.")
      veryShortTerm = "De koers staat in een zeer overgekochte positie met meerdere bevestigende signalen: RSI boven 70, Stochastic boven 80, en prijs nabij de bovenste Bollinger Band. "
      veryShortTerm += "Dit wijst op een hoge kans op een kortstondige correctie of consolidatie in de komende dagen. "
    } else if (rsiOversold && stochOversold && priceNearBBLower) {
      vstSignals.push("Sterk oververkocht signaal: zowel RSI als Stochastic staan in oververkochte zone, en de prijs raakt de onderste Bollinger Band.")
      veryShortTerm = "De koers bevindt zich in een zeer oververkochte positie met meerdere bevestigende signalen: RSI onder 30, Stochastic onder 20, en prijs nabij de onderste Bollinger Band. "
      veryShortTerm += "Dit kan een sterke koopkans bieden voor de zeer korte termijn, met een hoge waarschijnlijkheid van een technische rebound in de komende dagen. "
    } else if (rsiOverbought && priceNearBBUpper) {
      veryShortTerm = "De koers staat in overgekochte zone met RSI boven 70 en prijs nabij de bovenste Bollinger Band. Er is een verhoogde kans op een kortstondige correctie. "
    } else if (rsiOversold && priceNearBBLower) {
      veryShortTerm = "De koers bevindt zich in oververkochte zone met RSI onder 30 en prijs nabij de onderste Bollinger Band. Dit kan een koopkans bieden voor de zeer korte termijn. "
    } else if (macdBullish && macdHistogramRising && priceAction.momentum === "Positief" && obvTrend === "Stijgend") {
      veryShortTerm = "Sterk bullish momentum met meerdere bevestigingen: MACD boven signaallijn met stijgende histogram, positief prijsmomentum, en stijgend OBV (volume ondersteuning). "
      veryShortTerm += "Voor de komende dagen wordt een voortzetting van de opwaartse trend verwacht. "
    } else if (!macdBullish && !macdHistogramRising && priceAction.momentum === "Negatief" && obvTrend === "Dalend") {
      veryShortTerm = "Sterk bearish momentum met meerdere bevestigingen: MACD onder signaallijn met dalende histogram, negatief prijsmomentum, en dalend OBV (volume bevestigt daling). "
      veryShortTerm += "Voor de komende dagen wordt een voortzetting van de neerwaartse druk verwacht. "
    } else if (macdBullish && currentHistogram > 0 && priceAction.momentum === "Positief") {
      veryShortTerm = "Het momentum is positief met MACD boven de signaallijn en een stijgende histogram. Voor de komende dagen wordt een voortzetting van deze opwaartse trend verwacht. "
    } else if (!macdBullish && currentHistogram < 0 && priceAction.momentum === "Negatief") {
      veryShortTerm = "Het momentum is negatief met MACD onder de signaallijn. Voor de komende dagen wordt een voortzetting van deze neerwaartse druk verwacht. "
    } else {
      veryShortTerm = "De koers bevindt zich in een neutrale zone zonder duidelijke extreme signalen. Er wordt een consolidatie verwacht in de komende dagen. "
    }
    
    // Voeg divergentie informatie toe
    if (divergences.rsiDivergence !== "Geen divergentie") {
      veryShortTerm += `Belangrijk: ${divergences.rsiDivergence}. Dit kan een vroeg waarschuwingssignaal zijn. `
    }
    if (divergences.volumeDivergence !== "Geen divergentie") {
      veryShortTerm += `${divergences.volumeDivergence}. `
    }
    
    // Voeg volatiliteit en trend sterkte toe
    if (priceAction.volatility === "Hoog") {
      veryShortTerm += "De hoge volatiliteit betekent dat er grotere dagelijkse schommelingen kunnen optreden. "
    }
    if (strongTrend) {
      veryShortTerm += "De trend is sterk (ADX > 25), wat suggereert dat de huidige beweging waarschijnlijk zal aanhouden. "
    } else if (weakTrend) {
      veryShortTerm += "De trend is zwak (ADX < 20), wat wijst op mogelijke consolidatie of sideways beweging. "
    }
    
    // Voeg support/resistance levels toe
    const nearestSupport = levels.filter(l => l < currentPrice).sort((a, b) => b - a)[0]
    const nearestResistance = levels.filter(l => l > currentPrice).sort((a, b) => a - b)[0]
    if (nearestSupport && currentPrice < nearestSupport * 1.05) {
      veryShortTerm += `Het dichtstbijzijnde support niveau ligt rond $${nearestSupport.toFixed(2)}. `
    }
    if (nearestResistance && currentPrice > nearestResistance * 0.95) {
      veryShortTerm += `Het dichtstbijzijnde resistance niveau ligt rond $${nearestResistance.toFixed(2)}. `
    }
    
    // Korte termijn (1 week tot 1 maand) - Uitgebreide analyse
    let shortTerm = ""
    if (isStrongBullish && sma20VsSMA50 && priceVsSMA20 && priceVsSMA200 && strongTrend) {
      shortTerm = "Zeer sterke bullish setup voor de korte termijn met meerdere bevestigingen: prijs boven alle belangrijke moving averages (SMA20, SMA50, SMA200), gouden kruis patroon (SMA20 > SMA50), en sterke trend (ADX > 25). "
      if (obvTrend === "Stijgend" && volumeAnalysis.trend === "Stijgend") {
        shortTerm += "Zowel OBV als volume trend zijn stijgend, wat de trend sterk ondersteunt. "
      }
      if (macdHistogramRising && !rsiOverbought) {
        shortTerm += "MACD histogram stijgt en RSI is nog niet overgekocht, wat ruimte laat voor verdere stijging. "
      }
      if (nearestResistance && currentPrice < nearestResistance * 0.95) {
        shortTerm += `Voor de komende weken wordt een beweging richting het resistance niveau van $${nearestResistance.toFixed(2)} verwacht. `
      } else if (currentPrice < resistance * 0.95) {
        shortTerm += `Voor de komende weken wordt een beweging richting het resistance niveau van $${resistance.toFixed(2)} verwacht. `
      } else {
        shortTerm += "De koers nadert belangrijke resistance niveaus, wat mogelijk tot consolidatie of een doorbraak kan leiden. "
      }
      if (divergences.macdDivergence !== "Geen divergentie" && divergences.macdDivergence.includes("Bearish")) {
        shortTerm += `Waarschuwing: ${divergences.macdDivergence} - dit kan wijzen op mogelijke verzwakking. `
      }
    } else if (isBullish && sma20VsSMA50 && priceVsSMA20) {
      shortTerm = "Bullish setup voor de korte termijn. De prijs staat boven zowel de SMA20 als SMA50, en de SMA20 staat boven de SMA50 (gouden kruis patroon). "
      if (priceVsSMA200) {
        shortTerm += "Ook boven de SMA200, wat de langere termijn trend bevestigt. "
      }
      if (obvTrend === "Stijgend") {
        shortTerm += "OBV trend is stijgend, wat volume ondersteuning aangeeft. "
      }
      if (strongTrend) {
        shortTerm += "De trend is sterk (ADX > 25), wat suggereert dat de beweging waarschijnlijk zal aanhouden. "
      }
      if (nearestResistance && currentPrice < nearestResistance * 0.95) {
        shortTerm += `Voor de komende weken wordt een beweging richting $${nearestResistance.toFixed(2)} verwacht. `
      } else if (currentPrice < resistance * 0.95) {
        shortTerm += `Voor de komende weken wordt een beweging richting $${resistance.toFixed(2)} verwacht. `
      }
    } else if (!isBullish && !sma20VsSMA50 && !priceVsSMA20 && !priceVsSMA200) {
      shortTerm = "Bearish setup voor de korte termijn. De prijs staat onder zowel de SMA20 als SMA50, en de SMA20 staat onder de SMA50 (doodskruis patroon). "
      if (!priceVsSMA200) {
        shortTerm += "Ook onder de SMA200, wat de langere termijn bearish trend bevestigt. "
      }
      if (obvTrend === "Dalend") {
        shortTerm += "OBV trend is dalend, wat bevestigt dat volume de daling ondersteunt. "
      }
      if (volumeAnalysis.trend === "Stijgend") {
        shortTerm += "Het stijgende volume bij dalende prijzen versterkt deze bearish signalen (distributie). "
      }
      if (strongTrend) {
        shortTerm += "De trend is sterk bearish (ADX > 25), wat suggereert dat de daling waarschijnlijk zal aanhouden. "
      }
      if (nearestSupport && currentPrice > nearestSupport * 1.05) {
        shortTerm += `Voor de komende weken wordt een beweging richting $${nearestSupport.toFixed(2)} verwacht. `
      } else if (currentPrice > support * 1.05) {
        shortTerm += `Voor de komende weken wordt een beweging richting $${support.toFixed(2)} verwacht. `
      }
      if (divergences.rsiDivergence !== "Geen divergentie" && divergences.rsiDivergence.includes("Bullish")) {
        shortTerm += `Mogelijk positief signaal: ${divergences.rsiDivergence} - dit kan wijzen op mogelijke versterking. `
      }
    } else {
      shortTerm = "De technische indicatoren zijn gemengd voor de korte termijn. Er is geen duidelijke trendrichting, wat wijst op mogelijke consolidatie of sideways beweging in de komende weken. "
      if (weakTrend) {
        shortTerm += "De trend is zwak (ADX < 20), wat consolidatie bevestigt. "
      }
      if (priceAction.volatility === "Hoog") {
        shortTerm += "De hoge volatiliteit kan leiden tot grotere schommelingen, maar zonder duidelijke richting. "
      } else {
        shortTerm += "De relatief lage volatiliteit suggereert een rustigere periode met beperkte bewegingen. "
      }
      if (priceInBBMiddle) {
        shortTerm += "De prijs bevindt zich in het midden van de Bollinger Bands, wat neutraal is. "
      }
    }
    
    // Midden lange termijn (tot 3 maanden) - Uitgebreide analyse
    let mediumTerm = ""
    const longTermTrend = data.length >= 60 ? (() => {
      const threeMonthsAgo = data[Math.max(0, data.length - 60)]
      const change3M = ((currentPrice - threeMonthsAgo.close) / threeMonthsAgo.close) * 100
      return change3M
    })() : 0
    
    if (isStrongBullish && sma20VsSMA50 && sma50VsSMA200 && priceVsSMA200 && strongTrend) {
      mediumTerm = "Zeer sterke bullish setup voor de midden lange termijn (tot 3 maanden). Alle belangrijke moving averages zijn bullish geordend (prijs > SMA20 > SMA50 > SMA200), wat een klassieke opwaartse trendstructuur vormt. "
      mediumTerm += `Over de afgelopen periode is er een stijging van ${longTermTrend > 0 ? longTermTrend.toFixed(1) : '0'}% geweest. `
      if (obvTrend === "Stijgend" && !rsiOverbought) {
        mediumTerm += "OBV trend is stijgend en RSI is nog niet overgekocht, wat ruimte laat voor verdere stijging. "
      }
      if (macdHistogramRising && !divergences.macdDivergence.includes("Bearish")) {
        mediumTerm += "MACD momentum blijft positief zonder bearish divergentie. "
      }
      mediumTerm += "De sterke trend (ADX > 25) suggereert dat deze opwaartse beweging waarschijnlijk zal aanhouden. "
      if (nearestResistance && currentPrice < nearestResistance * 0.9) {
        mediumTerm += `Het eerste doel voor de komende maanden ligt rond $${nearestResistance.toFixed(2)}. `
      } else if (currentPrice < resistance * 0.9) {
        mediumTerm += `Het eerste doel voor de komende maanden ligt rond $${resistance.toFixed(2)}. `
      }
      mediumTerm += "Let wel op mogelijke correcties tijdens de trend, vooral als de RSI boven 70 komt, Stochastic overgekocht raakt, of als er negatieve divergenties optreden."
    } else if (isBullish && sma20VsSMA50) {
      mediumTerm = "Bullish setup voor de midden lange termijn (tot 3 maanden). De technische indicatoren wijzen op een positieve trend. "
      if (priceVsSMA200) {
        mediumTerm += "De prijs staat boven de SMA200, wat de langere termijn trend bevestigt. "
      }
      if (!isNaN(currentRSI) && currentRSI < 70 && !rsiOverbought) {
        mediumTerm += "De RSI is nog niet in overgekochte zone, wat ruimte laat voor verdere stijging. "
      }
      if (obvTrend === "Stijgend") {
        mediumTerm += "OBV trend is stijgend, wat volume ondersteuning aangeeft. "
      }
      mediumTerm += "De combinatie van positieve moving averages en bullish MACD signalen suggereert dat de opwaartse trend kan aanhouden. "
      if (divergences.macdDivergence !== "Geen divergentie" && divergences.macdDivergence.includes("Bearish")) {
        mediumTerm += `Waarschuwing: ${divergences.macdDivergence} - dit kan wijzen op mogelijke verzwakking op middellange termijn. `
      }
      if (currentPrice < resistance * 0.9) {
        mediumTerm += `Het eerste doel voor de komende maanden ligt rond $${resistance.toFixed(2)}. `
      }
    } else if (!isBullish && !sma20VsSMA50 && !priceVsSMA200) {
      mediumTerm = "Bearish setup voor de midden lange termijn (tot 3 maanden). De technische indicatoren wijzen op een neerwaartse trend. "
      if (!priceVsSMA200) {
        mediumTerm += "De prijs staat onder de SMA200, wat de langere termijn bearish trend bevestigt. "
      }
      if (!isNaN(currentRSI) && currentRSI > 30 && !rsiOversold) {
        mediumTerm += "De RSI is nog niet in oververkochte zone, wat suggereert dat er mogelijk nog ruimte is voor verdere daling. "
      }
      if (obvTrend === "Dalend") {
        mediumTerm += "OBV trend is dalend, wat bevestigt dat volume de daling ondersteunt. "
      }
      mediumTerm += "De combinatie van negatieve moving averages en bearish MACD signalen suggereert dat de neerwaartse druk kan aanhouden. "
      if (divergences.rsiDivergence !== "Geen divergentie" && divergences.rsiDivergence.includes("Bullish")) {
        mediumTerm += `Mogelijk positief signaal: ${divergences.rsiDivergence} - dit kan wijzen op mogelijke versterking. `
      }
      if (currentPrice > support * 1.1) {
        mediumTerm += `Het eerste doel voor de komende maanden ligt rond $${support.toFixed(2)}. `
      }
      mediumTerm += "Een doorbraak onder dit niveau zou een verdere daling kunnen inluiden."
    } else {
      mediumTerm = "Gemengde signalen voor de midden lange termijn (tot 3 maanden). De technische indicatoren wijzen niet duidelijk in één richting, wat suggereert dat er mogelijk een consolidatie fase aan de gang is. "
      if (weakTrend) {
        mediumTerm += "De zwakke trend (ADX < 20) bevestigt deze consolidatie. "
      }
      mediumTerm += "Dit kan een periode zijn waarin de koers zich voorbereidt op een volgende grote beweging. "
      if (priceAction.volatility === "Hoog") {
        mediumTerm += "De hoge volatiliteit kan leiden tot grotere schommelingen in beide richtingen. "
      }
      if (levels.length > 0) {
        mediumTerm += `Belangrijke support/resistance niveaus liggen rond $${levels.map(l => l.toFixed(2)).join(', $')}. `
      }
    }
    
    // Lange termijn (3-6 maanden)
    let longTerm = ""
    if (data.length >= 120) {
      const sixMonthsAgo = data[Math.max(0, data.length - 120)]
      const change6M = ((currentPrice - sixMonthsAgo.close) / sixMonthsAgo.close) * 100
      
      longTerm = "Voor de lange termijn (3-6 maanden) is de trendanalyse gebaseerd op de langere termijn moving averages en de algemene marktstructuur. "
      
      if (sma20VsSMA50 && priceVsSMA50 && change6M > 0) {
        longTerm += "De langere termijn trend is positief, met de koers boven de belangrijkste moving averages. "
        longTerm += `Over de afgelopen 6 maanden is er een stijging van ${change6M.toFixed(1)}% geweest. `
        longTerm += "Als deze trend zich voortzet, kan er voor de komende 3-6 maanden verdere opwaartse beweging worden verwacht, hoewel dit afhankelijk is van fundamentele factoren en marktomstandigheden."
      } else if (!sma20VsSMA50 && !priceVsSMA50 && change6M < 0) {
        longTerm += "De langere termijn trend is negatief, met de koers onder de belangrijkste moving averages. "
        longTerm += `Over de afgelopen 6 maanden is er een daling van ${Math.abs(change6M).toFixed(1)}% geweest. `
        longTerm += "Als deze trend zich voortzet, kan er voor de komende 3-6 maanden verdere neerwaartse druk worden verwacht, hoewel dit afhankelijk is van fundamentele factoren en marktomstandigheden."
      } else {
        longTerm += "De langere termijn trend is onduidelijk of gemengd. "
        longTerm += `Over de afgelopen 6 maanden is er een ${change6M > 0 ? 'stijging' : 'daling'} van ${Math.abs(change6M).toFixed(1)}% geweest. `
        longTerm += "Voor de komende 3-6 maanden wordt een consolidatie of een langzame trendwijziging verwacht, afhankelijk van hoe de technische structuur zich ontwikkelt."
      }
      
      longTerm += " Belangrijk om te onthouden: technische analyse heeft beperkingen op de lange termijn en fundamentele factoren worden steeds belangrijker."
    } else {
      longTerm = "Voor een betrouwbare lange termijn analyse (3-6 maanden) is meer historische data nodig. "
      longTerm += "Op basis van de beschikbare data: de huidige technische setup suggereert dat de trend zich waarschijnlijk zal voortzetten, maar dit moet worden bevestigd met meer data en fundamentele analyse."
    }
    
    // Zeer lange termijn (verder dan 6 maanden)
    let veryLongTerm = ""
    if (data.length >= 180) {
      const oneYearAgo = data[Math.max(0, data.length - 250)]
      const change1Y = ((currentPrice - oneYearAgo.close) / oneYearAgo.close) * 100
      
      veryLongTerm = "Voor de zeer lange termijn (verder dan 6 maanden) is technische analyse minder betrouwbaar en spelen fundamentele factoren een veel grotere rol. "
      
      veryLongTerm += `Op basis van de historische koersontwikkeling: over de afgelopen periode is er een ${change1Y > 0 ? 'stijging' : 'daling'} van ${Math.abs(change1Y).toFixed(1)}% geweest. `
      
      if (sma20VsSMA50 && priceVsSMA50) {
        veryLongTerm += "De huidige technische structuur is positief, wat suggereert dat de langere termijn trend mogelijk bullish blijft. "
      } else if (!sma20VsSMA50 && !priceVsSMA50) {
        veryLongTerm += "De huidige technische structuur is negatief, wat suggereert dat de langere termijn trend mogelijk bearish blijft. "
      } else {
        veryLongTerm += "De huidige technische structuur is gemengd, wat suggereert dat er mogelijk een trendwijziging aan de gang is. "
      }
      
      veryLongTerm += "Echter, voor voorspellingen verder dan 6 maanden zijn fundamentele factoren zoals bedrijfsresultaten, sector trends, economische omstandigheden en marktsentiment veel belangrijker dan technische indicatoren. "
      veryLongTerm += "Technische analyse kan helpen bij het identificeren van trends, maar kan geen garanties geven over toekomstige prestaties."
    } else {
      veryLongTerm = "Voor een betrouwbare zeer lange termijn analyse (verder dan 6 maanden) is minimaal een jaar aan historische data nodig. "
      veryLongTerm += "Op basis van de beschikbare data: de huidige technische indicatoren suggereren een bepaalde trendrichting, maar voor voorspellingen op deze termijn zijn fundamentele factoren veel belangrijker dan technische indicatoren."
    }
    
    // Bereken scores voor elke termijn
    // Voor zeer korte termijn: focus op momentum en overgekocht/oververkocht signalen
    const veryShortTermScore = calculateScore(
      data.slice(-30), // Laatste 30 dagen voor zeer korte termijn
      sma20.slice(-30),
      sma50.slice(-30),
      sma200.slice(-30),
      ema12.slice(-30),
      ema200.slice(-30),
      rsi.slice(-30),
      { macd: macd.macd.slice(-30), signal: macd.signal.slice(-30), histogram: macd.histogram.slice(-30) },
      { upper: bollinger.upper.slice(-30), middle: bollinger.middle.slice(-30), lower: bollinger.lower.slice(-30) },
      { k: stochastic.k.slice(-30), d: stochastic.d.slice(-30) },
      adx.slice(-30),
      obv.slice(-30),
      divergences,
      volumeAnalysis,
      priceAction,
      support,
      resistance
    )
    
    // Voor korte termijn: focus op moving averages en trend
    const shortTermScore = calculateScore(
      data.slice(-60), // Laatste 60 dagen
      sma20.slice(-60),
      sma50.slice(-60),
      sma200.slice(-60),
      ema12.slice(-60),
      ema200.slice(-60),
      rsi.slice(-60),
      { macd: macd.macd.slice(-60), signal: macd.signal.slice(-60), histogram: macd.histogram.slice(-60) },
      { upper: bollinger.upper.slice(-60), middle: bollinger.middle.slice(-60), lower: bollinger.lower.slice(-60) },
      { k: stochastic.k.slice(-60), d: stochastic.d.slice(-60) },
      adx.slice(-60),
      obv.slice(-60),
      divergences,
      volumeAnalysis,
      priceAction,
      support,
      resistance
    )
    
    // Voor midden lange termijn: volledige dataset
    const mediumTermScore = calculateScore(
      data,
      sma20,
      sma50,
      sma200,
      ema12,
      ema200,
      rsi,
      macd,
      bollinger,
      stochastic,
      adx,
      obv,
      divergences,
      volumeAnalysis,
      priceAction,
      support,
      resistance
    )
    
    // Voor lange termijn: zelfde als midden lange termijn (focus op langere trends)
    const longTermScore = mediumTermScore
    
    // Voor zeer lange termijn: zelfde als lange termijn maar met meer gewicht op fundamentele structuur
    const veryLongTermScore = mediumTermScore
    
    // Overall score: gewogen gemiddelde (meer gewicht op korte termijn)
    const overallScore = (
      veryShortTermScore * 0.15 +
      shortTermScore * 0.25 +
      mediumTermScore * 0.25 +
      longTermScore * 0.20 +
      veryLongTermScore * 0.15
    )
    
    return {
      veryShortTerm,
      shortTerm,
      mediumTerm,
      longTerm,
      veryLongTerm,
      veryShortTermScore,
      shortTermScore,
      mediumTermScore,
      longTermScore,
      veryLongTermScore,
      overallScore: Math.round(overallScore * 10) / 10
    }
  }

  // Haal AI-verbeterde analyse op
  const fetchAIAnalysis = async (
    symbol: string,
    term: string,
    currentPrice: number,
    indicators: Record<string, unknown>,
    baseAnalysis: string,
    score: number,
    fundamentalsData?: Record<string, unknown>
  ): Promise<void> => {
    const cacheKey = `${symbol}-${term}`
    
    // Set loading state eerst (dit triggert een re-render)
    setAiAnalyses(prev => {
      // Check cache en skip als al geladen of aan het laden
      if (prev[cacheKey] && (!prev[cacheKey].loading || prev[cacheKey].aiEnhanced)) {
        return prev // Geen wijziging, geen re-render
      }
      // Maak nieuwe state object om re-render te forceren
      return {
        ...prev,
        [cacheKey]: { analysis: baseAnalysis, loading: true, aiEnhanced: false }
      }
    })
    
    // Check of we moeten skippen na state update
    // We moeten dit doen via een kleine delay of we kunnen het gewoon proberen
    // en de API call doen - als het al geladen is, wordt het overschreven
    
    try {
      const response = await fetch('/api/stocks/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          currentPrice,
          indicators,
          analysis: baseAnalysis,
          term,
          score,
          fundamentals: fundamentalsData
        })
      })
      
      if (!response.ok) {
        throw new Error('AI analyse mislukt')
      }
      
      const data = await response.json()
      
      // Update cache met nieuwe object reference om re-render te forceren
      setAiAnalyses(prev => {
        // Maak een volledig nieuwe object structuur om re-render te garanderen
        const newState: Record<string, { analysis: string, loading: boolean, aiEnhanced: boolean, scoreExplanation?: string, score?: number }> = {}
        Object.keys(prev).forEach(key => {
          newState[key] = { ...prev[key] }
        })
        newState[cacheKey] = { 
          analysis: data.analysis || baseAnalysis, 
          loading: false, 
          aiEnhanced: data.aiEnhanced === true, // Zorg ervoor dat dit een boolean is
          scoreExplanation: data.scoreExplanation || undefined,
          score: data.score !== undefined ? data.score : undefined // Nieuwe score als beschikbaar
        }
        console.log('AI analysis updated for', cacheKey, {
          aiEnhanced: newState[cacheKey].aiEnhanced,
          hasAnalysis: !!newState[cacheKey].analysis,
          analysisLength: newState[cacheKey].analysis?.length,
          newScore: newState[cacheKey].score
        })
        return newState
      })
    } catch (error) {
      console.error('Error fetching AI analysis:', error)
      
      // Fallback naar basis analyse
      setAiAnalyses(prev => {
        // Maak een volledig nieuwe object structuur om re-render te garanderen
        const newState: Record<string, { analysis: string, loading: boolean, aiEnhanced: boolean, score?: number }> = {}
        Object.keys(prev).forEach(key => {
          newState[key] = { ...prev[key] }
        })
        newState[cacheKey] = { analysis: baseAnalysis, loading: false, aiEnhanced: false }
        return newState
      })
    }
  }

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

  // Laad fundamentele data
  const fetchFundamentals = async (symbol: string) => {
    try {
      const response = await fetch(`/api/stocks/fundamentals?symbol=${symbol}`)
      if (!response.ok) {
        const error = await response.json()
        // Fundamentele data is optioneel, return null bij fout
        console.warn("Error fetching fundamentals:", error.error || "Fout bij ophalen fundamentele data")
        return null
      }
      const data = await response.json()
      return data.fundamentals
    } catch (error) {
      console.error("Error fetching fundamentals:", error)
      // Return null in plaats van error gooien, zodat andere data wel wordt geladen
      return null
    }
  }

  // Laad favorieten
  const loadFavorites = async () => {
    if (!effectiveIsLoaded || !effectiveUser?.id) return

    try {
      const response = await fetch("/api/stocks/favorites", {
        credentials: "include", // Zorg dat cookies worden meegestuurd
      })
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
        
        // Laad quotes voor favorieten
        if (data.favorites && data.favorites.length > 0) {
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
      } else {
        // Als de response niet ok is, zet lege array
        setFavorites([])
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
      // Bij error, zet lege array om crashes te voorkomen
      setFavorites([])
    }
  }

  // Laad top stijgers en dalers
  const loadGainersLosers = async () => {
    setLoadingGainersLosers(true)
    try {
      const response = await fetch("/api/stocks/gainers-losers")
      if (response.ok) {
        const data = await response.json()
        setGainers(data.gainers || [])
        setLosers(data.losers || [])
      }
    } catch (error) {
      console.error("Error loading gainers and losers:", error)
    } finally {
      setLoadingGainersLosers(false)
    }
  }

  // Alle zoekresultaten (zonder filter)
  const [allSearchResults, setAllSearchResults] = useState<StockSearchResult[]>([])

  // Zoek aandelen
  const searchStocks = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      setAllSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        const results = data.results || []
        
        // Bewaar alle resultaten
        setAllSearchResults(results)
        
        // Filter op beurs als er een geselecteerd is
        if (selectedExchange !== "ALL") {
          const filtered = results.filter((result: StockSearchResult) => 
            result.exchange === selectedExchange
          )
          setSearchResults(filtered)
        } else {
          setSearchResults(results)
        }
      }
    } catch (error) {
      console.error("Error searching stocks:", error)
      toast.error("Fout bij zoeken")
    } finally {
      setSearching(false)
    }
  }

  // Filter zoekresultaten wanneer beurs verandert
  useEffect(() => {
    if (allSearchResults.length > 0) {
      if (selectedExchange !== "ALL") {
        const filtered = allSearchResults.filter((result: StockSearchResult) => 
          result.exchange === selectedExchange
        )
        setSearchResults(filtered)
      } else {
        setSearchResults(allSearchResults)
      }
    }
  }, [selectedExchange, allSearchResults])

  // Gefilterde zoekresultaten op basis van beurs
  const filteredSearchResults = searchResults

  // Zoek aandelen voor favorieten dialog
  const searchStocksForFavorite = async (query: string) => {
    if (query.length < 2) {
      setFavoriteSearchResults([])
      return
    }

    setFavoriteSearching(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setFavoriteSearchResults(data.results || [])
      }
    } catch (error) {
      console.error("Error searching stocks:", error)
      toast.error("Fout bij zoeken")
    } finally {
      setFavoriteSearching(false)
    }
  }

  // Effect voor favorieten zoeken
  useEffect(() => {
    const timer = setTimeout(() => {
      if (favoriteSearchQuery) {
        searchStocksForFavorite(favoriteSearchQuery)
      } else {
        setFavoriteSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [favoriteSearchQuery])

  // Voeg favoriet toe
  const addFavorite = async (stock: StockSearchResult) => {
    // Check of gebruiker echt ingelogd is - wacht tot Clerk geladen is
    if (!isLoaded) {
      toast.error("Even geduld, authenticatie wordt geladen...")
      return
    }

    if (!effectiveUser || !effectiveUser.id) {
      toast.error("Log in om favorieten toe te voegen")
      return
    }

    try {
      const response = await fetch("/api/stocks/favorites", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include", // Zorg dat cookies worden meegestuurd
        cache: "no-store", // Voorkom caching
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name || stock.symbol, // Fallback naar symbol als naam ontbreekt
          exchange: stock.exchange || null,
          type: stock.type || "STOCK",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.favorite) {
          setFavorites([...favorites, data.favorite])
          toast.success(`${stock.name} toegevoegd aan favorieten`)
          setSearchDialogOpen(false)
          setSearchQuery("")
          // Herlaad favorieten om zeker te zijn dat alles synchroon is
          loadFavorites().catch(err => console.warn("Failed to reload favorites:", err))
        } else {
          toast.error("Fout: Geen favoriet data ontvangen")
        }
      } else {
        let errorData: { error?: string } = {}
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: "Onbekende fout" }
        }
        
        const errorMessage = errorData?.error || `Fout bij toevoegen favoriet (${response.status})`
        
        // Specifieke melding voor 401
        if (response.status === 401) {
          toast.error("Je bent niet ingelogd. Log in om favorieten toe te voegen.")
        } else {
          toast.error(errorMessage)
        }
        console.error("Error response:", response.status, errorData)
      }
    } catch (error) {
      console.error("Error adding favorite:", error)
      toast.error("Fout bij toevoegen favoriet")
    }
  }

  // Verwijder favoriet
  const removeFavorite = async (symbol: string) => {
    if (!effectiveIsLoaded || !effectiveUser?.id) return

    try {
      const response = await fetch(`/api/stocks/favorites?symbol=${symbol}`, {
        method: "DELETE",
        credentials: "include", // Zorg dat cookies worden meegestuurd
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
      // Gebruik Promise.allSettled zodat individuele failures niet alles stoppen
      const results = await Promise.allSettled([
        fetchQuote(symbol).catch(err => {
          console.error("Error fetching quote:", err)
          return null
        }),
        fetchHistory(symbol, period).catch(err => {
          console.error("Error fetching history:", err)
          return []
        }),
        fetchHistory(symbol, "1Y").catch(err => {
          console.error("Error fetching analysis history:", err)
          return []
        }),
        fetchFundamentals(symbol).catch(err => {
          console.error("Error fetching fundamentals:", err)
          return null
        }),
      ])

      const quoteData = results[0].status === "fulfilled" ? results[0].value : null
      const historyData = results[1].status === "fulfilled" ? results[1].value : []
      const analysisData = results[2].status === "fulfilled" ? results[2].value : []
      const fundamentalsData = results[3].status === "fulfilled" ? results[3].value : null

      // Zet de data, zelfs als sommige calls faalden
      if (quoteData) setQuote(quoteData)
      if (historyData && historyData.length > 0) {
        setHistory(historyData)
      } else {
        // Als de geselecteerde periode geen data heeft, probeer ALL
        try {
          const fallbackData = await fetchHistory(symbol, "ALL")
          if (fallbackData && fallbackData.length > 0) {
            setHistory(fallbackData)
          }
        } catch (fallbackError) {
          console.error("Error fetching fallback history data:", fallbackError)
          setHistory([])
        }
      }
      
      if (analysisData && analysisData.length > 0) {
        setAnalysisHistory(analysisData)
      } else {
        // Probeer alsnog ALL data op te halen voor analyse als 1Y faalt
        try {
          const fallbackData = await fetchHistory(symbol, "ALL")
          if (fallbackData && fallbackData.length > 0) {
            setAnalysisHistory(fallbackData)
          } else {
            setAnalysisHistory([])
          }
        } catch (fallbackError) {
          console.error("Error fetching fallback analysis data:", fallbackError)
          setAnalysisHistory([])
        }
      }
      
      if (fundamentalsData) setFundamentals(fundamentalsData)

      // Toon alleen een error als kritieke data ontbreekt
      if (!quoteData && (!historyData || historyData.length === 0)) {
        toast.error("Kon geen beursdata ophalen. Probeer het later opnieuw.")
      } else if (!historyData || historyData.length === 0) {
        toast.warning("Geen historische data beschikbaar voor deze periode.")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fout bij laden beursdata"
      console.error("Error in loadStockData:", error)
      toast.error(message)
      // Zorg ervoor dat history leeg is als alles faalt
      setHistory([])
      setAnalysisHistory([])
    } finally {
      setLoading(false)
    }
  }

  // Lees symbol uit URL parameters
  useEffect(() => {
    const symbolParam = searchParams.get("symbol")
    if (symbolParam) {
      selectStock(symbolParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Initial load
  useEffect(() => {
    loadStockData(selectedStock, selectedPeriod)
    loadGainersLosers()
    // Probeer favorieten te laden, maar crash niet als het faalt
    if (effectiveIsLoaded && effectiveUser?.emailAddresses?.[0]?.emailAddress) {
      loadFavorites().catch((error) => {
        console.warn("Failed to load favorites (non-critical):", error)
        // Zet lege array om crashes te voorkomen
        setFavorites([])
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveIsLoaded, effectiveUser])

  // Update bij wijziging van aandeel of periode
  useEffect(() => {
    if (selectedStock) {
      loadStockData(selectedStock, selectedPeriod)
      // Reset AI analyses bij wijziging van aandeel
      setAiAnalyses({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStock, selectedPeriod])

  // Debug: Log wanneer aiAnalyses verandert
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('aiAnalyses state changed:', Object.keys(aiAnalyses).map(key => ({
        key,
        hasAnalysis: !!aiAnalyses[key]?.analysis,
        loading: aiAnalyses[key]?.loading,
        aiEnhanced: aiAnalyses[key]?.aiEnhanced
      })))
    }
  }, [aiAnalyses])

  // Detecteer patronen wanneer history verandert
  useEffect(() => {
    if (history.length > 20) {
      // Detecteer altijd alle patronen
      const patterns = detectAllPatterns(history)
      setDetectedPatterns(patterns)
      // Standaard alleen de top 3 meest betrouwbare patronen tonen
      // Alle andere patronen worden standaard verborgen
      const top3Count = Math.min(3, patterns.length)
      const hiddenIds = new Set<number>()
      for (let i = top3Count; i < patterns.length; i++) {
        hiddenIds.add(i)
      }
      setHiddenPatternIds(hiddenIds)
    } else {
      setDetectedPatterns([])
      setHiddenPatternIds(new Set())
    }
  }, [history])

  // Start AI analyse voor alle termijnen (handmatig via knop)
  const startAIAnalysis = async () => {
    if (analysisHistory.length < 50 || !quote || loading || isAnalyzing) {
      toast.error("Wacht tot de basis analyse klaar is")
      return
    }
    
    setIsAnalyzing(true)
    
    try {
      const sma20 = calculateSMA(analysisHistory, 20)
      const sma50 = calculateSMA(analysisHistory, 50)
      const ema12 = calculateEMA(analysisHistory, 12)
      const rsi = calculateRSI(analysisHistory, 14)
      const macd = calculateMACD(analysisHistory)
      const bollinger = calculateBollingerBands(analysisHistory, 20, 2)
      const stochastic = calculateStochastic(analysisHistory, 14, 3)
      const obv = calculateOBV(analysisHistory)
      const adx = calculateADX(analysisHistory, 14)
      const { support, resistance } = getSupportResistance(analysisHistory)
      const volumeAnalysis = analyzeVolume(analysisHistory)
      const priceAction = analyzePriceAction(analysisHistory)
      const divergences = detectDivergences(analysisHistory, rsi, macd)
      
      const currentPrice = analysisHistory[analysisHistory.length - 1].close
      const currentRSI = rsi[rsi.length - 1]
      const currentSMA20 = sma20[sma20.length - 1]
      const currentSMA50 = sma50[sma50.length - 1]
      // const currentEMA12 = ema12[ema12.length - 1] // Voor toekomstig gebruik
      const currentMACD = macd.macd[macd.macd.length - 1]
      const currentSignal = macd.signal[macd.signal.length - 1]
      const currentHistogram = macd.histogram[macd.histogram.length - 1]
      const currentBBUpper = bollinger.upper[bollinger.upper.length - 1]
      const currentBBLower = bollinger.lower[bollinger.lower.length - 1]
      const currentBBMiddle = bollinger.middle[bollinger.middle.length - 1]
      const currentStochK = stochastic.k[stochastic.k.length - 1]
      const currentADX = adx[adx.length - 1]
      const currentOBV = obv[obv.length - 1]
      const prevOBV = obv.length > 1 ? obv[obv.length - 2] : currentOBV
      const obvTrend = currentOBV > prevOBV ? "Stijgend" : currentOBV < prevOBV ? "Dalend" : "Neutraal"
      
      const analysis = generateTechnicalAnalysis(
        analysisHistory,
        sma20,
        sma50,
        ema12,
        rsi,
        macd,
        bollinger,
        calculateATR(analysisHistory, 14),
        support,
        resistance,
        getSupportResistance(analysisHistory).levels
      )
      
      // Voeg patronen informatie toe aan indicators
      const patternsInfo = detectedPatterns.map(p => ({
        type: p.type,
        name: getPatternName(p.type),
        explanation: getPatternExplanation(p.type),
        confidence: p.confidence,
        entry: p.entry,
        target: p.target,
        stop: p.stop,
        trend: getPatternTrend(p),
        breakoutDirection: p.breakoutDirection
      }))
      
      const indicators = {
        RSI: currentRSI,
        MACD: { value: currentMACD, signal: currentSignal, histogram: currentHistogram },
        SMA20: currentSMA20,
        SMA50: currentSMA50,
        Stochastic: { k: currentStochK, d: stochastic.d[stochastic.d.length - 1] },
        ADX: currentADX,
        OBV: obvTrend,
        BollingerBands: { upper: currentBBUpper, lower: currentBBLower, middle: currentBBMiddle },
        Volume: volumeAnalysis,
        PriceAction: priceAction,
        Divergences: divergences,
        Patterns: patternsInfo
      }
      
      toast.info("AI analyse wordt gestart voor alle termijnen...")
      
      // Haal AI analyses op voor alle termijnen (parallel)
      const terms = [
        { key: `${selectedStock}-veryShortTerm`, term: "Zeer Korte Termijn", analysis: analysis.veryShortTerm },
        { key: `${selectedStock}-shortTerm`, term: "Korte Termijn", analysis: analysis.shortTerm },
        { key: `${selectedStock}-mediumTerm`, term: "Midden Lange Termijn", analysis: analysis.mediumTerm },
        { key: `${selectedStock}-longTerm`, term: "Lange Termijn", analysis: analysis.longTerm },
        { key: `${selectedStock}-veryLongTerm`, term: "Zeer Lange Termijn", analysis: analysis.veryLongTerm }
      ]
      
      // Start alle AI analyses parallel
      const results = await Promise.allSettled(
        terms.map(({ key, term, analysis: baseAnalysis }) => {
          // Bepaal de score voor deze termijn
          let score = 0
          if (key.includes('veryShortTerm')) score = analysis.veryShortTermScore
          else if (key.includes('shortTerm')) score = analysis.shortTermScore
          else if (key.includes('mediumTerm')) score = analysis.mediumTermScore
          else if (key.includes('longTerm')) score = analysis.longTermScore
          else if (key.includes('veryLongTerm')) score = analysis.veryLongTermScore
          
          return fetchAIAnalysis(selectedStock, term, currentPrice, indicators, baseAnalysis, score, fundamentals || undefined)
        })
      )
      
      // Check of alle analyses succesvol zijn voltooid
      const failed = results.filter(r => r.status === 'rejected')
      const successful = results.filter(r => r.status === 'fulfilled')
      
      if (failed.length > 0) {
        console.error('Failed AI analyses:', failed.map(r => r.status === 'rejected' ? r.reason : null))
        toast.error(`${failed.length} van ${results.length} analyses mislukt. ${successful.length} analyses succesvol.`)
      } else {
        toast.success("AI analyse succesvol voltooid voor alle termijnen!")
      }
    } catch (error) {
      console.error('Error starting AI analysis:', error)
      toast.error("Fout bij starten AI analyse")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Start Deep Research rapport generatie
  const startDeepResearch = async (symbol?: string, name?: string, exchange?: string, type?: string) => {
    if (!isLoaded || !user?.id) {
      toast.error("Je moet ingelogd zijn om een Deep Research rapport te genereren")
      return
    }

    const stockSymbol = symbol || selectedStock
    const stockName = name || getStockName(stockSymbol)
    const stockExchange = exchange || ""
    const stockType = type || "STOCK"

    setGeneratingDeepResearch(true)
    
    try {
      const response = await fetch("/api/stocks/deep-research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Zorg dat cookies worden meegestuurd
        body: JSON.stringify({
          symbol: stockSymbol,
          name: stockName,
          exchange: stockExchange,
          type: stockType,
        }),
      })

      if (response.ok) {
        try {
          const data = await response.json()
          toast.success("Deep Research rapport wordt gegenereerd... Dit kan enkele minuten duren.")
          // Open de deep research pagina in een nieuw tabblad
          window.open(`/stocks/deep-research/${data.reportId}`, '_blank')
        } catch (jsonError) {
          console.error("Error parsing JSON response:", jsonError)
          toast.error("Fout bij verwerken response van server")
        }
      } else {
        // Probeer JSON error te lezen, anders gebruik status text
        let errorMessage = "Fout bij genereren Deep Research rapport"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (jsonError) {
          // Als het geen JSON is, gebruik status text
          errorMessage = response.statusText || errorMessage
          console.error("Error response was not JSON:", jsonError)
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error("Error generating deep research:", error)
      toast.error("Fout bij genereren Deep Research rapport")
    } finally {
      setGeneratingDeepResearch(false)
    }
  }

  // Zoek debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchStocks(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, selectedExchange])

  // Refresh functie
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        loadStockData(selectedStock, selectedPeriod),
        loadFavorites(),
        loadGainersLosers(),
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

  // Zorg dat we alleen na mount conditionele rendering doen
  useEffect(() => {
    setIsMounted(true)
  }, [])

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
              {/* Congressional Trades tijdelijk uitgeschakeld */}
              {/* <Button variant="outline" size="sm" asChild>
                <Link href="/stocks/pelosi-trades">
                  Congressional Trades
                </Link>
              </Button> */}
              <Select value={selectedCurrency} onValueChange={(value: "EUR" | "USD") => setSelectedCurrency(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Valuta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
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
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Zoek op naam of symbool (bijv. Apple, AAPL, ASML)..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                        <SelectTrigger className="w-[200px]">
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
                    </div>
                    {selectedExchange !== "ALL" && (
                      <div className="text-sm text-muted-foreground">
                        Gefilterd op: <span className="font-medium">{EXCHANGES.find(e => e.value === selectedExchange)?.label}</span>
                      </div>
                    )}
                    {searching && (
                      <div className="flex items-center justify-center py-8">
                        <Skeleton className="h-8 w-full" />
                      </div>
                    )}
                    {!searching && filteredSearchResults.length === 0 && searchResults.length > 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Geen resultaten gevonden voor deze beurs. Probeer een andere beurs of verwijder het filter.
                      </div>
                    )}
                    {!searching && filteredSearchResults.length > 0 && (
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        <div className="text-xs text-muted-foreground mb-2">
                          {filteredSearchResults.length} resultaat{filteredSearchResults.length !== 1 ? 'en' : ''} gevonden
                        </div>
                        {filteredSearchResults.map((result) => (
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
                                <Badge variant="outline" className="mr-1">{result.exchange}</Badge> • {result.type}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  selectStock(result.symbol)
                                  setSearchDialogOpen(false)
                                  setSearchQuery("")
                                }}
                              >
                                Selecteer
                              </Button>
                              {isLoaded && user?.id && (
                                <>
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
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      startDeepResearch(result.symbol, result.name, result.exchange, result.type)
                                      setSearchDialogOpen(false)
                                    }}
                                    disabled={generatingDeepResearch}
                                    title="Genereer Deep Research rapport"
                                  >
                                    {generatingDeepResearch ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <FileText className="h-4 w-4" />
                                    )}
                                  </Button>
                                </>
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

        {/* News Ticker - Compact */}
        <div className="mb-6">
          <NewsTicker pagePath="/stocks" />
        </div>

        {/* Dag-Top 3 Beleggingsproducten */}
        <div className="mb-8">
          <DailyTop3 selectedCurrency={selectedCurrency} eurToUsdRate={EUR_TO_USD_RATE} />
        </div>

        {/* Top Stijgers en Dalers */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Top 5 Stijgers */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Top 5 Stijgers
              </CardTitle>
              <CardDescription>
                Grootste winnaars van vandaag
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingGainersLosers ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : gainers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Geen data beschikbaar
                </div>
              ) : (
                <div className="space-y-3">
                  {gainers.map((stock, index) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        selectStock(stock.symbol)
                        setSearchDialogOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-500 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground truncate">
                            {stock.symbol}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {stock.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="font-semibold text-foreground">
                            {formatPrice(stock.price)}
                          </div>
                          <div className="text-sm text-green-500 flex items-center gap-1">
                            <ArrowUp className="h-3 w-3" />
                            {stock.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top 5 Dalers */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Top 5 Dalers
              </CardTitle>
              <CardDescription>
                Grootste verliezers van vandaag
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingGainersLosers ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : losers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Geen data beschikbaar
                </div>
              ) : (
                <div className="space-y-3">
                  {losers.map((stock, index) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        selectStock(stock.symbol)
                        setSearchDialogOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground truncate">
                            {stock.symbol}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {stock.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="font-semibold text-foreground">
                            {formatPrice(stock.price)}
                          </div>
                          <div className="text-sm text-red-500 flex items-center gap-1">
                            <ArrowDown className="h-3 w-3" />
                            {stock.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Linker kolom - Favorieten */}
          <div className="lg:col-span-1 space-y-6">
            {isMounted && isLoaded && user?.emailAddresses?.[0]?.emailAddress ? (
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-foreground">Mijn Favorieten</CardTitle>
                      <CardDescription>
                        Je opgeslagen aandelen en ETF&apos;s
                      </CardDescription>
                    </div>
                    <Dialog 
                      open={addFavoriteDialogOpen} 
                      onOpenChange={(open) => {
                        setAddFavoriteDialogOpen(open)
                        if (!open) {
                          setFavoriteSearchQuery("")
                          setFavoriteSearchResults([])
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Star className="h-4 w-4 mr-2" />
                          Toevoegen
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Favoriet Toevoegen</DialogTitle>
                          <DialogDescription>
                            Typ het symbool of de naam van het aandeel
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Typ symbool of naam (bijv. AAPL, ASML)..."
                              value={favoriteSearchQuery}
                              onChange={(e) => setFavoriteSearchQuery(e.target.value)}
                              className="pl-10"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && favoriteSearchResults.length > 0) {
                                  addFavorite(favoriteSearchResults[0])
                                  setAddFavoriteDialogOpen(false)
                                  setFavoriteSearchQuery("")
                                  setFavoriteSearchResults([])
                                }
                              }}
                            />
                          </div>
                          {favoriteSearching && (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                          )}
                          {!favoriteSearching && favoriteSearchResults.length > 0 && (
                            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
                              {favoriteSearchResults.map((result) => (
                                <div
                                  key={result.symbol}
                                  className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${
                                    isFavorite(result.symbol) 
                                      ? "opacity-50 cursor-not-allowed bg-muted" 
                                      : "hover:bg-accent/50"
                                  }`}
                                  onClick={() => {
                                    if (!isFavorite(result.symbol)) {
                                      addFavorite(result).then(() => {
                                        setAddFavoriteDialogOpen(false)
                                        setFavoriteSearchQuery("")
                                        setFavoriteSearchResults([])
                                      }).catch(() => {
                                        // Error wordt al getoond door addFavorite
                                      })
                                    } else {
                                      toast.info("Dit aandeel staat al in je favorieten")
                                    }
                                  }}
                                >
                                  <div className="flex-1">
                                    <div className="font-semibold text-foreground">
                                      {result.symbol}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {result.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      <Badge variant="outline" className="mr-1">{result.exchange}</Badge> • {result.type}
                                    </div>
                                  </div>
                                  <Button size="sm" variant="ghost">
                                    <Star className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          {!favoriteSearching && favoriteSearchQuery.length >= 2 && favoriteSearchResults.length === 0 && (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                              Geen resultaten gevonden
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {favorites.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nog geen favorieten</p>
                      <p className="text-sm mt-2">Klik op &quot;Toevoegen&quot; om een favoriet toe te voegen</p>
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
                                onClick={() => selectStock(favorite.symbol)}
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
                                      {formatPrice(quote.price)}
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
                              <div className="flex gap-1">
                                {isLoaded && user?.id && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startDeepResearch(favorite.symbol, favorite.name, favorite.exchange || "", favorite.type || "STOCK")}
                                    disabled={generatingDeepResearch}
                                    title="Genereer Deep Research rapport"
                                    className="h-8 w-8 p-0"
                                  >
                                    {generatingDeepResearch ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <FileText className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFavorite(favorite.symbol)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
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
                    {isMounted && isLoaded ? "Log in om favorieten op te slaan" : "Je opgeslagen aandelen en ETF's"}
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
                  <div className="space-y-2">
                    {user?.id && user?.emailAddresses?.[0]?.emailAddress && !isFavorite(selectedStock) && quote && (
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
                    {isLoaded && user?.id && quote && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => startDeepResearch()}
                        disabled={generatingDeepResearch}
                      >
                        {generatingDeepResearch ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Genereren...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Deep Research Rapport
                          </>
                        )}
                      </Button>
                    )}
                  </div>
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
                      {user?.id && user?.emailAddresses?.[0]?.emailAddress && (
                        <>
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startDeepResearch()}
                            disabled={generatingDeepResearch}
                            title="Genereer Deep Research rapport"
                          >
                            {generatingDeepResearch ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                          </Button>
                        </>
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
                        {formatPrice(quote.price)}
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
                        {formatPrice(quote.open)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Hoog</div>
                      <div className="text-lg font-semibold text-foreground">
                        {formatPrice(quote.high)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Laag</div>
                      <div className="text-lg font-semibold text-foreground">
                        {formatPrice(quote.low)}
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
                        {formatPrice(quote.previousClose)}
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
            <Card id="chart-section" className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Koersontwikkeling</CardTitle>
                  <div className="flex items-center gap-4">
                    {/* Toggles voor grafiek types */}
                    <div className="flex items-center gap-2">
                      <Label htmlFor="candlestick-toggle" className="text-sm text-muted-foreground cursor-pointer">
                        Candlestick
                      </Label>
                      <Switch
                        id="candlestick-toggle"
                        checked={showCandlestick}
                        onCheckedChange={setShowCandlestick}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="line-toggle" className="text-sm text-muted-foreground cursor-pointer">
                        Lijn
                      </Label>
                      <Switch
                        id="line-toggle"
                        checked={showLine}
                        onCheckedChange={setShowLine}
                      />
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Patronen
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Technische Patronen</DialogTitle>
                          <DialogDescription>
                            Selecteer welke patronen je wilt weergeven in de grafiek
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={showPatterns}
                              onCheckedChange={setShowPatterns}
                            />
                            <Label>Patronen weergeven</Label>
                          </div>
                          {showPatterns && (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {detectedPatterns.length > 0 ? (
                                <>
                                  <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-semibold">
                                      Gedetecteerde patronen: {detectedPatterns.length}
                                    </Label>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const top3Count = Math.min(3, detectedPatterns.length)
                                          const hiddenIds = new Set<number>()
                                          for (let i = top3Count; i < detectedPatterns.length; i++) {
                                            hiddenIds.add(i)
                                          }
                                          setHiddenPatternIds(hiddenIds)
                                        }}
                                      >
                                        Alleen top 3
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setHiddenPatternIds(new Set())}
                                      >
                                        Alles tonen
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    {detectedPatterns.map((pattern, idx) => {
                                      const isTop3 = idx < 3
                                      const isVisible = !hiddenPatternIds.has(idx)
                                      const trend = getPatternTrend(pattern)
                                      const explanation = getPatternExplanation(pattern.type)
                                      
                                      return (
                                        <div 
                                          key={idx} 
                                          className={`flex flex-col gap-2 p-3 rounded border ${
                                            isTop3 ? 'border-primary/50 bg-primary/5' : ''
                                          }`}
                                        >
                                          <div className="flex items-start gap-2">
                                            <Checkbox
                                              checked={isVisible}
                                              onCheckedChange={(checked) => {
                                                const newHidden = new Set(hiddenPatternIds)
                                                if (checked) {
                                                  newHidden.delete(idx)
                                                } else {
                                                  newHidden.add(idx)
                                                }
                                                setHiddenPatternIds(newHidden)
                                              }}
                                            />
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2">
                                                <Label className="text-sm cursor-pointer font-medium">
                                                  {getPatternName(pattern.type)}
                                                </Label>
                                                {isTop3 && (
                                                  <Badge variant="secondary" className="text-xs">
                                                    Top {idx + 1}
                                                  </Badge>
                                                )}
                                                {trend === 'bullish' && (
                                                  <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                                    <TrendingUp className="h-3 w-3 mr-1" />
                                                    Bullish
                                                  </Badge>
                                                )}
                                                {trend === 'bearish' && (
                                                  <Badge variant="outline" className="text-xs text-red-600 border-red-600">
                                                    <TrendingDown className="h-3 w-3 mr-1" />
                                                    Bearish
                                                  </Badge>
                                                )}
                                              </div>
                                              <div className="text-xs text-muted-foreground mt-1">
                                                Betrouwbaarheid: {(pattern.confidence * 100).toFixed(0)}%
                                                {pattern.entry && ` | Entry: ${formatPriceText(pattern.entry)}`}
                                                {pattern.target && ` | Target: ${formatPriceText(pattern.target)}`}
                                              </div>
                                              <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                                                {explanation}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <p>Geen patronen gedetecteerd</p>
                                  <p className="text-xs mt-2">Probeer een andere periode of aandeel</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
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
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-96 w-full" />
                ) : history.length > 0 ? (() => {
                  // Bereken min en max waarden van de koers over de geselecteerde periode
                  // Gebruik high en low voor candlestick bereik
                  const allPrices = history.flatMap(h => [h.high, h.low, h.open, h.close])
                  const minPrice = Math.min(...allPrices)
                  const maxPrice = Math.max(...allPrices)
                  
                  // Voeg 10% marge toe aan beide kanten
                  const priceRange = maxPrice - minPrice
                  const margin = priceRange * 0.1
                  const yAxisMin = Math.max(0, minPrice - margin) // Zorg dat minimum niet negatief wordt
                  const yAxisMax = maxPrice + margin
                  
                  // Genereer trendlijn data voor patronen
                  const generateTrendlineData = (pattern: Pattern) => {
                    if (!pattern.trendlines || pattern.trendlines.length === 0) return []
                    
                    return pattern.trendlines.map(trendline => {
                      const startIdx = Math.max(0, Math.min(trendline.start.x, history.length - 1))
                      const endIdx = Math.max(0, Math.min(trendline.end.x, history.length - 1))
                      
                      // Genereer data punten voor de trendlijn die overeenkomen met de history data structuur
                      const points: StockHistory[] = []
                      const steps = Math.max(1, Math.abs(endIdx - startIdx))
                      
                      for (let i = 0; i <= steps; i++) {
                        const idx = startIdx + Math.round((endIdx - startIdx) * (i / steps))
                        if (idx >= 0 && idx < history.length) {
                          const ratio = i / steps
                          const value = trendline.start.y + (trendline.end.y - trendline.start.y) * ratio
                          // Maak een data punt dat overeenkomt met de history structuur
                          points.push({
                            date: history[idx].date,
                            open: value,
                            high: value,
                            low: value,
                            close: value,
                            volume: 0
                          })
                        }
                      }
                      
                      return points
                    })
                  }
                  
                  // Custom candlestick dot component
                  interface CandlestickDotProps {
                    cx?: number
                    cy?: number
                    payload?: StockHistory
                  }
                  const CandlestickDot = (props: CandlestickDotProps) => {
                    const { cx, cy, payload } = props
                    if (!payload || !cx || !cy) return null
                    
                    const { open, high, low, close } = payload
                    const isUp = close >= open
                    const upColor = "oklch(0.55 0.20 150)" // Groen voor bullish
                    const downColor = "oklch(0.55 0.20 10)" // Rood voor bearish
                    const color = isUp ? upColor : downColor
                    
                    // Bereken Y posities op basis van de y-as schaal
                    // cy is de y positie van close, gebruik dat als referentie
                    const range = yAxisMax - yAxisMin
                    const chartHeight = 400 // Hoogte van de chart (minus margins)
                    const getY = (value: number) => {
                      const ratio = (yAxisMax - value) / range
                      // cy is de close positie, gebruik dat als basis
                      const closeRatio = (yAxisMax - close) / range
                      const offset = (ratio - closeRatio) * chartHeight
                      return cy - offset
                    }
                    
                    const candleWidth = 8
                    const candleX = cx - candleWidth / 2
                    const centerX = cx
                    
                    const highY = getY(high)
                    const lowY = getY(low)
                    const openY = getY(open)
                    const closeY = getY(close)
                    const bodyTop = Math.min(openY, closeY)
                    const bodyHeight = Math.max(Math.abs(closeY - openY), 1)
                    
                    return (
                      <g>
                        {/* Wick (lijn van low naar high) */}
                        <line
                          x1={centerX}
                          y1={highY}
                          x2={centerX}
                          y2={lowY}
                          stroke={color}
                          strokeWidth={1.5}
                        />
                        {/* Body (rechthoek van open naar close) */}
                        <rect
                          x={candleX}
                          y={bodyTop}
                          width={candleWidth}
                          height={bodyHeight}
                          fill={color}
                          stroke={color}
                          strokeWidth={1}
                        />
                      </g>
                    )
                  }
                  
                  return (
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart
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
                        domain={[yAxisMin, yAxisMax]}
                        stroke="oklch(0.60 0 0)"
                        style={{ fontSize: "12px" }}
                        tickFormatter={(value) => {
                          const convertedValue = convertPrice(value)
                          const symbol = selectedCurrency === "EUR" ? "€" : "$"
                          return `${symbol}${convertedValue.toFixed(0)}`
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.22 0.02 240)",
                          border: "1px solid oklch(0.32 0.025 250)",
                          borderRadius: "8px",
                          color: "oklch(0.98 0 0)",
                        }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length > 0) {
                            const data = payload[0].payload
                            return (
                              <div style={{
                                backgroundColor: "oklch(0.22 0.02 240)",
                                border: "1px solid oklch(0.32 0.025 250)",
                                borderRadius: "8px",
                                padding: "8px",
                                color: "oklch(0.98 0 0)",
                              }}>
                                <div style={{ marginBottom: "4px", fontWeight: "bold" }}>
                                  {label ? new Date(label).toLocaleString("nl-NL") : ""}
                                </div>
                                <div style={{ fontSize: "12px" }}>
                                  <div>Open: {formatPrice(data.open)}</div>
                                  <div>High: {formatPrice(data.high)}</div>
                                  <div>Low: {formatPrice(data.low)}</div>
                                  <div>Close: {formatPrice(data.close)}</div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      {/* Candlestick visualisatie */}
                      {showCandlestick && (
                        <Line
                          type="monotone"
                          dataKey="close"
                          stroke="transparent"
                          strokeWidth={0}
                          dot={<CandlestickDot />}
                          activeDot={false}
                        />
                      )}
                      {/* Lijn grafiek */}
                      {showLine && (
                        <Line
                          type="monotone"
                          dataKey="close"
                          stroke="oklch(0.65 0.18 150)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      )}
                      {/* Melding als beide uit staan */}
                      {!showCandlestick && !showLine && (
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          fill="oklch(0.60 0 0)"
                          fontSize="14"
                        >
                          Zet candlestick of lijn aan om de grafiek te zien
                        </text>
                      )}
                      {/* Patroon visualisatie - Trendlijnen */}
                      {showPatterns && detectedPatterns
                        .map((pattern, originalIdx) => {
                          // Skip als patroon verborgen is
                          if (hiddenPatternIds.has(originalIdx)) return null
                          
                          const trend = getPatternTrend(pattern)
                          const patternColor = trend === 'bullish'
                            ? "oklch(0.65 0.18 150)" 
                            : trend === 'bearish'
                            ? "oklch(0.55 0.20 10)"
                            : "oklch(0.65 0.15 250)"

                          const trendlineData = generateTrendlineData(pattern)
                          const isTop3 = originalIdx < 3
                          
                          return (
                            <g key={`pattern-${originalIdx}`}>
                              {/* Trendlijnen - dikkere lijn voor top 3 */}
                              {trendlineData.map((lineData, lineIdx) => (
                                <Line
                                  key={lineIdx}
                                  type="linear"
                                  dataKey="close"
                                  data={lineData}
                                  stroke={patternColor}
                                  strokeWidth={isTop3 ? 3 : 2}
                                  strokeDasharray={isTop3 ? "8 4" : "5 5"}
                                  strokeOpacity={isTop3 ? 0.9 : 0.6}
                                  dot={false}
                                  activeDot={false}
                                  connectNulls={true}
                                  isAnimationActive={false}
                                />
                              ))}
                            </g>
                          )
                        })}
                      
                      {/* Patroon visualisatie - Reference Lines voor horizontale levels */}
                      {showPatterns && detectedPatterns
                        .map((pattern, originalIdx) => {
                          // Skip als patroon verborgen is
                          if (hiddenPatternIds.has(originalIdx)) return null
                          
                          const trend = getPatternTrend(pattern)
                          const patternColor = trend === 'bullish'
                            ? "oklch(0.65 0.18 150)" 
                            : trend === 'bearish'
                            ? "oklch(0.55 0.20 10)"
                            : "oklch(0.65 0.15 250)"
                          
                          const isTop3 = originalIdx < 3
                          const patternName = getPatternName(pattern.type)
                          const trendLabel = trend === 'bullish' ? '↑ Bullish' : trend === 'bearish' ? '↓ Bearish' : '→ Neutraal'

                          return (
                            <g key={`ref-${originalIdx}`}>
                              {/* Neckline - alleen voor top 3 met label */}
                              {pattern.neckline && (
                                <ReferenceLine
                                  y={pattern.neckline}
                                  stroke={patternColor}
                                  strokeWidth={isTop3 ? 2 : 1.5}
                                  strokeDasharray="3 3"
                                  strokeOpacity={isTop3 ? 0.8 : 0.5}
                                  label={isTop3 ? { 
                                    value: `${patternName} - Neckline (${trendLabel})`, 
                                    position: "right", 
                                    fill: patternColor, 
                                    fontSize: 11,
                                    fontWeight: 'bold'
                                  } : undefined}
                                />
                              )}
                              
                              {/* Entry level - alleen voor top 3 */}
                              {pattern.entry && isTop3 && (
                                <ReferenceLine
                                  y={pattern.entry}
                                  stroke="oklch(0.65 0.18 150)"
                                  strokeWidth={1.5}
                                  strokeDasharray="2 2"
                                  strokeOpacity={0.6}
                                  label={{ value: "Entry", position: "right", fill: "oklch(0.65 0.18 150)", fontSize: 10 }}
                                />
                              )}
                              
                              {/* Stop level - alleen voor top 3 */}
                              {pattern.stop && isTop3 && (
                                <ReferenceLine
                                  y={pattern.stop}
                                  stroke="oklch(0.55 0.20 10)"
                                  strokeWidth={1.5}
                                  strokeDasharray="2 2"
                                  strokeOpacity={0.6}
                                  label={{ value: "Stop", position: "right", fill: "oklch(0.55 0.20 10)", fontSize: 10 }}
                                />
                              )}
                              
                              {/* Target level - alleen voor top 3 */}
                              {pattern.target && isTop3 && (
                                <ReferenceLine
                                  y={pattern.target}
                                  stroke="oklch(0.65 0.15 250)"
                                  strokeWidth={1.5}
                                  strokeDasharray="2 2"
                                  strokeOpacity={0.6}
                                  label={{ value: "Target", position: "right", fill: "oklch(0.65 0.15 250)", fontSize: 10 }}
                                />
                              )}
                            </g>
                          )
                        })}
                    </ComposedChart>
                  </ResponsiveContainer>
                  )
                })() : (
                  <div className="h-96 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Geen data beschikbaar</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Technische Analyse */}
            {analysisHistory.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="text-foreground">Technische Analyse</CardTitle>
                  <CardDescription>
                    Uitgebreide analyse en verwachtingen voor {selectedStock}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const sma20 = calculateSMA(analysisHistory, 20)
                    const sma50 = calculateSMA(analysisHistory, 50)
                    const ema12 = calculateEMA(analysisHistory, 12)
                    const rsi = calculateRSI(analysisHistory, 14)
                    const macd = calculateMACD(analysisHistory)
                    const bollinger = calculateBollingerBands(analysisHistory, 20, 2)
                    const atr = calculateATR(analysisHistory, 14)
                    const stochastic = calculateStochastic(analysisHistory, 14, 3)
                    const obv = calculateOBV(analysisHistory)
                    const adx = calculateADX(analysisHistory, 14)
                    const { support, resistance, levels } = getSupportResistance(analysisHistory)
                    const { trend, strength } = getTrendAnalysis(analysisHistory)
                    const volumeAnalysis = analyzeVolume(analysisHistory)
                    const priceAction = analyzePriceAction(analysisHistory)
                    const divergences = detectDivergences(analysisHistory, rsi, macd)
                    
                    const currentPrice = analysisHistory[analysisHistory.length - 1].close
                    const currentRSI = rsi[rsi.length - 1]
                    const currentSMA20 = sma20[sma20.length - 1]
                    const currentSMA50 = sma50[sma50.length - 1]
                    const currentEMA12 = ema12[ema12.length - 1]
                    const currentMACD = macd.macd[macd.macd.length - 1]
                    const currentSignal = macd.signal[macd.signal.length - 1]
                    const currentBBUpper = bollinger.upper[bollinger.upper.length - 1]
                    const currentBBLower = bollinger.lower[bollinger.lower.length - 1]
                    const currentBBMiddle = bollinger.middle[bollinger.middle.length - 1]
                    const currentATR = atr[atr.length - 1]
                    const currentStochK = stochastic.k[stochastic.k.length - 1]
                    const currentStochD = stochastic.d[stochastic.d.length - 1]
                    const currentADX = adx[adx.length - 1]
                    const currentOBV = obv[obv.length - 1]
                    const prevOBV = obv.length > 1 ? obv[obv.length - 2] : currentOBV
                    const obvTrend = currentOBV > prevOBV ? "Stijgend" : currentOBV < prevOBV ? "Dalend" : "Neutraal"
                    
                    // Bereken aanvullende indicatoren voor score berekening
                    const sma200 = calculateSMA(analysisHistory, 200)
                    const ema200 = calculateEMA(analysisHistory, 200)
                    
                    // Genereer uitgebreide analyse (inclusief scores)
                    const analysis = generateTechnicalAnalysis(
                      analysisHistory,
                      sma20,
                      sma50,
                      ema12,
                      rsi,
                      macd,
                      bollinger,
                      atr,
                      support,
                      resistance,
                      levels
                    )
                    
                    // Haal AI analyses op voor alle termijnen (gebruik useEffect buiten render)
                    // Dit wordt gedaan via een aparte useEffect hook
                    
                    // Signalen
                    const signals: string[] = []
                    
                    // RSI signalen
                    if (!isNaN(currentRSI)) {
                      if (currentRSI > 70) {
                        signals.push("RSI overgekocht (>70) - mogelijk overgekocht")
                      } else if (currentRSI < 30) {
                        signals.push("RSI oververkocht (<30) - mogelijk oververkocht")
                      }
                    }
                    
                    // Moving Average signalen
                    if (!isNaN(currentSMA20) && !isNaN(currentPrice)) {
                      if (currentPrice > currentSMA20) {
                        signals.push("Prijs boven SMA(20) - bullish signaal")
                      } else {
                        signals.push("Prijs onder SMA(20) - bearish signaal")
                      }
                    }
                    
                    if (!isNaN(currentSMA20) && !isNaN(currentSMA50)) {
                      if (currentSMA20 > currentSMA50) {
                        signals.push("SMA(20) > SMA(50) - opwaartse trend")
                      } else {
                        signals.push("SMA(20) < SMA(50) - neerwaartse trend")
                      }
                    }
                    
                    // MACD signalen
                    if (!isNaN(currentMACD) && !isNaN(currentSignal)) {
                      if (currentMACD > currentSignal) {
                        signals.push("MACD boven signaallijn - bullish momentum")
                      } else {
                        signals.push("MACD onder signaallijn - bearish momentum")
                      }
                    }
                    
                    // Bollinger Bands signalen
                    if (!isNaN(currentBBUpper) && !isNaN(currentBBLower)) {
                      if (currentPrice > currentBBUpper) {
                        signals.push("Prijs boven Bollinger Band - mogelijk overgekocht")
                      } else if (currentPrice < currentBBLower) {
                        signals.push("Prijs onder Bollinger Band - mogelijk oververkocht")
                      }
                    }
                    
                    return (
                      <div className="space-y-6">
                        {/* Trend Analyse */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-accent/10 rounded-lg border border-border">
                            <div className="text-sm text-muted-foreground mb-1">Trend</div>
                            <div className="text-2xl font-bold text-foreground">{trend}</div>
                            <div className="text-xs text-muted-foreground mt-1">Sterkte: {strength}</div>
                          </div>
                          <div className="p-4 bg-accent/10 rounded-lg border border-border">
                            <div className="text-sm text-muted-foreground mb-1">Support</div>
                            <div className="text-2xl font-bold text-foreground">{formatPrice(support)}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {((currentPrice - support) / support * 100).toFixed(1)}% boven support
                            </div>
                          </div>
                          <div className="p-4 bg-accent/10 rounded-lg border border-border">
                            <div className="text-sm text-muted-foreground mb-1">Resistance</div>
                            <div className="text-2xl font-bold text-foreground">{formatPrice(resistance)}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {((resistance - currentPrice) / currentPrice * 100).toFixed(1)}% boven huidige prijs
                            </div>
                          </div>
                        </div>

                        {/* Indicatoren */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-4 bg-accent/10 rounded-lg border border-border">
                            <div className="text-sm text-muted-foreground mb-1">RSI (14)</div>
                            <div className={`text-2xl font-bold ${
                              !isNaN(currentRSI) 
                                ? currentRSI > 70 
                                  ? "text-red-500" 
                                  : currentRSI < 30 
                                    ? "text-green-500" 
                                    : "text-foreground"
                                : "text-foreground"
                            }`}>
                              {!isNaN(currentRSI) ? currentRSI.toFixed(2) : "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {!isNaN(currentRSI) && currentRSI > 70 
                                ? "Overgekocht" 
                                : !isNaN(currentRSI) && currentRSI < 30 
                                  ? "Oververkocht" 
                                  : "Neutraal"}
                            </div>
                          </div>
                          
                          <div className="p-4 bg-accent/10 rounded-lg border border-border">
                            <div className="text-sm text-muted-foreground mb-1">SMA (20)</div>
                            <div className="text-2xl font-bold text-foreground">
                              {!isNaN(currentSMA20) ? formatPrice(currentSMA20) : "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {!isNaN(currentSMA20) && currentPrice > currentSMA20 
                                ? "Boven prijs" 
                                : !isNaN(currentSMA20) 
                                  ? "Onder prijs" 
                                  : "N/A"}
                            </div>
                          </div>
                          
                          <div className="p-4 bg-accent/10 rounded-lg border border-border">
                            <div className="text-sm text-muted-foreground mb-1">SMA (50)</div>
                            <div className="text-2xl font-bold text-foreground">
                              {!isNaN(currentSMA50) ? formatPrice(currentSMA50) : "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {!isNaN(currentSMA50) && currentPrice > currentSMA50 
                                ? "Boven prijs" 
                                : !isNaN(currentSMA50) 
                                  ? "Onder prijs" 
                                  : "N/A"}
                            </div>
                          </div>
                          
                          <div className="p-4 bg-accent/10 rounded-lg border border-border">
                            <div className="text-sm text-muted-foreground mb-1">EMA (12)</div>
                            <div className="text-2xl font-bold text-foreground">
                              {!isNaN(currentEMA12) ? formatPrice(currentEMA12) : "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {!isNaN(currentEMA12) && currentPrice > currentEMA12 
                                ? "Boven prijs" 
                                : !isNaN(currentEMA12) 
                                  ? "Onder prijs" 
                                  : "N/A"}
                            </div>
                          </div>
                        </div>

                        {/* MACD */}
                        <div className="p-4 bg-accent/10 rounded-lg border border-border">
                          <div className="text-sm text-muted-foreground mb-2">MACD</div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground">MACD</div>
                              <div className="text-lg font-semibold text-foreground">
                                {!isNaN(currentMACD) ? currentMACD.toFixed(4) : "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Signaal</div>
                              <div className="text-lg font-semibold text-foreground">
                                {!isNaN(currentSignal) ? currentSignal.toFixed(4) : "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Histogram</div>
                              <div className={`text-lg font-semibold ${
                                !isNaN(currentMACD) && !isNaN(currentSignal)
                                  ? currentMACD > currentSignal
                                    ? "text-green-500"
                                    : "text-red-500"
                                  : "text-foreground"
                              }`}>
                                {!isNaN(currentMACD) && !isNaN(currentSignal)
                                  ? (currentMACD - currentSignal).toFixed(4)
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Geavanceerde Indicatoren */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="p-4 bg-accent/10 rounded-lg border border-border">
                            <div className="text-sm text-muted-foreground mb-2">Bollinger Bands</div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Bovenste Band</span>
                                <span className="text-sm font-semibold">
                                  {!isNaN(currentBBUpper) ? formatPrice(currentBBUpper) : "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Midden (SMA20)</span>
                                <span className="text-sm font-semibold">
                                  {!isNaN(currentBBMiddle) ? formatPrice(currentBBMiddle) : "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Onderste Band</span>
                                <span className="text-sm font-semibold">
                                  {!isNaN(currentBBLower) ? formatPrice(currentBBLower) : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-accent/10 rounded-lg border border-border">
                            <div className="text-sm text-muted-foreground mb-2">Stochastic Oscillator</div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">%K (14)</span>
                                <span className={`text-sm font-semibold ${
                                  !isNaN(currentStochK)
                                    ? currentStochK > 80
                                      ? "text-red-500"
                                      : currentStochK < 20
                                        ? "text-green-500"
                                        : "text-foreground"
                                    : "text-foreground"
                                }`}>
                                  {!isNaN(currentStochK) ? currentStochK.toFixed(2) : "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">%D (3)</span>
                                <span className="text-sm font-semibold">
                                  {!isNaN(currentStochD) ? currentStochD.toFixed(2) : "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Status</span>
                                <span className="text-sm font-semibold">
                                  {!isNaN(currentStochK) && currentStochK > 80
                                    ? "Overgekocht"
                                    : !isNaN(currentStochK) && currentStochK < 20
                                      ? "Oververkocht"
                                      : "Neutraal"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-accent/10 rounded-lg border border-border">
                            <div className="text-sm text-muted-foreground mb-2">Trend Sterkte</div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">ADX (14)</span>
                                <span className={`text-sm font-semibold ${
                                  !isNaN(currentADX)
                                    ? currentADX > 25
                                      ? "text-green-500"
                                      : currentADX < 20
                                        ? "text-yellow-500"
                                        : "text-foreground"
                                    : "text-foreground"
                                }`}>
                                  {!isNaN(currentADX) ? currentADX.toFixed(2) : "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Trend Sterkte</span>
                                <span className="text-sm font-semibold">
                                  {!isNaN(currentADX)
                                    ? currentADX > 25
                                      ? "Sterk"
                                      : currentADX < 20
                                        ? "Zwak"
                                        : "Matig"
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Prijs Actie</span>
                                <span className="text-sm font-semibold">{priceAction.trendStrength}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-accent/10 rounded-lg border border-border">
                            <div className="text-sm text-muted-foreground mb-2">Volume Analyse</div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">OBV Trend</span>
                                <span className={`text-sm font-semibold ${
                                  obvTrend === "Stijgend" ? "text-green-500" : obvTrend === "Dalend" ? "text-red-500" : "text-foreground"
                                }`}>
                                  {obvTrend}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Volume Trend</span>
                                <span className="text-sm font-semibold">{volumeAnalysis.trend}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Volatiliteit</span>
                                <span className="text-sm font-semibold">{priceAction.volatility}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-accent/10 rounded-lg border border-border">
                            <div className="text-sm text-muted-foreground mb-2">Volatiliteit</div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">ATR (14)</span>
                                <span className="text-sm font-semibold">
                                  {!isNaN(currentATR) ? currentATR.toFixed(2) : "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Momentum</span>
                                <span className="text-sm font-semibold">{priceAction.momentum}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Prijsverandering</span>
                                <span className={`text-sm font-semibold ${
                                  priceAction.priceChange > 0 ? "text-green-500" : priceAction.priceChange < 0 ? "text-red-500" : "text-foreground"
                                }`}>
                                  {priceAction.priceChange > 0 ? "+" : ""}{priceAction.priceChange.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {levels.length > 0 && (
                            <div className="p-4 bg-accent/10 rounded-lg border border-border">
                              <div className="text-sm text-muted-foreground mb-2">Belangrijke Niveaus</div>
                              <div className="space-y-1">
                                {levels.slice(-3).map((level, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span className="text-xs text-muted-foreground">
                                      {level < currentPrice ? "Support" : "Resistance"}
                                    </span>
                                    <span className="text-sm font-semibold">
                                      {formatPrice(level)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Divergenties */}
                        {(divergences.rsiDivergence !== "Geen divergentie" || 
                          divergences.macdDivergence !== "Geen divergentie" || 
                          divergences.volumeDivergence !== "Geen divergentie") && (
                          <div className="p-4 bg-accent/10 rounded-lg border border-border">
                            <div className="text-sm font-semibold text-foreground mb-2">Divergenties</div>
                            <div className="space-y-2">
                              {divergences.rsiDivergence !== "Geen divergentie" && (
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-semibold">RSI: </span>
                                  {divergences.rsiDivergence}
                                </div>
                              )}
                              {divergences.macdDivergence !== "Geen divergentie" && (
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-semibold">MACD: </span>
                                  {divergences.macdDivergence}
                                </div>
                              )}
                              {divergences.volumeDivergence !== "Geen divergentie" && (
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-semibold">Volume: </span>
                                  {divergences.volumeDivergence}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Signalen */}
                        {signals.length > 0 && (
                          <div className="p-4 bg-accent/10 rounded-lg border border-border">
                            <div className="text-sm font-semibold text-foreground mb-2">Trading Signalen</div>
                            <ul className="space-y-1">
                              {signals.map((signal, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  {signal}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Overall Ondersteuning */}
                        {(() => {
                          // Bereken overall score op basis van AI-scores als beschikbaar
                          const veryShortTermScore = (aiAnalyses[`${selectedStock}-veryShortTerm`]?.aiEnhanced && aiAnalyses[`${selectedStock}-veryShortTerm`]?.score !== undefined)
                            ? aiAnalyses[`${selectedStock}-veryShortTerm`].score!
                            : analysis.veryShortTermScore
                          const shortTermScore = (aiAnalyses[`${selectedStock}-shortTerm`]?.aiEnhanced && aiAnalyses[`${selectedStock}-shortTerm`]?.score !== undefined)
                            ? aiAnalyses[`${selectedStock}-shortTerm`].score!
                            : analysis.shortTermScore
                          const mediumTermScore = (aiAnalyses[`${selectedStock}-mediumTerm`]?.aiEnhanced && aiAnalyses[`${selectedStock}-mediumTerm`]?.score !== undefined)
                            ? aiAnalyses[`${selectedStock}-mediumTerm`].score!
                            : analysis.mediumTermScore
                          const longTermScore = (aiAnalyses[`${selectedStock}-longTerm`]?.aiEnhanced && aiAnalyses[`${selectedStock}-longTerm`]?.score !== undefined)
                            ? aiAnalyses[`${selectedStock}-longTerm`].score!
                            : analysis.longTermScore
                          const veryLongTermScore = (aiAnalyses[`${selectedStock}-veryLongTerm`]?.aiEnhanced && aiAnalyses[`${selectedStock}-veryLongTerm`]?.score !== undefined)
                            ? aiAnalyses[`${selectedStock}-veryLongTerm`].score!
                            : analysis.veryLongTermScore
                          
                          // Bereken overall score: gewogen gemiddelde (meer gewicht op korte termijn)
                          const calculatedOverallScore = (
                            veryShortTermScore * 0.15 +
                            shortTermScore * 0.25 +
                            mediumTermScore * 0.25 +
                            longTermScore * 0.20 +
                            veryLongTermScore * 0.15
                          )
                          const displayOverallScore = Math.round(calculatedOverallScore * 10) / 10
                          
                          const overallAdvice = getAdvice(displayOverallScore)
                          const AdviceIcon = overallAdvice.icon
                          return (
                            <div className="p-6 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg border-2 border-border">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className={`p-3 rounded-full bg-background/50 ${overallAdvice.color.replace('text-', 'bg-').replace('-500', '-500/20')}`}>
                                    <AdviceIcon className={`h-6 w-6 ${overallAdvice.color}`} />
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">Overall Ondersteuning</div>
                                    <div className={`text-2xl font-bold ${overallAdvice.color}`}>
                                      {overallAdvice.text}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-muted-foreground">Score</div>
                                  <div className={`text-3xl font-bold ${overallAdvice.color}`}>
                                    {displayOverallScore.toFixed(1)}/10
                                  </div>
                                </div>
                              </div>
                              <div className="w-full bg-background/50 rounded-full h-2.5 mb-2">
                                <div 
                                  className={`h-2.5 rounded-full transition-all ${
                                    displayOverallScore >= 7 ? 'bg-green-500' :
                                    displayOverallScore >= 4 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${(displayOverallScore / 10) * 100}%` }}
                                />
                              </div>
                            </div>
                          )
                        })()}

                        {/* Uitgebreide Termijn Analyse */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-lg font-semibold text-foreground">Koersverwachtingen per Termijn</div>
                            <div className="flex items-center gap-2">
                              {Object.values(aiAnalyses).some(a => a.aiEnhanced) && (
                                <Badge variant="secondary" className="text-xs">
                                  <Activity className="h-3 w-3 mr-1" />
                                  AI-Versterkt
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={startAIAnalysis}
                                disabled={loading || analysisHistory.length < 50 || isAnalyzing}
                                className="gap-2"
                              >
                                {isAnalyzing ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    AI Analyse bezig...
                                  </>
                                ) : (
                                  <>
                                    <Activity className="h-4 w-4" />
                                    Start AI Analyse
                                  </>
                                )}
                              </Button>
                              {isLoaded && user?.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startDeepResearch()}
                                  disabled={generatingDeepResearch || !quote}
                                  className="gap-2"
                                >
                                  {generatingDeepResearch ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Genereren...
                                    </>
                                  ) : (
                                    <>
                                      <FileText className="h-4 w-4" />
                                      Deep Research
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            {(() => {
                              const termKey = `${selectedStock}-veryShortTerm`
                              const aiData = aiAnalyses[termKey]
                              // Gebruik AI analyse alleen als deze beschikbaar is EN niet aan het laden is EN aiEnhanced is true
                              // Anders gebruik de basis analyse
                              const displayAnalysis = (aiData?.aiEnhanced && !aiData?.loading && aiData?.analysis) 
                                ? aiData.analysis 
                                : analysis.veryShortTerm
                              const isAILoading = aiData?.loading || false
                              
                              // Gebruik AI score als beschikbaar, anders basis score
                              const displayScore = (aiData?.aiEnhanced && aiData?.score !== undefined) 
                                ? aiData.score 
                                : analysis.veryShortTermScore
                              const advice = getAdvice(displayScore)
                              const AdviceIcon = advice.icon
                              return (
                                <div key={`veryShortTerm-${aiData?.aiEnhanced ? 'ai' : 'base'}-${aiData?.loading ? 'loading' : 'done'}`} className="p-4 bg-accent/10 rounded-lg border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <AdviceIcon className={`h-5 w-5 ${advice.color}`} />
                                      <div className="text-sm font-semibold text-foreground">Zeer Korte Termijn (Komende dagen tot 1 week)</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm font-bold ${advice.color}`}>
                                        {displayScore.toFixed(1)}/10
                                      </span>
                                      <Badge variant="outline" className={advice.color}>
                                        {advice.text}
                                      </Badge>
                                      {aiData?.aiEnhanced && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Activity className="h-3 w-3 mr-1" />
                                          AI
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {isAILoading ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                      AI analyse wordt gegenereerd...
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <div className="prose prose-sm dark:prose-invert max-w-none
                                        prose-headings:text-foreground prose-headings:font-semibold
                                        prose-h2:text-lg prose-h2:mb-2 prose-h2:mt-4 prose-h2:text-primary
                                        prose-h3:text-base prose-h3:mb-2 prose-h3:mt-3 prose-h3:text-foreground
                                        prose-p:text-sm prose-p:leading-relaxed prose-p:mb-3 prose-p:text-muted-foreground
                                        prose-strong:text-foreground prose-strong:font-semibold
                                        prose-ul:text-sm prose-ul:my-2 prose-ul:space-y-1 prose-ul:list-disc prose-ul:pl-4
                                        prose-ol:text-sm prose-ol:my-2 prose-ol:space-y-1 prose-ol:list-decimal prose-ol:pl-4
                                        prose-li:text-muted-foreground prose-li:leading-relaxed
                                        prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-2
                                        prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono
                                        prose-hr:border-border prose-hr:my-4">
                                        <ReactMarkdown
                                          components={{
                                            h2: ({...props}) => (
                                              <h2 className="text-lg font-semibold mb-2 mt-4 text-primary" {...props} />
                                            ),
                                            h3: ({...props}) => (
                                              <h3 className="text-base font-semibold mb-2 mt-3 text-foreground" {...props} />
                                            ),
                                            p: ({...props}) => (
                                              <p className="text-sm leading-relaxed mb-3 text-muted-foreground" {...props} />
                                            ),
                                            ul: ({...props}) => (
                                              <ul className="text-sm my-2 space-y-1 list-disc pl-4" {...props} />
                                            ),
                                            ol: ({...props}) => (
                                              <ol className="text-sm my-2 space-y-1 list-decimal pl-4" {...props} />
                                            ),
                                            li: ({...props}) => (
                                              <li className="text-muted-foreground leading-relaxed" {...props} />
                                            ),
                                            blockquote: ({...props}) => (
                                              <blockquote className="border-l-2 border-primary pl-3 italic text-muted-foreground my-2" {...props} />
                                            ),
                                            code: ({...props}: React.HTMLAttributes<HTMLElement>) => {
                                              const isInline = !props.className || !props.className.includes('language-');
                                              return isInline ? (
                                                <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono" {...props} />
                                              ) : (
                                                <code className="block text-xs bg-muted p-2 rounded overflow-x-auto" {...props} />
                                              );
                                            },
                                            hr: ({...props}) => (
                                              <hr className="border-border my-4" {...props} />
                                            ),
                                          }}
                                        >
                                          {displayAnalysis}
                                        </ReactMarkdown>
                                      </div>
                                      {aiData?.scoreExplanation && (
                                        <div className="mt-3 p-3 bg-accent/20 rounded-lg border-l-2 border-primary">
                                          <div className="text-xs font-semibold text-foreground mb-1">Score Toelichting ({displayScore.toFixed(1)}/10):</div>
                                          <div className="prose prose-xs dark:prose-invert max-w-none prose-p:text-xs prose-p:text-muted-foreground prose-p:leading-relaxed">
                                            <ReactMarkdown>{aiData.scoreExplanation}</ReactMarkdown>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                            
                            {(() => {
                              const termKey = `${selectedStock}-shortTerm`
                              const aiData = aiAnalyses[termKey]
                              // Gebruik AI analyse alleen als deze beschikbaar is EN niet aan het laden is EN aiEnhanced is true
                              const displayAnalysis = (aiData?.aiEnhanced && !aiData?.loading && aiData?.analysis) 
                                ? aiData.analysis 
                                : analysis.shortTerm
                              const isAILoading = aiData?.loading || false
                              
                              // Gebruik AI score als beschikbaar, anders basis score
                              const displayScore = (aiData?.aiEnhanced && aiData?.score !== undefined) 
                                ? aiData.score 
                                : analysis.shortTermScore
                              const advice = getAdvice(displayScore)
                              const AdviceIcon = advice.icon
                              return (
                                <div className="p-4 bg-accent/10 rounded-lg border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <AdviceIcon className={`h-5 w-5 ${advice.color}`} />
                                      <div className="text-sm font-semibold text-foreground">Korte Termijn (1 week tot 1 maand)</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm font-bold ${advice.color}`}>
                                        {displayScore.toFixed(1)}/10
                                      </span>
                                      <Badge variant="outline" className={advice.color}>
                                        {advice.text}
                                      </Badge>
                                      {aiData?.aiEnhanced && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Activity className="h-3 w-3 mr-1" />
                                          AI
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {isAILoading ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                      AI analyse wordt gegenereerd...
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <div className="prose prose-sm dark:prose-invert max-w-none
                                        prose-headings:text-foreground prose-headings:font-semibold
                                        prose-h2:text-lg prose-h2:mb-2 prose-h2:mt-4 prose-h2:text-primary
                                        prose-h3:text-base prose-h3:mb-2 prose-h3:mt-3 prose-h3:text-foreground
                                        prose-p:text-sm prose-p:leading-relaxed prose-p:mb-3 prose-p:text-muted-foreground
                                        prose-strong:text-foreground prose-strong:font-semibold
                                        prose-ul:text-sm prose-ul:my-2 prose-ul:space-y-1 prose-ul:list-disc prose-ul:pl-4
                                        prose-ol:text-sm prose-ol:my-2 prose-ol:space-y-1 prose-ol:list-decimal prose-ol:pl-4
                                        prose-li:text-muted-foreground prose-li:leading-relaxed
                                        prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-2
                                        prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono
                                        prose-hr:border-border prose-hr:my-4">
                                        <ReactMarkdown
                                          components={{
                                            h2: ({...props}) => (
                                              <h2 className="text-lg font-semibold mb-2 mt-4 text-primary" {...props} />
                                            ),
                                            h3: ({...props}) => (
                                              <h3 className="text-base font-semibold mb-2 mt-3 text-foreground" {...props} />
                                            ),
                                            p: ({...props}) => (
                                              <p className="text-sm leading-relaxed mb-3 text-muted-foreground" {...props} />
                                            ),
                                            ul: ({...props}) => (
                                              <ul className="text-sm my-2 space-y-1 list-disc pl-4" {...props} />
                                            ),
                                            ol: ({...props}) => (
                                              <ol className="text-sm my-2 space-y-1 list-decimal pl-4" {...props} />
                                            ),
                                            li: ({...props}) => (
                                              <li className="text-muted-foreground leading-relaxed" {...props} />
                                            ),
                                            blockquote: ({...props}) => (
                                              <blockquote className="border-l-2 border-primary pl-3 italic text-muted-foreground my-2" {...props} />
                                            ),
                                            code: ({...props}: React.HTMLAttributes<HTMLElement>) => {
                                              const isInline = !props.className || !props.className.includes('language-');
                                              return isInline ? (
                                                <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono" {...props} />
                                              ) : (
                                                <code className="block text-xs bg-muted p-2 rounded overflow-x-auto" {...props} />
                                              );
                                            },
                                            hr: ({...props}) => (
                                              <hr className="border-border my-4" {...props} />
                                            ),
                                          }}
                                        >
                                          {displayAnalysis}
                                        </ReactMarkdown>
                                      </div>
                                      {aiData?.scoreExplanation && (
                                        <div className="mt-3 p-3 bg-accent/20 rounded-lg border-l-2 border-primary">
                                          <div className="text-xs font-semibold text-foreground mb-1">Score Toelichting ({displayScore.toFixed(1)}/10):</div>
                                          <div className="prose prose-xs dark:prose-invert max-w-none prose-p:text-xs prose-p:text-muted-foreground prose-p:leading-relaxed">
                                            <ReactMarkdown>{aiData.scoreExplanation}</ReactMarkdown>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                            
                            {(() => {
                              const termKey = `${selectedStock}-mediumTerm`
                              const aiData = aiAnalyses[termKey]
                              // Gebruik AI analyse alleen als deze beschikbaar is EN niet aan het laden is EN aiEnhanced is true
                              const displayAnalysis = (aiData?.aiEnhanced && !aiData?.loading && aiData?.analysis) 
                                ? aiData.analysis 
                                : analysis.mediumTerm
                              const isAILoading = aiData?.loading || false
                              
                              // Gebruik AI score als beschikbaar, anders basis score
                              const displayScore = (aiData?.aiEnhanced && aiData?.score !== undefined) 
                                ? aiData.score 
                                : analysis.mediumTermScore
                              const advice = getAdvice(displayScore)
                              const AdviceIcon = advice.icon
                              return (
                                <div className="p-4 bg-accent/10 rounded-lg border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <AdviceIcon className={`h-5 w-5 ${advice.color}`} />
                                      <div className="text-sm font-semibold text-foreground">Midden Lange Termijn (Tot 3 maanden)</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm font-bold ${advice.color}`}>
                                        {displayScore.toFixed(1)}/10
                                      </span>
                                      <Badge variant="outline" className={advice.color}>
                                        {advice.text}
                                      </Badge>
                                      {aiData?.aiEnhanced && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Activity className="h-3 w-3 mr-1" />
                                          AI
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {isAILoading ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                      AI analyse wordt gegenereerd...
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <div className="prose prose-sm dark:prose-invert max-w-none
                                        prose-headings:text-foreground prose-headings:font-semibold
                                        prose-h2:text-lg prose-h2:mb-2 prose-h2:mt-4 prose-h2:text-primary
                                        prose-h3:text-base prose-h3:mb-2 prose-h3:mt-3 prose-h3:text-foreground
                                        prose-p:text-sm prose-p:leading-relaxed prose-p:mb-3 prose-p:text-muted-foreground
                                        prose-strong:text-foreground prose-strong:font-semibold
                                        prose-ul:text-sm prose-ul:my-2 prose-ul:space-y-1 prose-ul:list-disc prose-ul:pl-4
                                        prose-ol:text-sm prose-ol:my-2 prose-ol:space-y-1 prose-ol:list-decimal prose-ol:pl-4
                                        prose-li:text-muted-foreground prose-li:leading-relaxed
                                        prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-2
                                        prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono
                                        prose-hr:border-border prose-hr:my-4">
                                        <ReactMarkdown
                                          components={{
                                            h2: ({...props}) => (
                                              <h2 className="text-lg font-semibold mb-2 mt-4 text-primary" {...props} />
                                            ),
                                            h3: ({...props}) => (
                                              <h3 className="text-base font-semibold mb-2 mt-3 text-foreground" {...props} />
                                            ),
                                            p: ({...props}) => (
                                              <p className="text-sm leading-relaxed mb-3 text-muted-foreground" {...props} />
                                            ),
                                            ul: ({...props}) => (
                                              <ul className="text-sm my-2 space-y-1 list-disc pl-4" {...props} />
                                            ),
                                            ol: ({...props}) => (
                                              <ol className="text-sm my-2 space-y-1 list-decimal pl-4" {...props} />
                                            ),
                                            li: ({...props}) => (
                                              <li className="text-muted-foreground leading-relaxed" {...props} />
                                            ),
                                            blockquote: ({...props}) => (
                                              <blockquote className="border-l-2 border-primary pl-3 italic text-muted-foreground my-2" {...props} />
                                            ),
                                            code: ({...props}: React.HTMLAttributes<HTMLElement>) => {
                                              const isInline = !props.className || !props.className.includes('language-');
                                              return isInline ? (
                                                <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono" {...props} />
                                              ) : (
                                                <code className="block text-xs bg-muted p-2 rounded overflow-x-auto" {...props} />
                                              );
                                            },
                                            hr: ({...props}) => (
                                              <hr className="border-border my-4" {...props} />
                                            ),
                                          }}
                                        >
                                          {displayAnalysis}
                                        </ReactMarkdown>
                                      </div>
                                      {aiData?.scoreExplanation && (
                                        <div className="mt-3 p-3 bg-accent/20 rounded-lg border-l-2 border-primary">
                                          <div className="text-xs font-semibold text-foreground mb-1">Score Toelichting ({displayScore.toFixed(1)}/10):</div>
                                          <div className="prose prose-xs dark:prose-invert max-w-none prose-p:text-xs prose-p:text-muted-foreground prose-p:leading-relaxed">
                                            <ReactMarkdown>{aiData.scoreExplanation}</ReactMarkdown>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                            
                            {(() => {
                              const termKey = `${selectedStock}-longTerm`
                              const aiData = aiAnalyses[termKey]
                              // Gebruik AI analyse alleen als deze beschikbaar is EN niet aan het laden is EN aiEnhanced is true
                              const displayAnalysis = (aiData?.aiEnhanced && !aiData?.loading && aiData?.analysis) 
                                ? aiData.analysis 
                                : analysis.longTerm
                              const isAILoading = aiData?.loading || false
                              
                              // Gebruik AI score als beschikbaar, anders basis score
                              const displayScore = (aiData?.aiEnhanced && aiData?.score !== undefined) 
                                ? aiData.score 
                                : analysis.longTermScore
                              const advice = getAdvice(displayScore)
                              const AdviceIcon = advice.icon
                              return (
                                <div className="p-4 bg-accent/10 rounded-lg border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <AdviceIcon className={`h-5 w-5 ${advice.color}`} />
                                      <div className="text-sm font-semibold text-foreground">Lange Termijn (3-6 maanden)</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm font-bold ${advice.color}`}>
                                        {displayScore.toFixed(1)}/10
                                      </span>
                                      <Badge variant="outline" className={advice.color}>
                                        {advice.text}
                                      </Badge>
                                      {aiData?.aiEnhanced && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Activity className="h-3 w-3 mr-1" />
                                          AI
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {isAILoading ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                      AI analyse wordt gegenereerd...
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <div className="prose prose-sm dark:prose-invert max-w-none
                                        prose-headings:text-foreground prose-headings:font-semibold
                                        prose-h2:text-lg prose-h2:mb-2 prose-h2:mt-4 prose-h2:text-primary
                                        prose-h3:text-base prose-h3:mb-2 prose-h3:mt-3 prose-h3:text-foreground
                                        prose-p:text-sm prose-p:leading-relaxed prose-p:mb-3 prose-p:text-muted-foreground
                                        prose-strong:text-foreground prose-strong:font-semibold
                                        prose-ul:text-sm prose-ul:my-2 prose-ul:space-y-1 prose-ul:list-disc prose-ul:pl-4
                                        prose-ol:text-sm prose-ol:my-2 prose-ol:space-y-1 prose-ol:list-decimal prose-ol:pl-4
                                        prose-li:text-muted-foreground prose-li:leading-relaxed
                                        prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-2
                                        prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono
                                        prose-hr:border-border prose-hr:my-4">
                                        <ReactMarkdown
                                          components={{
                                            h2: ({...props}) => (
                                              <h2 className="text-lg font-semibold mb-2 mt-4 text-primary" {...props} />
                                            ),
                                            h3: ({...props}) => (
                                              <h3 className="text-base font-semibold mb-2 mt-3 text-foreground" {...props} />
                                            ),
                                            p: ({...props}) => (
                                              <p className="text-sm leading-relaxed mb-3 text-muted-foreground" {...props} />
                                            ),
                                            ul: ({...props}) => (
                                              <ul className="text-sm my-2 space-y-1 list-disc pl-4" {...props} />
                                            ),
                                            ol: ({...props}) => (
                                              <ol className="text-sm my-2 space-y-1 list-decimal pl-4" {...props} />
                                            ),
                                            li: ({...props}) => (
                                              <li className="text-muted-foreground leading-relaxed" {...props} />
                                            ),
                                            blockquote: ({...props}) => (
                                              <blockquote className="border-l-2 border-primary pl-3 italic text-muted-foreground my-2" {...props} />
                                            ),
                                            code: ({...props}: React.HTMLAttributes<HTMLElement>) => {
                                              const isInline = !props.className || !props.className.includes('language-');
                                              return isInline ? (
                                                <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono" {...props} />
                                              ) : (
                                                <code className="block text-xs bg-muted p-2 rounded overflow-x-auto" {...props} />
                                              );
                                            },
                                            hr: ({...props}) => (
                                              <hr className="border-border my-4" {...props} />
                                            ),
                                          }}
                                        >
                                          {displayAnalysis}
                                        </ReactMarkdown>
                                      </div>
                                      {aiData?.scoreExplanation && (
                                        <div className="mt-3 p-3 bg-accent/20 rounded-lg border-l-2 border-primary">
                                          <div className="text-xs font-semibold text-foreground mb-1">Score Toelichting ({displayScore.toFixed(1)}/10):</div>
                                          <div className="prose prose-xs dark:prose-invert max-w-none prose-p:text-xs prose-p:text-muted-foreground prose-p:leading-relaxed">
                                            <ReactMarkdown>{aiData.scoreExplanation}</ReactMarkdown>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                            
                            {(() => {
                              const termKey = `${selectedStock}-veryLongTerm`
                              const aiData = aiAnalyses[termKey]
                              // Gebruik AI analyse alleen als deze beschikbaar is EN niet aan het laden is EN aiEnhanced is true
                              const displayAnalysis = (aiData?.aiEnhanced && !aiData?.loading && aiData?.analysis) 
                                ? aiData.analysis 
                                : analysis.veryLongTerm
                              const isAILoading = aiData?.loading || false
                              
                              // Gebruik AI score als beschikbaar, anders basis score
                              const displayScore = (aiData?.aiEnhanced && aiData?.score !== undefined) 
                                ? aiData.score 
                                : analysis.veryLongTermScore
                              const advice = getAdvice(displayScore)
                              const AdviceIcon = advice.icon
                              return (
                                <div className="p-4 bg-accent/10 rounded-lg border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <AdviceIcon className={`h-5 w-5 ${advice.color}`} />
                                      <div className="text-sm font-semibold text-foreground">Zeer Lange Termijn (Verder dan 6 maanden)</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm font-bold ${advice.color}`}>
                                        {displayScore.toFixed(1)}/10
                                      </span>
                                      <Badge variant="outline" className={advice.color}>
                                        {advice.text}
                                      </Badge>
                                      {aiData?.aiEnhanced && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Activity className="h-3 w-3 mr-1" />
                                          AI
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {isAILoading ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                      AI analyse wordt gegenereerd...
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <div className="prose prose-sm dark:prose-invert max-w-none
                                        prose-headings:text-foreground prose-headings:font-semibold
                                        prose-h2:text-lg prose-h2:mb-2 prose-h2:mt-4 prose-h2:text-primary
                                        prose-h3:text-base prose-h3:mb-2 prose-h3:mt-3 prose-h3:text-foreground
                                        prose-p:text-sm prose-p:leading-relaxed prose-p:mb-3 prose-p:text-muted-foreground
                                        prose-strong:text-foreground prose-strong:font-semibold
                                        prose-ul:text-sm prose-ul:my-2 prose-ul:space-y-1 prose-ul:list-disc prose-ul:pl-4
                                        prose-ol:text-sm prose-ol:my-2 prose-ol:space-y-1 prose-ol:list-decimal prose-ol:pl-4
                                        prose-li:text-muted-foreground prose-li:leading-relaxed
                                        prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-2
                                        prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono
                                        prose-hr:border-border prose-hr:my-4">
                                        <ReactMarkdown
                                          components={{
                                            h2: ({...props}) => (
                                              <h2 className="text-lg font-semibold mb-2 mt-4 text-primary" {...props} />
                                            ),
                                            h3: ({...props}) => (
                                              <h3 className="text-base font-semibold mb-2 mt-3 text-foreground" {...props} />
                                            ),
                                            p: ({...props}) => (
                                              <p className="text-sm leading-relaxed mb-3 text-muted-foreground" {...props} />
                                            ),
                                            ul: ({...props}) => (
                                              <ul className="text-sm my-2 space-y-1 list-disc pl-4" {...props} />
                                            ),
                                            ol: ({...props}) => (
                                              <ol className="text-sm my-2 space-y-1 list-decimal pl-4" {...props} />
                                            ),
                                            li: ({...props}) => (
                                              <li className="text-muted-foreground leading-relaxed" {...props} />
                                            ),
                                            blockquote: ({...props}) => (
                                              <blockquote className="border-l-2 border-primary pl-3 italic text-muted-foreground my-2" {...props} />
                                            ),
                                            code: ({...props}: React.HTMLAttributes<HTMLElement>) => {
                                              const isInline = !props.className || !props.className.includes('language-');
                                              return isInline ? (
                                                <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono" {...props} />
                                              ) : (
                                                <code className="block text-xs bg-muted p-2 rounded overflow-x-auto" {...props} />
                                              );
                                            },
                                            hr: ({...props}) => (
                                              <hr className="border-border my-4" {...props} />
                                            ),
                                          }}
                                        >
                                          {displayAnalysis}
                                        </ReactMarkdown>
                                      </div>
                                      {aiData?.scoreExplanation && (
                                        <div className="mt-3 p-3 bg-accent/20 rounded-lg border-l-2 border-primary">
                                          <div className="text-xs font-semibold text-foreground mb-1">Score Toelichting ({displayScore.toFixed(1)}/10):</div>
                                          <div className="prose prose-xs dark:prose-invert max-w-none prose-p:text-xs prose-p:text-muted-foreground prose-p:leading-relaxed">
                                            <ReactMarkdown>{aiData.scoreExplanation}</ReactMarkdown>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StocksPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Laden...</p>
          </div>
        </div>
      </div>
    }>
      <StocksPageContent />
    </Suspense>
  )
}
