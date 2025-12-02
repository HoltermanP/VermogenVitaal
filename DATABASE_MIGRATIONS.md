# Database Migraties in Productie

Deze gids legt uit hoe je database migraties uitvoert in productie, vooral voor Vercel deployments.

## 📋 Overzicht

Er zijn verschillende manieren om database migraties uit te voeren in productie:

1. **Automatisch tijdens build** (aanbevolen voor Vercel)
2. **Via Vercel CLI** (handmatig)
3. **Via lokale terminal** (met DATABASE_URL)
4. **Via database provider dashboard** (SQL scripts)

## 🚀 Methode 1: Automatisch tijdens Build (Aanbevolen)

Dit is de meest betrouwbare methode voor Vercel. Migraties worden automatisch uitgevoerd bij elke deployment.

### Stap 1: Update Build Command in Vercel

1. Ga naar **Vercel Dashboard** > Je Project > **Settings** > **General**
2. Scroll naar **Build & Development Settings**
3. Update het **Build Command** naar:
   ```bash
   prisma generate && prisma migrate deploy && next build --turbopack
   ```

Of als je de standaard build command wilt behouden, voeg dan een `postinstall` script toe aan `package.json` (al gedaan).

### Stap 2: Zorg dat DATABASE_URL is ingesteld

- Ga naar **Settings** > **Environment Variables**
- Zorg dat `DATABASE_URL` is ingesteld voor **Production** environment
- De URL moet verwijzen naar je productie database (niet localhost!)

### Stap 3: Deploy

Bij elke nieuwe deployment worden migraties automatisch uitgevoerd voordat de build start.

**Voordelen:**
- ✅ Automatisch bij elke deployment
- ✅ Geen handmatige stappen nodig
- ✅ Migraties worden altijd uitgevoerd voordat de app start

**Nadelen:**
- ⚠️ Als migraties falen, faalt de hele deployment
- ⚠️ Je moet wachten tot migraties klaar zijn voordat de app live gaat

## 🔧 Methode 2: Via Vercel CLI (Handmatig)

Als je migraties handmatig wilt uitvoeren voordat je deployt:

### Stap 1: Installeer Vercel CLI

```bash
npm i -g vercel
```

### Stap 2: Login

```bash
vercel login
```

### Stap 3: Link je project

```bash
vercel link
```

### Stap 4: Voer migraties uit

```bash
# Met productie DATABASE_URL
vercel env pull .env.production
npx prisma migrate deploy
```

Of gebruik het npm script:

```bash
npm run db:migrate:deploy
```

**Voordelen:**
- ✅ Controle over wanneer migraties worden uitgevoerd
- ✅ Kunt migraties testen voordat je deployt

**Nadelen:**
- ⚠️ Handmatige stap die je niet mag vergeten
- ⚠️ Vereist Vercel CLI installatie

## 💻 Methode 3: Via Lokale Terminal

Als je directe toegang hebt tot je productie database:

### Stap 1: Haal DATABASE_URL op uit Vercel

1. Ga naar **Vercel Dashboard** > Je Project > **Settings** > **Environment Variables**
2. Kopieer de `DATABASE_URL` waarde (of gebruik `vercel env pull`)

### Stap 2: Stel DATABASE_URL tijdelijk in

```bash
# Linux/Mac
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Windows (PowerShell)
$env:DATABASE_URL="postgresql://user:password@host:5432/database"

# Windows (CMD)
set DATABASE_URL=postgresql://user:password@host:5432/database
```

### Stap 3: Voer migraties uit

```bash
npx prisma migrate deploy
```

Of gebruik het npm script:

```bash
npm run db:migrate:deploy
```

**Voordelen:**
- ✅ Volledige controle
- ✅ Kunt output direct zien

**Nadelen:**
- ⚠️ Vereist lokale toegang tot database
- ⚠️ Moet DATABASE_URL handmatig kopiëren

## 🗄️ Methode 4: Via Database Provider Dashboard

Sommige database providers (zoals Supabase, Vercel Postgres) hebben een SQL editor waar je migraties handmatig kunt uitvoeren.

### Stap 1: Open migratie bestand

Migratie bestanden staan in `prisma/migrations/[timestamp]_[name]/migration.sql`

### Stap 2: Kopieer SQL

