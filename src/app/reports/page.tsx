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
        return "bg-green-100 text-green-800"
      case "In behandeling":
        return "bg-yellow-100 text-yellow-800"
      case "Fout":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Fiscaal":
        return "bg-blue-100 text-blue-800"
      case "Belegging":
        return "bg-green-100 text-green-800"
      case "Vastgoed":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mijn Rapporten
            </h1>
            <p className="text-lg text-gray-600">
              Bekijk en download je gegenereerde fiscale rapporten
            </p>
          </div>

          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center mb-2">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        {report.title}
                      </CardTitle>
                      <CardDescription className="mb-3">
                        {report.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
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
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/reports/${report.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Bekijk
                      </Link>
                    </Button>
                    {report.downloadUrl && (
                      <Button size="sm" asChild>
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
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nog geen rapporten
              </h3>
              <p className="text-gray-600 mb-6">
                Genereer je eerste rapport door een calculator te gebruiken
              </p>
              <Button asChild>
                <Link href="/calculators">
                  Start met Calculators
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-12 bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-green-900 mb-3">
              📊 Rapport Informatie
            </h2>
            <p className="text-green-800">
              Je rapporten worden automatisch gegenereerd na het voltooien van een calculator. 
              Ze bevatten gedetailleerde analyses en aanbevelingen op basis van je invoer.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
