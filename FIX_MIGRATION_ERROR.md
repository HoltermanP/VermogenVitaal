# Fix: Migration Failed - Users Table Does Not Exist

## Probleem
De migratie `20250120120000_add_deep_research_reports` faalt omdat de `users` tabel nog niet bestaat. Er is geen initiële migratie die eerst alle basis tabellen aanmaakt.

## 🚀 Snelle Oplossing voor Productie

### Stap 1: Resolve Failed Migration

Eerst moet je de failed migratie markeren als resolved:

```bash
# Via Vercel CLI (aanbevolen)
vercel env pull .env.production
export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-)

# Markeer de failed migratie als rolled back
npx prisma migrate resolve --rolled-back 20250120120000_add_deep_research_reports
```

### Stap 2: Push Volledige Schema naar Database

Gebruik `prisma db push` om het volledige schema direct te pushen (maakt alle tabellen aan):

```bash
# Zorg dat DATABASE_URL is ingesteld (zie Stap 1)
npx prisma db push --skip-generate --accept-data-loss
```

Dit maakt alle tabellen aan zonder migratie tracking.

### Stap 3: Reset Migratie State (Optioneel)

Als je migratie tracking wilt resetten:

```bash
# Verwijder de _prisma_migrations tabel (als deze bestaat)
# Via Neon SQL Editor of psql:
# DROP TABLE IF EXISTS "_prisma_migrations";

# Markeer alle bestaande migrations als applied
npx prisma migrate resolve --applied 20240101000000_init
npx prisma migrate resolve --applied 20250101000000_add_linkedin_posts
npx prisma migrate resolve --applied 20250120120000_add_deep_research_reports
npx prisma migrate resolve --applied 20251129102225_add_symbol_index_to_deep_research
npx prisma migrate resolve --applied 20251129115045_add_portfolio_items
```

## 🔄 Alternatieve Oplossing: Maak Initiele Migratie

Als je migratie tracking wilt behouden, maak dan eerst een initiële migratie:

### Via Neon SQL Editor:

1. Ga naar je Neon Dashboard > SQL Editor
2. Voer het volgende SQL script uit (maakt alle basis tabellen aan):

```sql
-- Create all enums first
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "UserTier" AS ENUM ('FREE', 'BASIC', 'PRO', 'ELITE');
CREATE TYPE "LegalForm" AS ENUM ('EMZ', 'BV', 'DGA');
CREATE TYPE "RiskProfile" AS ENUM ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE');
CREATE TYPE "ScenarioType" AS ENUM ('BV_VS_EMZ', 'ETF_GROWTH', 'REAL_ESTATE', 'CRYPTO_ALLOCATION');
CREATE TYPE "DocumentType" AS ENUM ('TAX_RETURN', 'SALARY', 'YEAR_END_STATEMENT', 'OTHER');
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'REVIEWED', 'SUBMITTED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED');
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');
CREATE TYPE "AuditStatus" AS ENUM ('UPLOADED', 'QUESTIONS_PENDING', 'ANALYZING', 'COMPLETED', 'ERROR');
CREATE TYPE "AccountingProvider" AS ENUM ('EXACT_ONLINE', 'E_BOEKHOUDEN', 'MONEYBIRD', 'AFAS', 'YUKI', 'JORTT', 'VISMA', 'SNELSTART');
CREATE TYPE "LinkedInPostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'POSTED', 'FAILED', 'CANCELLED');
CREATE TYPE "DeepResearchStatus" AS ENUM ('GENERATING', 'COMPLETED', 'FAILED');

-- Create users table first (basis tabel)
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "tier" "UserTier" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Create all other tables (zie prisma/schema.prisma voor volledige schema)
-- ... (voeg hier alle andere tabellen toe)
```

3. Markeer de initiële migratie als applied:
```bash
npx prisma migrate resolve --applied 20240101000000_init
```

## ✅ Verificatie

Na het uitvoeren van de oplossing:

1. Check of alle tabellen zijn aangemaakt:
```bash
npx prisma studio
```

2. Check migratie status:
```bash
npx prisma migrate status
```

3. Test de applicatie - probeer in te loggen

## 📝 Belangrijk

- **Gebruik `prisma db push` alleen voor de eerste keer** - dit maakt alle tabellen aan zonder migratie tracking
- **Voor toekomstige wijzigingen**, gebruik altijd `prisma migrate dev` en `prisma migrate deploy`
- **Maak altijd backups** voordat je migrations uitvoert in productie

## 🔍 Troubleshooting

### Error: "Migration already applied"
```bash
npx prisma migrate resolve --applied [migration_name]
```

### Error: "Schema drift detected"
```bash
# Pull huidige schema van database
npx prisma db pull

# Of reset migrations (alleen development!)
npx prisma migrate reset
```



















