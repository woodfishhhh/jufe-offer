-- AlterTable
ALTER TABLE "Resource" ADD COLUMN "startsAt" DATETIME;
ALTER TABLE "Resource" ADD COLUMN "deadlineAt" DATETIME;

-- Preserve deadlines from candidates that were already published before
-- Resource gained first-class event time fields.
UPDATE "Resource"
SET "deadlineAt" = (
    SELECT "Candidate"."deadline"
    FROM "Candidate"
    WHERE "Candidate"."resourceId" = "Resource"."id"
      AND "Candidate"."status" = 'APPROVED'
      AND "Candidate"."deadline" IS NOT NULL
    ORDER BY "Candidate"."deadline" ASC
    LIMIT 1
)
WHERE "deadlineAt" IS NULL
  AND EXISTS (
    SELECT 1
    FROM "Candidate"
    WHERE "Candidate"."resourceId" = "Resource"."id"
      AND "Candidate"."status" = 'APPROVED'
      AND "Candidate"."deadline" IS NOT NULL
  );
