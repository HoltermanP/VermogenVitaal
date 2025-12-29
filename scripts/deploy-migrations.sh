#!/bin/bash

# Script om database migraties uit te voeren in productie
# Gebruik: ./scripts/deploy-migrations.sh

set -e  # Stop bij errors

echo "🚀 Database Migraties Uitvoeren in Productie"
echo ""

# Check of Vercel CLI is geïnstalleerd
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is niet geïnstalleerd"
    echo "Installeer met: npm install -g vercel"
    exit 1
fi

# Check of je bent ingelogd
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Je bent niet ingelogd bij Vercel"
    echo "Voer eerst uit: vercel login"
    exit 1
fi

# Check of project is gelinkt
if [ ! -f .vercel/project.json ]; then
    echo "⚠️  Project is niet gelinkt aan Vercel"
    echo "Voer eerst uit: vercel link"
    exit 1
fi

echo "✅ Vercel CLI is geconfigureerd"
echo ""

# Haal environment variables op
echo "📥 Ophalen van productie environment variables..."
vercel env pull .env.production --yes

# Check of DATABASE_URL bestaat
if ! grep -q "DATABASE_URL=" .env.production 2>/dev/null; then
    echo "❌ DATABASE_URL niet gevonden in environment variables"
    echo "Zorg dat DATABASE_URL is ingesteld in Vercel Dashboard"
    exit 1
fi

echo "✅ DATABASE_URL gevonden"
echo ""

# Laad environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Check of DATABASE_URL geldig is
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is leeg"
    exit 1
fi

if [[ ! "$DATABASE_URL" =~ ^postgres ]]; then
    echo "❌ DATABASE_URL moet beginnen met postgresql:// of postgres://"
    echo "Huidige waarde: ${DATABASE_URL:0:20}..."
    exit 1
fi

echo "✅ DATABASE_URL is geldig"
echo ""

# Genereer Prisma client
echo "📦 Genereren van Prisma client..."
npx prisma generate

echo ""

# Kies migratie methode
echo "Kies migratie methode:"
echo "1) prisma db push (snel, maakt alle tabellen direct aan)"
echo "2) prisma migrate deploy (gebruikt migraties, aanbevolen)"
read -p "Kies optie (1 of 2): " choice

case $choice in
    1)
        echo ""
        echo "🗄️  Uitvoeren van prisma db push..."
        npx prisma db push --skip-generate --accept-data-loss
        echo ""
        echo "✅ Database schema is gepusht!"
        ;;
    2)
        echo ""
        echo "🗄️  Uitvoeren van prisma migrate deploy..."
        npx prisma migrate deploy
        echo ""
        echo "✅ Migraties zijn uitgevoerd!"
        ;;
    *)
        echo "❌ Ongeldige keuze"
        exit 1
        ;;
esac

echo ""
echo "🎉 Klaar! Database is geconfigureerd."
echo ""
echo "Verificatie:"
echo "- Check Vercel logs voor errors"
echo "- Test de applicatie (probeer in te loggen)"
echo "- Check database tabellen met: npx prisma studio"
