Open het migratie bestand en kopieer de SQL code.

### Stap 3: Voer uit in database dashboard

1. Ga naar je database provider dashboard
2. Open de SQL editor
3. Plak de SQL code
4. Voer uit

**Voordelen:**
- ✅ Volledige controle over SQL
- ✅ Kunt migraties aanpassen indien nodig

**Nadelen:**
- ⚠️ Handmatig en foutgevoelig
- ⚠️ Prisma weet niet dat migratie is uitgevoerd (kan problemen veroorzaken)

## 📝 Best Practices

### 1. Test Migraties Lokaal Eerst

Voordat je migraties in productie uitvoert:

```bash
# Test met lokale database
npm run db:migrate

# Controleer of alles werkt
npm run dev
```

### 2. Backup Database

Voordat je migraties uitvoert in productie, maak altijd een backup:

```bash
# Via pg_dump (PostgreSQL)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Gebruik Migrate Deploy (niet Migrate Dev)

In productie gebruik je altijd `prisma migrate deploy`, niet `prisma migrate dev`:

```bash
# ✅ Correct voor productie
npx prisma migrate deploy

# ❌ Niet gebruiken in productie
npx prisma migrate dev
```

### 4. Controleer Migratie Status

```bash
# Zie welke migraties zijn uitgevoerd
npx prisma migrate status
```

### 5. Rollback Plan

Als een migratie faalt:

1. **Stop de deployment** (als je Methode 1 gebruikt)
2. **Fix het probleem** lokaal
3. **Test opnieuw** lokaal
4. **Voer opnieuw uit** in productie

Voor complexe rollbacks, gebruik database backups.

## 🔍 Troubleshooting

### Probleem: "Migration failed"

**Oplossing:**
- Check Vercel logs voor specifieke error
- Test migratie lokaal met productie DATABASE_URL
- Controleer of DATABASE_URL correct is ingesteld

### Probleem: "Can't reach database server"

**Oplossing:**
- Controleer of DATABASE_URL correct is ingesteld
- Zorg dat database niet naar localhost verwijst
- Check firewall/network instellingen

### Probleem: "Migration already applied"

**Oplossing:**
- Dit is normaal als migratie al is uitgevoerd
- Gebruik `prisma migrate status` om te controleren
- Als je migratie opnieuw wilt uitvoeren, gebruik `prisma migrate resolve`

### Probleem: "Schema drift detected"

**Oplossing:**
- Dit betekent dat database schema niet overeenkomt met Prisma schema
- Gebruik `prisma db pull` om huidige schema te synchroniseren
- Of gebruik `prisma migrate reset` (alleen in development!)

## 📚 Gerelateerde Commands

```bash
# Genereer Prisma client
npm run db:generate

# Zie migratie status
npx prisma migrate status

# Markeer migratie als opgelost (bij problemen)
npx prisma migrate resolve --applied [migration_name]

# Reset database (alleen development!)
npx prisma migrate reset

# Zie database schema
npx prisma studio
```

## 🎯 Aanbevolen Workflow

Voor nieuwe migraties:

1. **Development:**
   ```bash
   # Maak migratie
   npm run db:migrate
   
   # Test lokaal
   npm run dev
   ```

2. **Commit & Push:**
   ```bash
   git add prisma/migrations
   git commit -m "Add database migration: [description]"
   git push
   ```

3. **Productie (automatisch):**
   - Vercel detecteert nieuwe migraties
   - Voert automatisch `prisma migrate deploy` uit tijdens build
   - App start alleen als migraties succesvol zijn

## ⚠️ Belangrijke Waarschuwingen

1. **Gebruik NOOIT `prisma db push` in productie** - dit overschrijft je schema zonder migratie tracking
2. **Gebruik NOOIT `prisma migrate reset` in productie** - dit verwijdert alle data!
3. **Test altijd eerst lokaal** voordat je migraties in productie uitvoert
4. **Maak altijd backups** voordat je migraties uitvoert in productie

## 📞 Hulp Nodig?

Als je problemen hebt met migraties:

1. Check Vercel logs voor specifieke errors
2. Test migratie lokaal met productie DATABASE_URL
3. Controleer `PRODUCTION_TROUBLESHOOTING.md` voor database connectie problemen
4. Gebruik `npx prisma migrate status` om migratie status te controleren

