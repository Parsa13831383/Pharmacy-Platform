-- CreateTable
CREATE TABLE "CustomerEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "phone" TEXT,
    "productId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerEvent_phone_idx" ON "CustomerEvent"("phone");

-- CreateIndex
CREATE INDEX "CustomerEvent_sessionId_idx" ON "CustomerEvent"("sessionId");

-- CreateIndex
CREATE INDEX "CustomerEvent_productId_idx" ON "CustomerEvent"("productId");

-- CreateIndex
CREATE INDEX "CustomerEvent_createdAt_idx" ON "CustomerEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "CustomerEvent" ADD CONSTRAINT "CustomerEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
