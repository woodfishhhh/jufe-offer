-- Added from GitHub issue #3 by jufe-offer-open-source-bot.
INSERT INTO "Resource" (
  "id", "title", "description", "url", "category", "tags",
  "isFeatured", "origin", "startsAt", "deadlineAt", "createdAt", "updatedAt"
)
SELECT
  'open_source_issue_3',
  'AI Agent 工程学习文档',
  'Damn Agent is a developer-oriented documentation site for learning AI Agent engineering in Chinese.',
  'https://github.com/iammm0/damn-agent',
  '校内开源项目',
  '[]',
  0,
  'MANUAL',
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "Resource"
  WHERE lower(rtrim("url", '/')) = lower(rtrim('https://github.com/iammm0/damn-agent', '/'))
);
-- Cache the GitHub repository profile used by every project-card surface.
INSERT INTO "RepositoryProfile" (
  "id", "repositoryUrl", "owner", "name", "description", "stars",
  "avatarPath", "avatarLogin", "primaryLanguage", "resourceId",
  "syncedAt", "createdAt", "updatedAt"
)
SELECT
  'repository_issue_3',
  'https://github.com/iammm0/damn-agent',
  'iammm0',
  'damn-agent',
  'Damn Agent is a developer-oriented documentation site for learning AI Agent engineering in Chinese. ',
  9,
  '/campus-project-avatars/chagumu-01.webp',
  'chagumu-01',
  'MDX',
  (SELECT "id" FROM "Resource" WHERE lower(rtrim("url", '/')) = lower(rtrim('https://github.com/iammm0/damn-agent', '/')) LIMIT 1),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "RepositoryProfile"
  WHERE lower(rtrim("repositoryUrl", '/')) = lower(rtrim('https://github.com/iammm0/damn-agent', '/'))
);
