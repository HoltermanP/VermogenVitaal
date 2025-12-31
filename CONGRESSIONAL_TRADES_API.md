# Congressional Trades API Implementatie

## Huidige Status

De House Stock Watcher API (`https://house-stock-watcher-data.s3-us-west-2.amazonaws.com/data/all_transactions.json`) geeft momenteel een **403 Forbidden** error. De S3 bucket is niet publiek toegankelijk.

## Beschikbare API Opties

### 1. **PoliAPI** (Betaald, Aanbevolen voor Productie) ⭐

**Website:** https://www.poliapi.com  
**Prijzen:** Vanaf $29/maand  
**Voordelen:**
- Uitgebreide data over alle politici
- Real-time updates
- Goede documentatie
- Betrouwbare service

**Hoe te gebruiken:**

1. **Registreer een account:**
   - Ga naar https://www.poliapi.com
   - Maak een account aan
   - Kies een abonnement (start met de goedkoopste optie)

2. **Krijg je API key:**
   - Log in op je account
   - Ga naar "API Keys" of "Settings"
   - Genereer een nieuwe API key

3. **Voeg API key toe aan je project:**
   ```bash
   # Open je .env bestand
   POLIAPI_API_KEY="jouw-api-key-hier"
   ```

4. **De code werkt automatisch!**
   - De huidige implementatie controleert automatisch op `POLIAPI_API_KEY`
   - Als de key aanwezig is, wordt deze gebruikt
   - Geen extra code wijzigingen nodig

**API Endpoint:**
```
GET https://api.poliapi.com/v1/trades?politician={naam}&limit={aantal}
Headers:
  Authorization: Bearer {jouw-api-key}
```

---

### 2. **RapidAPI** (Betaald, Verschillende API's Beschikbaar) ⭐

**Website:** https://rapidapi.com  
**Prijzen:** Variëren per API (vaak gratis tier beschikbaar)  
**Voordelen:**
- Veel verschillende congressional trades API's beschikbaar
- Eén API key voor meerdere services
- Goede documentatie
- Flexibele pricing

**Hoe te gebruiken:**

1. **Registreer een account:**
   - Ga naar https://rapidapi.com
   - Maak een account aan

2. **Zoek een congressional trades API:**
   - Zoek naar "congressional trades" of "congressional stock"
   - Abonneer je op een geschikte API
   - Kies een plan (vaak is er een gratis tier)

3. **Krijg je API key:**
   - Ga naar je dashboard
   - Kopieer je RapidAPI key (X-RapidAPI-Key)

4. **Krijg de API host (optioneel):**
   - In de API documentatie vind je de host (bijv. "congressional-trades-api.p.rapidapi.com")
   - Dit is optioneel, de code probeert het automatisch te detecteren

5. **Voeg toe aan .env:**
   ```bash
   RAPIDAPI_KEY="jouw-rapidapi-key-hier"
   # Optioneel: specificeer de host
   RAPIDAPI_HOST="congressional-trades-api.p.rapidapi.com"
   ```

6. **De code werkt automatisch!**
   - De huidige implementatie controleert automatisch op `RAPIDAPI_KEY`
   - Als de key aanwezig is, wordt RapidAPI als eerste geprobeerd
   - Geen extra code wijzigingen nodig

**API Endpoint Voorbeeld:**
```
GET https://{host}/trades?politician={naam}
Headers:
  X-RapidAPI-Key: {jouw-api-key}
  X-RapidAPI-Host: {host}
```

---

### 3. **Quiver Quantitative** (Gratis Tier Beschikbaar) 🆓

**Website:** https://www.quiverquant.com  
**Gratis Tier:** Beperkte requests per dag  
**Voordelen:**
- Gratis tier beschikbaar
- Goede data kwaliteit
- Focus op congressional trading

**Hoe te gebruiken:**

1. **Registreer gratis account:**
   - Ga naar https://www.quiverquant.com
   - Maak een gratis account aan

2. **Krijg API key:**
   - Ga naar je dashboard
   - Kopieer je API key

3. **Voeg toe aan .env:**
   ```bash
   QUIVER_API_KEY="jouw-api-key-hier"
   ```

