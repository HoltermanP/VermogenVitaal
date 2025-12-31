-- CreateEnum
CREATE TYPE "DeepResearchStatus" AS ENUM ('GENERATING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "deep_research_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exchange" TEXT,
    "type" TEXT,
    "report" JSONB NOT NULL,
    "status" "DeepResearchStatus" NOT NULL DEFAULT 'GENERATING',
    "pdfUrl" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deep_research_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deep_research_reports_userId_createdAt_idx" ON "deep_research_reports"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "deep_research_reports" ADD CONSTRAINT "deep_research_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;






































