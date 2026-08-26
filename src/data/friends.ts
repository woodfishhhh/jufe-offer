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
    name: "计算机协会",
    description: "成立于 1996 年的江财学术社团",
    url: "https://www.jxufe-cs.top/",
    domain: "www.jxufe-cs.top",
    group: "official",
    icon: "/api/friend-avatars/jxufe-cs",
  },
  {
    name: "网络安全协会",
    description: "江西财经大学网络安全协会",
    url: "https://csec.jxufe.edu.cn/",
    domain: "csec.jxufe.edu.cn",
    group: "official",
    icon: "/api/friend-avatars/network-security",
  },
  {
    name: "woodfish",
    description: "我喜欢你",
    url: "https://blog.woodfish.site/",
    domain: "blog.woodfish.site",
    group: "personal",
    icon: "/friends/woodfish.jpg",
  },
  {
    name: "有毒的羊",
    description: "小羊，我的小羊",
    url: "https://poisonous-sheep.github.io/",
    domain: "poisonous-sheep.github.io",
    group: "personal",
    icon: "/api/friend-avatars/poisonous-sheep",
  },
  {
    name: "miuma",
    description: "蒋涛哥哥什么时候带我拿金牌",
    url: "https://www.miuma.top/",
    domain: "www.miuma.top",
    group: "personal",
    icon: "/api/friend-avatars/miuma",
  },
  {
    name: "糖糖球",
    description: "可爱就对了",
    url: "https://tantanchugasuki.cn/",
    domain: "tantanchugasuki.cn",
    group: "personal",
    icon: "/api/friend-avatars/tangtangqiu",
  },
  {
    name: "JunieXD",
    description: "保研学长",
    url: "https://juniexd.cn/",
    domain: "juniexd.cn",
    group: "personal",
    icon: "/api/friend-avatars/juniexd",
  },
];
