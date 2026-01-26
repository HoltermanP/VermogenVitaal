# Clerk Signup & Webhook Troubleshooting Guide

## Probleem
- Webhook werkt niet (gebruikers worden niet aangemaakt in database via webhook)
- User aanmaken in Clerk werkt niet (signup faalt)

## Diagnose Stappen

### 1. Test of Webhook Endpoint Bereikbaar is

**Via Browser:**
```
GET https://jouw-domein.com/api/webhooks/clerk
```

**Via cURL:**
```bash
curl https://jouw-domein.com/api/webhooks/clerk
```

**Verwachte Response:**
```json
{
  "success": true,
  "message": "Clerk webhook endpoint is bereikbaar",
  "environment": {
    "hasWebhookSecret": true,
    "hasClerkSecret": true,
    "hasClerkPublishable": true,
    ...
  },
  "instructions": { ... }
}
```

Als `hasWebhookSecret: false`, dan is `CLERK_WEBHOOK_SECRET` niet ingesteld in Vercel.

### 2. Controleer Clerk Environment Variables

**In Vercel Dashboard:**
1. Ga naar je project
2. Settings > Environment Variables
3. Controleer of deze variabelen zijn ingesteld:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (moet beginnen met `pk_test_` of `pk_live_`)
   - `CLERK_SECRET_KEY` (moet beginnen met `sk_test_` of `sk_live_`)
   - `CLERK_WEBHOOK_SECRET` (moet beginnen met `whsec_`)

**Voor Productie:**
- Gebruik `pk_live_...` en `sk_live_...` (niet `pk_test_...`)
- Zorg dat alle variabelen zijn ingesteld voor Production environment

### 3. Controleer Clerk Dashboard Configuratie

#### A. Webhook Configuratie