4. **Update de code** (zie onderstaande implementatie sectie)

---

### 3. **GitHub Repositories** (Gratis, Open Source) 🆓

Er zijn verschillende GitHub repositories die congressional trading data hosten:

#### A. Washington Post Data
**Repository:** https://github.com/washingtonpost/data-congressional-trading  
**Raw Data URL:** 
```
https://raw.githubusercontent.com/washingtonpost/data-congressional-trading/main/all_transactions.json
```

#### B. Unusual Whales Congressional Trading
**Website:** https://unusualwhales.com/politics  
**API:** Betaald, maar heeft gratis data exports

**Hoe te gebruiken:**
- De huidige code probeert al GitHub repositories
- Werkt automatisch zonder API key
- Kan traag zijn of soms niet beschikbaar

---

### 4. **Congressional Trading Data API** (Gratis, Onstabiel) ⚠️

**URL:** https://www.congressionaltradingdata.com/api/trades  
**Status:** Soms beschikbaar, soms niet  
**Voordelen:**
- Geen API key nodig
- Directe toegang

**Nadelen:**
- Onbetrouwbaar
- Geen garantie op beschikbaarheid

---

## Implementatie Instructies

### Optie 1: RapidAPI (Aanbevolen - Flexibel)

**Stap 1:** Zoek een congressional trades API op RapidAPI:
- Ga naar https://rapidapi.com
- Zoek naar "congressional trades" of "congressional stock"
- Abonneer je op een API (kies gratis tier als beschikbaar)

**Stap 2:** Voeg API key toe aan `.env`:
```bash
RAPIDAPI_KEY="jouw-rapidapi-key-hier"
# Optioneel: specificeer de host als de API dat vereist
RAPIDAPI_HOST="congressional-trades-api.p.rapidapi.com"
```

**Stap 3:** De code werkt automatisch! Geen wijzigingen nodig.

**Stap 4:** Test de API:
```bash
# Start je development server
npm run dev

# Ga naar: http://localhost:3000/stocks/pelosi-trades
# Selecteer een politicus en klik op "Verversen"
```

---

### Optie 2: PoliAPI (Alternatief)

**Stap 1:** Voeg API key toe aan `.env`:
```bash
POLIAPI_API_KEY="jouw-poliapi-key-hier"
```

**Stap 2:** De code werkt automatisch! Geen wijzigingen nodig.

**Stap 3:** Test de API:
```bash
# Start je development server
npm run dev

# Ga naar: http://localhost:3000/stocks/pelosi-trades
# Selecteer een politicus en klik op "Verversen"
```

---

### Optie 2: Quiver Quantitative

**Stap 1:** Voeg API key toe aan `.env`:
```bash
QUIVER_API_KEY="jouw-quiver-key-hier"
```

**Stap 2:** Update `src/app/api/stocks/congressional-trades/route.ts`:
Voeg deze code toe in de `endpoints` array (rond regel 48):

