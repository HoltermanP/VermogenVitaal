# Google OAuth Setup Instructies

## Stap 1: Google Cloud Console
1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak een nieuw project aan of selecteer een bestaand project
3. Ga naar "APIs & Services" > "Credentials"

## Stap 2: OAuth 2.0 Client ID aanmaken
1. Klik op "Create Credentials" > "OAuth 2.0 Client ID"
2. Selecteer "Web application"
3. Voeg de volgende URLs toe:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`

## Stap 3: Environment Variables
Voeg de volgende variabelen toe aan je `.env.local` bestand:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# NextAuth
NEXTAUTH_SECRET=KjwstbHXVmGiRvg7Y1UNl5FeI65UPGT+4XwSW5mGYLY=
NEXTAUTH_URL=http://localhost:3000
```

## Stap 4: Test de login
1. Start de applicatie: `npm run dev`
2. Ga naar `http://localhost:3000/auth/signin`
3. Klik op "Inloggen met Google"
4. Je wordt doorgestuurd naar Google voor authenticatie
5. Na succesvolle login word je doorgestuurd naar `/dashboard`

## Voor Productie
Voor productie deployment:
1. Voeg je productie domain toe aan Google OAuth:
   - **Authorized JavaScript origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: `https://yourdomain.com/api/auth/callback/google`
2. Update `NEXTAUTH_URL` naar je productie domain
3. Gebruik een sterke, unieke `NEXTAUTH_SECRET`

## Troubleshooting
- **"redirect_uri_mismatch"**: Controleer of de redirect URI exact overeenkomt
- **"invalid_client"**: Controleer je Client ID en Secret
- **JWT errors**: Zorg dat `NEXTAUTH_SECRET` is ingesteld
