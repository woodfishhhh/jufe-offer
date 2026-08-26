import { PrismaClient, ResourceOrigin } from "@prisma/client";

const prisma = new PrismaClient();

const resources = [
  {
    title: "GitHub",
    description: "全球最大的开源代码托管平台，适合阅读项目、提交 Issue 和参与开源。",
    url: "https://github.com",
    category: "开源项目",
    tags: ["开源", "协作", "代码托管"],
    isFeatured: true,
  },
  {
    title: "MDN Web Docs",
    description: "Mozilla 维护的 Web 技术文档，查询 HTML、CSS、JavaScript 和浏览器 API 的首选。",
    url: "https://developer.mozilla.org/zh-CN/",
    category: "编程学习",
    tags: ["前端", "文档", "Web"],
    isFeatured: true,
  },
  {
    title: "LeetCode",
    description: "算法与数据结构练习平台，适合准备笔试和面试中的编程题。",
    url: "https://leetcode.cn",
    category: "编程学习",
    tags: ["算法", "刷题", "面试"],
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
    category: "开源项目",
    tags: ["开源", "实习经历", "社区"],
    isFeatured: true,
  },
  {
    title: "Datawhale",
    description: "开源学习社区，常组织数据科学、机器学习和编程方向的学习活动。",
    url: "https://www.datawhale.cn",
    category: "训练营",
    tags: ["数据科学", "学习社区", "训练营"],
    isFeatured: false,
  },
  {
    title: "HelloGitHub",
    description: "分享有趣、入门友好的开源项目，适合扩展技术视野。",
    url: "https://hellogithub.com",
    category: "开源项目",
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
  {
    title: "Visual Studio Code",
    description: "目前最常用的代码编辑器之一，插件丰富，适合日常开发。",
    url: "https://code.visualstudio.com",
    category: "编程工具",
    tags: ["编辑器", "工具", "开发环境"],
    isFeatured: false,
  },
  {
    title: "Tech Interview Handbook",
    description: "开源面试准备手册，覆盖算法、系统设计和求职流程。",
    url: "https://www.techinterviewhandbook.org/zh-hans/",
    category: "简历与面试",
    tags: ["面试", "算法", "求职"],
    isFeatured: true,
  },
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