```typescript
// Quiver Quantitative API
{
  url: `https://api.quiverquant.com/beta/congresstrading/${encodedPolitician}`,
  requiresAuth: true,
  transform: (data: any) => {
    if (Array.isArray(data)) {
      return data.map((trade: any) => ({
        representative: trade.Representative || politician,
        party: trade.Party || "Unknown",
        state: trade.State || "",
        ticker: trade.Ticker || "",
        company: trade.Company || "",
        transactionType: trade.Transaction || "Unknown",
        amount: trade.Amount || "Unknown",
        transactionDate: trade.TransactionDate || "",
        disclosureDate: trade.DisclosureDate || "",
      })).filter((t: CongressionalTrade) => t.ticker && t.ticker !== "")
    }
    return []
  },
},
```

En update de headers sectie (rond regel 138):
```typescript
if (typeof endpointConfig === "object" && endpointConfig.requiresAuth) {
  const apiKey = process.env.QUIVER_API_KEY || process.env.POLIAPI_API_KEY
  if (apiKey) {
    headers["X-API-KEY"] = apiKey // Quiver gebruikt X-API-KEY header
  }
}
```

---

### Optie 3: GitHub Repository (Gratis)

**Geen configuratie nodig!** De code probeert automatisch GitHub repositories.

Als je een specifieke repository wilt toevoegen, voeg deze toe aan de `endpoints` array:

```typescript
// Washington Post GitHub Data
{
  url: "https://raw.githubusercontent.com/washingtonpost/data-congressional-trading/main/all_transactions.json",
  requiresAuth: false,
  transform: (data: any) => {
    if (Array.isArray(data)) {
      return data.filter((trade: any) => {
        const repName = (trade.representative || trade.politician || "").toLowerCase()
        return repName.includes(politician.toLowerCase())
      }).map((trade: any) => ({
        representative: trade.representative || trade.politician || politician,
        party: trade.party || "D",
        state: trade.state || "CA",
        ticker: trade.ticker || trade.symbol || "",
        company: trade.company || trade.stockName || "",
        transactionType: trade.transactionType || trade.type || "Unknown",
        amount: trade.amount || trade.value || "Unknown",
        transactionDate: trade.transactionDate || trade.date || "",
        disclosureDate: trade.disclosureDate || trade.filedDate || "",
      }))
    }
    return []
  },
},
```

---

## Huidige Implementatie

De huidige code probeert automatisch meerdere endpoints in deze volgorde:

1. ✅ **Pelosi Tracker scraping** (gratis, werkt soms)
2. ✅ **Congressional Trading Data API** (gratis, onstabiel)
3. ✅ **PoliAPI** (betaald, vereist API key)
4. ✅ **House Stock Watcher S3** (niet meer beschikbaar)
5. ⚠️ **Mock data** (alleen in development mode)

Als alle endpoints falen, wordt er een lege array geretourneerd met een waarschuwing.

---

## Aanbevelingen per Gebruik

### Voor Productie (Live Website)
✅ **Gebruik PoliAPI** - Betrouwbaar en professioneel
- Kosten: ~$29/maand
- Betrouwbaarheid: ⭐⭐⭐⭐⭐
- Data kwaliteit: ⭐⭐⭐⭐⭐

### Voor Development/Testing
✅ **Gebruik GitHub Repositories** - Gratis en voldoende
- Kosten: Gratis
- Betrouwbaarheid: ⭐⭐⭐
- Data kwaliteit: ⭐⭐⭐⭐

### Voor Prototyping
✅ **Gebruik Mock Data** - Werkt altijd
- Kosten: Gratis
- Betrouwbaarheid: ⭐⭐⭐⭐⭐ (maar niet real)
- Data kwaliteit: ⭐⭐ (test data)

---

## Troubleshooting

### Geen data wordt getoond

1. **Check je .env bestand:**
   ```bash
   # Zorg dat je API key correct is toegevoegd
   POLIAPI_API_KEY="jouw-key-hier"
   ```

2. **Check de console logs:**
   - Open je browser console (F12)
   - Kijk naar errors in de Network tab
   - Check de server logs voor API errors

3. **Test de API direct:**
   ```bash
   # Test PoliAPI (vervang YOUR_KEY met je echte key)
   curl -H "Authorization: Bearer YOUR_KEY" \
     "https://api.poliapi.com/v1/trades?politician=Nancy%20Pelosi&limit=10"
   ```

4. **Check of je in development mode bent:**
   - In development mode wordt mock data gebruikt als fallback
   - In productie krijg je een error als API's falen

### API geeft 401 Unauthorized

- Je API key is ongeldig of verlopen
- Check of je API key correct is gekopieerd (geen extra spaties)
- Verifieer je API key op de provider website

### API geeft 429 Too Many Requests

- Je hebt je rate limit bereikt
- Wacht een paar minuten en probeer opnieuw
- Overweeg een betaald abonnement voor hogere limits

---

## Volgende Stappen

1. ✅ **Kies een API provider** (aanbevolen: PoliAPI voor productie)
2. ✅ **Registreer en krijg API key**
3. ✅ **Voeg API key toe aan `.env`**
4. ✅ **Test de implementatie**
5. ✅ **Deploy naar productie**

---

## Hulp Nodig?

Als je hulp nodig hebt met de implementatie:
1. Check de console logs voor specifieke errors
2. Test de API direct met curl of Postman
3. Check de documentatie van je gekozen API provider
4. Zorg dat je `.env` bestand correct is geconfigureerd

**Voordelen:**
- Uitgebreide data over alle politici
- Real-time updates
- Goede documentatie

**Implementatie:**

1. Registreer op [poliapi.com](https://www.poliapi.com)
2. Voeg API key toe aan `.env`:
   ```
   POLIAPI_API_KEY="your-api-key-here"
   ```

3. Update `src/app/api/stocks/congressional-trades/route.ts`:
   ```typescript
   const POLIAPI_KEY = process.env.POLIAPI_API_KEY
   
   if (POLIAPI_KEY) {
     const response = await fetch(
       `https://api.poliapi.com/v1/trades?politician=${encodeURIComponent(politician)}&limit=${limit}`,
       {
         headers: {
           "Authorization": `Bearer ${POLIAPI_KEY}`,
           "Content-Type": "application/json",
         },
       }
     )
     // ... rest van de code
   }
   ```

### 2. HillSignals (Betaald, real-time meldingen)

**Voordelen:**
- Real-time meldingen
- Webhook support
- API toegang voor ontwikkelaars

**Implementatie:**

1. Registreer op [hillsignals.com](https://hillsignals.com)
2. Voeg API key toe aan `.env`:
   ```
   HILLSIGNALS_API_KEY="your-api-key-here"
   ```

### 3. Open Source Alternatieven

#### GitHub Repository Scraping

Er zijn verschillende GitHub repositories die congressional trading data scrapen en hosten:

- [unitedstates/congress-legislators](https://github.com/unitedstates/congress-legislators)
- [washingtonpost/data-congressional-trading](https://github.com/washingtonpost/data-congressional-trading)

**Implementatie voorbeeld:**

```typescript
// Probeer GitHub raw content
const githubEndpoints = [
  "https://raw.githubusercontent.com/washingtonpost/data-congressional-trading/main/all_transactions.json",
  "https://raw.githubusercontent.com/[repo]/[path]/data.json",
]

