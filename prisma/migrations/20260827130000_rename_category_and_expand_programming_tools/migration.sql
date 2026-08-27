-- Rename the public directory category while preserving existing resources.
UPDATE "Resource"
SET
  "category" = '校内开源项目',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "category" = '开源项目';

-- Add the approved programming IDE and AI Agent entries once by normalized URL.
WITH "ApprovedProgrammingTools" ("id", "title", "description", "url", "tags", "isFeatured") AS (
  VALUES
    ('programming_tool_cursor', 'Cursor', '面向 AI 编程的代码编辑器，支持代码库理解、补全、重构和 Agent 工作流。', 'https://www.cursor.com/', '["IDE","AI","Agent"]', 1),
    ('programming_tool_windsurf', 'Windsurf', '面向 Agent 工作流的 AI IDE，支持上下文理解、代码生成与任务执行。', 'https://windsurf.com/', '["IDE","AI","Agent"]', 1),
    ('programming_tool_intellij_idea', 'IntelliJ IDEA', '面向 Java 和 Kotlin 开发的 IDE，提供代码分析、调试、测试与项目管理能力。', 'https://www.jetbrains.com/idea/', '["IDE","Java","Kotlin"]', 1),
    ('programming_tool_pycharm', 'PyCharm', '面向 Python 开发的 IDE，支持项目管理、调试、测试和 Web 开发。', 'https://www.jetbrains.com/pycharm/', '["IDE","Python","开发环境"]', 1),
    ('programming_tool_clion', 'CLion', '面向 C 和 C++ 的 IDE，提供代码分析、调试、测试和 CMake 支持。', 'https://www.jetbrains.com/clion/', '["IDE","C++","CMake"]', 0),
    ('programming_tool_visual_studio', 'Visual Studio', '面向 .NET、C++ 等技术栈的完整 IDE，适合 Windows、云服务与跨平台开发。', 'https://visualstudio.microsoft.com/', '["IDE",".NET","C++"]', 0),
    ('programming_tool_github_copilot', 'GitHub Copilot', '覆盖 IDE、GitHub 和命令行的 AI 编程助手，支持补全、问答与代理任务。', 'https://github.com/features/copilot', '["AI","Agent","GitHub"]', 1),
    ('programming_tool_openai_codex', 'OpenAI Codex', '面向软件开发任务的 AI Agent，可在编辑器、终端和网页工作流中协作编码。', 'https://openai.com/codex/', '["AI","Agent","终端"]', 1),
    ('programming_tool_claude_code', 'Claude Code', '面向代码库的终端与 IDE 编程 Agent，适合理解项目、修改代码和运行验证。', 'https://www.anthropic.com/claude-code', '["AI","Agent","终端"]', 1),
    ('programming_tool_opencode', 'OpenCode', '开源终端编程 Agent，适合在命令行中进行代码理解、修改和验证。', 'https://opencode.ai/', '["AI","Agent","终端","开源"]', 0),
    ('programming_tool_grok_build', 'Grok', 'xAI 的 Grok Build 终端编程 Agent，适合探索代码库理解、任务执行与开发工作流。', 'https://docs.x.ai/build/overview', '["AI","Agent","终端"]', 1)
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
  tool."id",
  tool."title",
  tool."description",
  tool."url",
  '编程工具',
  tool."tags",
  tool."isFeatured",
  'MANUAL',
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "ApprovedProgrammingTools" AS tool
WHERE NOT EXISTS (
  SELECT 1
  FROM "Resource" AS resource
  WHERE lower(rtrim(resource."url", '/')) = lower(rtrim(tool."url", '/'))
);
