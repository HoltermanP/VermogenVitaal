# Vercel DATABASE_URL Checklist

## Probleem
De error "DATABASE_URL environment variable is not set" verschijnt in productie, ook al is DATABASE_URL ingesteld in Vercel.

## Oplossing

### Stap 1: Controleer DATABASE_URL in Vercel Dashboard

1. Ga naar [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecteer je project (`vermogen-vitaal`)
3. Ga naar **Settings** → **Environment Variables**
4. Zoek naar `DATABASE_URL`

### Stap 2: Verifieer Environment Settings

**BELANGRIJK**: Zorg dat `DATABASE_URL` is ingesteld voor **Production** environment:

- ✅ **Production** moet aangevinkt zijn
- ✅ **Preview** (optioneel, maar aanbevolen)
- ✅ **Development** (optioneel, voor lokale tests)

### Stap 3: Controleer de Waarde

De `DATABASE_URL` moet:
- Beginnen met `postgresql://` of `postgres://`
- Geen spaties bevatten voor/na de URL
- Volledig zijn (niet afgekapt)

**Voorbeeld voor NEON database:**
```
postgresql://username:password@ep-xxxxx-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Stap 4: Herdeploy na Wijzigingen

Als je `DATABASE_URL` hebt aangepast of toegevoegd:

1. Ga naar **Deployments** tab
2. Klik op de drie puntjes (⋯) naast de laatste deployment
3. Kies **Redeploy**
4. Of: Push een nieuwe commit naar GitHub (Vercel deployt automatisch)

### Stap 5: Verifieer in Logs

Na deployment, check de logs:

1. Ga naar **Deployments** → Selecteer de laatste deployment
2. Klik op **View Function Logs** of **View Build Logs**
3. Zoek naar: `✅ DATABASE_URL is configured`

Als je deze melding ziet, is alles correct ingesteld.

## Veelvoorkomende Problemen

### Probleem 1: DATABASE_URL is alleen ingesteld voor Development
**Oplossing**: Zorg dat **Production** is aangevinkt bij het instellen van de environment variable.

### Probleem 2: DATABASE_URL bevat onzichtbare karakters
**Oplossing**: 
1. Verwijder de environment variable
2. Voeg opnieuw toe door de waarde handmatig in te typen (niet kopiëren/plakken)
3. Controleer dat er geen spaties zijn

### Probleem 3: Deployment gebeurde voordat DATABASE_URL was ingesteld
**Oplossing**: Herdeploy de applicatie na het instellen van DATABASE_URL.

### Probleem 4: DATABASE_URL verwijst naar localhost
**Oplossing**: In productie moet DATABASE_URL verwijzen naar een externe database (zoals NEON), niet naar localhost.

## Test Lokaal met Productie DATABASE_URL

Om te testen of je DATABASE_URL correct is:

```bash
# Haal environment variables op
npx vercel env pull .env.production

# Test Prisma connectie
npx prisma db pull
```

Als dit werkt, is je DATABASE_URL correct.

## Code Wijzigingen

De code is aangepast om:
- ✅ Lazy initialization te gebruiken (validatie alleen bij gebruik)
- ✅ Alleen server-side te valideren (geen client-side errors)
- ✅ Build-time errors te voorkomen (environment variables zijn tijdens build mogelijk niet beschikbaar)
- ✅ Runtime validatie te gebruiken (controleert pas wanneer Prisma client wordt gebruikt)

Dit betekent dat de applicatie nu correct werkt, zelfs als environment variables tijdens build niet beschikbaar zijn.




