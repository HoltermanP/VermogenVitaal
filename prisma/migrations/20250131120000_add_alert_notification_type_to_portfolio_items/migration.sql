-- CreateEnum
CREATE TYPE "AlertNotificationType" AS ENUM ('EMAIL', 'WHATSAPP', 'BOTH');

-- AlterTable
ALTER TABLE "portfolio_items" ADD COLUMN "alertNotificationType" "AlertNotificationType" NOT NULL DEFAULT 'EMAIL';




