import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type) {
      return NextResponse.json(
        { error: "Rapport type is verplicht" },
        { status: 400 }
      )
    }

    // Mock PDF generation based on type
    const reportData = {
      bvVsEmz: {
        title: "BV vs EMZ Analyse",
        description: "Vergelijking tussen BV en EMZ voor jouw situatie",
        generatedAt: new Date().toISOString(),
        results: {
          eenmanszaak: {
            nettoResultaat: 79750,
            belasting: 45250
          },
          bv: {
            nettoResultaat: 82750,
            vennootschapsbelasting: 23750,
            inkomstenbelasting: 12500,
            dividendbelasting: 6000
          },
          aanbeveling: "Een BV is in jouw situatie €3.000 voordeliger per jaar."
        }
      },
      etfGrowth: {
        title: "ETF Groei Projectie",
        description: "20-jarige ETF groeiprojectie",
        generatedAt: new Date().toISOString(),
        results: {
          totaalIngelegd: 130000,
          verwachteWaarde: 347850,
          winst: 217850,
          jaarlijkseOntwikkeling: {
            jaar5: 45230,
            jaar10: 98450,
            jaar15: 178920,
            jaar20: 347850
          }
        }
      },
      realEstate: {
        title: "Vastgoed Cashflow Analyse",
        description: "Cashflow analyse voor vastgoed investering",
        generatedAt: new Date().toISOString(),
        results: {
          nettoCashflow: 10000,
          rendement: 3.33,
          box3Belasting: 1200,
          nettoNaBelasting: 8800
        }
      },
      cryptoAllocation: {
        title: "Crypto Allocatie Advies",
        description: "Optimale allocatie voor crypto portfolio",
        generatedAt: new Date().toISOString(),
        results: {
          bitcoin: 40,
          ethereum: 25,
          altcoins: 20,
          stablecoins: 15,
          portfolioRisico: "Gemiddeld",
          verwachteVolatiliteit: "60-80%"
        }
      }
    }

    const reportId = `report_${Date.now()}`
    const reportType = type.replace('-', 'Vs').replace('-', '')
    
    // Get the appropriate report data
    const report = reportData[reportType as keyof typeof reportData]
    
    if (!report) {
      return NextResponse.json(
        { error: "Onbekend rapport type" },
        { status: 400 }
      )
    }

    // Mock PDF URL (in production this would be a real PDF)
    const pdfUrl = `/api/reports/${reportId}/download`

    return NextResponse.json({
      reportId,
      title: report.title,
      description: report.description,
      url: pdfUrl,
      downloadUrl: pdfUrl,
      generatedAt: report.generatedAt,
      type: type,
      status: "completed"
    })
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json(
      { error: "Interne server fout" },
      { status: 500 }
    )
  }
}