import { NextRequest, NextResponse } from "next/server"
import { fetchNewsForPage } from "@/lib/news-service"

export const dynamic = 'force-dynamic' // Zorg dat route altijd dynamisch is
export const revalidate = 0 // Geen cache

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path") || "/"
    const limit = parseInt(searchParams.get("limit") || "10")

    console.log(`[News API] Request received for path: ${path}, limit: ${limit}`)
    console.log(`[News API] NEWS_API_KEY configured: ${!!process.env.NEWS_API_KEY}`)

    const articles = await fetchNewsForPage(path, limit)

    console.log(`[News API] Returning ${articles.length} articles`)

    return NextResponse.json({
      articles,
      count: articles.length
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Onbekende fout"
    console.error("[News API] Error in news API route:", errorMessage)
    console.error("[News API] Error stack:", error instanceof Error ? error.stack : undefined)
    return NextResponse.json(
      { error: "Fout bij ophalen nieuws", articles: [] },
      { status: 500 }
    )
  }
}

