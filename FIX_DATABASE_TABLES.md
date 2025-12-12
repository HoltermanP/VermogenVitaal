# Fix: Database Tabellen Aanmaken

## Probleem
De error `The table public.users does not exist` betekent dat de database migraties nog niet zijn uitgevoerd, of dat er geen initiële migratie is die de basis tabellen aanmaakt.

## 🚀 Snelle Oplossing (Kies één methode)

### Optie 1: Via Vercel CLI (Aanbevolen)

```bash
# 1. Installeer Vercel CLI (eenmalig)
npm i -g vercel

# 2. Login
vercel login

# 3. Link project
vercel link

# 4. Haal productie DATABASE_URL op
vercel env pull .env.production

# 5. Push schema direct naar database (eenmalig)
npx prisma db push --skip-generate

# 6. Of gebruik migraties (als je initiële migratie hebt)
npx prisma migrate deploy
```

### Optie 2: Maak Initiele Migratie (Voor productie)

Als je database helemaal leeg is, moet je eerst een initiële migratie maken:

```bash
# Lokaal, met lokale DATABASE_URL (test database)
# Stel eerst lokale DATABASE_URL in
export DATABASE_URL="postgresql://user:password@localhost:5432/tax_wealth_hub"

# Maak initiële migratie
npx prisma migrate dev --name init

# Dit maakt een nieuwe migratie aan met alle tabellen
# Commit deze migratie naar git
git add prisma/migrations
git commit -m "Add initial database migration"
git push

# Dan in productie (via Vercel CLI):
vercel env pull .env.production
npx prisma migrate deploy
```

### Optie 3: Automatisch tijdens Build

1. Ga naar **Vercel Dashboard** > Je Project > **Settings** > **General**
2. Scroll naar **Build & Development Settings**
3. Update **Build Command** naar:
   ```bash
   prisma generate && prisma migrate deploy && next build --turbopack
   ```
4. Klik op **Save**
5. Ga naar **Deployments** en klik op **Redeploy**

**Let op:** Deze methode werkt alleen als je al een initiële migratie hebt gemaakt.

## ⚠️ Belangrijk: Eerste Keer Setup

Als je database helemaal leeg is (geen tabellen), gebruik dan eerst `prisma db push`:

```bash
# Via Vercel CLI
vercel env pull .env.production
npx prisma db push --skip-generate
```

Dit pusht het schema direct naar de database zonder migratie tracking. Daarna kun je migraties gebruiken voor toekomstige wijzigingen.

## ✅ Verificatie

Na het uitvoeren:

1. **Check Vercel logs** - geen errors meer over missing tables
2. **Test applicatie** - probeer in te loggen
3. **Check database** - tabellen zouden nu moeten bestaan

Je kunt ook lokaal checken:
```bash
vercel env pull .env.production
npx prisma studio
# Dit opent een GUI waar je alle tabellen kunt zien
```

## 🔍 Troubleshooting

**Als `prisma migrate deploy` faalt met "No migrations found":**
- Je hebt nog geen migraties gemaakt
- Gebruik eerst `npx prisma db push` om het schema te pushen
- Of maak een initiële migratie met `npx prisma migrate dev --name init`

**Als `prisma db push` faalt:**
- Controleer of `DATABASE_URL` correct is ingesteld
- Check of je database toegankelijk is
- Check Vercel logs voor specifieke errors

**Als je "Migration already applied" errors krijgt:**
- Dit is normaal als migraties al zijn uitgevoerd
- Check met `npx prisma migrate status`
















