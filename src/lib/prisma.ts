import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Valideer DATABASE_URL - alleen server-side en tijdens runtime
function validateDatabaseUrl(): string {
  // Alleen server-side validatie
  if (typeof window !== 'undefined') {
    throw new Error('Prisma client can only be used server-side')
  }

  const databaseUrl = process.env.DATABASE_URL
  const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.VERCEL_ENV
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
  
  // Tijdens build-time (NEXT_PHASE is undefined), skip validatie
  // Environment variables zijn mogelijk niet beschikbaar tijdens build
  const isBuildTime = process.env.NEXT_PHASE === undefined && !process.env.VERCEL
  
  if (!databaseUrl) {
    // Tijdens build-time, gebruik een dummy URL om crashes te voorkomen
    if (isBuildTime) {
      console.warn('⚠️  DATABASE_URL not available during build, using placeholder')
      return 'postgresql://localhost:5432/temp?connect_timeout=1'
    }
    
    // In productie runtime, gooi een error
    if (isProduction) {
      const errorMessage = 
        'DATABASE_URL environment variable is not set. ' +
        'Please set DATABASE_URL in your environment variables. ' +
        'Go to Vercel Dashboard > Settings > Environment Variables > Add DATABASE_URL'
      console.error('❌ Prisma initialization error:', errorMessage)
      throw new Error(errorMessage)
    }
    
    // In development runtime, geef een waarschuwing maar gebruik dummy URL
    console.warn('⚠️  DATABASE_URL is niet ingesteld')
    console.warn('📝 Maak een .env.local bestand aan met:')
    console.warn('   DATABASE_URL="postgresql://username:password@localhost:5432/tax_wealth_hub"')
    console.warn('   Zie env.example voor alle benodigde variabelen')
    return 'postgresql://localhost:5432/temp?connect_timeout=1'
  }
  
  // Trim whitespace (soms zijn er onzichtbare spaties)
  const trimmedUrl = databaseUrl.trim()
  
  // Valideer dat URL begint met correct protocol
  if (!trimmedUrl.startsWith('postgresql://') && !trimmedUrl.startsWith('postgres://')) {
    // Tijdens build-time, gebruik dummy URL
    if (isBuildTime) {
      console.warn('⚠️  DATABASE_URL format invalid during build, using placeholder')
      return 'postgresql://localhost:5432/temp?connect_timeout=1'
    }
    
    const errorMessage = 
      'DATABASE_URL must start with "postgresql://" or "postgres://". ' +
      `Current value: "${trimmedUrl.substring(0, 20)}..." (truncated). ` +
      'Please check Vercel Settings > Environment Variables > DATABASE_URL. ' +
      'The URL should look like: postgresql://user:password@host:5432/database'
    console.error('❌ Prisma initialization error:', errorMessage)
    
    // In productie runtime, gooi een error
    if (isProduction) {
      throw new Error(errorMessage)
    }
    
    // In development runtime, waarschuw maar gebruik dummy URL
    console.warn('⚠️  Warning:', errorMessage)
    return 'postgresql://localhost:5432/temp?connect_timeout=1'
  }
  
  // Waarschuw als DATABASE_URL naar localhost verwijst in productie (alleen runtime)
  if (isProduction && !isBuildTime) {
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

// Lazy initialization - valideer alleen wanneer Prisma client wordt gebruikt
let prismaClient: PrismaClient | null = null
let databaseUrlCache: string | null = null

function getPrismaClient(): PrismaClient {
  // Alleen server-side
  if (typeof window !== 'undefined') {
    throw new Error('Prisma client can only be used server-side')
  }

  // Hergebruik bestaande client
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  if (prismaClient) {
    return prismaClient
  }

  // Valideer en haal DATABASE_URL op
  databaseUrlCache = validateDatabaseUrl()
  
  // Maak Prisma client
  prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrlCache,
      },
    },
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'pretty',
  })

  // Cache voor development
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient
  }

  // Log alleen als DATABASE_URL geldig is (niet tijdens build)
  if (databaseUrlCache && !databaseUrlCache.includes('temp') && typeof window === 'undefined') {
    console.log('✅ DATABASE_URL is configured')
  }

  return prismaClient
}

// Export prisma met lazy initialization
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = (client as any)[prop]
    
    // Als het een functie is, bind de context
    if (typeof value === 'function') {
      return value.bind(client)
    }
    
    return value
  }
})

// Test database connectie bij eerste gebruik (alleen in development en als DATABASE_URL is ingesteld)
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  // Test asynchroon om startup niet te blokkeren
  setTimeout(() => {
    const url = process.env.DATABASE_URL
    if (url && !url.includes('temp')) {
      getPrismaClient().$connect()
        .then(() => {
          console.log('✅ Database connection successful')
        })
        .catch((error) => {
          console.error('❌ Database connection failed:', error.message)
          console.error('Zorg dat je database draait en DATABASE_URL correct is ingesteld in .env.local')
        })
    }
  }, 1000)
}
