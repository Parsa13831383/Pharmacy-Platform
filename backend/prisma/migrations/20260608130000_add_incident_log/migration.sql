-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE "IncidentStatus"   AS ENUM ('SENT', 'FAILED', 'TEST');

-- CreateTable
CREATE TABLE "IncidentLog" (
    "id"        TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "severity"  "IncidentSeverity" NOT NULL,
    "type"      TEXT         NOT NULL,
    "title"     TEXT         NOT NULL,
    "message"   TEXT         NOT NULL,
    "orderId"   TEXT,
    "phone"     TEXT,
    "endpoint"  TEXT,
    "status"    "IncidentStatus"   NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IncidentLog_createdAt_idx" ON "IncidentLog"("createdAt");
CREATE INDEX "IncidentLog_severity_idx"  ON "IncidentLog"("severity");
CREATE INDEX "IncidentLog_type_idx"      ON "IncidentLog"("type");
