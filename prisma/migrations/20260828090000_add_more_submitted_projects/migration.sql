-- Add the additional submitted projects once by normalized URL.
WITH "SubmittedProjects" ("id", "title", "description", "url", "category", "tags", "isFeatured") AS (
  VALUES
    ('campus_project_jufe_offer', '江财OFFER', '江财学生自发维护的实习、竞赛与学习资源导航，汇总校内开源项目、面经、优秀简历和常用入口。', 'https://github.com/woodfishhhh/jufe-offer', '校内开源项目', '["开源","江财","资源导航"]', 1),
    ('campus_project_typability', 'Typability', '基于 Milkdown 的所见即所得 Markdown 编辑器，适合以可视化方式编辑和管理 Markdown 内容。', 'https://github.com/SimonShiki/Typability', '校内开源项目', '["开源","Markdown","编辑器"]', 1)
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
