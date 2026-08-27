import { PrismaClient, ResourceOrigin } from "@prisma/client";

const prisma = new PrismaClient();

const programmingToolResources = [
  {
    title: "Cursor",
    description: "面向 AI 编程的代码编辑器，支持代码库理解、补全、重构和 Agent 工作流。",
    url: "https://www.cursor.com/",
    category: "编程工具",
    tags: ["IDE", "AI", "Agent"],
    isFeatured: true,
  },
  {
    title: "Windsurf",
    description: "面向 Agent 工作流的 AI IDE，支持上下文理解、代码生成与任务执行。",
    url: "https://windsurf.com/",
    category: "编程工具",
    tags: ["IDE", "AI", "Agent"],
    isFeatured: true,
  },
  {
    title: "IntelliJ IDEA",
    description:
      "面向 Java 和 Kotlin 开发的 IDE，提供代码分析、调试、测试与项目管理能力。",
    url: "https://www.jetbrains.com/idea/",
    category: "编程工具",
    tags: ["IDE", "Java", "Kotlin"],
    isFeatured: true,
  },
  {
    title: "PyCharm",
    description: "面向 Python 开发的 IDE，支持项目管理、调试、测试和 Web 开发。",
    url: "https://www.jetbrains.com/pycharm/",
    category: "编程工具",
    tags: ["IDE", "Python", "开发环境"],
    isFeatured: true,
  },
  {
    title: "CLion",
    description: "面向 C 和 C++ 的 IDE，提供代码分析、调试、测试和 CMake 支持。",
    url: "https://www.jetbrains.com/clion/",
    category: "编程工具",
    tags: ["IDE", "C++", "CMake"],
    isFeatured: false,
  },
  {
    title: "Visual Studio",
    description: "面向 .NET、C++ 等技术栈的完整 IDE，适合 Windows、云服务与跨平台开发。",
    url: "https://visualstudio.microsoft.com/",
    category: "编程工具",
    tags: ["IDE", ".NET", "C++"],
    isFeatured: false,
  },
  {
    title: "GitHub Copilot",
    description: "覆盖 IDE、GitHub 和命令行的 AI 编程助手，支持补全、问答与代理任务。",
    url: "https://github.com/features/copilot",
    category: "编程工具",
    tags: ["AI", "Agent", "GitHub"],
    isFeatured: true,
  },
  {
    title: "OpenAI Codex",
    description: "面向软件开发任务的 AI Agent，可在编辑器、终端和网页工作流中协作编码。",
    url: "https://openai.com/codex/",
    category: "编程工具",
    tags: ["AI", "Agent", "终端"],
    isFeatured: true,
  },
  {
    title: "Claude Code",
    description: "面向代码库的终端与 IDE 编程 Agent，适合理解项目、修改代码和运行验证。",
    url: "https://www.anthropic.com/claude-code",
    category: "编程工具",
    tags: ["AI", "Agent", "终端"],
    isFeatured: true,
  },
  {
    title: "OpenCode",
    description: "开源终端编程 Agent，适合在命令行中进行代码理解、修改和验证。",
    url: "https://opencode.ai/",
    category: "编程工具",
    tags: ["AI", "Agent", "终端", "开源"],
    isFeatured: false,
  },
  {
    title: "Grok",
    description:
      "xAI 的 Grok Build 终端编程 Agent，适合探索代码库理解、任务执行与开发工作流。",
    url: "https://docs.x.ai/build/overview",
    category: "编程工具",
    tags: ["AI", "Agent", "终端"],
    isFeatured: true,
  },
];

const competitionResources = [
  {
    title: "AtCoder",
    description: "国际算法竞赛平台，定期举办高质量编程比赛，适合训练算法与实现能力。",
    url: "https://atcoder.jp/",
    category: "竞赛",
    tags: ["竞赛", "算法", "ICPC"],
    isFeatured: true,
  },
  {
    title: "洛谷",
    description: "中文编程题库与竞赛社区，覆盖算法训练、题解交流和在线比赛。",
    url: "https://www.luogu.com.cn/",
    category: "竞赛",
    tags: ["竞赛", "算法", "题库"],
    isFeatured: true,
  },
  {
    title: "AcWing",
    description: "面向算法学习与竞赛训练的平台，提供课程、题库、活动和社区交流。",
    url: "https://www.acwing.com/about/",
    category: "竞赛",
    tags: ["竞赛", "算法", "学习社区"],
    isFeatured: false,
  },
  {
    title: "Virtual Judge",
    description: "聚合多个在线评测平台的 Virtual Judge，方便参加跨平台算法训练和比赛。",
    url: "https://vjudge.net/",
    category: "竞赛",
    tags: ["竞赛", "OJ", "算法"],
    isFeatured: false,
  },
  {
    title: "星码 StarryCoding",
    description: "面向算法竞赛入门的学习平台，适合从基础开始建立刷题和竞赛习惯。",
    url: "https://www.starrycoding.com/",
    category: "竞赛",
    tags: ["竞赛", "算法", "入门"],
    isFeatured: false,
  },
  {
    title: "CFTracker",
    description: "Codeforces 比赛日历与信息查询工具，方便关注比赛安排和训练计划。",
    url: "https://cftracker.netlify.app/contests",
    category: "竞赛",
    tags: ["Codeforces", "竞赛", "工具"],
    isFeatured: false,
  },
];

