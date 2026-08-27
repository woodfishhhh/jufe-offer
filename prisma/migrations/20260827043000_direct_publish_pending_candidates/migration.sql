-- Retire the manual review queue. Existing pending candidates become formal
-- resources once per normalized URL; later matches are retained as duplicates.
INSERT INTO "Resource" (
  "id",
  "title",
  "description",
  "url",
  "category",
  "tags",
  "isFeatured",
  "origin",
  "startsAt",
  "deadlineAt",
  "createdAt",
  "updatedAt"
)
SELECT
  'auto_' || candidate."id",
  candidate."title",
  candidate."summary",
  COALESCE(candidate."officialUrl", candidate."sourceUrl"),
  CASE candidate."category"
    WHEN 'INTERNSHIP' THEN '实习与校招'
    WHEN 'CAMPUS_RECRUITMENT' THEN '实习与校招'
    WHEN 'REFERRAL' THEN '实习与校招'
    WHEN 'COMPETITION' THEN '竞赛'
    WHEN 'HACKATHON' THEN 'Hackathon'
    WHEN 'OPEN_SOURCE_RESOURCE' THEN '开源项目'
    WHEN 'TRAINING' THEN '训练营'
    WHEN 'PROGRAMMING_LEARNING' THEN '编程学习'
    WHEN 'LEARNING_PATH' THEN '学习路线'
    WHEN 'PROGRAMMING_TOOL' THEN '编程工具'
    WHEN 'CAREER_EXPERIENCE' THEN '简历与面试'
    WHEN 'RESUME_INTERVIEW' THEN '简历与面试'
    WHEN 'CAMPUS_RESOURCE' THEN '江财校内资源'
    ELSE '其他资源'
  END,
  candidate."tags",
  0,
  'OPENCLAW',
  NULL,
  candidate."deadline",
  candidate."createdAt",
  CURRENT_TIMESTAMP
FROM "Candidate" AS candidate
WHERE candidate."status" = 'PENDING'
  AND candidate."id" = (
    SELECT earliest."id"
    FROM "Candidate" AS earliest
    WHERE earliest."status" = 'PENDING'
      AND lower(rtrim(COALESCE(earliest."officialUrl", earliest."sourceUrl"), '/')) =
          lower(rtrim(COALESCE(candidate."officialUrl", candidate."sourceUrl"), '/'))
    ORDER BY earliest."createdAt" ASC, earliest."id" ASC
    LIMIT 1
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "Resource" AS resource
    WHERE lower(rtrim(resource."url", '/')) =
          lower(rtrim(COALESCE(candidate."officialUrl", candidate."sourceUrl"), '/'))
  );

UPDATE "Candidate"
SET
  "ingestDisposition" = 'AUTO_PUBLISH',
  "status" = 'APPROVED',
  "reviewNote" = '审核流程关闭后自动发布。',
  "reviewedAt" = CURRENT_TIMESTAMP,
  "resourceId" = 'auto_' || "id",
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "status" = 'PENDING'
  AND EXISTS (
    SELECT 1
    FROM "Resource"
    WHERE "Resource"."id" = 'auto_' || "Candidate"."id"
  );

UPDATE "Candidate"
SET
  "ingestDisposition" = 'AUTO_PUBLISH',
  "status" = 'DUPLICATE',
  "reviewNote" = '审核流程关闭后按正式资源 URL 自动判重。',
  "reviewedAt" = CURRENT_TIMESTAMP,
  "resourceId" = (
    SELECT resource."id"
    FROM "Resource" AS resource
    WHERE lower(rtrim(resource."url", '/')) =
          lower(rtrim(COALESCE("Candidate"."officialUrl", "Candidate"."sourceUrl"), '/'))
    ORDER BY resource."createdAt" ASC, resource."id" ASC
    LIMIT 1
  ),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "status" = 'PENDING'
  AND EXISTS (
    SELECT 1
    FROM "Resource" AS resource
    WHERE lower(rtrim(resource."url", '/')) =
          lower(rtrim(COALESCE("Candidate"."officialUrl", "Candidate"."sourceUrl"), '/'))
  );
