"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";

type Falloff = "linear" | "exponential" | "gaussian";

type VariableProximityProps = {
  label: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  fromFontVariationSettings?: string;
  toFontVariationSettings?: string;
  radius?: number;
  falloff?: Falloff;
  className?: string;
};

function parseSettings(settings: string) {
  return settings.split(",").flatMap((setting) => {
    const [axis, value] = setting.trim().split(/\s+/);
    const parsedValue = Number.parseFloat(value);
    return axis && Number.isFinite(parsedValue)
      ? [[axis.replace(/["']/g, ""), parsedValue] as const]
      : [];
  });
}

export function VariableProximity({
  label,
  containerRef,
  fromFontVariationSettings = "'wght' 500",
  toFontVariationSettings = "'wght' 850",
  radius = 110,
  falloff = "gaussian",
  className = "",
}: VariableProximityProps) {
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const mouseRef = useRef({ x: Number.NaN, y: Number.NaN });
  const parsedSettings = useMemo(() => ({
    from: fromFontVariationSettings,
    axes: parseSettings(fromFontVariationSettings).map(([axis, from]) => {
      const to = parseSettings(toFontVariationSettings).find(([toAxis]) => toAxis === axis)?.[1] ?? from;
      return { axis, from, to };
    }),
  }), [fromFontVariationSettings, toFontVariationSettings]);

  useEffect(() => {
    const updatePosition = (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) mouseRef.current = { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleMouseMove = (event: MouseEvent) => updatePosition(event.clientX, event.clientY);
    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) updatePosition(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [containerRef]);

  useEffect(() => {
    let frame = 0;
    const animate = () => {
      const container = containerRef.current;
      const { x, y } = mouseRef.current;
      if (container && Number.isFinite(x) && Number.isFinite(y)) {
        const containerRect = container.getBoundingClientRect();
        letterRefs.current.forEach((letter) => {
          if (!letter) return;
          const rect = letter.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2 - containerRect.left;
          const centerY = rect.top + rect.height / 2 - containerRect.top;
          const distance = Math.hypot(x - centerX, y - centerY);
          const normalized = Math.min(Math.max(1 - distance / radius, 0), 1);
          const influence =
            falloff === "exponential"
              ? normalized ** 2
              : falloff === "gaussian"
                ? Math.exp(-((distance / (radius / 2)) ** 2) / 2)
                : normalized;

          if (influence === 0) {
            letter.style.fontVariationSettings = parsedSettings.from;
            letter.style.fontWeight = String(parsedSettings.axes[0]?.from ?? 500);
            letter.style.transform = "scaleX(1)";
            return;
          }

          letter.style.fontVariationSettings = parsedSettings.axes
            .map(({ axis, from, to }) => `'${axis}' ${from + (to - from) * influence}`)
            .join(", ");
          const weight = parsedSettings.axes.find(({ axis }) => axis === "wght");
          if (weight) letter.style.fontWeight = String(weight.from + (weight.to - weight.from) * influence);
          letter.style.transform = `scaleX(${1 + influence * 0.035})`;
        });
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [containerRef, falloff, parsedSettings, radius]);

  let letterIndex = 0;
  return (
    <span className={`variable-proximity ${className}`}>
      {label.split(" ").map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} className="variable-proximity__word">
          {Array.from(word).map((letter) => {
            const index = letterIndex++;
            return (
              <motion.span
                key={`${letter}-${index}`}
                ref={(element) => {
                  letterRefs.current[index] = element;
                }}
                className="variable-proximity__letter"
                style={{ fontVariationSettings: fromFontVariationSettings }}
                aria-hidden="true"
              >
                {letter}
              </motion.span>
            );
          })}
          {wordIndex < label.split(" ").length - 1 && <span aria-hidden="true">&nbsp;</span>}
        </span>
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
}
