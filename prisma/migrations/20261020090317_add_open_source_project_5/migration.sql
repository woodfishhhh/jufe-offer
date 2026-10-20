-- Added from GitHub issue #5 by jufe-offer-open-source-bot.
INSERT INTO "Resource" (
  "id", "title", "description", "url", "category", "tags",
  "isFeatured", "origin", "startsAt", "deadlineAt", "createdAt", "updatedAt"
)
SELECT
  'open_source_issue_5',
  'Opia RSS Reader',
  'Electron 驱动的本地 RSS 阅读器，默认订阅并特化支持橘鸦 AI 早报，目前是本人 AI 信息来源的主要获取工具。',
  'https://github.com/CaiYan12/opia-rss-reader',
  '校内开源项目',
  '["AI","工具","前端","桌面应用"]',
  0,
  'MANUAL',
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "Resource"
  WHERE lower(rtrim("url", '/')) = lower(rtrim('https://github.com/CaiYan12/opia-rss-reader', '/'))
);
-- Cache the GitHub repository profile used by every project-card surface.
INSERT INTO "RepositoryProfile" (
  "id", "repositoryUrl", "owner", "name", "description", "stars",
  "avatarPath", "avatarLogin", "primaryLanguage", "resourceId",
  "syncedAt", "createdAt", "updatedAt"
)
SELECT
  'repository_issue_5',
  'https://github.com/CaiYan12/opia-rss-reader',
  'CaiYan12',
  'opia-rss-reader',
  '专门为橘鸦Juya RSS订阅设计的专用阅读器',
  1,
  '/campus-project-avatars/caiyan12.webp',
  'CaiYan12',
  'TypeScript',
  (SELECT "id" FROM "Resource" WHERE lower(rtrim("url", '/')) = lower(rtrim('https://github.com/CaiYan12/opia-rss-reader', '/')) LIMIT 1),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "RepositoryProfile"
  WHERE lower(rtrim("repositoryUrl", '/')) = lower(rtrim('https://github.com/CaiYan12/opia-rss-reader', '/'))
);
