-- AlterTable: Voeg trial kolommen toe aan users tabel
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isTrialActive" BOOLEAN NOT NULL DEFAULT false;


