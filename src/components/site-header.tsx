"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { ExternalLink } from "@/components/external-link";
import { SiteLogoMark } from "@/components/site-logo-mark";
import { Button, buttonVariants } from "@/components/ui/button";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

const LoginDialog = dynamic(
  () => import("@/components/login-dialog").then((module) => module.LoginDialog),
  { ssr: false },
);

const MobileNavSheet = dynamic(
  () => import("@/components/mobile-nav-sheet").then((module) => module.MobileNavSheet),
  { ssr: false },
);

const navItems = [
  { href: "/", label: "首页" },
  { href: "/resources", label: "资源" },
  { href: "/friends", label: "友链" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { authenticated, setAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      setAuthenticated(false);
      toast.success("已退出登录");
    } catch {
      toast.error("退出失败，请稍后重试");
    }
  }

  return (
    <>
      <header className="border-border bg-background/86 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-5 px-5 sm:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label={`${site.name}首页`}
          >
            <SiteLogoMark className="transition-transform duration-150 ease-[var(--ease-out)] group-hover:scale-105" />
            <span className="font-display text-sm font-bold tracking-[0.12em]">
              JUFE OFFER
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="主导航">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative py-2 text-sm transition-colors duration-150 after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:origin-left after:bg-[var(--brand-red)] after:transition-transform after:duration-200 after:ease-[var(--ease-out)]",
                    active
                      ? "text-foreground font-medium after:scale-x-100"
                      : "text-muted-foreground after:scale-x-0 hover:text-[var(--brand-red)] hover:after:scale-x-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button
              type="button"
              variant="ghost"
              onClick={() => (authenticated ? void logout() : setLoginOpen(true))}
              className="text-muted-foreground"
            >
              {authenticated ? "退出" : "管理"}
            </Button>
            <ExternalLink
              href={site.qqGroupJoinUrl}
              className={buttonVariants({ variant: "default" })}
            >
              <MessageSquare />
              加入群聊
            </ExternalLink>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="打开菜单"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
        </div>
      </header>

      {open ? (
        <MobileNavSheet
          open={open}
          authenticated={authenticated}
          onOpenChange={setOpen}
          onManage={() => {
            if (authenticated) void logout();
            else setLoginOpen(true);
          }}
        />
      ) : null}
      {loginOpen ? (
        <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      ) : null}
    </>
  );
}
