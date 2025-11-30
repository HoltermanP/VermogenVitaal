"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  ArrowLeft,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Calendar
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  Legend,
  Cell,
} from "recharts"

type DeepResearchReport = {
  id: string
  symbol: string
  name: string
  exchange: string | null
  type: string | null
  status: "GENERATING" | "COMPLETED" | "FAILED"
  pdfUrl: string | null
  error: string | null
  report: {
    content?: string
    quote?: Record<string, unknown>
    fundamentals?: Record<string, unknown>
    history?: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>
    scores?: {
      overallScore: number
      shortTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
      mediumTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
      longTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
    }
    generatedAt?: string
  }
  createdAt: string
  updatedAt: string
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-blue-600"
  if (score >= 40) return "text-yellow-600"
  return "text-red-600"
}

const getScoreBgColor = (score: number) => {
  if (score >= 80) return "bg-green-500"
  if (score >= 60) return "bg-blue-500"
  if (score >= 40) return "bg-yellow-500"
  return "bg-red-500"
}

const getScoreLabel = (score: number) => {
  if (score >= 86) return "Uitstekend"
  if (score >= 76) return "Zeer Goed"
  if (score >= 61) return "Goed"
  if (score >= 41) return "Neutraal"
  return "Risicovol"
}

export default function DeepResearchDetailPage() {
  const { user, isLoaded } = useUser()
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string
  const [report, setReport] = useState<DeepResearchReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    if (isLoaded && user && reportId) {
      fetchReport()
    }
  }, [isLoaded, user, reportId])

  useEffect(() => {
    if (!report || report.status !== "GENERATING") return

    setPolling(true)
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/stocks/deep-research?reportId=${reportId}`)
        if (response.ok) {
          const updatedReport = await response.json()
          setReport(updatedReport)
          if (updatedReport.status === "COMPLETED" || updatedReport.status === "FAILED") {
            setPolling(false)
            clearInterval(interval)
            if (updatedReport.status === "COMPLETED") {
              toast.success("Rapport is voltooid!")
            }
          }
        }
      } catch (error) {
        console.error("Error polling report:", error)
      }
    }, 3000)

    return () => {
      clearInterval(interval)
      setPolling(false)
    }
  }, [report, reportId])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/stocks/deep-research?reportId=${reportId}`)
      if (response.ok) {
        const data = await response.json()
        setReport(data)
      } else {
        toast.error("Rapport niet gevonden")
        router.push("/stocks/deep-research")
      }
    } catch (error) {
      console.error("Error fetching report:", error)
      toast.error("Fout bij ophalen rapport")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Rapport niet gevonden
                </h3>
                <Button asChild className="mt-4">
                  <Link href="/stocks/deep-research">Terug naar Deep Research</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const reportData = report.report as {
    content?: string
    quote?: Record<string, unknown>
    fundamentals?: Record<string, unknown>
    history?: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>
    scores?: {
      overallScore: number
      shortTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
      mediumTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
      longTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
    }
    generatedAt?: string
  }

  // Bereid data voor grafieken
  const historyData = reportData.history || []
  const priceChartData = historyData.map((h, index) => {
    // Bereken percentage verandering ten opzichte van vorige dag
    let changePercent = 0
    if (index > 0 && historyData[index - 1].close > 0) {
      changePercent = ((h.close - historyData[index - 1].close) / historyData[index - 1].close) * 100
    }
    return {
      date: new Date(h.date).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' }),
      prijs: h.close,
      changePercent: changePercent,
      volume: h.volume
    }
  }) || []

  // Bereid financiele data voor grafieken
  const incomeStatements = (reportData.fundamentals?.incomeStatement as Array<Record<string, unknown>>) || []
  const revenueChartData = incomeStatements.map((item: Record<string, unknown>) => {
    const endDate = item.endDate as { fmt?: string; raw?: string | number } | undefined;
    return {
      jaar: endDate?.fmt || endDate?.raw || 'N/A',
      omzet: item.totalRevenue ? ((item.totalRevenue as { raw?: number }).raw || (item.totalRevenue as number)) / 1e6 : 0,
      winst: item.netIncome ? ((item.netIncome as { raw?: number }).raw || (item.netIncome as number)) / 1e6 : 0,
    };
  }).reverse()

  const balanceSheetData = (reportData.fundamentals?.balanceSheet as Array<Record<string, unknown>>) || []
  const balanceChartData = balanceSheetData.map((item: Record<string, unknown>) => {
    const endDate = item.endDate as { fmt?: string; raw?: string | number } | undefined;
    return {
      jaar: endDate?.fmt || endDate?.raw || 'N/A',
      activa: item.totalAssets ? ((item.totalAssets as { raw?: number }).raw || (item.totalAssets as number)) / 1e6 : 0,
      passiva: item.totalLiab ? ((item.totalLiab as { raw?: number }).raw || (item.totalLiab as number)) / 1e6 : 0,
      eigenVermogen: item.totalStockholderEquity ? ((item.totalStockholderEquity as { raw?: number }).raw || (item.totalStockholderEquity as number)) / 1e6 : 0,
    };
  }).reverse()

  const cashFlowData = (reportData.fundamentals?.cashFlow as Array<Record<string, unknown>>) || []
  const cashFlowChartData = cashFlowData.map((item: Record<string, unknown>) => {
    const endDate = item.endDate as { fmt?: string; raw?: string | number } | undefined;
    const operating = item.totalCashFromOperatingActivities ? ((item.totalCashFromOperatingActivities as { raw?: number }).raw || (item.totalCashFromOperatingActivities as number)) / 1e6 : 0
    const capex = item.capitalExpenditures ? Math.abs(((item.capitalExpenditures as { raw?: number }).raw || (item.capitalExpenditures as number))) / 1e6 : 0
    return {
      jaar: endDate?.fmt || endDate?.raw || 'N/A',
      operating: operating,
      freeCashflow: operating - capex,
    }
  }).reverse()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <Button
                variant="ghost"
                onClick={() => router.push("/stocks/deep-research")}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug
              </Button>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                <span className="text-gradient-financial">
                  Deep Research: {report.name}
                </span>
              </h1>
              <p className="text-muted-foreground">
                {report.symbol} • {report.exchange || "N/A"} • {report.type || "N/A"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {report.status === "COMPLETED" && (
                <Button
                  className="gradient-financial text-white shadow-financial"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/stocks/deep-research/${reportId}/download`)
                      if (!response.ok) {
                        throw new Error("Download mislukt")
                      }
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `deep-research-${report.symbol}-${reportId}.pdf`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                      toast.success("PDF wordt gedownload")
                    } catch (error) {
                      console.error("Download error:", error)
                      toast.error("Fout bij downloaden PDF")
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>

          {/* Status Card */}
          {report.status === "GENERATING" && (
            <Card className="bg-blue-500/10 border-blue-500/20 mb-6">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  <div>
                    <div className="font-semibold text-blue-600">
                      Rapport wordt gegenereerd...
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Dit kan enkele minuten duren. De pagina wordt automatisch bijgewerkt.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {report.status === "FAILED" && (
            <Card className="bg-red-500/10 border-red-500/20 mb-6">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-semibold text-red-600">
                      Rapport generatie mislukt
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {report.error || "Onbekende fout"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Content */}
          {report.status === "COMPLETED" && reportData?.content && (
            <>
              {/* Overall Score Card - Visueel Verbeterd */}
              {reportData.scores && (
                <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border-2 border-primary/30 shadow-2xl mb-8 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
                  <CardHeader className="relative z-10 pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                      Overall Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    {/* Hoofd Score Display */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      {/* Centrale Score Display */}
                      <div className="lg:col-span-2">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-baseline gap-4 mb-3">
                              <div className={`text-8xl font-extrabold leading-none ${getScoreColor(reportData.scores.overallScore)}`}>
                                {reportData.scores.overallScore}
                              </div>
                              <div className="flex flex-col justify-end pb-2">
                                <div className="text-3xl font-bold text-muted-foreground">/100</div>
                                <Badge 
                                  className={`mt-2 text-sm px-3 py-1 ${getScoreBgColor(reportData.scores.overallScore)} text-white`}
                                >
                                  {getScoreLabel(reportData.scores.overallScore)}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-lg font-medium text-muted-foreground mb-4">
                              {reportData.scores.overallScore >= 80 && "Uitstekende investeringsmogelijkheid"}
                              {reportData.scores.overallScore >= 60 && reportData.scores.overallScore < 80 && "Solide investeringsmogelijkheid"}
                              {reportData.scores.overallScore >= 40 && reportData.scores.overallScore < 60 && "Voorzichtige benadering aanbevolen"}
                              {reportData.scores.overallScore < 40 && "Hoge risico's - extra voorzichtigheid vereist"}
                            </div>
                            
                            {/* Score Progressie Bar */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Score Progressie</span>
                                <span className={`font-bold text-lg ${getScoreColor(reportData.scores.overallScore)}`}>
                                  {reportData.scores.overallScore}%
                                </span>
                              </div>
                              <Progress 
                                value={reportData.scores.overallScore} 
                                className="h-6 rounded-full"
                                style={{
                                  background: 'hsl(var(--muted))'
                                }}
                              />
                              {/* Score Zones Indicator */}
                              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                <span>0</span>
                                <span className={reportData.scores.overallScore < 40 ? "font-bold text-red-600" : ""}>Risicovol</span>
                                <span className={reportData.scores.overallScore >= 40 && reportData.scores.overallScore < 60 ? "font-bold text-yellow-600" : ""}>Neutraal</span>
                                <span className={reportData.scores.overallScore >= 60 && reportData.scores.overallScore < 80 ? "font-bold text-blue-600" : ""}>Goed</span>
                                <span className={reportData.scores.overallScore >= 80 ? "font-bold text-green-600" : ""}>Uitstekend</span>
                                <span>100</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Termijn Scores Vergelijking */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-muted-foreground">Korte Termijn</span>
                              <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className={`text-3xl font-bold mb-2 ${getScoreColor(reportData.scores.shortTerm.score)}`}>
                              {reportData.scores.shortTerm.score}
                            </div>
                            <Progress 
                              value={reportData.scores.shortTerm.score} 
                              className="h-2 rounded-full"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {reportData.scores.shortTerm.timeframe}
                            </div>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-muted-foreground">Middellange Termijn</span>
                              <Target className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className={`text-3xl font-bold mb-2 ${getScoreColor(reportData.scores.mediumTerm.score)}`}>
                              {reportData.scores.mediumTerm.score}
                            </div>
                            <Progress 
                              value={reportData.scores.mediumTerm.score} 
                              className="h-2 rounded-full"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {reportData.scores.mediumTerm.timeframe}
                            </div>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-muted-foreground">Lange Termijn</span>
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            </div>
                            <div className={`text-3xl font-bold mb-2 ${getScoreColor(reportData.scores.longTerm.score)}`}>
                              {reportData.scores.longTerm.score}
                            </div>
                            <Progress 
                              value={reportData.scores.longTerm.score} 
                              className="h-2 rounded-full"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {reportData.scores.longTerm.timeframe}
                            </div>
                          </div>
                        </div>

                        {/* Score Trend Visualisatie */}
                        <div className="mt-6 bg-muted/20 rounded-lg p-4 border border-border/50">
                          <div className="text-sm font-semibold mb-3 text-foreground">Score Trend per Termijn</div>
                          <ResponsiveContainer width="100%" height={120}>
                            <BarChart data={[
                              { name: 'Kort', score: reportData.scores.shortTerm.score },
                              { name: 'Middel', score: reportData.scores.mediumTerm.score },
                              { name: 'Lang', score: reportData.scores.longTerm.score },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                              <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis 
                                domain={[0, 100]}
                                tick={{ fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip 
                                formatter={(value: number) => [`${value}`, "Score"]}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                                contentStyle={{ 
                                  backgroundColor: 'hsl(var(--background))', 
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }}
                              />
                              <Bar 
                                dataKey="score" 
                                radius={[8, 8, 0, 0]}
                              >
                                <Cell fill="#3b82f6" />
                                <Cell fill="#8b5cf6" />
                                <Cell fill="#10b981" />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Rechter Kolom - Cirkel Progress & Extra Info */}
                      <div className="flex flex-col items-center justify-center space-y-6">
                        {/* Grote Cirkel Progress */}
                        <div className="w-48 h-48 relative flex-shrink-0">
                          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
                            {/* Achtergrond Cirkel */}
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-muted/20"
                            />
                            {/* Score Cirkel */}
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${(reportData.scores.overallScore / 100) * 439.82} 439.82`}
                              strokeLinecap="round"
                              className={getScoreColor(reportData.scores.overallScore)}
                              style={{
                                filter: `drop-shadow(0 0 12px ${reportData.scores.overallScore >= 80 ? 'rgb(34, 197, 94)' : reportData.scores.overallScore >= 60 ? 'rgb(59, 130, 246)' : reportData.scores.overallScore >= 40 ? 'rgb(234, 179, 8)' : 'rgb(239, 68, 68)'})`,
                                transition: 'stroke-dasharray 0.5s ease-in-out'
                              }}
                            />
                            {/* Zone Markers */}
                            <circle cx="80" cy="10" r="3" fill="currentColor" className="text-red-500/50" />
                            <circle cx="150" cy="80" r="3" fill="currentColor" className="text-yellow-500/50" />
                            <circle cx="80" cy="150" r="3" fill="currentColor" className="text-blue-500/50" />
                            <circle cx="10" cy="80" r="3" fill="currentColor" className="text-green-500/50" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className={`text-4xl font-extrabold ${getScoreColor(reportData.scores.overallScore)}`}>
                                {reportData.scores.overallScore}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">van 100</div>
                            </div>
                          </div>
                        </div>

                        {/* Score Vergelijking Indicator */}
                        <div className="w-full space-y-3">
                          <div className="text-sm font-semibold text-center text-foreground mb-3">
                            Score Vergelijking
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Kort vs Overall</span>
                              <span className={`font-bold ${
                                reportData.scores.shortTerm.score > reportData.scores.overallScore 
                                  ? 'text-green-600' 
                                  : reportData.scores.shortTerm.score < reportData.scores.overallScore 
                                  ? 'text-red-600' 
                                  : 'text-muted-foreground'
                              }`}>
                                {reportData.scores.shortTerm.score > reportData.scores.overallScore ? '↑' : 
                                 reportData.scores.shortTerm.score < reportData.scores.overallScore ? '↓' : '='}
                                {Math.abs(reportData.scores.shortTerm.score - reportData.scores.overallScore)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Middel vs Overall</span>
                              <span className={`font-bold ${
                                reportData.scores.mediumTerm.score > reportData.scores.overallScore 
                                  ? 'text-green-600' 
                                  : reportData.scores.mediumTerm.score < reportData.scores.overallScore 
                                  ? 'text-red-600' 
                                  : 'text-muted-foreground'
                              }`}>
                                {reportData.scores.mediumTerm.score > reportData.scores.overallScore ? '↑' : 
                                 reportData.scores.mediumTerm.score < reportData.scores.overallScore ? '↓' : '='}
                                {Math.abs(reportData.scores.mediumTerm.score - reportData.scores.overallScore)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Lang vs Overall</span>
                              <span className={`font-bold ${
                                reportData.scores.longTerm.score > reportData.scores.overallScore 
                                  ? 'text-green-600' 
                                  : reportData.scores.longTerm.score < reportData.scores.overallScore 
                                  ? 'text-red-600' 
                                  : 'text-muted-foreground'
                              }`}>
                                {reportData.scores.longTerm.score > reportData.scores.overallScore ? '↑' : 
                                 reportData.scores.longTerm.score < reportData.scores.overallScore ? '↓' : '='}
                                {Math.abs(reportData.scores.longTerm.score - reportData.scores.overallScore)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Trend Indicator */}
                        <div className="w-full bg-muted/30 rounded-lg p-4 border border-border/50">
                          <div className="text-xs font-semibold text-center text-foreground mb-2">
                            Trend Analyse
                          </div>
                          {(() => {
                            const scores = [
                              reportData.scores.shortTerm.score,
                              reportData.scores.mediumTerm.score,
                              reportData.scores.longTerm.score
                            ];
                            const isUpward = scores[2] > scores[0];
                            const isStable = Math.abs(scores[2] - scores[0]) < 5;
                            return (
                              <div className="flex flex-col items-center">
                                {isUpward ? (
                                  <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                                ) : isStable ? (
                                  <BarChart3 className="h-8 w-8 text-yellow-600 mb-2" />
                                ) : (
                                  <TrendingDown className="h-8 w-8 text-red-600 mb-2" />
                                )}
                                <div className={`text-sm font-bold ${
                                  isUpward ? 'text-green-600' : 
                                  isStable ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {isUpward ? 'Opwaartse Trend' : 
                                   isStable ? 'Stabiele Trend' : 
                                   'Neerwaartse Trend'}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 text-center">
                                  {isUpward 
                                    ? `+${(scores[2] - scores[0]).toFixed(1)} punten over tijd`
                                    : isStable
                                    ? 'Minimale verandering'
                                    : `${(scores[2] - scores[0]).toFixed(1)} punten over tijd`}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Info - Visueel Verbeterd */}
              {(reportData.quote || reportData.fundamentals) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {reportData.quote?.price && typeof reportData.quote.price === 'number' ? (
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 shadow-lg hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-muted-foreground">Huidige Prijs</div>
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-foreground">
                          ${(reportData.quote.price as number).toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                  {reportData.quote?.changePercent && typeof reportData.quote.changePercent === 'number' ? (
                    <Card className={`bg-gradient-to-br ${
                      (reportData.quote.changePercent as number) >= 0
                        ? "from-green-500/10 to-green-600/5 border-green-500/20"
                        : "from-red-500/10 to-red-600/5 border-red-500/20"
                    } shadow-lg hover:shadow-xl transition-all`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-muted-foreground">Verandering</div>
                          <div className={`p-2 rounded-lg ${
                            (reportData.quote.changePercent as number) >= 0
                              ? "bg-green-500/10"
                              : "bg-red-500/10"
                          }`}>
                            {(reportData.quote.changePercent as number) >= 0 ? (
                              <TrendingUp className={`h-4 w-4 ${
                                (reportData.quote.changePercent as number) >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`} />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                        <div className={`text-3xl font-bold flex items-center gap-2 ${
                          (reportData.quote.changePercent as number) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                          {(reportData.quote.changePercent as number) >= 0 ? "+" : ""}
                          {(reportData.quote.changePercent as number).toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                  {reportData.fundamentals?.trailingPE && typeof reportData.fundamentals.trailingPE === 'number' ? (
                    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 shadow-lg hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-muted-foreground">P/E Ratio</div>
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-foreground">
                          {(reportData.fundamentals.trailingPE as number).toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                  {reportData.fundamentals?.sector ? (
                    <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20 shadow-lg hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-muted-foreground">Sector</div>
                          <div className="p-2 rounded-lg bg-amber-500/10">
                            <Target className="h-4 w-4 text-amber-600" />
                          </div>
                        </div>
                        <div className="text-xl font-bold text-foreground line-clamp-2">
                          {reportData.fundamentals.sector as string}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              ) : null}

              {/* Extra Financiële Metrics */}
              {reportData.fundamentals ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {reportData.fundamentals.marketCap && typeof reportData.fundamentals.marketCap === 'number' ? (
                    <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
                      <CardContent className="p-5">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Marktkapitalisatie</div>
                        <div className="text-xl font-bold text-foreground">
                          ${((reportData.fundamentals.marketCap as number) / 1e9).toFixed(2)}B
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                  {reportData.fundamentals.dividendYield && typeof reportData.fundamentals.dividendYield === 'number' ? (
                    <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
                      <CardContent className="p-5">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Dividend Yield</div>
                        <div className="text-xl font-bold text-foreground">
                          {((reportData.fundamentals.dividendYield as number) * 100).toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                  {reportData.fundamentals.returnOnEquity && typeof reportData.fundamentals.returnOnEquity === 'number' ? (
                    <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
                      <CardContent className="p-5">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Return on Equity</div>
                        <div className="text-xl font-bold text-foreground">
                          {((reportData.fundamentals.returnOnEquity as number) * 100).toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                  {reportData.fundamentals.profitMargins && typeof reportData.fundamentals.profitMargins === 'number' ? (
                    <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
                      <CardContent className="p-5">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Winstmarge</div>
                        <div className="text-xl font-bold text-foreground">
                          {((reportData.fundamentals.profitMargins as number) * 100).toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                  {reportData.fundamentals.debtToEquity && typeof reportData.fundamentals.debtToEquity === 'number' ? (
                    <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
                      <CardContent className="p-5">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Schuld/Eigen Vermogen</div>
                        <div className="text-xl font-bold text-foreground">
                          {(reportData.fundamentals.debtToEquity as number).toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                  {reportData.fundamentals.currentRatio && typeof reportData.fundamentals.currentRatio === 'number' ? (
                    <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
                      <CardContent className="p-5">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Current Ratio</div>
                        <div className="text-xl font-bold text-foreground">
                          {(reportData.fundamentals.currentRatio as number).toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              ) : null}

              {/* Voorspellingen per Termijn - Visueel Verbeterd */}
              {reportData.scores && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Korte Termijn */}
                  <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-card/90 border-2 border-blue-500/20 shadow-xl hover:shadow-2xl transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        Korte Termijn
                      </CardTitle>
                      <CardDescription className="text-sm font-medium mt-1">
                        {reportData.scores.shortTerm.timeframe}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-muted-foreground">Score</span>
                          <span className={`text-4xl font-extrabold ${getScoreColor(reportData.scores.shortTerm.score)}`}>
                            {reportData.scores.shortTerm.score}
                          </span>
                        </div>
                        <Progress 
                          value={reportData.scores.shortTerm.score} 
                          className="h-3 rounded-full"
                        />
                      </div>
                      <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border/50">
                        <div className="text-sm font-semibold mb-2 text-foreground">Voorspelling</div>
                        <p className="text-sm leading-relaxed text-foreground/90">{reportData.scores.shortTerm.prediction}</p>
                      </div>
                      <div>
                        <div className="text-sm font-semibold mb-3 text-foreground">Belangrijke Factoren</div>
                        <ul className="space-y-2">
                          {reportData.scores.shortTerm.keyFactors.map((factor, idx) => (
                            <li key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                              <span className="text-sm text-foreground/90 leading-relaxed">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Midden Lange Termijn */}
                  <Card className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-card/90 border-2 border-purple-500/20 shadow-xl hover:shadow-2xl transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <Target className="h-5 w-5 text-purple-600" />
                        </div>
                        Midden Lange Termijn
                      </CardTitle>
                      <CardDescription className="text-sm font-medium mt-1">
                        {reportData.scores.mediumTerm.timeframe}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-muted-foreground">Score</span>
                          <span className={`text-4xl font-extrabold ${getScoreColor(reportData.scores.mediumTerm.score)}`}>
                            {reportData.scores.mediumTerm.score}
                          </span>
                        </div>
                        <Progress 
                          value={reportData.scores.mediumTerm.score} 
                          className="h-3 rounded-full"
                        />
                      </div>
                      <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border/50">
                        <div className="text-sm font-semibold mb-2 text-foreground">Voorspelling</div>
                        <p className="text-sm leading-relaxed text-foreground/90">{reportData.scores.mediumTerm.prediction}</p>
                      </div>
                      <div>
                        <div className="text-sm font-semibold mb-3 text-foreground">Belangrijke Factoren</div>
                        <ul className="space-y-2">
                          {reportData.scores.mediumTerm.keyFactors.map((factor, idx) => (
                            <li key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-600" />
                              <span className="text-sm text-foreground/90 leading-relaxed">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lange Termijn */}
                  <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-card/90 border-2 border-green-500/20 shadow-xl hover:shadow-2xl transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 rounded-lg bg-green-500/20">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        Lange Termijn
                      </CardTitle>
                      <CardDescription className="text-sm font-medium mt-1">
                        {reportData.scores.longTerm.timeframe}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-muted-foreground">Score</span>
                          <span className={`text-4xl font-extrabold ${getScoreColor(reportData.scores.longTerm.score)}`}>
                            {reportData.scores.longTerm.score}
                          </span>
                        </div>
                        <Progress 
                          value={reportData.scores.longTerm.score} 
                          className="h-3 rounded-full"
                        />
                      </div>
                      <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border/50">
                        <div className="text-sm font-semibold mb-2 text-foreground">Voorspelling</div>
                        <p className="text-sm leading-relaxed text-foreground/90">{reportData.scores.longTerm.prediction}</p>
                      </div>
                      <div>
                        <div className="text-sm font-semibold mb-3 text-foreground">Belangrijke Factoren</div>
                        <ul className="space-y-2">
                          {reportData.scores.longTerm.keyFactors.map((factor, idx) => (
                            <li key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                              <span className="text-sm text-foreground/90 leading-relaxed">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Grafieken */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Prijs Trend */}
                {priceChartData.length > 0 && (
                  <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                    <CardHeader>
                      <CardTitle>Prijs Trend (Laatste Jaar)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={priceChartData}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis 
                            domain={[-5, 5]}
                            tick={{ fontSize: 12 }} 
                            tickFormatter={(value) => `${value.toFixed(1)}%`} 
                          />
                          <Tooltip 
                            formatter={(value: number) => [`${value >= 0 ? '+' : ''}${value.toFixed(2)}%`, "Verandering"]}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="changePercent" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Revenue & Winst Trend */}
                {revenueChartData.length > 0 && (
                  <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                    <CardHeader>
                      <CardTitle>Omzet & Winst Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="jaar" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value.toFixed(0)}M`} />
                          <Tooltip 
                            formatter={(value: number) => [`$${value.toFixed(2)}M`, ""]}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                          />
                          <Legend />
                          <Bar dataKey="omzet" fill="#3b82f6" name="Omzet (M)" />
                          <Bar dataKey="winst" fill="#10b981" name="Winst (M)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Balance Sheet */}
                {balanceChartData.length > 0 && (
                  <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                    <CardHeader>
                      <CardTitle>Balans Structuur</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={balanceChartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="jaar" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value.toFixed(0)}M`} />
                          <Tooltip 
                            formatter={(value: number) => [`$${value.toFixed(2)}M`, ""]}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                          />
                          <Legend />
                          <Bar dataKey="activa" fill="#8b5cf6" name="Activa (M)" />
                          <Bar dataKey="passiva" fill="#ef4444" name="Passiva (M)" />
                          <Bar dataKey="eigenVermogen" fill="#10b981" name="Eigen Vermogen (M)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Cashflow Trend */}
                {cashFlowChartData.length > 0 && (
                  <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                    <CardHeader>
                      <CardTitle>Cashflow Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={cashFlowChartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="jaar" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value.toFixed(0)}M`} />
                          <Tooltip 
                            formatter={(value: number) => [`$${value.toFixed(2)}M`, ""]}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="operating" stroke="#3b82f6" strokeWidth={2} name="Operating Cashflow (M)" />
                          <Line type="monotone" dataKey="freeCashflow" stroke="#10b981" strokeWidth={2} name="Free Cashflow (M)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Main Report - Verbeterde Styling */}
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Volledig Onderzoeksrapport</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {reportData.generatedAt
                        ? new Date(reportData.generatedAt).toLocaleDateString("nl-NL", {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : new Date(report.createdAt).toLocaleDateString("nl-NL", {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="report-content prose prose-lg dark:prose-invert max-w-none 
                    prose-headings:font-bold prose-headings:text-foreground
                    prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:border-b prose-h1:border-border prose-h1:pb-3
                    prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-primary
                    prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-foreground
                    prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-4
                    prose-p:text-base prose-p:leading-relaxed prose-p:mb-4 prose-p:text-foreground/90
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-ul:my-4 prose-ul:space-y-2 prose-ul:list-disc prose-ul:pl-6
                    prose-ol:my-4 prose-ol:space-y-2 prose-ol:list-decimal prose-ol:pl-6
                    prose-li:text-foreground/90 prose-li:leading-relaxed
                    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-4
                    prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono
                    prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                    prose-table:w-full prose-table:my-6 prose-table:border-collapse
                    prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-3 prose-th:text-left prose-th:font-semibold
                    prose-td:border prose-td:border-border prose-td:p-3
                    prose-a:text-primary prose-a:underline prose-a:decoration-primary/50 hover:prose-a:decoration-primary
                    prose-img:rounded-lg prose-img:shadow-lg prose-img:my-6
                    prose-hr:border-border prose-hr:my-8">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => (
                          <h1 className="text-4xl font-bold mb-6 mt-8 pb-3 border-b border-border text-foreground" {...props} />
                        ),
                        h2: ({node, ...props}) => (
                          <h2 className="text-3xl font-bold mb-4 mt-8 text-primary" {...props} />
                        ),
                        h3: ({node, ...props}) => (
                          <h3 className="text-2xl font-semibold mb-3 mt-6 text-foreground" {...props} />
                        ),
                        h4: ({node, ...props}) => (
                          <h4 className="text-xl font-semibold mb-2 mt-4 text-foreground" {...props} />
                        ),
                        p: ({node, ...props}) => (
                          <p className="text-base leading-relaxed mb-4 text-foreground/90" {...props} />
                        ),
                        ul: ({node, ...props}) => (
                          <ul className="my-4 space-y-2 list-disc pl-6" {...props} />
                        ),
                        ol: ({node, ...props}) => (
                          <ol className="my-4 space-y-2 list-decimal pl-6" {...props} />
                        ),
                        li: ({node, ...props}) => (
                          <li className="text-foreground/90 leading-relaxed" {...props} />
                        ),
                        blockquote: ({node, ...props}) => (
                          <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4" {...props} />
                        ),
                        code: ({node, ...props}: any) => {
                          const isInline = !props.className || !props.className.includes('language-');
                          return isInline ? (
                            <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono" {...props} />
                          ) : (
                            <code className="block text-sm bg-muted p-4 rounded-lg overflow-x-auto" {...props} />
                          );
                        },
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-6">
                            <table className="w-full border-collapse" {...props} />
                          </div>
                        ),
                        th: ({node, ...props}) => (
                          <th className="border border-border bg-muted p-3 text-left font-semibold" {...props} />
                        ),
                        td: ({node, ...props}) => (
                          <td className="border border-border p-3" {...props} />
                        ),
                        a: ({node, ...props}) => (
                          <a className="text-primary underline decoration-primary/50 hover:decoration-primary transition-colors" {...props} />
                        ),
                        hr: ({node, ...props}) => (
                          <hr className="border-border my-8" {...props} />
                        ),
                      }}
                    >
                      {(() => {
                        // Verwijder eventuele resterende JSON scores uit de content
                        let cleanContent = reportData.content || ""
                        if (cleanContent) {
                          // Verwijder ANALYSIS_SCORES tags en inhoud
                          cleanContent = cleanContent.replace(/<ANALYSIS_SCORES>[\s\S]*?<\/ANALYSIS_SCORES>/g, '').trim()
                          // Verwijder ook losse JSON objecten die op scores lijken
                          cleanContent = cleanContent.replace(/\{[\s\S]*?"overallScore"[\s\S]*?\}/g, '').trim()
                        }
                        return cleanContent
                      })()}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <Card className="bg-accent/10 border border-primary/20 mt-6">
                <CardContent className="py-6">
                  <div className="text-sm text-muted-foreground">
                    <strong>Disclaimer:</strong> Dit rapport is gegenereerd met behulp van AI en is uitsluitend 
                    bedoeld voor educatieve en informatieve doeleinden. Het vormt geen persoonlijk financieel 
                    advies, beleggingsadvies of aanbeveling tot koop of verkoop van effecten. Raadpleeg altijd 
                    een gekwalificeerde financieel adviseur voordat u beleggingsbeslissingen neemt.
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


