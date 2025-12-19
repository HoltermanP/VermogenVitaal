import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Valideer DATABASE_URL voordat we Prisma client initialiseren
function validateDatabaseUrl(): string | null {
  const databaseUrl = process.env.DATABASE_URL
  const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.VERCEL_ENV
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
  
  if (!databaseUrl) {
    // In productie, gooi een error zodat het probleem duidelijk is
    if (isProduction) {
      const errorMessage = 
        'DATABASE_URL environment variable is not set. ' +
        'Please set DATABASE_URL in your environment variables. ' +
        'Go to Vercel Dashboard > Settings > Environment Variables > Add DATABASE_URL'
      console.error('❌ Prisma initialization error:', errorMessage)
      throw new Error(errorMessage)
    }
    
    // In development, geef een vriendelijke instructie maar crash niet
    console.warn('⚠️  DATABASE_URL is niet ingesteld')
    console.warn('📝 Maak een .env.local bestand aan met:')
    console.warn('   DATABASE_URL="postgresql://username:password@localhost:5432/tax_wealth_hub"')
    console.warn('   Zie env.example voor alle benodigde variabelen')
    return null
  }
  
  // Trim whitespace (soms zijn er onzichtbare spaties)
  const trimmedUrl = databaseUrl.trim()
  
  // Valideer dat URL begint met correct protocol
  if (!trimmedUrl.startsWith('postgresql://') && !trimmedUrl.startsWith('postgres://')) {
    const errorMessage = 
      'DATABASE_URL must start with "postgresql://" or "postgres://". ' +
      `Current value: "${trimmedUrl.substring(0, 20)}..." (truncated). ` +
      'Please check Vercel Settings > Environment Variables > DATABASE_URL. ' +
      'The URL should look like: postgresql://user:password@host:5432/database'
    console.error('❌ Prisma initialization error:', errorMessage)
    
    // In productie, gooi een error
    if (isProduction) {
      throw new Error(errorMessage)
    }
    
    // In development, waarschuw maar crash niet
    console.warn('⚠️  Warning:', errorMessage)
    return null
  }
  
  // Waarschuw als DATABASE_URL naar localhost verwijst in productie
  // Maar alleen tijdens runtime, niet tijdens build-time
  if (isProduction && 
      !process.env.NEXT_PHASE && // NEXT_PHASE is undefined tijdens build
      typeof window === 'undefined') { // Alleen server-side
    if (trimmedUrl.includes('localhost') || trimmedUrl.includes('127.0.0.1')) {
      const errorMessage = 
        'DATABASE_URL cannot point to localhost in production. ' +
        'Please configure a production database URL in your environment variables. ' +
        'Check Vercel Settings > Environment Variables > DATABASE_URL'
      console.error('❌ Prisma initialization error:', errorMessage)
      throw new Error(errorMessage)
    }
  }
  
  return trimmedUrl
}

// Valideer DATABASE_URL bij initialisatie
const databaseUrl = validateDatabaseUrl()
const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.VERCEL_ENV

if (databaseUrl) {
  console.log('✅ DATABASE_URL is configured')
}

// Maak Prisma client met connection pool configuratie
const createPrismaClient = () => {
  // In development, als DATABASE_URL niet is ingesteld, gebruik een dummy URL
  // Dit voorkomt crashes tijdens initialisatie, maar queries zullen falen met een duidelijke error
  const url = databaseUrl || 'postgresql://localhost:5432/temp?connect_timeout=1'
  
  return new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'pretty',
  })
}

// Initialiseer Prisma client
const prismaClient = globalForPrisma.prisma ?? createPrismaClient()

export const prisma = prismaClient

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient
}

// Test database connectie bij startup (alleen in development en als DATABASE_URL is ingesteld)
if (isDevelopment && databaseUrl) {
  prismaClient.$connect()
    .then(() => {
      console.log('✅ Database connection successful')
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error.message)
      console.error('Zorg dat je database draait en DATABASE_URL correct is ingesteld in .env.local')
    })
}
