export const FRIEND_CATEGORIES = [
  "学校相关",
  "求职招聘",
  "编程学习",
  "算法竞赛",
  "开源社区",
  "开发工具",
  "学生社区",
] as const;

export type FriendCategory = (typeof FRIEND_CATEGORIES)[number];

export type FriendLink = {
  name: string;
  description: string;
  url: string;
  category: FriendCategory;
  icon?: string;
};

export const friends: FriendLink[] = [
  {
    name: "江西财经大学",
    description: "学校官网，查询通知、院系和校内入口。",
    url: "https://www.jxufe.edu.cn",
    category: "学校相关",
  },
  {
    name: "江西财经大学图书馆",
    description: "馆藏检索、电子资源和学习空间信息。",
    url: "https://lib.jxufe.edu.cn",
    category: "学校相关",
  },
  {
    name: "国家大学生就业服务平台",
    description: "教育部就业服务平台，提供岗位、活动和政策信息。",
    url: "https://www.ncss.cn",
    category: "求职招聘",
  },
  {
    name: "牛客网",
    description: "求职、笔试练习、面经和讨论社区。",
    url: "https://www.nowcoder.com",
    category: "求职招聘",
  },
  {
    name: "MDN Web Docs",
    description: "Web 技术权威文档，适合系统查阅 HTML、CSS 和 JavaScript。",
    url: "https://developer.mozilla.org/zh-CN/",
    category: "编程学习",
  },
  {
    name: "LeetCode",
    description: "算法题库和讨论区，适合日常刷题。",
    url: "https://leetcode.cn",
    category: "算法竞赛",
  },
  {
    name: "Codeforces",
    description: "国际算法竞赛平台，赛制完整、题库丰富。",
    url: "https://codeforces.com",
    category: "算法竞赛",
  },
  {
    name: "GitHub",
    description: "开源代码托管与协作平台。",
    url: "https://github.com",
    category: "开源社区",
  },
  {
    name: "Visual Studio Code",
    description: "常用代码编辑器，插件生态完整。",
    url: "https://code.visualstudio.com",
    category: "开发工具",
  },
  {
    name: "Stack Overflow",
    description: "开发问答社区，排查具体技术问题时很有用。",
    url: "https://stackoverflow.com",
    category: "开发工具",
  },
  {
    name: "掘金",
    description: "中文技术社区，适合看实践经验和专题整理。",
    url: "https://juejin.cn",
    category: "学生社区",
  },
];