for (const endpoint of githubEndpoints) {
  try {
    const response = await fetch(endpoint)
    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch (error) {
    continue
  }
}
```

### 4. Direct Congressional Disclosure Websites

De officiële congressional disclosure websites kunnen worden gescraped:

- **House**: [clerk.house.gov/public_disc/financial-pdfs](https://clerk.house.gov/public_disc/financial-pdfs)
- **Senate**: [efdsearch.senate.gov](https://efdsearch.senate.gov)

**Let op:** Deze vereisen scraping en kunnen regelmatig wijzigen.

## Huidige Implementatie

De huidige implementatie probeert automatisch meerdere endpoints:

1. `https://house-stock-watcher-data.s3-us-west-2.amazonaws.com/data/all_transactions.json`
2. `https://housestockwatcher.com/api/trades`
3. `https://api.housestockwatcher.com/trades`

Als alle endpoints falen, wordt er een lege array geretourneerd met een waarschuwing.

## Aanbevelingen

1. **Voor productie:** Gebruik PoliAPI of HillSignals voor betrouwbare data
2. **Voor ontwikkeling:** Gebruik mock data of een lokale JSON file
3. **Voor gratis opties:** Implementeer scraping van GitHub repositories of congressional websites

## Mock Data Voorbeeld

Voor testen kun je mock data gebruiken:

```typescript
const mockTrades: CongressionalTrade[] = [
  {
    representative: "Nancy Pelosi",
    party: "D",
    state: "CA",
    ticker: "AAPL",
    company: "Apple Inc.",
    transactionType: "Purchase",
    amount: "$1,000,001 - $5,000,000",
    transactionDate: "2024-01-15",
    disclosureDate: "2024-01-20",
  },
  // ... meer trades
]
```

## Volgende Stappen

1. Kies een API provider (aanbevolen: PoliAPI)
2. Voeg API key toe aan `.env`
3. Update de API route om de nieuwe provider te gebruiken
4. Test de implementatie
5. Update deze documentatie met de gekozen oplossing

