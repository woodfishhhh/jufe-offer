export const site = {
  name: "江财OFFER",
  shortName: "OFFER",
  tagline: "实习、竞赛、学习资源。",
  description: "江财学生资源导航。",
  disclaimer: "江财OFFER是学生自发维护的非官方社区，不代表江西财经大学官方立场。",
  communityCardTitle: `打破信息差`,
  qqGroupName: "计算机江财OFFER",
  qqGroupPurpose: "实习、竞赛和学习资料交流。",
  qqGroupNumber: "729592444",
  qqGroupJoinUrl: "https://qm.qq.com/q/Hz6xLo2qAc",
  qqGroupQrSrc: "/QQ群_compressed.png",
  logoSrc: "/0b9e02d4fcddecc48d4b61e79cb26f16_compressed.png",
  defaultUrl: "http://localhost:3000",
} as const;

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || site.defaultUrl;
}
