-- Add the submitted open-source projects and competition tracker once by normalized URL.
WITH "SubmittedProjects" ("id", "title", "description", "url", "category", "tags", "isFeatured") AS (
  VALUES
    ('campus_project_auto_email_sender', 'AutoEmailSender', '面向导师套磁场景的智能邮件助手，支持导师信息整理、匹配分析、邮件草稿生成、定时发送与回复追踪。', 'https://github.com/JunieXD/AutoEmailSender', '校内开源项目', '["开源","AI","邮件"]', 1),
    ('campus_project_woodfish_theme', 'Woodfish Theme', '面向 VS Code 的深色主题与运行时视觉效果，提供渐变语法、文字发光和彩虹光标等可配置效果。', 'https://github.com/woodfishhhh/Woodfish-Theme', '校内开源项目', '["开源","VS Code","主题"]', 1),
    ('competition_xcpc_tracker', 'XCPC Tracker', '前端优先、静态部署的 XCPC 题目覆盖追踪工具，支持比赛目录、成员管理、覆盖状态和做题状态同步。', 'https://github.com/mohaoz/xcpc-tracker', '竞赛', '["竞赛","算法","工具"]', 1)
)
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
  project."id",
  project."title",
  project."description",
  project."url",
  project."category",
  project."tags",
  project."isFeatured",
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
