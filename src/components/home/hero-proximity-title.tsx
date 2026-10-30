"use client";

import { VisitorCountBadge } from "@/components/home/visitor-count-badge";

export function HeroProximityTitle() {
  return (
    <div className="hero-proximity-title">
      <h1 className="font-display mt-4 text-[64px] leading-[0.78] font-bold tracking-[-0.075em] sm:mt-7 sm:text-[112px] lg:text-[138px]">
        <span className="block">
          JUFE
        </span>
        <span className="ml-[0.38em] block">
          OFFER
        </span>
      </h1>
      <VisitorCountBadge />
    </div>
  );
}
