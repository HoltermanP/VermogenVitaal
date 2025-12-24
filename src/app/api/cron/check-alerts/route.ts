import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendAlertNotifications } from "@/lib/notification-service"

// Helper functie om koers op te halen
async function getStockQuote(symbol: string) {
  try {
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

// GET - Cron job endpoint voor automatische alert checks
// Deze wordt aangeroepen door Vercel Cron Jobs
export async function GET(request: NextRequest) {
  try {
    // Verifieer dat dit een cron job request is (optioneel: check Authorization header)
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    // Haal alle portfolio items op met alerts enabled
    const portfolioItems = await prisma.portfolioItem.findMany({
      where: {
        alertEnabled: true,
        alertThreshold: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            whatsappNumber: true,
          },
        },
      },
    })

    let alertsProcessed = 0
    let notificationsSent = 0

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
          alertsProcessed++

          // Verstuur notificaties
          try {
            const notificationType = item.alertNotificationType || 'EMAIL'
            const result = await sendAlertNotifications(
              {
                symbol: item.symbol,
                name: item.name,
                changePercent: changePercent,
                currentPrice: currentPrice,
                previousPrice: item.lastPrice,
                type: changePercent > 0 ? 'gain' : 'loss',
                userEmail: item.user.email,
                userName: item.user.name || undefined,
              },
              notificationType,
              item.user.whatsappNumber || null
            )

            if (result.emailSent || result.whatsappSent) {
              notificationsSent++
            }
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

    return NextResponse.json({
      success: true,
      alertsProcessed,
      notificationsSent,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in cron job checking alerts:", error)
    return NextResponse.json(
      { error: "Fout bij controleren alerts" },
      { status: 500 }
    )
  }
}

