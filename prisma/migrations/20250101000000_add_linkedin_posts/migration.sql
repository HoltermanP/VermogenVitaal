-- CreateEnum
CREATE TYPE "LinkedInPostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'POSTED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "linkedin_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "LinkedInPostStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledFor" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),
    "linkedInPostId" TEXT,
    "error" TEXT,
    "topic" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linkedin_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "linkedin_posts_status_scheduledFor_idx" ON "linkedin_posts"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "linkedin_posts_topic_idx" ON "linkedin_posts"("topic");

