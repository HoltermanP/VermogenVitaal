"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Newspaper, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface NewsArticle {
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
  imageUrl?: string
  isFallback?: boolean
}

interface NewsTickerProps {
  pagePath: string
  className?: string
}

export function NewsTicker({ pagePath, className }: NewsTickerProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadNews() {
      try {
        // Voeg timestamp toe om cache te omzeilen
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/news?path=${encodeURIComponent(pagePath)}&_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        if (response.ok) {
          const data = await response.json()
          const articles = data.articles || []
          const fallbackCount = articles.filter((a: NewsArticle) => a.isFallback).length
          const realCount = articles.length - fallbackCount
          
          if (fallbackCount > 0) {
            console.warn(`[NewsTicker] ⚠️ ${fallbackCount} fallback artikelen geladen (API werkt niet)`)
          } else {
            console.log(`[NewsTicker] ✅ ${realCount} echte artikelen geladen van API`)
          }
          
          setArticles(articles)
        } else {
          // Bij 404 of andere errors, gebruik fallback of lege array
          if (response.status === 404) {
            console.warn(`[NewsTicker] ⚠️ News API route niet gevonden (404). Dit kan gebeuren tijdens development.`)
          } else {
            console.warn(`[NewsTicker] ⚠️ API response not OK: ${response.status} ${response.statusText}`)
          }
          // Stel lege array in zodat component niet crasht
          setArticles([])
        }
      } catch (error) {
        // Bij network errors of andere fouten, gebruik lege array
        console.warn("[NewsTicker] ⚠️ Error loading news:", error instanceof Error ? error.message : "Unknown error")
        setArticles([])
      } finally {
        setIsLoading(false)
      }
    }

    // Laad direct bij mount
    loadNews()

    // Poll elke 4 uur voor nieuwe nieuwsberichten
    const interval = setInterval(() => {
      loadNews()
    }, 14400000) // 4 uur (4 * 60 * 60 * 1000 milliseconden)

    return () => clearInterval(interval)
  }, [pagePath])

  // Rotate through articles
  useEffect(() => {
    if (articles.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length)
    }, 6000) // Change every 6 seconds

    return () => clearInterval(interval)
  }, [articles.length])

  if (isLoading) {
    return (
      <Card className={cn("bg-gradient-to-r from-blue-600/10 to-blue-700/10 border-blue-500/20 shadow-xl", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md animate-pulse">
              <Newspaper className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (articles.length === 0) {
    return null
  }

  const currentArticle = articles[currentIndex]

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return "Net gepubliceerd"
      if (diffInHours < 24) return `${diffInHours} uur geleden`
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `${diffInDays} dag${diffInDays > 1 ? 'en' : ''} geleden`
      return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })
    } catch {
      return "Recent"
    }
  }

  return (
    <Card className={cn("bg-gradient-to-r from-blue-600/10 via-blue-700/10 to-blue-600/10 border-blue-500/30 shadow-xl hover:shadow-blue-500/20 transition-all duration-500 overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent" />
          
          <div className="relative p-4">
            <div className="flex items-center gap-4">
              {/* Image - smaller */}
              {currentArticle.imageUrl ? (
                <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden shadow-md border border-blue-500/20 relative bg-gradient-to-br from-blue-600 to-blue-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentArticle.imageUrl}
                    alt={currentArticle.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide image on error, show icon instead
                      e.currentTarget.style.display = 'none'
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg></div>'
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md border border-blue-500/20">
                  <Newspaper className="h-8 w-8 text-white" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-600 border-blue-500/30 text-xs">
                    <Newspaper className="h-3 w-3 mr-1" />
                    Nieuws
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {currentArticle.source}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(currentArticle.publishedAt)}
                  </div>
                </div>

                {/* Title - compact */}
                <a
                  href={currentArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <h3 className="text-base font-semibold text-foreground group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                    {currentArticle.title}
                  </h3>
                </a>

                {/* Description - single line */}
                {currentArticle.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {currentArticle.description}
                  </p>
                )}
              </div>

              {/* Navigation - horizontal dots */}
              <div className="flex gap-1.5 flex-shrink-0">
                {articles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      index === currentIndex
                        ? "bg-blue-600 w-2 h-2 shadow-md shadow-blue-500/50"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={`Ga naar artikel ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