const learningRouteResources = [
  {
    title: "算法与编程学习路线思维导图",
    description: "腾讯文档思维导图形式的算法与编程学习路线，适合梳理阶段目标和知识结构。",
    url: "https://docs.qq.com/mind/DS2FhYVpvcFRvSUti",
    category: "学习路线",
    tags: ["路线图", "算法", "思维导图"],
    isFeatured: true,
  },
  {
    title: "前端学习路线 · Front Talk",
    description: "前端方向学习路线，按基础、工程实践和进阶方向整理学习内容。",
    url: "https://front-talk.com/roadmap",
    category: "学习路线",
    tags: ["前端", "路线图", "Web"],
    isFeatured: true,
  },
  {
    title: "后端学习路线",
    description: "面向后端开发学习的路线视频，帮助梳理语言、框架、数据库和工程实践。",
    url: "https://www.bilibili.com/video/BV1Z6YCzSEWq/",
    category: "学习路线",
    tags: ["后端", "路线图", "视频"],
    isFeatured: false,
  },
  {
    title: "快速入门大模型应用开发",
    description: "大模型应用开发入门视频，适合了解模型调用、应用构建和实践方向。",
    url: "https://www.bilibili.com/video/BV1Dwwnz8ExP/",
    category: "学习路线",
    tags: ["大模型", "AI", "视频"],
    isFeatured: false,
  },
  {
    title: "Java 学习路线与大厂实习准备",
    description: "围绕 Java 学习、项目积累和实习准备整理的经验分享视频。",
    url: "https://www.bilibili.com/video/BV1EQE4zMEpP/",
    category: "学习路线",
    tags: ["Java", "后端", "实习"],
    isFeatured: false,
  },
  {
    title: "我的 Agent 学习路线",
    description: "Agent 方向学习路线分享，适合了解智能体基础概念和实践切入点。",
    url: "https://www.bilibili.com/video/BV1thRcBpEtZ/",
    category: "学习路线",
    tags: ["Agent", "AI", "视频"],
    isFeatured: false,
  },
  {
    title: "前端交互学习路线",
    description: "以前端交互为主题的学习路线视频，适合补充页面交互和动效实践。",
    url: "https://www.bilibili.com/video/BV1CCuxzHEus/",
    category: "学习路线",
    tags: ["前端", "交互", "视频"],
    isFeatured: false,
  },
];

const excellentResumeResources = [
  {
    title: "牛客：技术岗校招简历模板深度拆解",
    description: "从结构、信息密度、项目表达和量化结果等角度拆解技术岗校招简历模板。",
    url: "https://www.nowcoder.com/discuss/865554536985853952",
    category: "优秀简历",
    tags: ["简历", "校招", "技术岗"],
    isFeatured: true,
  },
  {
    title: "牛客：校招简历准备与模板",
    description:
      "整理校招简历中的教育背景、经历描述、荣誉和技能模块写法，并提供模板参考。",
    url: "https://www.nowcoder.com/discuss/353159519880552448",
    category: "优秀简历",
    tags: ["简历", "校招", "模板"],
    isFeatured: true,
  },
  {
    title: "牛客：简历系列与项目经历写法",
    description: "围绕项目经历和简历内容迭代的系列文章，适合对照检查项目表达。",
    url: "https://www.nowcoder.com/discuss/353159535340756992",
    category: "优秀简历",
    tags: ["简历", "项目经历", "求职"],
    isFeatured: false,
  },
  {
    title: "Tech Interview Handbook：简历指南",
    description:
      "面向软件工程求职的英文简历指南，覆盖筛选逻辑、内容组织和 ATS 友好写法。",
    url: "https://www.techinterviewhandbook.org/resume/",
    category: "优秀简历",
    tags: ["简历", "英文", "软件工程"],
    isFeatured: true,
  },
  {
    title: "Awesome CV",
    description: "开源 LaTeX 简历与求职信模板，适合需要自行排版和维护源文件的同学。",
    url: "https://github.com/posquit0/Awesome-CV",
    category: "优秀简历",
    tags: ["简历", "LaTeX", "开源"],
    isFeatured: false,
  },
  {
    title: "sb2nov Resume",
    description:
      "开源软件工程师英文简历示例与 LaTeX 源文件，适合参考技术经历的组织方式。",
    url: "https://github.com/sb2nov/resume",
    category: "优秀简历",
    tags: ["简历", "英文", "LaTeX"],
    isFeatured: false,
  },
];

