import { NextRequest, NextResponse } from "next/server"
import { fetchNewsForPage } from "@/lib/news-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path") || "/"
    const limit = parseInt(searchParams.get("limit") || "10")

    const articles = await fetchNewsForPage(path, limit)

    return NextResponse.json({
      articles,
      count: articles.length
    })
  } catch (error) {
    console.error("Error in news API:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen nieuws", articles: [] },
      { status: 500 }
    )
  }
}

