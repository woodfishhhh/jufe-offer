"use client";

import { useRef } from "react";
import { VariableProximity } from "@/components/variable-proximity";

export function HeroProximityTitle() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="hero-proximity-title">
      <h1 className="font-display mt-4 text-[64px] leading-[0.78] font-bold tracking-[-0.075em] sm:mt-7 sm:text-[112px] lg:text-[138px]">
        <span className="block">
          <VariableProximity
            label="JUFE"
            containerRef={containerRef}
            fromFontVariationSettings="'wght' 650"
            toFontVariationSettings="'wght' 900"
            radius={125}
          />
        </span>
        <span className="ml-[0.38em] block">
          <VariableProximity
            label="OFFER"
            containerRef={containerRef}
            fromFontVariationSettings="'wght' 650"
            toFontVariationSettings="'wght' 900"
            radius={125}
          />
        </span>
      </h1>
    </div>
  );
}
