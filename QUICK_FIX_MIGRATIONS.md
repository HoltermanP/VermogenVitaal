# Snelle Oplossing: Database Tabellen Aanmaken

Je krijgt de error: `The table public.users does not exist` omdat de database migraties nog niet zijn uitgevoerd.

## 🚀 Snelle Oplossing (Kies één methode)

### Optie 1: Via Vercel CLI (Aanbevolen - Snelst)

```bash
# 1. Installeer Vercel CLI (eenmalig)
npm i -g vercel

# 2. Login
vercel login

# 3. Link project (als je dit nog niet hebt gedaan)
vercel link

# 4. Haal environment variables op
vercel env pull .env.production

# 5. Voer migraties uit
npx prisma migrate deploy
```

### Optie 2: Automatisch tijdens Build (Voor toekomstige deployments)

1. Ga naar **Vercel Dashboard** > Je Project > **Settings** > **General**
2. Scroll naar **Build & Development Settings**
3. Update **Build Command** naar:
   ```bash
   prisma generate && prisma migrate deploy && next build --turbopack
   ```
4. Klik op **Save**
5. Ga naar **Deployments** en klik op **Redeploy**

### Optie 3: Via Database Provider Dashboard (Als je SQL editor hebt)

Als je database provider een SQL editor heeft (zoals Supabase), kun je het schema direct pushen:

```bash
# Lokaal: Genereer SQL van je schema
npx prisma db push --skip-generate

# Of gebruik prisma migrate dev om een initiële migratie te maken
npx prisma migrate dev --name init
```

Dan kopieer je de gegenereerde SQL en voer je deze uit in je database dashboard.

## ⚠️ Belangrijk

Als je database helemaal leeg is (geen tabellen), moet je eerst een initiële migratie maken:

```bash
# Lokaal, met lokale DATABASE_URL
npx prisma migrate dev --name init

# Dit maakt een nieuwe migratie aan met alle tabellen
# Commit deze migratie naar git
git add prisma/migrations
git commit -m "Add initial database migration"
git push

# Dan in productie:
npx prisma migrate deploy
```

## ✅ Verificatie

Na het uitvoeren van migraties:

1. Check Vercel logs - je zou geen errors meer moeten zien
2. Test de applicatie - probeer in te loggen
3. Check database - tabellen zouden nu moeten bestaan

## 🔍 Troubleshooting

**Als `prisma migrate deploy` faalt met "No migrations found":**
- Je hebt waarschijnlijk nog geen migraties gemaakt
- Gebruik eerst `npx prisma migrate dev --name init` lokaal
- Commit en push de migraties
- Voer dan `prisma migrate deploy` uit in productie

**Als je "Migration already applied" errors krijgt:**
- Dit is normaal als migraties al zijn uitgevoerd
- Check met `npx prisma migrate status`
























