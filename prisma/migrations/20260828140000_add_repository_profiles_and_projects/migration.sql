-- Store mutable GitHub metadata in the database so every project surface shares one source.
CREATE TABLE "RepositoryProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repositoryUrl" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "avatarPath" TEXT,
    "avatarLogin" TEXT,
    "primaryLanguage" TEXT,
    "resourceId" TEXT,
    "syncedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RepositoryProfile_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "RepositoryProfile_repositoryUrl_key" ON "RepositoryProfile"("repositoryUrl");
CREATE UNIQUE INDEX "RepositoryProfile_resourceId_key" ON "RepositoryProfile"("resourceId");

-- Keep the campus-project category limited to projects created or maintained by JUFE students.
UPDATE "Resource"
SET "category" = '编程工具', "updatedAt" = CURRENT_TIMESTAMP
WHERE lower(rtrim("url", '/')) = lower('https://github.com');

UPDATE "Resource"
SET "category" = '实习与校招', "updatedAt" = CURRENT_TIMESTAMP
WHERE lower(rtrim("url", '/')) = lower('https://summer-ospp.ac.cn');

UPDATE "Resource"
SET "category" = '编程学习', "updatedAt" = CURRENT_TIMESTAMP
WHERE lower(rtrim("url", '/')) = lower('https://hellogithub.com');

UPDATE "Resource"
SET "category" = '校内开源项目', "updatedAt" = CURRENT_TIMESTAMP
WHERE lower(rtrim("url", '/')) = lower('https://github.com/mohaoz/xcpc-tracker');

-- Add the four requested repositories once by normalized URL.
WITH "SubmittedProjects" ("id", "title", "description", "url", "tags") AS (
  VALUES
    ('campus_project_jufe_cas', 'jufe_cas', '面向江西财经大学统一身份认证的 Dart 客户端，实现标准 Apereo CAS 登录流程，支持 Cookie 持久化、RSA 加密和 MFA 多因子认证。', 'https://github.com/SeRazon/jufe_cas', '["开源","Dart","统一认证"]'),
    ('campus_project_eridanus', 'Eridanus', '基于 OneBot 协议的多功能机器人与 Python 开发框架，以 LLM Function Calling 构建智能功能调用，并支持 Live2D 桌宠模式。', 'https://github.com/AOrbitron/Eridanus', '["开源","Python","LLM"]'),
    ('campus_project_resume_grill', 'Resume Grill', '把简历中的项目、技能和成果转化为连续追问式能力测试，帮助发现知识漏洞、复盘掌握度并改进简历表达。', 'https://github.com/MIU-MA/resume-grill', '["开源","AI","简历"]'),
    ('campus_project_jxufe_csg_website', 'JXUFE CSG Website', '江西财经大学网络安全协会官方网站建设项目，基于 Nuxt 4，面向协会内容展示、活动传播与开源协作。', 'https://github.com/JUFEWPST/JXUFE-CSG-Website', '["开源","Nuxt","网络安全"]')
)
INSERT INTO "Resource" (
  "id", "title", "description", "url", "category", "tags",
  "isFeatured", "origin", "startsAt", "deadlineAt", "createdAt", "updatedAt"
)
SELECT
  project."id",
  project."title",
  project."description",
  project."url",
  '校内开源项目',
  project."tags",
  1,
  'MANUAL',
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "SubmittedProjects" AS project
WHERE NOT EXISTS (
  SELECT 1
  FROM "Resource" AS resource
  WHERE lower(rtrim(resource."url", '/')) = lower(rtrim(project."url", '/'))
);

