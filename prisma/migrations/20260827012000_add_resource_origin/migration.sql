ALTER TABLE "Resource" ADD COLUMN "origin" TEXT NOT NULL DEFAULT 'MANUAL';

UPDATE "Resource"
SET "origin" = 'OPENCLAW'
WHERE "id" IN (
  SELECT "resourceId"
  FROM "Candidate"
  WHERE "resourceId" IS NOT NULL
);
