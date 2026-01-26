"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import type { User } from "@clerk/backend"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Search, 
  FileText, 
  Download, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { ClerkErrorBoundary } from "@/components/clerk-error-boundary"

type StockSearchResult = {
  symbol: string
  name: string
  exchange: string
  type: string
  market: string
}

type DeepResearchReport = {
  id: string
  symbol: string
  name: string
  exchange: string | null
  type: string | null
  status: "GENERATING" | "COMPLETED" | "FAILED" | "CANCELLED"
  progressPercentage: number | null
  progressMessage: string | null
  pdfUrl: string | null
  error: string | null
  createdAt: string
  updatedAt: string
}

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
function DeepResearchPageWithAuth() {
  const clerkAvailable = isClerkAvailable()
  const clerkData = useUser()

  // Als Clerk niet beschikbaar is, behandel als niet ingelogd
  if (!clerkAvailable) {
    return <DeepResearchPage user={null} isLoaded={true} />
  }

  return <DeepResearchPage user={clerkData.user || null} isLoaded={clerkData.isLoaded} />
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DeepResearchPage({ user: propUser, isLoaded: propIsLoaded }: { user: any, isLoaded: boolean }) {
  const user = propUser
  const isLoaded = propIsLoaded
  const effectiveUser = user
  const effectiveIsLoaded = isLoaded
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null)
  const [generating, setGenerating] = useState(false)
  const [reports, setReports] = useState<DeepResearchReport[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [pollingReportId, setPollingReportId] = useState<string | null>(null)

  // Haal rapporten op bij mount
  useEffect(() => {
    if (effectiveIsLoaded && effectiveUser) {
      fetchReports()
    }
  }, [effectiveIsLoaded, effectiveUser])

  // Poll voor rapport status als er een rapport wordt gegenereerd
  useEffect(() => {
    if (!pollingReportId) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/stocks/deep-research?reportId=${pollingReportId}`, {
          credentials: "include", // Zorg dat cookies worden meegestuurd
        })
        if (response.ok) {
          const report = await response.json()
          // Update het rapport in de lijst met nieuwe progress info
          setReports(prevReports => 
            prevReports.map(r => r.id === report.id ? report : r)
          )
          if (report.status === "COMPLETED" || report.status === "FAILED" || report.status === "CANCELLED") {
            setPollingReportId(null)
            fetchReports()
            if (report.status === "COMPLETED") {
              toast.success("Rapport succesvol gegenereerd!")
            } else if (report.status === "CANCELLED") {
              toast.info("Rapport generatie geannuleerd")
            } else {
              toast.error("Rapport generatie mislukt")
            }
          }
        }
      } catch (error) {
        console.error("Error polling report:", error)
      }
    }, 2000) // Poll elke 2 seconden voor betere progress updates

    return () => clearInterval(interval)
  }, [pollingReportId])

  const fetchReports = async () => {
    try {
      setLoadingReports(true)
      const response = await fetch("/api/stocks/deep-research", {
        credentials: "include", // Zorg dat cookies worden meegestuurd
      })
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoadingReports(false)
    }
  }

  const handleCancel = async (reportId: string) => {
    if (!confirm("Weet je zeker dat je de generatie wilt annuleren?")) {
      return
    }

    try {
      const response = await fetch(`/api/stocks/deep-research/${reportId}/cancel`, {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        toast.success("Rapport generatie geannuleerd")
        fetchReports()
      } else {
        const data = await response.json()
        toast.error(data.error || "Fout bij annuleren")
      }
    } catch (error) {
      console.error("Error cancelling report:", error)
      toast.error("Fout bij annuleren rapport")
    }
  }

  const handleSearch = async (query: string) => {
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

  const handleGenerateReport = async () => {
    if (!selectedStock) return

    setGenerating(true)
    try {
      const response = await fetch("/api/stocks/deep-research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Zorg dat cookies worden meegestuurd
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          exchange: selectedStock.exchange,
          type: selectedStock.type,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Controleer of er een bestaand rapport is
        if (data.status === "EXISTING" && data.existingReport) {
          const reportDate = new Date(data.createdAt).toLocaleDateString('nl-NL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
          toast.info(`Er bestaat al een recent rapport voor ${selectedStock.name} (${selectedStock.symbol}) van ${reportDate}. Het bestaande rapport wordt getoond.`, {
            duration: 5000,
          })
          // Refresh de rapporten lijst om het bestaande rapport te tonen
          fetchReports()
        } else {
          // Nieuw rapport wordt gegenereerd
          // Voeg het nieuwe rapport direct toe aan de lijst
          const newReport: DeepResearchReport = {
            id: data.reportId,
            symbol: selectedStock.symbol,
            name: selectedStock.name,
            exchange: selectedStock.exchange || null,
            type: selectedStock.type || null,
            status: "GENERATING",
            progressPercentage: 0,
            progressMessage: "Rapport generatie gestart...",
            pdfUrl: null,
            error: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          // Voeg toe aan het begin van de lijst
          setReports(prevReports => [newReport, ...prevReports])
          setPollingReportId(data.reportId)
          
          // Sluit dialog eerst
          setSearchDialogOpen(false)
          setSelectedStock(null)
          setSearchQuery("")
          
          // Haal na een korte delay de volledige lijst op om zeker te zijn dat alles gesynchroniseerd is
          setTimeout(() => {
            fetchReports().then(() => {
              // Scroll naar de rapporten sectie na update
              setTimeout(() => {
                const reportsSection = document.getElementById("reports-section")
                if (reportsSection) {
                  reportsSection.scrollIntoView({ behavior: "smooth", block: "start" })
                } else {
                  // Fallback: scroll naar boven
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
              }, 100)
            })
          }, 500)
          
          toast.success("Rapport wordt gegenereerd... Dit kan enkele minuten duren.")
        }
      } else {
        const error = await response.json()
        toast.error(error.error || "Fout bij genereren rapport")
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast.error("Fout bij genereren rapport")
    } finally {
      setGenerating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-500/20 text-green-600 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Voltooid
          </Badge>
        )
      case "GENERATING":
        return (
          <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Wordt gegenereerd...
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
            <XCircle className="h-3 w-3 mr-1" />
            Geannuleerd
          </Badge>
        )
      case "FAILED":
        return (
          <Badge className="bg-red-500/20 text-red-600 dark:text-red-400">
            <XCircle className="h-3 w-3 mr-1" />
            Mislukt
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
            <XCircle className="h-3 w-3 mr-1" />
            Geannuleerd
          </Badge>
        )
      default:
        return null
    }
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 animate-fade-in">
              <span className="text-gradient-financial">Deep Research</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in delay-200">
              Genereer uitgebreide onderzoeksrapporten voor aandelen en beleggingsproducten met AI
            </p>
          </div>

          {/* Generate New Report Card */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Nieuw Onderzoeksrapport
              </CardTitle>
              <CardDescription>
                Kies een aandeel of ETF om een compleet AI-onderzoeksrapport te genereren
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300 w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Zoek Aandeel of ETF
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Zoek Aandeel of ETF</DialogTitle>
                    <DialogDescription>
                      Zoek naar een aandeel of ETF om een deep research rapport te genereren
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Zoek op naam of symbool (bijv. Apple, AAPL, ASML)..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          handleSearch(e.target.value)
                        }}
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
                            className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent ${
                              selectedStock?.symbol === result.symbol
                                ? "border-primary bg-primary/10"
                                : "border-border"
                            }`}
                            onClick={() => setSelectedStock(result)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold">{result.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {result.symbol} • {result.exchange}
                                </div>
                              </div>
                              <Badge variant="outline">{result.type}</Badge>
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
                    {selectedStock && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-semibold">{selectedStock.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {selectedStock.symbol} • {selectedStock.exchange}
                            </div>
                          </div>
                          <Button
                            onClick={handleGenerateReport}
                            disabled={generating}
                            className="gradient-financial text-white"
                          >
                            {generating ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Genereren...
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4 mr-2" />
                                Genereer Rapport
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div id="reports-section" className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Mijn Rapporten</h2>
            {loadingReports ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <Card className="bg-card/80 backdrop-blur-sm border-border">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nog geen rapporten
                  </h3>
                  <p className="text-muted-foreground">
                    Genereer je eerste deep research rapport door hierboven een aandeel te zoeken
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card
                    key={report.id}
                    className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center mb-2">
                            <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3 shadow-financial">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                            {report.name} ({report.symbol})
                          </CardTitle>
                          <CardDescription className="mb-3">
                            {report.exchange && `${report.exchange} • `}
                            {report.type}
                          </CardDescription>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(report.createdAt).toLocaleDateString('nl-NL')} om{" "}
                              {new Date(report.createdAt).toLocaleTimeString('nl-NL', {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            {getStatusBadge(report.status)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-3">
                        {report.status === "COMPLETED" && report.pdfUrl && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                              asChild
                            >
                              <Link href={`/stocks/deep-research/${report.id}`}>
                                Bekijk Rapport
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300"
                              asChild
                            >
                              <a href={report.pdfUrl} download>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </a>
                            </Button>
                          </>
                        )}
                        {report.status === "GENERATING" && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {report.progressMessage || "Rapport wordt gegenereerd... Dit kan enkele minuten duren."}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancel(report.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                Annuleren
                              </Button>
                            </div>
                            {report.progressPercentage !== null && (
                              <div className="space-y-2">
                                <Progress value={report.progressPercentage} className="h-2" />
                                <div className="text-xs text-muted-foreground text-right">
                                  {report.progressPercentage}%
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {report.status === "CANCELLED" && (
                          <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Rapport generatie geannuleerd
                          </div>
                        )}
                        {report.status === "FAILED" && (
                          <div className="flex items-center text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {report.error || "Generatie mislukt"}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Info Card */}
          <Card className="bg-accent/10 border border-primary/20 p-6 rounded-lg hover:border-primary/40 hover:shadow-financial-lg transition-all duration-500">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              📊 Over Deep Research
            </h2>
            <p className="text-muted-foreground mb-2">
              Onze Deep Research functionaliteit genereert uitgebreide onderzoeksrapporten met behulp van AI. 
              Elk rapport bevat:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Executive Summary met belangrijkste conclusies</li>
              <li>Uitgebreide bedrijfsanalyse</li>
              <li>Financiële analyse en kentallen</li>
              <li>Valuatie analyse</li>
              <li>Technische analyse</li>
              <li>Risico analyse</li>
              <li>Recent nieuws en ontwikkelingen</li>
              <li>Conclusie en samenvatting</li>
            </ul>
            <p className="text-muted-foreground mt-4 text-sm">
              <strong>Let op:</strong> Rapporten worden gegenereerd met behulp van AI en zijn uitsluitend bedoeld 
              voor educatieve doeleinden. Ze vormen geen persoonlijk financieel advies.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DeepResearchPageWrapper() {
  return (
    <ClerkErrorBoundary>
      <DeepResearchPageWithAuth />
    </ClerkErrorBoundary>
  )
}