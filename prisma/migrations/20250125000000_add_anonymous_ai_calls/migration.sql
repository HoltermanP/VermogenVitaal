-- AlterTable: Maak userId optioneel en voeg sessionId toe
ALTER TABLE "ai_calls" 
  ALTER COLUMN "userId" DROP NOT NULL;

-- AddColumn: Voeg sessionId toe voor anonieme gebruikers
ALTER TABLE "ai_calls" 
  ADD COLUMN "sessionId" TEXT;

-- DropForeignKey: Verwijder de foreign key constraint (we maken deze later opnieuw optioneel)
ALTER TABLE "ai_calls" 
  DROP CONSTRAINT IF EXISTS "ai_calls_userId_fkey";

-- AddForeignKey: Voeg foreign key constraint terug toe, maar nu optioneel
ALTER TABLE "ai_calls" 
  ADD CONSTRAINT "ai_calls_userId_fkey" 
  FOREIGN KEY ("userId") 
  REFERENCES "users"("id") 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

-- CreateIndex: Voeg index toe voor sessionId queries
CREATE INDEX "ai_calls_sessionId_createdAt_idx" ON "ai_calls"("sessionId", "createdAt");


















