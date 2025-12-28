import { NextRequest, NextResponse } from "next/server"
import { getClerkUser } from "@/lib/clerk-auth"
import { prisma } from "@/lib/prisma"
import { sendAlertNotifications } from "@/lib/notification-service"

// Helper functie om koers op te halen (hergebruik van quote route)
async function getStockQuote(symbol: string) {
  try {
    // Converteer Nederlandse symbolen naar Yahoo Finance format
    const dutchSymbols: Record<string, string> = {
      ASML: "ASML.AS",
      INGA: "INGA.AS",
      PHIA: "PHIA.AS",
      UNA: "UNA.AS",
      RDSA: "RDSA.AS",
    }
    const yahooSymbol = dutchSymbols[symbol] || symbol

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (!data.chart?.result?.[0]?.meta?.regularMarketPrice) {
      return null
    }

    return data.chart.result[0].meta.regularMarketPrice
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    return null
  }
}

// POST - Check alle portfolio items voor alerts
export async function POST(request: NextRequest) {
  try {
    const user = await getClerkUser(request)
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    // Haal gebruiker op voor email en whatsapp nummer
    let dbUser
    try {
      dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { email: true, name: true, whatsappNumber: true },
      })
    } catch (error) {
      // Fallback als whatsappNumber kolom nog niet bestaat
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('whatsappNumber')) {
        dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { email: true, name: true },
        })
        if (dbUser) {
          // Voeg null toe voor whatsappNumber
          dbUser = { ...dbUser, whatsappNumber: null }
        }
      } else {
        throw error
      }
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden" },
        { status: 404 }
      )
    }

    // Haal alle portfolio items op met alerts enabled
    const portfolioItems = await prisma.portfolioItem.findMany({
      where: {
        userId: user.id,
        alertEnabled: true,
        alertThreshold: { not: null },
      },
      include: {
        user: {
          select: { 
            email: true, 
            name: true, 
            whatsappNumber: true,
          },
        },
      },
    })

    const alerts: Array<{
      id: string
      symbol: string
      name: string
      changePercent: number
      currentPrice: number
      previousPrice: number
      type: 'gain' | 'loss'
    }> = []

    // Check elk item
    for (const item of portfolioItems) {
      if (!item.alertThreshold || !item.lastPrice) {
        // Als er nog geen lastPrice is, haal de huidige prijs op en sla op
        const currentPrice = await getStockQuote(item.symbol)
        if (currentPrice) {
          await prisma.portfolioItem.update({
            where: { id: item.id },
            data: { lastPrice: currentPrice },
          })
        }
        continue
      }

      // Haal huidige prijs op
      const currentPrice = await getStockQuote(item.symbol)
      if (!currentPrice) {
        continue
      }

      // Bereken percentage verandering
      const changePercent = ((currentPrice - item.lastPrice) / item.lastPrice) * 100
      const absChangePercent = Math.abs(changePercent)

      // Check of alert threshold is bereikt
      if (absChangePercent >= item.alertThreshold) {
        // Check of we niet te recent een alert hebben gehad (binnen 1 uur)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const shouldAlert = !item.lastAlertAt || item.lastAlertAt < oneHourAgo

        if (shouldAlert) {
          const alertData = {
            id: item.id,
            symbol: item.symbol,
            name: item.name,
            changePercent: changePercent,
            currentPrice: currentPrice,
            previousPrice: item.lastPrice,
            type: changePercent > 0 ? 'gain' : 'loss' as 'gain' | 'loss',
          }

          alerts.push(alertData)

          // Verstuur notificaties
          try {
            const notificationType = item.alertNotificationType || 'EMAIL'
            await sendAlertNotifications(
              {
                ...alertData,
                userEmail: dbUser.email,
                userName: dbUser.name || undefined,
              },
              notificationType,
              dbUser.whatsappNumber || null
            )
          } catch (notificationError) {
            console.error("Fout bij verzenden notificaties:", notificationError)
            // Ga door, update wel de lastAlertAt zodat we niet te vaak proberen
          }

          // Update lastPrice en lastAlertAt
          await prisma.portfolioItem.update({
            where: { id: item.id },
            data: {
              lastPrice: currentPrice,
              lastAlertAt: new Date(),
            },
          })
        }
      } else {
        // Update alleen lastPrice als er geen alert is
        await prisma.portfolioItem.update({
          where: { id: item.id },
          data: { lastPrice: currentPrice },
        })
      }
    }

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("Error checking alerts:", error)
    return NextResponse.json(
      { error: "Fout bij controleren alerts" },
      { status: 500 }
    )
  }
}

