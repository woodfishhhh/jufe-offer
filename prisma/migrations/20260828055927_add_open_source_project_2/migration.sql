-- Added from GitHub issue #2 by jufe-offer-open-source-bot.
INSERT INTO "Resource" (
  "id", "title", "description", "url", "category", "tags",
  "isFeatured", "origin", "startsAt", "deadlineAt", "createdAt", "updatedAt"
)
SELECT
  'open_source_issue_2',
  'TheNook',
  '一个专注于推理小说的发现与收藏平台',
  'https://github.com/kinguang3/TheNook',
  '校内开源项目',
  '["网站"]',
  0,
  'MANUAL',
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "Resource"
  WHERE lower(rtrim("url", '/')) = lower(rtrim('https://github.com/kinguang3/TheNook', '/'))
);
-- Cache the GitHub repository profile used by every project-card surface.
INSERT INTO "RepositoryProfile" (
  "id", "repositoryUrl", "owner", "name", "description", "stars",
  "avatarPath", "avatarLogin", "primaryLanguage", "resourceId",
  "syncedAt", "createdAt", "updatedAt"
)
SELECT
  'repository_issue_2',
  'https://github.com/kinguang3/TheNook',
  'kinguang3',
  'TheNook',
  '一个专注于推理小说的发现与收藏平台',
  0,
  '/campus-project-avatars/kinguang3.webp',
  'kinguang3',
  'TypeScript',
  (SELECT "id" FROM "Resource" WHERE lower(rtrim("url", '/')) = lower(rtrim('https://github.com/kinguang3/TheNook', '/')) LIMIT 1),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "RepositoryProfile"
  WHERE lower(rtrim("repositoryUrl", '/')) = lower(rtrim('https://github.com/kinguang3/TheNook', '/'))
);
