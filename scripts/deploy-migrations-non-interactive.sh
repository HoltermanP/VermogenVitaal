#!/bin/bash

# Script om database migraties uit te voeren in productie (non-interactive)
# Gebruik: DATABASE_URL="postgresql://..." ./scripts/deploy-migrations-non-interactive.sh
# Of: vercel env pull .env.production && source .env.production && ./scripts/deploy-migrations-non-interactive.sh

set -e  # Stop bij errors

echo "🚀 Database Migraties Uitvoeren in Productie (Non-Interactive)"
echo ""

# Check of DATABASE_URL is ingesteld
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is niet ingesteld"
    echo ""
    echo "Optie 1: Stel DATABASE_URL handmatig in:"
    echo "  export DATABASE_URL=\"postgresql://user:password@host:5432/database\""
    echo "  ./scripts/deploy-migrations-non-interactive.sh"
    echo ""
    echo "Optie 2: Haal op via Vercel CLI:"
    echo "  vercel env pull .env.production"
    echo "  source .env.production"
    echo "  ./scripts/deploy-migrations-non-interactive.sh"
    exit 1
fi

# Check of DATABASE_URL geldig is
if [[ ! "$DATABASE_URL" =~ ^postgres ]]; then
    echo "❌ DATABASE_URL moet beginnen met postgresql:// of postgres://"
    echo "Huidige waarde: ${DATABASE_URL:0:30}..."
    exit 1
fi

echo "✅ DATABASE_URL is ingesteld en geldig"
echo ""

# Genereer Prisma client
echo "📦 Genereren van Prisma client..."
npx prisma generate

echo ""

# Gebruik db push (snelste methode voor eerste keer)
echo "🗄️  Uitvoeren van prisma db push..."
echo "Dit maakt alle tabellen direct aan in de database."
npx prisma db push --skip-generate --accept-data-loss

echo ""
echo "✅ Database schema is gepusht!"
echo ""
echo "🎉 Klaar! Database is geconfigureerd."
echo ""
echo "Verificatie:"
echo "- Check Vercel logs voor errors"
echo "- Test de applicatie (probeer in te loggen)"
echo "- Check database tabellen met: npx prisma studio"














