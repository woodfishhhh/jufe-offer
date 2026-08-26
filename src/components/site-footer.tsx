"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname === "/resources") return null;

  return (
    <footer className="bg-foreground text-background mt-auto border-t border-white/12">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-sm font-bold tracking-[0.12em]">JUFE OFFER</p>
          <p className="text-background/45 mt-3 max-w-xl text-xs leading-5">
            {site.disclaimer}
          </p>
        </div>
        <div className="text-background/65 flex flex-wrap items-center gap-5 text-sm">
          <Link
            href="/resources"
            className="hover:text-background transition-colors duration-150"
          >
            资源
          </Link>
          <Link
            href="/friends"
            className="hover:text-background transition-colors duration-150"
          >
            友链
          </Link>
          <span className="font-mono text-xs">QQ {site.qqGroupNumber}</span>
        </div>
      </div>
    </footer>
  );
}
