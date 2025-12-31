-- AlterEnum
ALTER TYPE "DeepResearchStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "deep_research_reports" ADD COLUMN "progressPercentage" INTEGER;
ALTER TABLE "deep_research_reports" ADD COLUMN "progressMessage" TEXT;

