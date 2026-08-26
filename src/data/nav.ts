import { BookOpen, House, UsersRound, type LucideIcon } from "lucide-react";

export type SiteNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const siteNavItems: SiteNavItem[] = [
  { href: "/", label: "首页", icon: House },
  { href: "/resources", label: "资源", icon: BookOpen },
  { href: "/friends", label: "友链", icon: UsersRound },
];
