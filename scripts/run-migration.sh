#!/bin/bash

# Script om LinkedIn posts migratie uit te voeren
# Gebruik: ./scripts/run-migration.sh

echo "🔄 Uitvoeren van database migratie voor LinkedIn posts..."

# Genereer Prisma client
echo "📦 Genereren van Prisma client..."
npx prisma generate

# Voer migratie uit
echo "🗄️  Uitvoeren van database migratie..."
npx prisma migrate deploy

# Of gebruik db:push als je in development bent:
# npx prisma db push

echo "✅ Migratie voltooid!"

