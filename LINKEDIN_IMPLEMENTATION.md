# LinkedIn Posts Implementatie

## ✅ Wat is geïmplementeerd

### 1. Database Schema
- ✅ `LinkedInPost` model toegevoegd aan Prisma schema
- ✅ `LinkedInPostStatus` enum (DRAFT, SCHEDULED, POSTED, FAILED, CANCELLED)
- ✅ Migratie bestand aangemaakt: `prisma/migrations/20250101000000_add_linkedin_posts/migration.sql`

### 2. Backend
- ✅ `src/lib/linkedin-content-generator.ts` - AI-powered content generator
- ✅ `/api/linkedin/generate` - POST endpoint om posts te genereren
- ✅ `/api/linkedin/posts` - GET endpoint om posts op te halen

### 3. Frontend
- ✅ `/admin/linkedin` - Admin pagina om posts te beheren
- ✅ Tabs voor Concepten, Gepland, Gepubliceerd, Alles
- ✅ Detail view om volledige content te bekijken
- ✅ Knop om 5 posts te genereren

## 🚀 Database Migratie Uitvoeren

### Optie 1: Via Prisma Migrate (Aanbevolen)
```bash
# Zorg dat je database draait en DATABASE_URL is ingesteld in .env
npx prisma migrate deploy
```

### Optie 2: Via Prisma DB Push (Development)
```bash
# Voor development - overschrijft schema direct
npx prisma db push
```

### Optie 3: Via Script
```bash
chmod +x scripts/run-migration.sh
./scripts/run-migration.sh
```

## 📋 Environment Variables

Zorg dat deze variabelen zijn ingesteld in `.env.local`:

```env
# Vereist voor content generatie
OPENAI_API_KEY="sk-..."

# App URL voor call-to-actions in posts
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# Of voor productie:
# NEXT_PUBLIC_APP_URL="https://taxwealthhub.nl"

# Database (als je lokaal werkt)
DATABASE_URL="postgresql://username:password@localhost:5432/tax_wealth_hub"
```

## 🧪 Testen

1. **Start de development server:**
   ```bash
   npm run dev
   ```

2. **Ga naar de admin pagina:**
   ```
   http://localhost:3000/admin/linkedin
   ```

3. **Genereer 5 test posts:**
   - Klik op de knop "Genereer 5 Posts"
   - Wacht tot de posts zijn gegenereerd (kan 15-30 seconden duren)
   - Bekijk de gegenereerde posts in de "Concepten" tab

4. **Bekijk post details:**
   - Klik op "Bekijk" bij een post om de volledige content te zien
   - Gebruik "Kopieer Content" om de content te kopiëren

## 📝 Features

### Automatische Content Generatie
- Genereert gevarieerde posts over verschillende onderwerpen
- Gebruikt kennisbank artikelen voor context
- Automatische variatie in topics (belasting, vermogen, ondernemen, etc.)
- Natuurlijke call-to-action naar je app

### Onderwerpen
De generator gebruikt deze categorieën:
- **Belasting**: Inkomstenbelasting, vennootschapsbelasting, aftrekposten
- **Vermogen**: Box 3, ETF, beleggen, vermogensopbouw
- **Ondernemen**: BV vs EMZ, rechtsvorm, DGA optimalisatie
- **Vastgoed**: Cashflow, yield, rendement
- **Crypto**: Digitale valuta, box 3
- **Tips**: Belastingplanning, optimalisatie, deadlines

### Post Status
- **DRAFT**: Concept, nog niet gepland
- **SCHEDULED**: Gepland voor publicatie
- **POSTED**: Gepubliceerd op LinkedIn
- **FAILED**: Publicatie mislukt
- **CANCELLED**: Geannuleerd

## 🔄 Volgende Stappen (Later)

### Automatische Publicatie
Wanneer je klaar bent om automatisch te publiceren:

1. **LinkedIn API Setup:**
   - Maak LinkedIn Developer App
   - Vraag `w_member_social` permission aan
   - Verkrijg access token en person URN

2. **Environment Variables toevoegen:**
   ```env
   LINKEDIN_ACCESS_TOKEN="your-token"
   LINKEDIN_PERSON_URN="urn:li:person:your-id"
   CRON_SECRET="your-secret"
   ```

3. **Cron Jobs configureren:**
   - Voeg cron jobs toe aan `vercel.json`
   - Automatische generatie: Elke maandag om 10:00
   - Automatische publicatie: Elk uur

## 🐛 Troubleshooting

### Database migratie faalt
- Controleer of je database draait
- Controleer DATABASE_URL in .env
- Probeer `npx prisma db push` voor development

### Posts worden niet gegenereerd
- Controleer of OPENAI_API_KEY is ingesteld
- Check console voor errors
- Zorg dat kennisbank artikelen bestaan in database

### Admin pagina laadt niet
- Controleer of alle dependencies zijn geïnstalleerd: `npm install`
- Check of Tabs component bestaat: `src/components/ui/tabs.tsx`

## 📚 Documentatie

- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [OpenAI API](https://platform.openai.com/docs)
- [LinkedIn API](https://learn.microsoft.com/en-us/linkedin/)

