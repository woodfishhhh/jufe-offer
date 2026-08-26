"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { ExternalLink } from "@/components/external-link";
import { SiteLogoMark } from "@/components/site-logo-mark";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/resources", label: "资源" },
  { href: "/friends", label: "友链" },
];

export function MobileNavSheet({
  open,
  authenticated,
  onOpenChange,
  onManage,
}: {
  open: boolean;
  authenticated: boolean;
  onOpenChange: (open: boolean) => void;
  onManage: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="border-border bg-background border-l p-0">
        <SheetHeader className="border-border border-b px-6 py-6">
          <div className="flex items-center gap-3">
            <SiteLogoMark />
            <div>
              <SheetTitle className="font-display text-lg font-bold tracking-[0.1em]">
                JUFE OFFER
              </SheetTitle>
              <SheetDescription>江财学生资源导航</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <nav className="flex flex-1 flex-col px-6 py-8" aria-label="移动导航">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className="group border-border flex items-center justify-between border-b py-5 text-2xl font-semibold tracking-[-0.03em]"
            >
              <span>{item.label}</span>
              <span className="text-muted-foreground font-mono text-[10px] font-normal tracking-normal">
                0{index + 1}
              </span>
            </Link>
          ))}

          <ExternalLink
            href={site.qqGroupJoinUrl}
            className={cn(buttonVariants({ size: "lg" }), "mt-8")}
          >
            <MessageSquare />
            一键加入群聊
          </ExternalLink>

          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground mt-auto"
            onClick={() => {
              onOpenChange(false);
              onManage();
            }}
          >
            {authenticated ? "退出登录" : "管理员登录"}
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
