export const FRIEND_GROUPS = [
  {
    id: "official",
    eyebrow: "Official",
    title: "官方卡片",
    description: "学校组织与官方平台。",
  },
  {
    id: "personal",
    eyebrow: "Personal",
    title: "个人卡片",
    description: "校友与成员的个人站点。",
  },
] as const;

export type FriendGroup = (typeof FRIEND_GROUPS)[number]["id"];

export type FriendLink = {
  name: string;
  description: string;
  url: string;
  domain: string;
  group: FriendGroup;
  icon?: string;
};

export const friends: FriendLink[] = [
  {
    name: "程序设计竞赛协会",
    description: "江西财经大学程序设计竞赛协会",
    url: "https://jxufe-acm.cn/",
    domain: "jxufe-acm.cn",
    group: "official",
    icon: "/friends/jxufe-acm.png",
  },
  {
    name: "woodfish",
    description: "我喜欢你",
    url: "https://blog.woodfish.site/",
    domain: "blog.woodfish.site",
    group: "personal",
    icon: "/friends/woodfish.jpg",
  },
];
