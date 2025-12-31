"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Upload, FileText, Loader2, AlertTriangle, FileCheck, Table as TableIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NewsTicker } from "@/components/news-ticker"

interface Question {
  id: string
  question: string
  answer: string
}

interface Transaction {
  nr?: string | number
  datum?: string
  type?: string
  soort?: string
  bedrag?: number | string
  categorie?: string
  rekening?: string
  tegenrekening?: string
  factuur?: string
  omschrijving?: string
}

interface Finding {
  severity: string
  category: string
  description: string
  recommendation: string
  ruleReference?: string
}

interface Recommendations {
  summary?: string
  critical?: string[]
  important?: string[]
  suggestions?: string[]
}

interface AuditResults {
  id: string
  findings: Finding[]
  recommendations: Recommendations
  status: string
}

export default function AuditPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [auditId, setAuditId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<AuditResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([]) // Bewaar transacties voor development mode
  const [showTransactions, setShowTransactions] = useState(false) // Toggle voor transacties tabel

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Selecteer eerst een bestand")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/audit/upload", {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        let errorMessage = "Upload mislukt"
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch {
          errorMessage = `Upload mislukt: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setAuditId(data.id)
      setQuestions(data.questions.map((q: string, i: number) => ({
        id: `q${i}`,
        question: q,
        answer: ""
      })))
      // Bewaar transacties - deze worden nu altijd teruggestuurd
      if (data.transactions && Array.isArray(data.transactions)) {
        setTransactions(data.transactions)
        // Toon transacties tabel na upload
        setShowTransactions(true)
      } else {
        // Als er geen transacties zijn, ga direct naar vragen
        setShowTransactions(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt")
    } finally {
      setUploading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!auditId) return

    // Check of alle vragen zijn beantwoord
    const unanswered = questions.filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      setError("Beantwoord alle vragen voordat je de analyse start")
      return
    }

    setAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/audit/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          answers,
          transactions: transactions.length > 0 ? transactions : undefined // Stuur transacties mee voor development mode
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Analyse mislukt")
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyse mislukt")
    } finally {
      setAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "warning":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-primary/20 text-primary border-primary/30"
    }
  }

  const resetForm = () => {
    setFile(null)
    setAuditId(null)
    setQuestions([])
    setAnswers({})
    setResults(null)
    setError(null)
    setTransactions([])
    setShowTransactions(false)
    
    // Reset file input
    const fileInput = document.getElementById("file") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const formatCurrency = (value: number | string | undefined): string => {
    const num = parseFloat(String(value || 0))
    if (isNaN(num)) return "€0,00"
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(num)
  }

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return ""
    try {
      // Als het al YYYY-MM-DD is, format het
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const date = new Date(dateStr)
        return date.toLocaleDateString('nl-NL')
      }
      // Anders return origineel
      return dateStr
    } catch {
      return dateStr
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        {/* Financial grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 animate-fade-in">
              <span className="text-gradient-financial">Administratie Controle</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in delay-200">
              Upload een XAF audit bestand van e-boekhouden of een CSV bestand met alle mutaties voor automatische controle op basis van belastingregels 2025
            </p>
          </div>

          {/* News Ticker - Compact */}
          <div className="mb-6">
            <NewsTicker pagePath="/audit" />
          </div>

          {error && (
            <Card className="mb-6 border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <div className="flex items-center text-destructive">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              </CardContent>
            </Card>
          )}

          {!auditId && (
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3 shadow-financial">
                    <FileCheck className="h-5 w-5 text-white" />
                  </div>
                  Upload Audit Bestand
                </CardTitle>
                <CardDescription>
                  Upload een XAF audit bestand van e-boekhouden (.xaf/.xml) of een CSV bestand. 
                  <br />
                  <span className="text-sm mt-2 block">
                    CSV kolommen: Nr, Datum (DD-MM-YYYY), Soort, Bedrag (1.000,00), Rekening, Tegenrekening, Factuur
                  </span>
                  <a 
                    href="/voorbeeld-boekingen.csv" 
                    download 
                    className="text-primary hover:underline text-sm mt-1 inline-block"
                  >
                    Download voorbeeld CSV bestand
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file">Audit Bestand (XAF/XML of CSV)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".xaf,.xml,.csv"
                    onChange={handleFileChange}
                    className="mt-2"
                  />
                  {file && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Geselecteerd: {file.name}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploaden...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload en Start Controle
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {auditId && showTransactions && transactions.length > 0 && (
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3 shadow-financial">
                    <TableIcon className="h-5 w-5 text-white" />
                  </div>
                  Geüploade Mutaties ({transactions.length})
                </CardTitle>
                <CardDescription>
                  Controleer de mutaties en ga verder met de vragen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-[600px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nr</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead>Soort</TableHead>
                        <TableHead className="text-right">Bedrag</TableHead>
                        <TableHead>Rekening</TableHead>
                        <TableHead>Tegenrekening</TableHead>
                        <TableHead>Factuur</TableHead>
                        <TableHead>Omschrijving</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((t, index) => {
                        const amount = parseFloat(String(t.bedrag || 0))
                        const isNegative = amount < 0
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs">
                              {t.nr || index + 1}
                            </TableCell>
                            <TableCell>
                              {formatDate(t.datum || '')}
                            </TableCell>
                            <TableCell>
                              {t.type || t.soort || '-'}
                            </TableCell>
                            <TableCell className={`text-right font-medium ${isNegative ? 'text-destructive' : 'text-primary'}`}>
                              {formatCurrency(t.bedrag || 0)}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {t.categorie || t.rekening || '-'}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {t.tegenrekening || '-'}
                            </TableCell>
                            <TableCell>
                              {t.factuur || '-'}
                            </TableCell>
                            <TableCell className="text-sm max-w-xs truncate">
                              {t.omschrijving || '-'}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                <Button
                  onClick={() => setShowTransactions(false)}
                  className="w-full mt-4 gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300"
                >
                  Doorgaan naar Vragen
                </Button>
              </CardContent>
            </Card>
          )}

          {auditId && questions.length > 0 && !results && !showTransactions && (
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-foreground">Aanvullende Vragen</CardTitle>
                <CardDescription>
                  Beantwoord deze vragen om een nauwkeurige analyse te krijgen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <Label>{q.question}</Label>
                    {q.question.toLowerCase().includes("rechtsvorm") ? (
                      <Select
                        value={answers[q.id] || ""}
                        onValueChange={(value) =>
                          setAnswers({ ...answers, [q.id]: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer rechtsvorm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMZ">Eenmanszaak (EMZ)</SelectItem>
                          <SelectItem value="BV">Besloten Vennootschap (BV)</SelectItem>
                          <SelectItem value="DGA">DGA (Directeur-Groot Aandeelhouder)</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={answers[q.id] || ""}
                        onChange={(e) =>
                          setAnswers({ ...answers, [q.id]: e.target.value })
                        }
                        placeholder="Typ je antwoord..."
                      />
                    )}
                  </div>
                ))}
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyseren...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Start Analyse
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {results && (
            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3 shadow-financial">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    Analyse Voltooid
                  </CardTitle>
                  <CardDescription>
                    Bekijk de bevindingen en aanbevelingen hieronder
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mb-4">Samenvatting</h3>
                    <p className="whitespace-pre-line text-muted-foreground">
                      {results.recommendations?.summary || "Controle voltooid."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {results.recommendations?.critical && results.recommendations.critical.length > 0 && (
                <Card className="border-destructive bg-destructive/10">
                  <CardHeader>
                    <CardTitle className="flex items-center text-destructive">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Kritieke Aanbevelingen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-destructive">
                      {results.recommendations.critical.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {results.recommendations?.important && results.recommendations.important.length > 0 && (
                <Card className="border-muted bg-muted/10">
                  <CardHeader>
                    <CardTitle className="flex items-center text-muted-foreground">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Belangrijke Aanbevelingen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      {results.recommendations.important.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {results.recommendations?.suggestions && results.recommendations.suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Suggesties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      {results.recommendations.suggestions.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {results.findings && results.findings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Gedetailleerde Bevindingen</CardTitle>
                    <CardDescription>
                      Alle gevonden problemen en aandachtspunten
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.findings.map((finding: Finding, i: number) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border ${getSeverityColor(finding.severity)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="mb-2">
                            {finding.category}
                          </Badge>
                          {finding.ruleReference && (
                            <span className="text-xs text-muted-foreground">
                              {finding.ruleReference}
                            </span>
                          )}
                        </div>
                        <p className="font-medium mb-2">{finding.description}</p>
                        <p className="text-sm text-muted-foreground">{finding.recommendation}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300"
              >
                Nieuwe Controle Starten
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

