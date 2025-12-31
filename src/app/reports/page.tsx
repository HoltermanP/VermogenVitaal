import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Calendar } from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
  const reports = [
    {
      id: "1",
      title: "BV vs EMZ Analyse",
      type: "Fiscaal",
      date: "2024-01-15",
      status: "Voltooid",
      description: "Vergelijking tussen BV en EMZ voor omzet van €150.000",
      downloadUrl: "/reports/1/download"
    },
    {
      id: "2", 
      title: "ETF Groei Projectie",
      type: "Belegging",
      date: "2024-01-12",
      status: "Voltooid",
      description: "10-jarige projectie van ETF portfolio met €50.000 startkapitaal",
      downloadUrl: "/reports/2/download"
    },
    {
      id: "3",
      title: "Vastgoed Cashflow Analyse",
      type: "Vastgoed", 
      date: "2024-01-10",
      status: "In behandeling",
      description: "Cashflow analyse voor appartement in Amsterdam",
      downloadUrl: null
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Voltooid":
        return "bg-primary/20 text-primary"
      case "In behandeling":
        return "bg-muted text-muted-foreground"
      case "Fout":
        return "bg-destructive/20 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Fiscaal":
        return "bg-primary/20 text-primary"
      case "Belegging":
        return "bg-primary/20 text-primary"
      case "Vastgoed":
        return "bg-primary/20 text-primary"
      default:
        return "bg-muted text-muted-foreground"
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 animate-fade-in">
              <span className="text-gradient-financial">Mijn Rapporten</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in delay-200">
              Bekijk en download je gegenereerde fiscale rapporten
            </p>
          </div>

          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.id} className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center mb-2 text-foreground">
                        <div className="w-10 h-10 gradient-financial rounded-lg flex items-center justify-center mr-3 shadow-financial">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        {report.title}
                      </CardTitle>
                      <CardDescription className="mb-3">
                        {report.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(report.date).toLocaleDateString('nl-NL')}
                        </div>
                        <Badge variant="outline" className={getTypeColor(report.type)}>
                          {report.type}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300" asChild>
                      <Link href={`/reports/${report.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Bekijk
                      </Link>
                    </Button>
                    {report.downloadUrl && (
                      <Button size="sm" className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
                        <Link href={report.downloadUrl}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {reports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nog geen rapporten
              </h3>
              <p className="text-muted-foreground mb-6">
                Genereer je eerste rapport door een calculator te gebruiken
              </p>
              <Button className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
                <Link href="/calculators">
                  Start met Calculators
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-12 bg-accent/10 border border-primary/20 p-6 rounded-lg hover:border-primary/40 hover:shadow-financial-lg transition-all duration-500">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              📊 Rapport Informatie
            </h2>
            <p className="text-muted-foreground">
              Je rapporten worden automatisch gegenereerd na het voltooien van een calculator. 
              Ze bevatten gedetailleerde analyses en aanbevelingen op basis van je invoer.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