-- Snapshot GitHub metadata. The sync tool refreshes these values without making page loads hit GitHub.
WITH "Profiles" (
  "id", "repositoryUrl", "owner", "name", "description", "stars",
  "avatarPath", "avatarLogin", "primaryLanguage"
) AS (
  VALUES
    ('repository_profile_jufe_offer', 'https://github.com/woodfishhhh/jufe-offer', 'woodfishhhh', 'jufe-offer', '江财学生的实习、竞赛与学习资源导航。', 5, '/campus-project-avatars/woodfishhhh.webp', 'woodfishhhh', 'TypeScript'),
    ('repository_profile_typability', 'https://github.com/SimonShiki/Typability', 'SimonShiki', 'Typability', 'a WYSIWYG markdown editor based on Milkdown.', 131, '/campus-project-avatars/simonshiki.webp', 'SimonShiki', 'TypeScript'),
    ('repository_profile_auto_email_sender', 'https://github.com/JunieXD/AutoEmailSender', 'JunieXD', 'AutoEmailSender', 'AutoEmailSender 是一个专为套磁场景设计的智能邮件助手', 135, '/campus-project-avatars/juniexd.webp', 'JunieXD', 'Python'),
    ('repository_profile_woodfish_theme', 'https://github.com/woodfishhhh/Woodfish-Theme', 'woodfishhhh', 'Woodfish-Theme', '一个优雅的 VSCode 渐变主题，提供现代化的视觉体验和舒适的编程环境。', 60, '/campus-project-avatars/woodfishhhh.webp', 'woodfishhhh', 'TypeScript'),
    ('repository_profile_xcpc_tracker', 'https://github.com/mohaoz/xcpc-tracker', 'mohaoz', 'xcpc-tracker', NULL, 7, '/campus-project-avatars/mohaoz.webp', 'mohaoz', 'JavaScript'),
    ('repository_profile_jufe_cas', 'https://github.com/SeRazon/jufe_cas', 'SeRazon', 'jufe_cas', '江西财经大学（标准Apereo CAS）统一身份认证 Dart 客户端，支持 Cookie 持久化、RSA 加密、MFA 多因子认证。', 1, '/campus-project-avatars/serazon.webp', 'SeRazon', 'Dart'),
    ('repository_profile_eridanus', 'https://github.com/AOrbitron/Eridanus', 'AOrbitron', 'Eridanus', '基于 OneBot 协议的多功能bot兼开发框架。以llm function calling为核心构建了更智能的功能调用机制。支持不接入QQ纯Live2d桌宠模式', 200, '/campus-project-avatars/aorbitron.webp', 'AOrbitron', 'Python'),
    ('repository_profile_resume_grill', 'https://github.com/MIU-MA/resume-grill', 'MIU-MA', 'resume-grill', 'vue和react，我还是更喜欢vue（', 8, '/campus-project-avatars/miu-ma.webp', 'MIU-MA', 'TypeScript'),
    ('repository_profile_jxufe_csg_website', 'https://github.com/JUFEWPST/JXUFE-CSG-Website', 'JUFEWPST', 'JXUFE-CSG-Website', '江西财经大学网络安全协会官方网站建设项目', 7, '/campus-project-avatars/jufewpst.webp', 'JUFEWPST', 'Vue')
)
INSERT INTO "RepositoryProfile" (
  "id", "repositoryUrl", "owner", "name", "description", "stars",
  "avatarPath", "avatarLogin", "primaryLanguage", "resourceId",
  "syncedAt", "createdAt", "updatedAt"
)
SELECT
  profile."id",
  profile."repositoryUrl",
  profile."owner",
  profile."name",
  profile."description",
  profile."stars",
  profile."avatarPath",
  profile."avatarLogin",
  profile."primaryLanguage",
  (
    SELECT resource."id"
    FROM "Resource" AS resource
    WHERE lower(rtrim(resource."url", '/')) = lower(rtrim(profile."repositoryUrl", '/'))
    LIMIT 1
  ),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Profiles" AS profile
WHERE NOT EXISTS (
  SELECT 1
  FROM "RepositoryProfile" AS existing
  WHERE lower(rtrim(existing."repositoryUrl", '/')) = lower(rtrim(profile."repositoryUrl", '/'))
);
