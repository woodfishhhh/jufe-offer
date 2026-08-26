"use client";

import { ResilientImage } from "@/components/resilient-image";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export function SiteLogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "border-border relative size-9 shrink-0 overflow-hidden rounded-full border bg-white",
        className,
      )}
      aria-hidden="true"
    >
      <ResilientImage
        src={site.logoSrc}
        alt=""
        width={72}
        height={72}
        sizes="36px"
        loading="eager"
        fetchPriority="high"
        className="h-full w-full object-cover"
      />
    </span>
  );
}
