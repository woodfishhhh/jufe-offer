-- Remove the training-camp directory without mislabeling those resources as interview notes.
UPDATE "Resource"
SET
  "category" = '编程学习',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "category" = '训练营';

-- Existing interview experiences and guides belong in the new interview-notes directory.
UPDATE "Resource"
SET
  "category" = '面经',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "category" = '简历与面试';

-- LeetCode is a competition and practice platform in the directory taxonomy.
UPDATE "Resource"
SET
  "category" = '竞赛',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'LeetCode'
  AND "category" = '编程学习';

-- Add the requested competition, learning-route, and resume references once by URL.
WITH "CuratedResources" ("id", "title", "description", "url", "category", "tags", "isFeatured") AS (
  VALUES
    ('competition_atcoder', 'AtCoder', '国际算法竞赛平台，定期举办高质量编程比赛，适合训练算法与实现能力。', 'https://atcoder.jp/', '竞赛', '["竞赛","算法","ICPC"]', 1),
    ('competition_luogu', '洛谷', '中文编程题库与竞赛社区，覆盖算法训练、题解交流和在线比赛。', 'https://www.luogu.com.cn/', '竞赛', '["竞赛","算法","题库"]', 1),
    ('competition_acwing', 'AcWing', '面向算法学习与竞赛训练的平台，提供课程、题库、活动和社区交流。', 'https://www.acwing.com/about/', '竞赛', '["竞赛","算法","学习社区"]', 0),
    ('competition_virtual_judge', 'Virtual Judge', '聚合多个在线评测平台的 Virtual Judge，方便参加跨平台算法训练和比赛。', 'https://vjudge.net/', '竞赛', '["竞赛","OJ","算法"]', 0),
    ('competition_starrycoding', '星码 StarryCoding', '面向算法竞赛入门的学习平台，适合从基础开始建立刷题和竞赛习惯。', 'https://www.starrycoding.com/', '竞赛', '["竞赛","算法","入门"]', 0),
    ('competition_cftracker', 'CFTracker', 'Codeforces 比赛日历与信息查询工具，方便关注比赛安排和训练计划。', 'https://cftracker.netlify.app/contests', '竞赛', '["Codeforces","竞赛","工具"]', 0),
    ('learning_route_qq_mind', '算法与编程学习路线思维导图', '腾讯文档思维导图形式的算法与编程学习路线，适合梳理阶段目标和知识结构。', 'https://docs.qq.com/mind/DS2FhYVpvcFRvSUti', '学习路线', '["路线图","算法","思维导图"]', 1),
    ('learning_route_front_talk', '前端学习路线 · Front Talk', '前端方向学习路线，按基础、工程实践和进阶方向整理学习内容。', 'https://front-talk.com/roadmap', '学习路线', '["前端","路线图","Web"]', 1),
    ('learning_route_backend_video', '后端学习路线', '面向后端开发学习的路线视频，帮助梳理语言、框架、数据库和工程实践。', 'https://www.bilibili.com/video/BV1Z6YCzSEWq/', '学习路线', '["后端","路线图","视频"]', 0),
    ('learning_route_llm_video', '快速入门大模型应用开发', '大模型应用开发入门视频，适合了解模型调用、应用构建和实践方向。', 'https://www.bilibili.com/video/BV1Dwwnz8ExP/', '学习路线', '["大模型","AI","视频"]', 0),
    ('learning_route_java_video', 'Java 学习路线与大厂实习准备', '围绕 Java 学习、项目积累和实习准备整理的经验分享视频。', 'https://www.bilibili.com/video/BV1EQE4zMEpP/', '学习路线', '["Java","后端","实习"]', 0),
    ('learning_route_agent_video', '我的 Agent 学习路线', 'Agent 方向学习路线分享，适合了解智能体基础概念和实践切入点。', 'https://www.bilibili.com/video/BV1thRcBpEtZ/', '学习路线', '["Agent","AI","视频"]', 0),
    ('learning_route_frontend_interaction_video', '前端交互学习路线', '以前端交互为主题的学习路线视频，适合补充页面交互和动效实践。', 'https://www.bilibili.com/video/BV1CCuxzHEus/', '学习路线', '["前端","交互","视频"]', 0),
    ('resume_nowcoder_template_breakdown', '牛客：技术岗校招简历模板深度拆解', '从结构、信息密度、项目表达和量化结果等角度拆解技术岗校招简历模板。', 'https://www.nowcoder.com/discuss/865554536985853952', '优秀简历', '["简历","校招","技术岗"]', 1),
    ('resume_nowcoder_application_guide', '牛客：校招简历准备与模板', '整理校招简历中的教育背景、经历描述、荣誉和技能模块写法，并提供模板参考。', 'https://www.nowcoder.com/discuss/353159519880552448', '优秀简历', '["简历","校招","模板"]', 1),
    ('resume_nowcoder_project_writing', '牛客：简历系列与项目经历写法', '围绕项目经历和简历内容迭代的系列文章，适合对照检查项目表达。', 'https://www.nowcoder.com/discuss/353159535340756992', '优秀简历', '["简历","项目经历","求职"]', 0),
    ('resume_tech_interview_handbook', 'Tech Interview Handbook：简历指南', '面向软件工程求职的英文简历指南，覆盖筛选逻辑、内容组织和 ATS 友好写法。', 'https://www.techinterviewhandbook.org/resume/', '优秀简历', '["简历","英文","软件工程"]', 1),
    ('resume_awesome_cv', 'Awesome CV', '开源 LaTeX 简历与求职信模板，适合需要自行排版和维护源文件的同学。', 'https://github.com/posquit0/Awesome-CV', '优秀简历', '["简历","LaTeX","开源"]', 0),
    ('resume_sb2nov', 'sb2nov Resume', '开源软件工程师英文简历示例与 LaTeX 源文件，适合参考技术经历的组织方式。', 'https://github.com/sb2nov/resume', '优秀简历', '["简历","英文","LaTeX"]', 0)
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
  curated."id",
  curated."title",
  curated."description",
  curated."url",
  curated."category",
  curated."tags",
  curated."isFeatured",
  'MANUAL',
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "CuratedResources" AS curated
WHERE NOT EXISTS (
  SELECT 1
  FROM "Resource" AS resource
  WHERE lower(rtrim(resource."url", '/')) = lower(rtrim(curated."url", '/'))
);
