import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { analyzeTransactionsWithAI } from "@/lib/audit-service"
import OpenAI from "openai"
import type { Session } from "next-auth"

export async function POST(request: NextRequest) {
  // Declareer variabelen voor error handling
  let auditId: string | null = null
  let dbAvailable = false
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NEXTAUTH_SECRET
  
  try {
    // In Next.js 15, getServerSession kan headers nodig hebben
    let session: Session | null = null
    try {
      session = await getServerSession(authOptions)
    } catch (error) {
      console.log('Session check failed, using development fallback:', error)
    }
    
    let userEmail = session?.user?.email
    
    // Development fallback: als er geen sessie is, gebruik test email
    if (!userEmail && isDevelopment) {
      userEmail = 'test@example.com'
      console.log('Development mode: using test email for authentication')
    }
    
    if (!userEmail) {
      return NextResponse.json({ error: "Niet geautoriseerd. Log in om analyses uit te voeren." }, { status: 401 })
    }

    // Check eerst of database beschikbaar is
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let user: any = null
    
    // Probeer database connectie te testen
    try {
      await prisma.$queryRaw`SELECT 1`
      dbAvailable = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (dbError: any) {
      console.log('Database not available:', dbError.message)
      dbAvailable = false
    }
    
    if (dbAvailable) {
      try {
        user = await prisma.user.findUnique({
          where: { email: userEmail }
        })

        // In development mode, maak gebruiker aan als deze niet bestaat
        if (!user && isDevelopment) {
          try {
            user = await prisma.user.create({
              data: {
                email: userEmail,
                name: 'Test Gebruiker',
                role: 'USER',
                tier: 'FREE'
              }
            })
            console.log('Development mode: created test user')
          } catch (createError) {
            console.error('Failed to create user:', createError)
            user = { id: 'dev-user-id', email: userEmail } as any
            console.log('Development mode: using mock user')
          }
        }
      } catch (dbError) {
        console.error('Database query error:', dbError)
        dbAvailable = false
      }
    }
    
    // Als database niet beschikbaar is, gebruik mock user in development
    if (!user && !dbAvailable && isDevelopment) {
      user = { id: 'dev-user-id', email: userEmail } as any
      console.log('Development mode: using mock user (database unavailable)')
    }
    
    if (!user && !isDevelopment) {
      return NextResponse.json({ 
        error: "Database niet beschikbaar en niet in development mode" 
      }, { status: 503 })
    }
    
    if (!user) {
      return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 })
    }

    // Check OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is niet geconfigureerd. Voeg OPENAI_API_KEY toe aan je .env.local bestand." },
        { status: 500 }
      )
    }
    
    // Valideer dat de API key geen placeholder is
    if (openaiApiKey.includes('your_') || openaiApiKey.includes('********') || openaiApiKey.length < 20) {
      return NextResponse.json(
        { error: "OpenAI API key is ongeldig. Je moet een echte API key gebruiken van https://platform.openai.com/account/api-keys. De huidige key lijkt een placeholder te zijn." },
        { status: 500 }
      )
    }

    const body = await request.json()
    auditId = body.auditId
    const { answers, transactions: transactionsFromBody } = body

    if (!auditId) {
      return NextResponse.json({ error: "Audit ID is verplicht" }, { status: 400 })
    }

    // Gebruik BV 2025 als default als er geen antwoorden zijn
    const defaultAnswers = {
      legalForm: "BV",
      taxYear: "2025",
      "Wat is de rechtsvorm van je onderneming? (EMZ/BV/DGA)": "BV",
      "Wat is het belastingjaar van deze administratie?": "2025"
    }
    
    const finalAnswers = answers && Object.keys(answers).length > 0 ? answers : defaultAnswers

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let auditCheck: any = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let transactions: any[] = []
    
    if (dbAvailable) {
      try {
        auditCheck = await prisma.auditCheck.findUnique({
          where: { id: auditId, userId: user.id }
        })
        
        if (auditCheck) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          transactions = auditCheck.csvData as any[]
          
          // Start analyse
          await prisma.auditCheck.update({
            where: { id: auditId },
            data: { status: "ANALYZING" }
          })
        }
      } catch (dbError) {
        console.error('Database error in analyze:', dbError)
        dbAvailable = false
      }
    }
    
    // In development mode zonder database, gebruik transactions uit request body
    if (!auditCheck && !dbAvailable && isDevelopment) {
      console.log('Development mode: using transactions from request body')
      if (auditId.startsWith('dev-') && transactionsFromBody && Array.isArray(transactionsFromBody)) {
        transactions = transactionsFromBody
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        auditCheck = { id: auditId, status: "ANALYZING" } as any
        console.log(`Using ${transactions.length} transactions from request body`)
      } else {
        return NextResponse.json({ 
          error: "In development mode zonder database zijn transacties nodig. Upload het bestand opnieuw." 
        }, { status: 400 })
      }
    }
    
    if (!auditCheck && !isDevelopment) {
      return NextResponse.json({ error: "Audit niet gevonden" }, { status: 404 })
    }
    
    if (!auditCheck) {
      return NextResponse.json({ error: "Audit niet gevonden" }, { status: 404 })
    }

    // Valideer dat we transacties hebben
    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ 
        error: "Geen transacties gevonden om te analyseren" 
      }, { status: 400 })
    }

    console.log(`Starting AI analysis for ${transactions.length} transactions`)

    // Voer AI analyse uit
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let findings: any[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let recommendations: any = null
    
    try {
      const openai = new OpenAI({ apiKey: openaiApiKey })
      console.log('Starting AI analysis...')
      console.log(`- Transactions: ${transactions.length}`)
      console.log(`- Answers: ${Object.keys(finalAnswers).length} questions answered`)
      console.log(`- Legal form: ${finalAnswers.legalForm || finalAnswers["Wat is de rechtsvorm van je onderneming? (EMZ/BV/DGA)"] || "BV"}`)
      console.log(`- Tax year: ${finalAnswers.taxYear || finalAnswers["Wat is het belastingjaar van deze administratie?"] || "2025"}`)
      
      const result = await analyzeTransactionsWithAI(
        transactions,
        finalAnswers,
        openai
      )
      findings = result.findings
      recommendations = result.recommendations
      console.log(`AI analysis completed successfully: ${findings.length} findings, ${recommendations.critical?.length || 0} critical issues`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (aiError: any) {
      console.error('AI analysis error in route:', aiError)
      console.error('Error stack:', aiError instanceof Error ? aiError.stack : 'No stack')
      
      // Als de analyse functie zelf al een fallback heeft gegeven, gebruik die
      // Anders gooi de error door
      if (aiError.message && aiError.message.includes('Fallback')) {
        // De analyse functie heeft al een fallback resultaat gegeven
        throw aiError
      }
      
      // Probeer zelf een fallback analyse
      console.log('Attempting fallback analysis...')
      const openai = new OpenAI({ apiKey: openaiApiKey })
      const result = await analyzeTransactionsWithAI(
        transactions,
        finalAnswers,
        openai
      )
      findings = result.findings
      recommendations = result.recommendations
      console.log('Fallback analysis completed')
    }

    // Sla resultaten op (alleen als database beschikbaar is)
    let updated = { id: auditId, status: "COMPLETED" }
    
    if (dbAvailable) {
      try {
        updated = await prisma.auditCheck.update({
          where: { id: auditId },
          data: {
            status: "COMPLETED",
            questions: answers,
            findings: findings,
            recommendations: recommendations
          }
        })
      } catch (dbError) {
        console.error('Failed to save results to database:', dbError)
        // In development mode kunnen we doorgaan zonder database
        if (!isDevelopment) {
          return NextResponse.json({ 
            error: "Kon resultaten niet opslaan in database" 
          }, { status: 500 })
        }
      }
    }

    return NextResponse.json({
      id: updated.id,
      findings,
      recommendations,
      status: updated.status
    })
  } catch (error) {
    console.error("Analyse error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    
    // Update status naar ERROR als er een audit check bestaat en database beschikbaar is
    // Note: We kunnen request body niet opnieuw lezen, dus gebruiken we auditId uit scope
    if (auditId && dbAvailable) {
      try {
        await prisma.auditCheck.update({
          where: { id: auditId },
          data: { status: "ERROR" }
        }).catch((updateError) => {
          console.error('Failed to update audit check status:', updateError)
        })
      } catch {
        // Ignore errors in error handling
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Fout bij analyseren"
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? (error instanceof Error ? error.stack : undefined) 
      : undefined

    console.error("Returning error response:", errorMessage)

    return NextResponse.json(
      { 
        error: errorMessage,
        ...(errorDetails && { details: errorDetails })
      },
      { status: 500 }
    )
  }
}

