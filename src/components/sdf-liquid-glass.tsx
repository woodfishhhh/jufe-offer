"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Vaso } from "vaso";

type SdfLiquidGlassProps = {
  children: ReactNode;
  className?: string;
  height?: number;
  radius?: number;
  depth?: number;
  blur?: number;
  dispersion?: number;
  style?: CSSProperties;
};

export function SdfLiquidGlass({
  children,
  className = "",
  height = 86,
  radius = 16,
  depth = 0.58,
  blur = 0.4,
  dispersion = 0.32,
  style,
}: SdfLiquidGlassProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1, height });

  useLayoutEffect(() => {
    const host = hostRef.current;
    const content = contentRef.current;
    if (!host || !content) return;

    const update = () => {
      const contentHeight = Math.ceil(content.getBoundingClientRect().height);
      setSize({
        width: Math.max(1, Math.round(host.getBoundingClientRect().width)),
        height: Math.max(height, contentHeight),
      });
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(host);
    observer.observe(content);
    return () => observer.disconnect();
  }, [height]);

  return (
    <div
      ref={hostRef}
      className={`sdf-liquid-glass ${className}`.trim()}
      style={{ ...style, minHeight: height, borderRadius: radius }}
    >
      <Vaso
        className="sdf-liquid-glass__effect"
        width={size.width}
        height={size.height}
        radius={radius}
        depth={depth}
        blur={blur}
        dispersion={dispersion}
      >
        <div style={{ width: size.width, height: size.height }} />
      </Vaso>
      <div ref={contentRef} className="sdf-liquid-glass__content">
        {children}
      </div>
    </div>
  );
}
