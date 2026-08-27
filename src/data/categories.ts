export const CATEGORY_VALUES = [
  "实习与校招",
  "编程学习",
  "竞赛",
  "Hackathon",
  "开源项目",
  "训练营",
  "学习路线",
  "编程工具",
  "简历与面试",
  "江财校内资源",
  "其他资源",
] as const;

export type Category = (typeof CATEGORY_VALUES)[number];

export const RESOURCE_DIRECTORY_CATEGORY_VALUES = [
  "开源项目",
  "实习与校招",
  "学习路线",
  "编程学习",
  "竞赛",
  "Hackathon",
  "训练营",
  "编程工具",
  "简历与面试",
  "江财校内资源",
  "其他资源",
] as const satisfies readonly Category[];

export const HOME_CATEGORY_PREVIEWS: {
  category: Category;
  summary: string;
}[] = [
  { category: "实习与校招", summary: "实习、校招和求职信息入口" },
  { category: "编程学习", summary: "文档、教程和练习平台" },
  { category: "竞赛", summary: "算法、服务外包等赛事" },
  { category: "开源项目", summary: "值得参与和阅读的开源项目" },
  { category: "简历与面试", summary: "简历模板和面试准备资料" },
  { category: "江财校内资源", summary: "学校官网和校内常用入口" },
];

export function isCategory(value: string): value is Category {
  return (CATEGORY_VALUES as readonly string[]).includes(value);
}
