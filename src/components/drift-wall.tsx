"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";

import { RepositoryShowcaseCard } from "@/components/repository-showcase-card";
import type { RepositoryCardData } from "@/lib/repository-card";

export type DriftWallItem = RepositoryCardData;

export type DriftWallProps = {
  items: DriftWallItem[];
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  radius?: number;
  tilt?: number;
  turn?: number;
  roll?: number;
  perspective?: number;
  depth?: number;
  speed?: number;
  variance?: number;
  parallax?: number;
  lift?: number;
  fade?: number;
  dim?: number;
  className?: string;
};

type ColumnMeta = {
  copyHeight: number;
  copies: number;
};

function columnFactor(index: number, variance: number) {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
  return 1 + variance * pseudo;
}

export function DriftWall({
  items,
  columns = 3,
  tileWidth = 250,
  tileHeight = 150,
  gap = 18,
  radius = 18,
  tilt = 14,
  turn = -12,
  roll = 0,
  perspective = 1200,
  depth = 100,
  speed = 34,
  variance = 0.32,
  parallax = 0.5,
  lift = 54,
  fade = 0.62,
  dim = 0.58,
  className = "",
}: DriftWallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<Array<HTMLDivElement | null>>([]);
  const offsetsRef = useRef<number[]>([]);
  const velocitiesRef = useRef<number[]>([]);
  const hoveredColumnRef = useRef(-1);
  const pointerRef = useRef({ x: 0, y: 0 });
  const dampedPointerRef = useRef({ x: 0, y: 0 });
  const lastFrameRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const activePointerRef = useRef<{ x: number; y: number } | null>(null);
  const [containerHeight, setContainerHeight] = useState(600);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { threshold: 0.04 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const columnItems = useMemo(() => {
    const groups: DriftWallItem[][] = Array.from({ length: columns }, () => []);
    items.forEach((item, index) => groups[index % columns].push(item));
    return groups.map((group) => (group.length ? group : items.slice(0, 1)));
  }, [columns, items]);

  const columnMeta = useMemo<ColumnMeta[]>(() => {
    const unit = tileHeight + gap;
    return columnItems.map((column) => {
      const copyHeight = Math.max(unit, column.length * unit);
      const copies = Math.max(2, Math.ceil((containerHeight * 1.6) / copyHeight) + 1);
      return { copyHeight, copies };
    });
  }, [columnItems, containerHeight, gap, tileHeight]);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerHeight(entry?.contentRect.height || 600);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const baseVelocities = useMemo(
    () =>
      columnItems.map((_, column) => {
        const alternatingDirection = column % 2 === 0 ? 1 : -1;
        return speed * columnFactor(column, variance) * alternatingDirection;
      }),
    [columnItems, speed, variance],
  );

  useEffect(() => {
    offsetsRef.current = columnMeta.map(
      (meta, column) => meta.copyHeight * ((column * 0.37) % 1),
    );
    velocitiesRef.current = columnItems.map(() => 0);
  }, [columnItems, columnMeta]);

  const applyPlaneTransform = useCallback(
    (pointerX: number, pointerY: number) => {
      if (!planeRef.current) return;
      planeRef.current.style.transform =
        `translate(-50%, -50%) scale(1.18) ` +
        `rotateX(${tilt + pointerY}deg) rotateY(${turn + pointerX}deg) rotateZ(${roll}deg) ` +
        `translateZ(${-depth}px)`;
    },
    [depth, roll, tilt, turn],
  );

  useEffect(() => {
    if (!visible) return;

    if (reducedMotion) {
      applyPlaneTransform(0, 0);
      trackRefs.current.forEach((track, column) => {
        if (track) {
          track.style.transform = `translate3d(0, ${-(offsetsRef.current[column] ?? 0)}px, 0)`;
        }
      });
      return;
    }

    const animate = (time: number) => {
      if (lastFrameRef.current === null) lastFrameRef.current = time;
      const delta = Math.min(0.05, Math.max(0, time - lastFrameRef.current) / 1000);
      lastFrameRef.current = time;

      const maxTilt = parallax * 8;
      const holdPlane = activeIdRef.current !== null;
      const targetX = holdPlane
        ? dampedPointerRef.current.x
        : pointerRef.current.x * maxTilt;
      const targetY = holdPlane
        ? dampedPointerRef.current.y
        : -pointerRef.current.y * maxTilt;
      const damping = 1 - Math.exp(-delta / 0.12);
      dampedPointerRef.current.x += (targetX - dampedPointerRef.current.x) * damping;
      dampedPointerRef.current.y += (targetY - dampedPointerRef.current.y) * damping;
      applyPlaneTransform(dampedPointerRef.current.x, dampedPointerRef.current.y);

      trackRefs.current.forEach((track, column) => {
        const meta = columnMeta[column];
        if (!track || !meta) return;
        const targetVelocity =
          hoveredColumnRef.current === column ? 0 : baseVelocities[column];
        const easing = 1 - Math.exp(-delta / (targetVelocity === 0 ? 0.16 : 0.28));
        velocitiesRef.current[column] +=
          (targetVelocity - velocitiesRef.current[column]) * easing;
        let next =
          (offsetsRef.current[column] ?? 0) + velocitiesRef.current[column] * delta;
        next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
        offsetsRef.current[column] = next;
        track.style.transform = `translate3d(0, ${-next}px, 0)`;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      lastFrameRef.current = null;
    };
  }, [applyPlaneTransform, baseVelocities, columnMeta, parallax, reducedMotion, visible]);

  const activate = useCallback(
    (id: string, column: number, pointer?: { x: number; y: number }) => {
      const activePointer = activePointerRef.current;
      if (
        pointer &&
        activeIdRef.current &&
        activeIdRef.current !== id &&
        activePointer &&
        Math.hypot(pointer.x - activePointer.x, pointer.y - activePointer.y) < 32
      ) {
        return;
      }
      activeIdRef.current = id;
      activePointerRef.current = pointer ?? null;
      hoveredColumnRef.current = column;
      velocitiesRef.current[column] = 0;
      setActiveId(id);
    },
    [],
  );

  const release = useCallback(() => {
    activeIdRef.current = null;
    activePointerRef.current = null;
    hoveredColumnRef.current = -1;
    setActiveId(null);
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) return;
      if (parallax > 0 && !reducedMotion) {
        pointerRef.current = {
          x: (event.clientX - bounds.left) / bounds.width - 0.5,
          y: (event.clientY - bounds.top) / bounds.height - 0.5,
        };
      }
    },
    [parallax, reducedMotion],
  );

  const cssVariables = {
    "--dw-tile-w": `${tileWidth}px`,
    "--dw-tile-h": `${tileHeight}px`,
    "--dw-gap": `${gap}px`,
    "--dw-radius": `${radius}px`,
    "--dw-perspective": `${perspective}px`,
    "--dw-lift": `${lift}px`,
    "--dw-dim": dim,
    "--dw-edge": `${Math.max(0, (1 - fade) * 100)}%`,
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className={`drift-wall${reducedMotion ? "drift-wall--reduced" : ""}${className ? ` ${className}` : ""}`}
      style={cssVariables}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        pointerRef.current = { x: 0, y: 0 };
        release();
      }}
      role="group"
      aria-label="校内开源项目漂移墙"
    >
      <div ref={planeRef} className="drift-wall__plane">
        {columnItems.map((columnItemsForTrack, column) => {
          const meta = columnMeta[column];
          const copies = Array.from({ length: meta.copies });
          return (
            <div className="drift-wall__column" key={`column-${column}`}>
              <div
                className="drift-wall__track"
                ref={(element) => {
                  trackRefs.current[column] = element;
                }}
              >
                {copies.flatMap((_, copyIndex) =>
                  columnItemsForTrack.map((item, itemIndex) => {
                    const id = `${column}-${copyIndex}-${itemIndex}`;
                    return (
                      <a
                        key={id}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-tile-id={id}
                        data-column={column}
                        className={
                          activeId === id
                            ? "drift-wall__tile is-active"
                            : "drift-wall__tile"
                        }
                        onPointerEnter={(event) =>
                          activate(id, column, {
                            x: event.clientX,
                            y: event.clientY,
                          })
                        }
                        onFocus={() => activate(id, column)}
                        onBlur={release}
                        aria-label={`查看 ${item.owner}/${item.name} GitHub 仓库`}
                      >
                        <span className="drift-wall__inner">
                          <RepositoryShowcaseCard repository={item} variant="wall" />
                        </span>
                      </a>
                    );
                  }),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
