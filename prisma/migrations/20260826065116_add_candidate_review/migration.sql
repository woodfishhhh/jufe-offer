-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "officialUrl" TEXT,
    "deadline" DATETIME,
    "tags" TEXT NOT NULL,
    "rawExcerpt" TEXT,
    "discoveredAt" DATETIME NOT NULL,
    "ingestDisposition" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedAt" DATETIME,
    "resourceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Candidate_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_externalId_key" ON "Candidate"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_dedupeKey_key" ON "Candidate"("dedupeKey");

-- CreateIndex
CREATE INDEX "Candidate_status_createdAt_idx" ON "Candidate"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Candidate_category_status_idx" ON "Candidate"("category", "status");

-- CreateIndex
CREATE INDEX "Candidate_resourceId_idx" ON "Candidate"("resourceId");
