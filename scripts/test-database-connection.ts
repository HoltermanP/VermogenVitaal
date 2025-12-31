// Script om database connectie te testen
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

// Laad environment variabelen
config({ path: '.env.local' })

// Als .env.local niet bestaat of DATABASE_URL niet heeft, probeer .env
if (!process.env.DATABASE_URL) {
  try {
    const envContent = readFileSync('.env', 'utf-8')
    const lines = envContent.split('\n')
    for (const line of lines) {
      if (line.startsWith('DATABASE_URL=')) {
        const [, value] = line.split('=', 2)
        process.env.DATABASE_URL = value.replace(/["']/g, '')
        break
      }
    }
  } catch (error) {
    // .env bestand bestaat niet, ga verder
  }
}

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n')

  // Controleer DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is niet ingesteld')
    console.error('📝 Maak een .env.local bestand aan met:')
    console.error('   DATABASE_URL="postgresql://username:password@localhost:5432/database"')
    return false
  }

  console.log('✅ DATABASE_URL is ingesteld')

  // Controleer of URL begint met correct protocol
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    console.error('❌ DATABASE_URL moet beginnen met "postgresql://" of "postgres://"')
    console.error(`📝 Huidige waarde begint met: "${databaseUrl.substring(0, 20)}..."`)
    return false
  }

  console.log('✅ DATABASE_URL heeft correct protocol')

  // Controleer of het niet naar localhost verwijst in productie
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
  if (isProduction && (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1'))) {
    console.error('❌ DATABASE_URL mag niet naar localhost verwijzen in productie')
    console.error('📝 Gebruik een externe database URL (bijv. Neon, Supabase, etc.)')
    return false
  }

  if (!isProduction) {
    console.log('✅ DATABASE_URL is geschikt voor productie')
  }

  // Test de daadwerkelijke connectie
  console.log('🔌 Testing database connectie...')

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl.trim(),
      },
    },
    log: ['error', 'warn'],
  })

  try {
    // Test connectie met een simpele query
    await prisma.$connect()
    console.log('✅ Database connectie succesvol!')

    // Test een simpele query
    const userCount = await prisma.user.count()
    console.log(`✅ Database query succesvol (users: ${userCount})`)

    // Sluit connectie
    await prisma.$disconnect()
    console.log('✅ Database connectie gesloten')

    return true
  } catch (error) {
    console.error('❌ Database connectie mislukt:')
    console.error(`   Error: ${error.message}`)

    if (error.code === 'P1001') {
      console.error('📝 Mogelijke oorzaken:')
      console.error('   - Database server draait niet')
      console.error('   - Firewall blokkeert connectie')
      console.error('   - DATABASE_URL is incorrect')
      console.error('   - Database credentials zijn verkeerd')
    } else if (error.code === 'P2002') {
      console.error('📝 Mogelijke oorzaken:')
      console.error('   - Database schema mismatch')
      console.error('   - Migraties moeten worden uitgevoerd')
    }

    return false
  }
}

// Run de test
testDatabaseConnection()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Database connectie test geslaagd!')
      process.exit(0)
    } else {
      console.log('\n💥 Database connectie test mislukt!')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('\n💥 Onverwachte fout tijdens test:', error)
    process.exit(1)
  })
