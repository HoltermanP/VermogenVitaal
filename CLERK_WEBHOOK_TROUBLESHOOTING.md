# Clerk Webhook Troubleshooting Guide

## Probleem
Nieuwe gebruikers worden niet automatisch aangemaakt in de NEON database via de Clerk webhook, maar kunnen wel inloggen (omdat ze via fallback worden aangemaakt).

## Oplossing

### 1. Controleer Webhook Configuratie in Clerk Dashboard

1. Ga naar [Clerk Dashboard](https://dashboard.clerk.com)
2. Selecteer je applicatie
3. Ga naar **Webhooks** in het linker menu
4. Controleer of er een webhook is geconfigureerd met:
   - **Endpoint URL**: `https://jouw-domein.com/api/webhooks/clerk`
   - **Events**: Zorg dat `user.created`, `user.updated`, en `user.deleted` zijn geselecteerd
   - **Status**: Moet "Active" zijn

### 2. Controleer Environment Variables

Zorg dat de volgende environment variable is ingesteld in Vercel:

```bash
CLERK_WEBHOOK_SECRET=whsec_...
```

**Hoe te vinden:**
1. In Clerk Dashboard → Webhooks
2. Klik op je webhook
3. Kopieer de "Signing Secret" (begint met `whsec_`)
4. Voeg toe aan Vercel Environment Variables

### 3. Controleer Webhook Logs

Na de verbeterde logging kun je nu in Vercel logs zien:

- ✅ **Webhook ontvangen**: `=== Clerk Webhook Received ===`
- ✅ **Verificatie succesvol**: `✅ Webhook verification successful`
- ✅ **Event type**: `📨 Clerk webhook event: user.created`
- ✅ **Gebruiker aangemaakt**: `✅ User created in database via webhook`
- ❌ **Errors**: Alle errors worden nu gedetailleerd gelogd

**Hoe logs te bekijken:**
1. Ga naar Vercel Dashboard
2. Selecteer je project
3. Ga naar **Deployments** → Klik op de laatste deployment
4. Klik op **Functions** → Zoek naar `/api/webhooks/clerk`
5. Bekijk de **Logs** tab

### 4. Test de Webhook

#### Optie A: Via Clerk Dashboard
1. Ga naar Clerk Dashboard → Webhooks
2. Klik op je webhook
3. Klik op **Send test event**
4. Selecteer `user.created`
5. Controleer de logs in Vercel

#### Optie B: Maak een test gebruiker aan
1. Maak een nieuwe gebruiker aan via je signup pagina
2. Controleer direct de logs in Vercel
3. Zoek naar de webhook logs

### 5. Veelvoorkomende Problemen

#### Probleem: Webhook wordt niet aangeroepen
**Oplossing:**
- Controleer of de webhook URL correct is (moet HTTPS zijn in productie)
- Controleer of de webhook "Active" is in Clerk Dashboard
- Controleer of de webhook events correct zijn geselecteerd

#### Probleem: Webhook verificatie faalt
**Oplossing:**
- Controleer of `CLERK_WEBHOOK_SECRET` correct is ingesteld
- Zorg dat de secret overeenkomt met de secret in Clerk Dashboard
- Herstel de secret in Clerk en update in Vercel

#### Probleem: Database connectie faalt
**Oplossing:**
- Controleer of `DATABASE_URL` correct is ingesteld in Vercel
- Test de database connectie
- Controleer of de database toegankelijk is vanuit Vercel

#### Probleem: Gebruiker wordt niet aangemaakt (geen error)
**Oplossing:**
- Controleer de logs voor specifieke errors
- Controleer of de email correct wordt uitgelezen uit de webhook data
- Controleer of er geen duplicate key errors zijn (gebruiker bestaat al)

### 6. Fallback Mechanisme

Als de webhook faalt, wordt de gebruiker nog steeds aangemaakt via:
- `getClerkUser()` in `src/lib/clerk-auth.ts` - wordt aangeroepen bij elke request
- `/api/user` route - wordt aangeroepen wanneer gebruiker data wordt opgehaald

Dit verklaart waarom gebruikers wel kunnen inloggen, maar niet via de webhook worden aangemaakt.

### 7. Monitoring

Na de verbeteringen kun je nu:
- Alle webhook events zien in de logs
- Specifieke errors identificeren
- Database operaties volgen
- Performance meten (duration in ms)

### 8. Volgende Stappen

1. ✅ Verbeterde logging is geïmplementeerd
2. ⏳ Controleer webhook configuratie in Clerk Dashboard
3. ⏳ Test de webhook met een nieuwe gebruiker
4. ⏳ Bekijk de logs in Vercel om te zien wat er gebeurt
5. ⏳ Fix eventuele configuratie problemen

## Belangrijke URLs

- **Clerk Dashboard**: https://dashboard.clerk.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Webhook Endpoint**: `https://jouw-domein.com/api/webhooks/clerk`

## Support

Als het probleem blijft bestaan na het volgen van deze stappen:
1. Bekijk de gedetailleerde logs in Vercel
2. Controleer Clerk webhook logs in Clerk Dashboard
3. Controleer database logs in NEON dashboard







