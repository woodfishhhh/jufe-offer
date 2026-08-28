"use client";

import { useEffect, useState, type ComponentType } from "react";

import type { AsciiObjectProps } from "@/components/canvasui/AsciiObject";
import { ResilientImage } from "@/components/resilient-image";
import { site } from "@/data/site";
import { useEffectsMode } from "@/hooks/use-effects-mode";
import { scheduleIdle, supportsWebGL2 } from "@/lib/client-performance";
import { cn } from "@/lib/utils";

export function EmblemCanvas({ className }: { className?: string }) {
  const [renderer, setRenderer] = useState<ComponentType<AsciiObjectProps> | null>(null);
  const [mode, setMode] = useState<"loading" | "active" | "fallback">("loading");
  const effectsMode = useEffectsMode();
  const effectsAllowed = effectsMode === "enhanced";

  useEffect(() => {
    if (!effectsAllowed) return;
    let cancelled = false;
    const cancelIdle = scheduleIdle(() => {
      setMode("loading");
      if (!supportsWebGL2()) {
        setMode("fallback");
        return;
      }
      import("@/components/canvasui/AsciiObject")
        .then((module) => {
          if (!cancelled) setRenderer(() => module.AsciiObject);
        })
        .catch(() => {
          if (!cancelled) setMode("fallback");
        });
    }, 700);
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [effectsAllowed]);

  const Renderer = renderer;

  return (
    <div className={cn("relative h-full min-h-[360px] w-full", className)}>
      {effectsAllowed && Renderer && mode !== "fallback" ? (
        <Renderer
          src="/models/jc.glb"
          className={cn(
            "h-full w-full transition-opacity duration-250 ease-[var(--ease-out)]",
            mode === "active" ? "opacity-100" : "opacity-0",
          )}
          cellSize={5.6}
          cellAspect={0.58}
          contrast={1.35}
          edgeContrast={2.4}
          exposure={1.08}
          environmentIntensity={0.85}
          roughness={0.3}
          scale={3.3}
          modelRotation={[Math.PI / 2, 0, 0]}
          floatIntensity={0.4}
          rotationIntensity={0.18}
          floatSpeed={0.7}
          orbit
          zoom={false}
          autoRotate={false}
          fov={46}
          cameraDistance={4.6}
          ascii
          colored
          background="#0a0a0a"
          highlight="#ffffff"
          onLoad={() => setMode("active")}
          onError={() => setMode("fallback")}
        />
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.1),transparent_48%)] transition-opacity duration-250 ease-[var(--ease-out)]",
          effectsAllowed && mode === "loading" ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      >
        <span className="grid size-[min(38vw,42%)] max-h-[52%] max-w-[52%] place-items-center rounded-full border border-white/12 bg-white/[0.025] text-center shadow-[0_0_70px_rgba(255,255,255,0.06)]">
          <span>
            <span className="block font-mono text-[10px] tracking-[0.28em] text-white/42 uppercase">
              JUFE OFFER
            </span>
            <span className="mt-2 block font-mono text-[9px] tracking-[0.18em] text-white/24 uppercase">
              3D Object / Loading
            </span>
          </span>
        </span>
      </div>

      {!effectsAllowed || mode === "fallback" ? (
        <div
          className="pointer-events-none absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.12),transparent_48%)]"
          aria-hidden="true"
        >
          <span className="relative aspect-square w-[min(52vw,56%)] max-w-[68%] overflow-hidden rounded-full border border-white/15 bg-white shadow-[0_30px_90px_-36px_rgba(255,255,255,0.42)]">
            <ResilientImage
              src={site.logoSrc}
              alt=""
              fill
              sizes="(max-width: 1023px) 52vw, 28vw"
              loading="lazy"
              fetchPriority="low"
              className="object-cover"
            />
          </span>
        </div>
      ) : null}
    </div>
  );
}
