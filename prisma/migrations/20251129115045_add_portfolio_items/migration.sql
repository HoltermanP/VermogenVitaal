-- CreateTable
CREATE TABLE "portfolio_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exchange" TEXT,
    "type" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "averagePrice" DOUBLE PRECISION,
    "alertThreshold" DOUBLE PRECISION,
    "lastPrice" DOUBLE PRECISION,
    "lastAlertAt" TIMESTAMP(3),
    "alertEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_items_userId_symbol_key" ON "portfolio_items"("userId", "symbol");

-- CreateIndex
CREATE INDEX "portfolio_items_userId_idx" ON "portfolio_items"("userId");

-- CreateIndex
CREATE INDEX "portfolio_items_alertEnabled_lastAlertAt_idx" ON "portfolio_items"("alertEnabled", "lastAlertAt");

-- AddForeignKey
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

