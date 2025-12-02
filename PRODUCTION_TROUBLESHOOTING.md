# Productie Troubleshooting Guide

## 401 Unauthorized Errors in Productie

### Google OAuth / OAuth Providers

Als je via Google (of andere OAuth provider) bent ingelogd en je krijgt 401 errors:

1. **Controleer Clerk Dashboard**:
   - Ga naar je Clerk Dashboard > Users
   - Zoek je gebruiker (via email)
   - Controleer of de gebruiker een geldige sessie heeft
   - Controleer of de email is geverifieerd

2. **OAuth Provider Configuratie**:
   - In Clerk Dashboard > User & Authentication > Social Connections
   - Zorg dat Google OAuth is ingeschakeld
   - Controleer of de OAuth credentials correct zijn ingesteld
   - Voor productie: gebruik productie OAuth credentials (niet test credentials)

3. **Email Verificatie**:
   - Voor OAuth providers moet de email mogelijk worden geverifieerd
   - Controleer in Clerk Dashboard of de email status "Verified" is

4. **Sessie Problemen**:
   - Probeer uit te loggen en opnieuw in te loggen
   - Clear browser cookies en cache
   - Test in een incognito venster

## 401 Unauthorized Errors in Productie (Algemeen)

Als je 401 errors krijgt in productie bij het gebruik van Deep Research of andere API routes, controleer het volgende:

### 1. Clerk Environment Variables

Zorg dat de volgende environment variables zijn ingesteld in Vercel (of je hosting platform):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

**Belangrijk:**
- Gebruik `pk_live_...` en `sk_live_...` voor productie (niet `pk_test_...`)
- Zorg dat beide variabelen zijn ingesteld
- Controleer in Vercel: Settings > Environment Variables

### 2. Clerk Dashboard Configuratie

In het Clerk Dashboard:
1. Ga naar je applicatie
2. Ga naar "Domains"
3. Voeg je productie domain toe (bijv. `vermogen-vitaal.vercel.app`)
4. Zorg dat de domain is geverifieerd

### 3. CORS en Cookies

De applicatie gebruikt nu `credentials: "include"` in alle fetch calls om cookies correct door te geven.

Als je nog steeds problemen hebt:
- Controleer of cookies worden geblokkeerd door browser instellingen
- Test in een incognito venster
- Controleer browser console voor CORS errors

### 4. Middleware Configuratie

De middleware markeert `/api/stocks(.*)` als public route, wat betekent dat de route zelf authenticatie afhandelt. Dit is correct geconfigureerd.

### 5. Debugging in Productie

De applicatie logt nu uitgebreide informatie in productie. Check de Vercel logs voor:
- `getClerkUser: Request info` - toont of cookies aanwezig zijn
- `getClerkUser: No userId from auth()` - toont authenticatie problemen
- `Deep Research API: Geen gebruiker gevonden` - toont waar authenticatie faalt

### 6. Clerk Telemetry CORS Warning

De CORS warning voor `clerk-telemetry.com` is niet kritisch. Dit is Clerk's telemetrie service en heeft geen invloed op de functionaliteit. Je kunt dit negeren of uitschakelen in Clerk Dashboard.

### 7. Database Connectie Problemen

#### Error: "the URL must start with the protocol `postgresql://` or `postgres://`"

Als je deze error krijgt:
```
error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
```

**Oorzaak:** De `DATABASE_URL` environment variabele is leeg, ongeldig, of bevat onzichtbare karakters.

**Oplossing:**
1. Ga naar **Vercel Dashboard** > Je Project > **Settings** > **Environment Variables**
2. Zoek naar `DATABASE_URL`
3. **Verwijder** de bestaande waarde (als deze bestaat)
4. **Voeg opnieuw toe** met de correcte waarde:
   - Klik op "Add New" of "Edit"
   - Key: `DATABASE_URL`
   - Value: Je database connection string (moet beginnen met `postgresql://` of `postgres://`)
   - Environment: Selecteer **Production** (en eventueel Preview/Development)
5. **Herdeploy** je applicatie

**Voorbeelden van correcte DATABASE_URL:**
```env
# Vercel Postgres
DATABASE_URL="postgres://default:password@host.vercel-storage.com:5432/verceldb"

# Supabase
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"

# Andere PostgreSQL provider
DATABASE_URL="postgresql://username:password@your-db-host.com:5432/database_name"
```

**Veelvoorkomende fouten:**
- ❌ Lege waarde
- ❌ Spaties voor/na de URL
- ❌ Verkeerde protocol (bijv. `https://` in plaats van `postgresql://`)
- ❌ Vergeten quotes (als je via CLI instelt)

#### Error: "Can't reach database server at `localhost:5432`"

Als je deze error krijgt:
```
Can't reach database server at `localhost:5432`
```

Dit betekent dat de `DATABASE_URL` environment variabele nog steeds naar localhost verwijst.

#### Oplossing:

1. **Controleer DATABASE_URL in Vercel**:
   - Ga naar Vercel Dashboard > Je Project > Settings > Environment Variables
   - Zoek naar `DATABASE_URL`
   - Zorg dat deze is ingesteld voor "Production" environment
   - De URL moet verwijzen naar een externe database (niet localhost)

2. **Voorbeelden van correcte DATABASE_URL**:
   ```env
   # Vercel Postgres
   DATABASE_URL="postgres://default:password@host.vercel-storage.com:5432/verceldb"
   
   # Supabase
   DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
   
   # Andere PostgreSQL provider
   DATABASE_URL="postgresql://username:password@your-db-host.com:5432/database_name"
   ```

3. **Verkeerde DATABASE_URL (zal niet werken in productie)**:
   ```env
   # ❌ Dit werkt alleen lokaal, niet in productie!
   DATABASE_URL="postgresql://username:password@localhost:5432/tax_wealth_hub"
   ```

4. **Na het instellen van DATABASE_URL**:
   - Herdeploy je applicatie in Vercel
   - De applicatie zal nu automatisch controleren of DATABASE_URL correct is ingesteld
   - Als DATABASE_URL naar localhost verwijst in productie, krijg je een duidelijke error

5. **Database Migraties Uitvoeren**:
   
   Zie `DATABASE_MIGRATIONS.md` voor uitgebreide instructies. Kort samengevat:
   
   **Optie A: Automatisch tijdens build (aanbevolen)**:
   - Update Build Command in Vercel naar: `prisma generate && prisma migrate deploy && next build --turbopack`
   - Migraties worden automatisch uitgevoerd bij elke deployment
   
   **Optie B: Handmatig via Vercel CLI**:
   ```bash
   vercel env pull .env.production
   npm run db:migrate:deploy
   ```
   
   **Optie C: Via lokale terminal**:
   ```bash
   # Stel DATABASE_URL in (kopieer uit Vercel dashboard)
   export DATABASE_URL="postgresql://..."
   npm run db:migrate:deploy
   ```

6. **Test Database Connectie**:
   De applicatie test nu automatisch de database connectie bij startup in development mode.
   In productie worden errors gelogd in Vercel logs.

### 8. Test Checklist

Voordat je deployt naar productie:
- [ ] Clerk environment variables zijn ingesteld (live keys)
- [ ] Productie domain is toegevoegd aan Clerk Dashboard
- [ ] **DATABASE_URL is ingesteld en verwijst naar productie database (niet localhost)**
- [ ] Database migraties zijn uitgevoerd (`prisma migrate deploy`)
- [ ] Database is bereikbaar vanuit productie
- [ ] Alle andere environment variables zijn ingesteld (OPENAI_API_KEY, etc.)

### 9. Veelvoorkomende Problemen

**Probleem:** 401 errors bij alle API calls
**Oplossing:** Controleer of `CLERK_SECRET_KEY` is ingesteld (niet alleen `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)

**Probleem:** Cookies worden niet meegestuurd
**Oplossing:** Zorg dat `credentials: "include"` is toegevoegd aan fetch calls (al gedaan)

**Probleem:** Authenticatie werkt lokaal maar niet in productie
**Oplossing:** Controleer of je live keys gebruikt (niet test keys) en of je domain is toegevoegd aan Clerk

**Probleem:** Database connectie errors (`Can't reach database server at localhost:5432`)
**Oplossing:** 
- Controleer of `DATABASE_URL` is ingesteld in Vercel environment variables
- Zorg dat `DATABASE_URL` verwijst naar een externe database (niet localhost)
- Herdeploy na het instellen van `DATABASE_URL`
- Zie sectie 7 voor gedetailleerde instructies

**Probleem:** "the URL must start with the protocol `postgresql://` or `postgres://`"
**Oplossing:**
- De `DATABASE_URL` is leeg of ongeldig
- Ga naar Vercel Settings > Environment Variables
- Verwijder en voeg `DATABASE_URL` opnieuw toe met correcte waarde
- Zorg dat de URL begint met `postgresql://` of `postgres://`
- Controleer op onzichtbare spaties of karakters
- Herdeploy na het instellen

**Probleem:** "The table `public.users` does not exist"
**Oplossing:**
- Database migraties zijn nog niet uitgevoerd
- Zie `FIX_DATABASE_TABLES.md` voor uitgebreide instructies
- Snelle oplossing:
  ```bash
  vercel env pull .env.production
  npx prisma db push --skip-generate
  ```
- Of voer migraties uit:
  ```bash
  vercel env pull .env.production
  npx prisma migrate deploy
  ```

### 10. Vercel Specifieke Instellingen

In Vercel:
1. Ga naar je project
2. Settings > Environment Variables
3. Zorg dat variabelen zijn ingesteld voor "Production"
4. Herdeploy na het toevoegen van variabelen

### 11. Contact

Als het probleem blijft bestaan na het volgen van deze stappen:
1. Check Vercel logs voor specifieke error messages
2. Check Clerk Dashboard voor authenticatie events
3. Controleer browser console voor client-side errors