1. Ga naar [Clerk Dashboard](https://dashboard.clerk.com)
2. Selecteer je applicatie
3. Ga naar **Webhooks** in het linker menu
4. Controleer of er een webhook is met:
   - **Endpoint URL**: `https://jouw-domein.com/api/webhooks/clerk`
   - **Status**: "Active" (niet "Inactive" of "Failed")
   - **Events**: 
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted`

5. **Als webhook niet bestaat:**
   - Klik op "Add Endpoint"
   - Voer URL in: `https://jouw-domein.com/api/webhooks/clerk`
   - Selecteer events: `user.created`, `user.updated`, `user.deleted`
   - Klik op "Create"
   - Kopieer de "Signing Secret" (begint met `whsec_`)
   - Voeg toe aan Vercel als `CLERK_WEBHOOK_SECRET`

6. **Als webhook bestaat maar niet werkt:**
   - Klik op de webhook
   - Bekijk "Recent Deliveries" tab
   - Controleer of er errors zijn
   - Klik op een failed delivery om details te zien

#### B. Signup Configuratie

1. Ga naar Clerk Dashboard > **User & Authentication**
2. Controleer **Email, Phone, Username** settings:
   - Zorg dat Email is ingeschakeld
   - Controleer email verificatie instellingen
   - Controleer password requirements

3. Ga naar **Paths**:
   - Controleer of signup path correct is: `/auth/signup`
   - Controleer redirect URLs

### 4. Test Signup Flow

#### A. Via Browser Console

Open browser console (F12) en probeer een nieuwe gebruiker aan te maken. Je zou deze logs moeten zien:

```
🔵 SignUp: Starting user creation
🔵 SignUp: Result received
✅ SignUp: Session activated successfully
```

Als je errors ziet, noteer de exacte error message.

#### B. Controleer Vercel Logs

1. Ga naar Vercel Dashboard
2. Selecteer je project
3. Ga naar **Deployments** → Laatste deployment
4. Klik op **Functions** → Zoek naar `/api/webhooks/clerk`
5. Bekijk **Logs** tab

**Zoek naar:**
- `=== Clerk Webhook Received ===` - Webhook wordt aangeroepen
- `✅ Webhook verification successful` - Verificatie slaagt
- `📨 Clerk webhook event: user.created` - Event wordt ontvangen
- `✅ User created in database via webhook` - Gebruiker wordt aangemaakt
- `❌` - Errors (noteer deze)

### 5. Veelvoorkomende Problemen

#### Probleem: "CLERK_WEBHOOK_SECRET is not configured"

**Oplossing:**
1. Ga naar Clerk Dashboard > Webhooks
2. Klik op je webhook
3. Kopieer de "Signing Secret"
4. Ga naar Vercel > Settings > Environment Variables
5. Voeg toe: `CLERK_WEBHOOK_SECRET` = `whsec_...`
6. Redeploy de applicatie

#### Probleem: "Webhook verification failed"

**Oplossing:**
- Controleer of `CLERK_WEBHOOK_SECRET` overeenkomt met de secret in Clerk Dashboard
- Zorg dat er geen extra spaties zijn in de secret
- Herstel de secret in Clerk Dashboard en update in Vercel

#### Probleem: "User aanmaken in Clerk werkt niet"

**Mogelijke oorzaken:**

1. **Clerk niet geconfigureerd:**
   - Controleer of `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is ingesteld
   - Controleer of de key geldig is (niet `pk_test_...` placeholder)

2. **Email verificatie vereist:**
   - Controleer in Clerk Dashboard of email verificatie is ingeschakeld
   - Als verificatie vereist is, moet gebruiker eerst email verifiëren

3. **Password requirements:**
   - Controleer password requirements in Clerk Dashboard
   - Wachtwoord moet minimaal 8 tekens zijn
   - Mogelijk zijn er extra requirements (hoofdletters, cijfers, etc.)

4. **Rate limiting:**
   - Te veel signup pogingen kunnen rate limiting triggeren
   - Wacht een paar minuten en probeer opnieuw

5. **Domain niet geconfigureerd:**
   - In productie: voeg je domain toe aan Clerk Dashboard > Domains
   - Zorg dat domain is geverifieerd

#### Probleem: "Webhook wordt niet aangeroepen"

**Mogelijke oorzaken:**

1. **Webhook URL incorrect:**
   - Moet HTTPS zijn in productie
   - Moet exact zijn: `https://jouw-domein.com/api/webhooks/clerk`
   - Geen trailing slash

2. **Webhook niet actief:**
   - Controleer in Clerk Dashboard of webhook "Active" is
   - Als "Failed", bekijk de error details

3. **Events niet geselecteerd:**
   - Zorg dat `user.created` event is geselecteerd
   - Test met "Send test event" in Clerk Dashboard

4. **Middleware blokkeert webhook:**
   - Controleer `src/middleware.ts`
   - Zorg dat `/api/webhooks(.*)` in public routes staat

### 6. Test Webhook Manueel

**Via Clerk Dashboard:**
1. Ga naar Clerk Dashboard > Webhooks
2. Klik op je webhook
3. Klik op "Send test event"
4. Selecteer `user.created`
5. Controleer Vercel logs om te zien of webhook wordt ontvangen

### 7. Debug Checklist

- [ ] `CLERK_WEBHOOK_SECRET` is ingesteld in Vercel
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is ingesteld
- [ ] `CLERK_SECRET_KEY` is ingesteld
- [ ] Webhook bestaat in Clerk Dashboard
- [ ] Webhook URL is correct (HTTPS in productie)
- [ ] Webhook is "Active" in Clerk Dashboard
- [ ] `user.created` event is geselecteerd
- [ ] Webhook secret in Vercel komt overeen met Clerk Dashboard
- [ ] Domain is toegevoegd aan Clerk Dashboard (productie)
- [ ] Middleware blokkeert webhook niet
- [ ] Database connectie werkt (test met andere API calls)

### 8. Logs Bekijken

**Vercel Logs:**
```bash
# Via Vercel CLI
vercel logs --follow
```

**Filter op webhook:**
```bash
vercel logs --follow | grep "Clerk Webhook"
```

**Filter op signup:**
```bash
vercel logs --follow | grep "SignUp"
```

### 9. Contact Support

Als het probleem blijft bestaan na het volgen van deze stappen:

1. **Verzamel informatie:**
   - Screenshot van Clerk Dashboard webhook configuratie
   - Screenshot van Vercel environment variables (verberg secrets)
   - Vercel logs met errors
   - Browser console logs tijdens signup

2. **Test in development:**
   - Test lokaal met `npm run dev`
   - Controleer of webhook werkt met ngrok of lokale tunnel

3. **Check Clerk Status:**
   - Ga naar https://status.clerk.com
   - Controleer of er known issues zijn

## Belangrijke URLs

- **Clerk Dashboard**: https://dashboard.clerk.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Webhook Endpoint**: `https://jouw-domein.com/api/webhooks/clerk`
- **Test Endpoint**: `https://jouw-domein.com/api/webhooks/clerk/test`
- **Clerk Status**: https://status.clerk.com







