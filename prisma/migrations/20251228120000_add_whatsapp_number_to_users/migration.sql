-- AlterTable: Voeg whatsappNumber kolom toe aan users tabel
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "whatsappNumber" TEXT;

