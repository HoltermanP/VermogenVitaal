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
        return "bg-red-100 text-red-800 border-red-300"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-blue-100 text-blue-800 border-blue-300"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Administratie Controle
            </h1>
            <p className="text-lg text-gray-300">
              Upload een XAF audit bestand van e-boekhouden of een CSV bestand met alle mutaties voor automatische controle op basis van belastingregels 2025
            </p>
          </div>

          {error && (
            <Card className="mb-6 border-red-300 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-800">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              </CardContent>
            </Card>
          )}

          {!auditId && (
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileCheck className="h-5 w-5 mr-2" />
                  Upload Audit Bestand
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Upload een XAF audit bestand van e-boekhouden (.xaf/.xml) of een CSV bestand. 
                  <br />
                  <span className="text-sm mt-2 block">
                    CSV kolommen: Nr, Datum (DD-MM-YYYY), Soort, Bedrag (1.000,00), Rekening, Tegenrekening, Factuur
                  </span>
                  <a 
                    href="/voorbeeld-boekingen.csv" 
                    download 
                    className="text-blue-400 hover:text-blue-300 underline text-sm mt-1 inline-block"
                  >
                    Download voorbeeld CSV bestand
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file" className="text-gray-300">Audit Bestand (XAF/XML of CSV)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".xaf,.xml,.csv"
                    onChange={handleFileChange}
                    className="mt-2 bg-slate-700 border-slate-600 text-white"
                  />
                  {file && (
                    <p className="mt-2 text-sm text-gray-400">
                      Geselecteerd: {file.name}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TableIcon className="h-5 w-5 mr-2" />
                  Geüploade Mutaties ({transactions.length})
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Controleer de mutaties en ga verder met de vragen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-600 max-h-[600px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-700 hover:bg-slate-700">
                        <TableHead className="text-gray-300">Nr</TableHead>
                        <TableHead className="text-gray-300">Datum</TableHead>
                        <TableHead className="text-gray-300">Soort</TableHead>
                        <TableHead className="text-gray-300 text-right">Bedrag</TableHead>
                        <TableHead className="text-gray-300">Rekening</TableHead>
                        <TableHead className="text-gray-300">Tegenrekening</TableHead>
                        <TableHead className="text-gray-300">Factuur</TableHead>
                        <TableHead className="text-gray-300">Omschrijving</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((t, index) => {
                        const amount = parseFloat(String(t.bedrag || 0))
                        const isNegative = amount < 0
                        return (
                          <TableRow key={index} className="border-slate-600 hover:bg-slate-700/50">
                            <TableCell className="text-gray-300 font-mono text-xs">
                              {t.nr || index + 1}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {formatDate(t.datum || '')}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {t.type || t.soort || '-'}
                            </TableCell>
                            <TableCell className={`text-right font-medium ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
                              {formatCurrency(t.bedrag || 0)}
                            </TableCell>
                            <TableCell className="text-gray-300 font-mono text-xs">
                              {t.categorie || t.rekening || '-'}
                            </TableCell>
                            <TableCell className="text-gray-300 font-mono text-xs">
                              {t.tegenrekening || '-'}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {t.factuur || '-'}
                            </TableCell>
                            <TableCell className="text-gray-300 text-sm max-w-xs truncate">
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
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  Doorgaan naar Vragen
                </Button>
              </CardContent>
            </Card>
          )}

          {auditId && questions.length > 0 && !results && !showTransactions && (
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Aanvullende Vragen</CardTitle>
                <CardDescription className="text-gray-300">
                  Beantwoord deze vragen om een nauwkeurige analyse te krijgen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <Label className="text-gray-300">{q.question}</Label>
                    {q.question.toLowerCase().includes("rechtsvorm") ? (
                      <Select
                        value={answers[q.id] || ""}
                        onValueChange={(value) =>
                          setAnswers({ ...answers, [q.id]: value })
                        }
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
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
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    )}
                  </div>
                ))}
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                    Analyse Voltooid
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Bekijk de bevindingen en aanbevelingen hieronder
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mb-4 text-white">Samenvatting</h3>
                    <p className="whitespace-pre-line text-gray-300">
                      {results.recommendations?.summary || "Controle voltooid."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {results.recommendations?.critical && results.recommendations.critical.length > 0 && (
                <Card className="border-red-300 bg-red-50/10">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-400">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Kritieke Aanbevelingen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-red-300">
                      {results.recommendations.critical.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {results.recommendations?.important && results.recommendations.important.length > 0 && (
                <Card className="border-yellow-300 bg-yellow-50/10">
                  <CardHeader>
                    <CardTitle className="flex items-center text-yellow-400">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Belangrijke Aanbevelingen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-yellow-300">
                      {results.recommendations.important.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {results.recommendations?.suggestions && results.recommendations.suggestions.length > 0 && (
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Suggesties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                      {results.recommendations.suggestions.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {results.findings && results.findings.length > 0 && (
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Gedetailleerde Bevindingen</CardTitle>
                    <CardDescription className="text-gray-300">
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
                            <span className="text-xs text-gray-500">
                              {finding.ruleReference}
                            </span>
                          )}
                        </div>
                        <p className="font-medium mb-2">{finding.description}</p>
                        <p className="text-sm">{finding.recommendation}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full border-slate-600 text-gray-300 hover:bg-slate-700"
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