const resources = [
  {
    title: "GitHub",
    description: "全球最大的开源代码托管平台，适合阅读项目、提交 Issue 和参与开源。",
    url: "https://github.com",
    category: "校内开源项目",
    tags: ["开源", "协作", "代码托管"],
    isFeatured: true,
  },
  {
    title: "MDN Web Docs",
    description:
      "Mozilla 维护的 Web 技术文档，查询 HTML、CSS、JavaScript 和浏览器 API 的首选。",
    url: "https://developer.mozilla.org/zh-CN/",
    category: "编程学习",
    tags: ["前端", "文档", "Web"],
    isFeatured: true,
  },
  {
    title: "LeetCode",
    description: "算法与数据结构练习平台，适合准备笔试和面试中的编程题。",
    url: "https://leetcode.cn",
    category: "竞赛",
    tags: ["竞赛", "算法", "刷题"],
    isFeatured: true,
  },
  {
    title: "Codeforces",
    description: "国际算法竞赛平台，定期举办比赛，题库和赛后题解都很完整。",
    url: "https://codeforces.com",
    category: "竞赛",
    tags: ["竞赛", "算法", "ICPC"],
    isFeatured: false,
  },
  ...competitionResources,
  {
    title: "牛客网",
    description: "国内常见的求职社区，可找实习校招、刷笔试题和阅读面经。",
    url: "https://www.nowcoder.com",
    category: "实习与校招",
    tags: ["校招", "实习", "面经"],
    isFeatured: true,
  },
  {
    title: "中国大学生服务外包创新创业大赛",
    description: "面向大学生的服务外包与软件创新赛事，可关注当年赛题和报名通知。",
    url: "https://www.fwwb.org.cn",
    category: "竞赛",
    tags: ["竞赛", "服务外包", "创新创业"],
    isFeatured: false,
  },
  {
    title: "开源之夏",
    description: "中科院软件所发起的开源贡献活动，学生可申请项目并获得社区导师指导。",
    url: "https://summer-ospp.ac.cn",
    category: "校内开源项目",
    tags: ["开源", "实习经历", "社区"],
    isFeatured: true,
  },
  {
    title: "Datawhale",
    description: "开源学习社区，常组织数据科学、机器学习和编程方向的学习活动。",
    url: "https://www.datawhale.cn",
    category: "编程学习",
    tags: ["数据科学", "学习社区", "课程"],
    isFeatured: false,
  },
  {
    title: "HelloGitHub",
    description: "分享有趣、入门友好的开源项目，适合扩展技术视野。",
    url: "https://hellogithub.com",
    category: "校内开源项目",
    tags: ["开源", "发现", "入门"],
    isFeatured: false,
  },
  {
    title: "现代 JavaScript 教程",
    description: "系统讲解 JavaScript 语言本身，适合打前端和全栈基础。",
    url: "https://zh.javascript.info",
    category: "编程学习",
    tags: ["JavaScript", "前端", "教程"],
    isFeatured: false,
  },
  {
    title: "Developer Roadmaps",
    description: "按方向整理的学习路线图，覆盖前端、后端、数据等常见路径。",
    url: "https://roadmap.sh",
    category: "学习路线",
    tags: ["路线图", "自学", "职业方向"],
    isFeatured: true,
  },
  ...learningRouteResources,
  {
    title: "Visual Studio Code",
    description: "目前最常用的代码编辑器之一，插件丰富，适合日常开发。",
    url: "https://code.visualstudio.com",
    category: "编程工具",
    tags: ["编辑器", "工具", "开发环境"],
    isFeatured: false,
  },
  ...programmingToolResources,
  {
    title: "Tech Interview Handbook",
    description: "开源面试准备手册，覆盖算法、系统设计和求职流程。",
    url: "https://www.techinterviewhandbook.org/zh-hans/",
    category: "面经",
    tags: ["面试", "算法", "求职"],
    isFeatured: true,
  },
  ...excellentResumeResources,
  {
    title: "CS 自学指南",
    description: "计算机自学路径整理，适合补充课内没有覆盖的基础和项目经验。",
    url: "https://csdiy.wiki",
    category: "学习路线",
    tags: ["自学", "计算机基础", "课程"],
    isFeatured: false,
  },
  {
    title: "江西财经大学",
    description: "学校官网，可进入通知、院系、教务和校内服务入口。",
    url: "https://www.jxufe.edu.cn",
    category: "江财校内资源",
    tags: ["江财", "官网", "校内"],
    isFeatured: true,
  },
];

async function main() {
  await prisma.resource.deleteMany();

  for (const resource of resources) {
    await prisma.resource.create({
      data: {
        title: resource.title,
        description: resource.description,
        url: resource.url,
        category: resource.category,
        tags: JSON.stringify(resource.tags),
        isFeatured: resource.isFeatured,
        origin: ResourceOrigin.SEED,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
