import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseCSV, parseXAF, generateQuestionsWithAI } from "@/lib/audit-service"
import OpenAI from "openai"
import type { Session } from "next-auth"

export async function POST(request: NextRequest) {
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
    if (!userEmail && (process.env.NODE_ENV === 'development' || !process.env.NEXTAUTH_SECRET)) {
      userEmail = 'test@example.com'
      console.log('Development mode: using test email for authentication')
    }
    
    if (!userEmail) {
      return NextResponse.json({ error: "Niet geautoriseerd. Log in om bestanden te uploaden." }, { status: 401 })
    }

    // Check eerst of database beschikbaar is
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NEXTAUTH_SECRET
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let user: any = null
    
    // Probeer database connectie te testen
    let dbAvailable = false
    try {
      // Test database connectie met een simpele query
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
            // Fallback naar mock user
            user = { id: 'dev-user-id', email: userEmail } as { id: string; email: string }
            console.log('Development mode: using mock user (create failed)')
          }
        }
      } catch (dbError) {
        console.error('Database query error:', dbError)
        dbAvailable = false
      }
    }
    
    // Als database niet beschikbaar is, gebruik mock user in development
    if (!user && !dbAvailable && isDevelopment) {
      user = { id: 'dev-user-id', email: userEmail } as { id: string; email: string }
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

    console.log('Received upload request')
    
    let formData
    try {
      formData = await request.formData()
      console.log('FormData parsed successfully')
    } catch (formError) {
      console.error('Error parsing formData:', formError)
      return NextResponse.json({ 
        error: "Fout bij lezen van upload: " + (formError instanceof Error ? formError.message : "Onbekende fout") 
      }, { status: 400 })
    }

    const file = formData.get("file") as File | null
    console.log('File from formData:', file ? { name: file.name, size: file.size, type: file.type } : 'null')

    if (!file) {
      console.error('No file found in formData')
      return NextResponse.json({ 
        error: "Geen bestand geüpload. Zorg ervoor dat je een bestand selecteert voordat je uploadt." 
      }, { status: 400 })
    }

    if (file.size === 0) {
      return NextResponse.json({ 
        error: "Het geüploade bestand is leeg" 
      }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    const isCSV = fileName.endsWith(".csv")
    const isXAF = fileName.endsWith(".xaf") || fileName.endsWith(".xml")

    console.log('File validation:', { fileName, isCSV, isXAF })

    if (!isCSV && !isXAF) {
      return NextResponse.json({ 
        error: `Alleen CSV of XAF (XML) audit bestanden zijn toegestaan. Geüploade bestand: ${file.name}` 
      }, { status: 400 })
    }

    let text: string
    try {
      text = await file.text()
      console.log('File content read, length:', text.length)
    } catch (readError) {
      console.error('Error reading file content:', readError)
      return NextResponse.json({ 
        error: "Fout bij lezen van bestand: " + (readError instanceof Error ? readError.message : "Onbekende fout") 
      }, { status: 400 })
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ 
        error: "Bestand is leeg" 
      }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let transactions: any[]

    try {
      console.log('Parsing file as:', isXAF ? 'XAF' : 'CSV')
      if (isXAF) {
        transactions = parseXAF(text)
      } else {
        transactions = parseCSV(text)
      }
      console.log('Parsing successful, found', transactions.length, 'transactions')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error parsing file:', error)
      return NextResponse.json({ 
        error: `Bestand kon niet worden geparsed: ${error.message || "Onbekende fout"}` 
      }, { status: 400 })
    }

    if (transactions.length === 0) {
      // Log uitgebreide debugging informatie
      const preview = text.substring(0, 1000)
      console.error('='.repeat(80))
      console.error('NO TRANSACTIONS FOUND - Debugging Information')
      console.error('='.repeat(80))
      console.error('File name:', file.name)
      console.error('File type detected:', isXAF ? 'XAF/XML' : 'CSV')
      console.error('File size:', text.length, 'characters')
      console.error('File preview (first 1000 chars):', preview)
      console.error('File preview (last 500 chars):', text.substring(Math.max(0, text.length - 500)))
      
      // Voor XAF bestanden, probeer de XML structuur te loggen
      if (isXAF) {
        try {
          const { XMLParser } = await import('fast-xml-parser')
          const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            removeNSPrefix: true,
            parseAttributeValue: true
          })
          const xmlData = parser.parse(text)
          
          // Log de volledige structuur (eerste 3000 karakters)
          const structurePreview = JSON.stringify(xmlData, null, 2).substring(0, 3000)
          console.error('XML structure preview (first 3000 chars):', structurePreview)
          
          // Log alle top-level keys
          console.error('Top-level keys:', Object.keys(xmlData))
          if (xmlData.AuditFile) {
            console.error('AuditFile keys:', Object.keys(xmlData.AuditFile))
            if (xmlData.AuditFile.GeneralLedgerEntries) {
              console.error('GeneralLedgerEntries keys:', Object.keys(xmlData.AuditFile.GeneralLedgerEntries))
            }
            if (xmlData.AuditFile.MasterFiles) {
              console.error('MasterFiles keys:', Object.keys(xmlData.AuditFile.MasterFiles))
            }
          }
          
          // Tel alle arrays in de structuur
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const countArrays = (obj: any, depth: number = 0, path: string = ''): { path: string, count: number }[] => {
            const results: { path: string, count: number }[] = []
            if (depth > 5) return results
            
            if (Array.isArray(obj)) {
              results.push({ path, count: obj.length })
              if (obj.length > 0 && typeof obj[0] === 'object') {
                obj.forEach((item, idx) => {
                  results.push(...countArrays(item, depth + 1, `${path}[${idx}]`))
                })
              }
            } else if (obj && typeof obj === 'object') {
              Object.keys(obj).forEach(key => {
                results.push(...countArrays(obj[key], depth + 1, path ? `${path}.${key}` : key))
              })
            }
            return results
          }
          
          const arrayCounts = countArrays(xmlData)
          const significantArrays = arrayCounts.filter(ac => ac.count > 0).sort((a, b) => b.count - a.count).slice(0, 20)
          console.error(`Found ${arrayCounts.length} arrays. Top 20 by size:`, significantArrays)
        } catch (parseError) {
          console.error('Error parsing XML for debugging:', parseError)
        }
      }
      
      console.error('='.repeat(80))
      
      return NextResponse.json({ 
        error: `Bestand bevat geen herkenbare transacties. Gevonden: ${transactions.length} transacties. Bestand type: ${isXAF ? 'XAF/XML' : 'CSV'}, Grootte: ${text.length} karakters. Bekijk de server terminal logs voor gedetailleerde informatie over de XML structuur.` 
      }, { status: 400 })
    }

    // Maak audit check record (of gebruik mock ID in development zonder database)
    let auditCheckId = 'dev-audit-id'
    let auditStatus = "QUESTIONS_PENDING"
    
    if (dbAvailable) {
      try {
        const auditCheck = await prisma.auditCheck.create({
          data: {
            userId: user.id,
            fileName: file.name,
            csvData: transactions,
            status: "QUESTIONS_PENDING"
          }
        })
        auditCheckId = auditCheck.id
        auditStatus = auditCheck.status
      } catch (dbError) {
        console.error('Failed to create audit check in database:', dbError)
        dbAvailable = false
      }
    }
    
    if (!dbAvailable && !isDevelopment) {
      return NextResponse.json({ 
        error: "Database niet beschikbaar. Controleer je database connectie." 
      }, { status: 503 })
    }
    
    if (!dbAvailable) {
      console.log('Development mode: continuing without database storage')
      // Genereer een unieke ID voor development
      auditCheckId = `dev-audit-${Date.now()}`
    }

    // Genereer aanvullende vragen met AI
    const openai = new OpenAI({ apiKey: openaiApiKey })
    const questions = await generateQuestionsWithAI(transactions, openai)

    // Stuur altijd transacties mee zodat de gebruiker ze kan zien in de tabel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = {
      id: auditCheckId,
      questions,
      status: auditStatus,
      transactions: transactions // Stuur altijd transacties mee
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fout bij uploaden" },
      { status: 500 }
    )
  }
}

