"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useEffectsMode } from "@/hooks/use-effects-mode";

const EnhancedFlameWrap = dynamic(
  () => import("@/components/canvasui/FlameWrap").then((module) => module.FlameWrap),
  { ssr: false },
);

export function ResponsiveFlameWrap({ children }: { children: ReactNode }) {
  const effectsMode = useEffectsMode();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [nearby, setNearby] = useState(false);

  useEffect(() => {
    if (effectsMode !== "enhanced") return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNearby(entry?.isIntersecting ?? false),
      { rootMargin: "25% 0px", threshold: 0.01 },
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [effectsMode]);

  return (
    <div ref={wrapperRef} className="github-flame-slot">
      {effectsMode === "enhanced" && nearby ? (
        <EnhancedFlameWrap
          color={[1, 0, 42 / 255]}
          intensity={0.55}
          height={200}
          spread={8}
          radius={37}
          speed={0.25}
          scale={1}
          turbulence={0.93}
          turbulenceScale={1.95}
          turbulenceReach={61}
          sparks={3}
          sparkSize={0.6}
          sparkDensity={0.8}
          sparkSpeed={1}
          rim={2.5}
          melt={0}
          distortion={8.5}
          smoke={0.5}
          ember={1.8}
          scorch={0}
        >
          {children}
        </EnhancedFlameWrap>
      ) : (
        children
      )}
    </div>
  );
}
