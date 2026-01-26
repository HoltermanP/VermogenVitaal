# Webhook 404 Error - Oplossing

## Probleem
De webhook endpoint geeft een 404 error: `Failed to load resource: the server responded with a status of 404 ()`

## Oplossing Stappen

### Stap 1: Controleer de Route Structuur

De route moet exact op deze locatie staan:
```
src/app/api/webhooks/clerk/route.ts
```

**Verifieer:**
```bash
ls -la src/app/api/webhooks/clerk/route.ts
```

### Stap 2: Controleer of Route Correct is Geëxporteerd

De route moet deze exports hebben:
- `export async function GET()`
- `export async function POST()`
- `export async function OPTIONS()` (optioneel, voor CORS)

### Stap 3: Rebuild de Applicatie

**Lokaal:**
```bash
# Stop de dev server
# Verwijder .next folder
rm -rf .next

# Start opnieuw
npm run dev
```

**In Vercel:**
1. Ga naar Vercel Dashboard
2. Selecteer je project
3. Klik op "Redeploy" of push een nieuwe commit
4. Wacht tot deployment klaar is

### Stap 4: Test de Route Direct

**Via Browser:**
```
https://jouw-domein.com/api/webhooks/clerk
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
  ...
}
```

### Stap 5: Controleer Middleware

De middleware moet API routes doorlaten. Controleer `src/middleware.ts`:

```typescript
// API routes handelen authenticatie zelf af - laat altijd door
if (pathname.startsWith('/api/')) {
  return NextResponse.next()
}
```

### Stap 6: Controleer Next.js Configuratie

Controleer `next.config.ts` - er mogen geen routes worden uitgesloten die de webhook blokkeren.

### Stap 7: Controleer Vercel Build Logs

1. Ga naar Vercel Dashboard
2. Selecteer je project
3. Ga naar "Deployments"
4. Klik op de laatste deployment
5. Bekijk "Build Logs"
6. Zoek naar errors of warnings over routes

### Stap 8: Test met Test Endpoint

Er is ook een test endpoint:
```
https://jouw-domein.com/api/webhooks/clerk/test
```

Als deze ook 404 geeft, dan is er een algemeen probleem met de route structuur.

### Stap 9: Controleer URL in Clerk Dashboard

In Clerk Dashboard > Webhooks, controleer of de URL exact is:
```
https://jouw-domein.com/api/webhooks/clerk
```

**NIET:**
- `https://jouw-domein.com/api/webhooks/clerk/` (trailing slash)
- `http://jouw-domein.com/api/webhooks/clerk` (HTTP in plaats van HTTPS)
- `https://www.jouw-domein.com/api/webhooks/clerk` (www subdomain als die niet is geconfigureerd)

### Stap 10: Force Rebuild in Vercel

Als niets werkt:

1. Ga naar Vercel Dashboard
2. Settings > General
3. Scroll naar "Build & Development Settings"
4. Klik op "Clear Build Cache"
5. Redeploy de applicatie

## Veelvoorkomende Oorzaken

### 1. Route niet in juiste map
❌ `src/app/api/webhook/clerk/route.ts` (webhook zonder 's')
✅ `src/app/api/webhooks/clerk/route.ts` (webhooks met 's')

### 2. Route file heeft verkeerde naam
❌ `src/app/api/webhooks/clerk/index.ts`
❌ `src/app/api/webhooks/clerk/page.tsx`
✅ `src/app/api/webhooks/clerk/route.ts`

### 3. Build cache probleem
- Oplossing: Clear build cache en rebuild

### 4. Deployment niet compleet
- Oplossing: Wacht tot deployment 100% klaar is

### 5. Verkeerde URL
- Controleer of URL exact overeenkomt met route pad
- Geen trailing slash
- HTTPS in productie

## Debug Commands

**Check route bestaat:**
```bash
find src/app/api/webhooks -name "*.ts" -type f
```

**Check exports:**
```bash
grep -n "export.*function" src/app/api/webhooks/clerk/route.ts
```

**Test lokaal:**
```bash
curl http://localhost:3000/api/webhooks/clerk
```

## Als Niets Werkt

1. **Maak een nieuwe route aan** om te testen:
   ```
   src/app/api/test-webhook/route.ts
   ```
   
   Met deze content:
   ```typescript
   import { NextResponse } from 'next/server'
   
   export async function GET() {
     return NextResponse.json({ success: true, message: 'Test route works' })
   }
   ```

2. Test deze route: `https://jouw-domein.com/api/test-webhook`
3. Als deze werkt, dan is er een specifiek probleem met de clerk route
4. Als deze ook 404 geeft, dan is er een algemeen routing probleem

## Contact

Als het probleem blijft bestaan na alle stappen:
1. Verzamel Vercel build logs
2. Verzamel browser console errors
3. Test de test route hierboven
4. Controleer of andere API routes werken (bijv. `/api/user`)







