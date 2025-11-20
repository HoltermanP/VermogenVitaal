import { NextRequest, NextResponse } from "next/server"
import { fetchNewsForPage } from "@/lib/news-service"

export const dynamic = 'force-dynamic' // Zorg dat route altijd dynamisch is
export const revalidate = 0 // Geen cache

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path") || "/"
    const limit = parseInt(searchParams.get("limit") || "10")

    const articles = await fetchNewsForPage(path, limit)

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
    console.error("Error in news API:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen nieuws", articles: [] },
      { status: 500 }
    )
  }
}

