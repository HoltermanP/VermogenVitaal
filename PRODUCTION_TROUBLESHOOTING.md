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

### 7. Test Checklist

Voordat je deployt naar productie:
- [ ] Clerk environment variables zijn ingesteld (live keys)
- [ ] Productie domain is toegevoegd aan Clerk Dashboard
- [ ] Database is bereikbaar vanuit productie
- [ ] Alle andere environment variables zijn ingesteld (OPENAI_API_KEY, DATABASE_URL, etc.)

### 8. Veelvoorkomende Problemen

**Probleem:** 401 errors bij alle API calls
**Oplossing:** Controleer of `CLERK_SECRET_KEY` is ingesteld (niet alleen `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)

**Probleem:** Cookies worden niet meegestuurd
**Oplossing:** Zorg dat `credentials: "include"` is toegevoegd aan fetch calls (al gedaan)

**Probleem:** Authenticatie werkt lokaal maar niet in productie
**Oplossing:** Controleer of je live keys gebruikt (niet test keys) en of je domain is toegevoegd aan Clerk

### 9. Vercel Specifieke Instellingen

In Vercel:
1. Ga naar je project
2. Settings > Environment Variables
3. Zorg dat variabelen zijn ingesteld voor "Production"
4. Herdeploy na het toevoegen van variabelen

### 10. Contact

Als het probleem blijft bestaan na het volgen van deze stappen:
1. Check Vercel logs voor specifieke error messages
2. Check Clerk Dashboard voor authenticatie events
3. Controleer browser console voor client-side errors

