import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Valideer DATABASE_URL voordat we Prisma client initialiseren
function validateDatabaseUrl(): string | null {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    const errorMessage = 
      'DATABASE_URL environment variable is not set. ' +
      'Please set DATABASE_URL in your environment variables. ' +
      'Go to Vercel Dashboard > Settings > Environment Variables > Add DATABASE_URL'
    console.error('❌ Prisma initialization error:', errorMessage)
    
    // In productie, gooi een error zodat het probleem duidelijk is
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
      throw new Error(errorMessage)
    }
    
    // In development, waarschuw maar crash niet
    console.warn('⚠️  Warning:', errorMessage)
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
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
      throw new Error(errorMessage)
    }
    
    // In development, waarschuw maar crash niet
    console.warn('⚠️  Warning:', errorMessage)
    return null
  }
  
  // Waarschuw als DATABASE_URL naar localhost verwijst in productie
  // Maar alleen tijdens runtime, niet tijdens build-time
  if ((process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') && 
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
try {
  const url = validateDatabaseUrl()
  if (url) {
    console.log('✅ DATABASE_URL is configured')
  }
} catch (error) {
  // In productie gooien we de error door zodat deployment faalt
  // MAAR alleen tijdens runtime, niet tijdens build-time
  // NEXT_PHASE is undefined tijdens build, waardoor we weten dat we tijdens build zijn
  if ((process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') && 
      process.env.NEXT_PHASE !== undefined) {
    throw error
  }
  // Tijdens build of development loggen we alleen
  console.error('Database configuration error:', error instanceof Error ? error.message : String(error))
}

// Maak Prisma client met connection pool configuratie voor productie
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'pretty',
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Test database connectie bij startup (alleen in development)
if (process.env.NODE_ENV === 'development') {
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connection successful')
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error.message)
      console.error('Make sure your database is running and DATABASE_URL is correct')
    })
}
