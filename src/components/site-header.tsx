"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { FluidNav } from "@/components/fluid-nav";
import { SiteLogoMark } from "@/components/site-logo-mark";
import { Button } from "@/components/ui/button";
import { site } from "@/data/site";

const LoginDialog = dynamic(
  () => import("@/components/login-dialog").then((module) => module.LoginDialog),
  { ssr: false },
);

function HeaderChip({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`site-header__chip ${className ?? ""}`.trim()}>{children}</div>;
}

export function SiteHeader() {
  const pathname = usePathname();
  const { authenticated, setAuthenticated } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  if (pathname.startsWith("/playground")) return null;

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
      <header className="site-header">
        <HeaderChip className="site-header__chip--brand">
          <Link href="/" className="site-header__brand" aria-label={`${site.name}首页`}>
            <SiteLogoMark className="size-7 border-black/10 sm:size-8" />
            <span className="site-header__brand-label" aria-hidden="true">
              <span>JUFE</span>
              <span>OFFER</span>
            </span>
          </Link>
        </HeaderChip>

        <HeaderChip className="site-header__chip--nav">
          <FluidNav />
        </HeaderChip>

        <HeaderChip className="site-header__chip--action">
          <Button
            type="button"
            variant="ghost"
            onClick={() => (authenticated ? void logout() : setLoginOpen(true))}
            className="site-header__action"
          >
            {authenticated ? "退出" : "管理"}
          </Button>
        </HeaderChip>
      </header>

      {loginOpen ? (
        <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      ) : null}
    </>
  );
}
