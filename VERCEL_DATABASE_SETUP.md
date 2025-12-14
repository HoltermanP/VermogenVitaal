# Vercel Database Setup - Snelle Gids

Als je de error krijgt: `the URL must start with the protocol postgresql:// or postgres://`, betekent dit dat `DATABASE_URL` niet correct is ingesteld in Vercel.

## 🚀 Snelle Oplossing

### Stap 1: Ga naar Vercel Environment Variables

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecteer je project (`vermogen-vitaal`)
3. Ga naar **Settings** (in de bovenste navigatie)
4. Klik op **Environment Variables** (in de linker sidebar)

### Stap 2: Controleer DATABASE_URL

1. Zoek naar `DATABASE_URL` in de lijst
2. **Als deze bestaat maar leeg is of verkeerd:**
   - Klik op de drie puntjes (⋯) naast `DATABASE_URL`
   - Kies **Delete**
   - Bevestig verwijdering

### Stap 3: Voeg DATABASE_URL toe

1. Klik op **Add New**
2. Vul in:
   - **Key:** `DATABASE_URL`
   - **Value:** Je database connection string (zie hieronder voor voorbeelden)
   - **Environment:** Selecteer **Production** (en eventueel **Preview** en **Development**)
3. Klik op **Save**

### Stap 4: Herdeploy

1. Ga naar **Deployments** tab
2. Klik op de drie puntjes (⋯) naast de laatste deployment
3. Kies **Redeploy**
4. Of push een nieuwe commit naar GitHub (Vercel deployt automatisch)

## 📋 Database Connection String Voorbeelden

### Vercel Postgres

Als je Vercel Postgres gebruikt:

1. Ga naar je project in Vercel Dashboard
2. Klik op **Storage** tab
3. Klik op je Postgres database
4. Ga naar **.env.local** tab
5. Kopieer de `POSTGRES_URL` waarde
6. Gebruik deze als `DATABASE_URL`

Voorbeeld:
```env
DATABASE_URL="postgres://default:password@host.vercel-storage.com:5432/verceldb"
```

### Supabase

Als je Supabase gebruikt:

1. Ga naar [Supabase Dashboard](https://app.supabase.com)
2. Selecteer je project
3. Ga naar **Settings** > **Database**
4. Scroll naar **Connection string**
5. Kies **URI** (niet **JDBC**)
6. Kopieer de connection string
7. Vervang `[YOUR-PASSWORD]` met je database password

Voorbeeld:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

### Andere PostgreSQL Providers

Voor andere providers (bijv. Railway, Render, Neon, etc.):

1. Ga naar je database provider dashboard
2. Zoek naar "Connection String" of "Database URL"
3. Kopieer de connection string
4. Zorg dat deze begint met `postgresql://` of `postgres://`

Voorbeeld format:
```env
DATABASE_URL="postgresql://username:password@host:5432/database_name"
```

## ✅ Verificatie

Na het instellen van `DATABASE_URL`:

1. **Check Vercel Logs:**
   - Ga naar **Deployments** > Klik op laatste deployment > **Logs**
   - Zoek naar: `✅ DATABASE_URL is configured`
   - Als je deze ziet, is de configuratie correct!

2. **Test de Applicatie:**
   - Probeer in te loggen
   - Test een API endpoint die de database gebruikt
   - Check of er geen database errors meer zijn in de logs

## ⚠️ Veelvoorkomende Fouten

### Fout 1: Lege waarde
- **Symptoom:** Error over missing protocol
- **Oplossing:** Zorg dat `DATABASE_URL` een waarde heeft (niet leeg)

### Fout 2: Spaties
- **Symptoom:** Error over missing protocol
- **Oplossing:** Zorg dat er geen spaties voor/na de URL zijn

### Fout 3: Verkeerde Environment
- **Symptoom:** Werkt lokaal maar niet in productie
- **Oplossing:** Zorg dat `DATABASE_URL` is ingesteld voor **Production** environment

### Fout 4: Verkeerde Protocol
- **Symptoom:** Error over missing protocol
- **Oplossing:** URL moet beginnen met `postgresql://` of `postgres://` (niet `https://`)

### Fout 5: Localhost in Productie
- **Symptoom:** `Can't reach database server at localhost:5432`
- **Oplossing:** Gebruik een externe database URL (niet localhost)

## 🔍 Debugging

Als het nog steeds niet werkt:

1. **Check Vercel Logs:**
   ```
   Vercel Dashboard > Deployments > [Latest] > Logs
   ```
   Zoek naar errors met "DATABASE_URL" of "Prisma"

2. **Test Lokaal:**
   ```bash
   # Haal environment variables op
   vercel env pull .env.production
   
   # Check DATABASE_URL
   echo $DATABASE_URL
   
   # Test Prisma connectie
   npx prisma db pull
   ```

3. **Check Environment Variables:**
   - Ga naar Vercel Dashboard > Settings > Environment Variables
   - Controleer of `DATABASE_URL` bestaat
   - Controleer of deze is ingesteld voor Production
   - Controleer of de waarde correct is (begint met `postgresql://`)

## 📞 Hulp Nodig?

Als je nog steeds problemen hebt:

1. Check `PRODUCTION_TROUBLESHOOTING.md` voor meer informatie
2. Check Vercel logs voor specifieke error messages
3. Test de database connectie lokaal met `vercel env pull`

## 🎯 Checklist

Voordat je deployt:

- [ ] `DATABASE_URL` is ingesteld in Vercel
- [ ] `DATABASE_URL` begint met `postgresql://` of `postgres://`
- [ ] `DATABASE_URL` is ingesteld voor **Production** environment
- [ ] `DATABASE_URL` verwijst naar een externe database (niet localhost)
- [ ] Geen spaties voor/na de URL
- [ ] Applicatie is herdeployed na het instellen van `DATABASE_URL`

















