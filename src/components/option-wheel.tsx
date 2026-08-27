"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type Side = "left" | "right";

type WheelConfig = {
  count: number;
  items: string[];
  rowHeight: number;
  curve: number;
  tilt: number;
  blur: number;
  fade: number;
  minOpacity: number;
  side: Side;
  loop: boolean;
  smoothing: number;
  draggable: boolean;
  reducedMotion: boolean;
};

export type OptionWheelProps = {
  items: string[];
  defaultSelected?: number;
  onChange?: (index: number, item: string) => void;
  textColor?: string;
  activeColor?: string;
  side?: Side;
  fontSize?: number;
  spacing?: number;
  curve?: number;
  tilt?: number;
  blur?: number;
  fade?: number;
  minOpacity?: number;
  smoothing?: number;
  inset?: number;
  loop?: boolean;
  draggable?: boolean;
  className?: string;
};

export function OptionWheel({
  items,
  defaultSelected = 0,
  onChange,
  textColor = "#9a9a9a",
  activeColor = "#111111",
  side = "left",
  fontSize = 2.5,
  spacing = 1.35,
  curve = 0.82,
  tilt = 7,
  blur = 1.35,
  fade = 0.23,
  minOpacity = 0.08,
  smoothing = 200,
  inset = 20,
  loop = false,
  draggable = true,
  className = "",
}: OptionWheelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const positionRef = useRef(defaultSelected);
  const targetRef = useRef(defaultSelected);
  const animationRef = useRef<number | null>(null);
  const runFrameRef = useRef<(now: number) => void>(() => {});
  const lastFrameRef = useRef(0);
  const visualSelectedRef = useRef(defaultSelected);
  const committedSelectedRef = useRef(defaultSelected);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{
    y: number;
    start: number;
    id: number;
    optionIndex: number | null;
  } | null>(null);
  const dragMovedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [isDragging, setIsDragging] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const config = useMemo<WheelConfig>(
    () => ({
      count: items.length,
      items,
      rowHeight: Math.max(fontSize * spacing * 16, 1),
      curve,
      tilt,
      blur,
      fade,
      minOpacity,
      side,
      loop,
      smoothing,
      draggable,
      reducedMotion,
    }),
    [
      blur,
      curve,
      draggable,
      fade,
      fontSize,
      items,
      loop,
      minOpacity,
      reducedMotion,
      side,
      smoothing,
      spacing,
      tilt,
    ],
  );
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
    onChangeRef.current = onChange;
  }, [config, onChange]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const runFrame = useCallback((now: number) => {
    const cfg = configRef.current;
    const delta = Math.min((now - lastFrameRef.current) / 1000, 0.05);
    lastFrameRef.current = now;
    const smoothingSeconds = Math.max(cfg.smoothing, 1) / 1000;
    const amount = cfg.reducedMotion ? 1 : 1 - Math.exp(-delta / smoothingSeconds);
    const target = targetRef.current;
    let next = positionRef.current + (target - positionRef.current) * amount;
    const settled = Math.abs(target - next) < 0.001;
    if (settled) next = target;
    positionRef.current = next;

    if (cfg.count > 0) {
      const visualIndex = ((Math.round(next) % cfg.count) + cfg.count) % cfg.count;
      if (visualIndex !== visualSelectedRef.current) {
        visualSelectedRef.current = visualIndex;
        setSelectedIndex(visualIndex);
      }

      const targetIndex = ((Math.round(target) % cfg.count) + cfg.count) % cfg.count;
      if (
        Math.abs(target - next) < 0.35 &&
        targetIndex !== committedSelectedRef.current
      ) {
        committedSelectedRef.current = targetIndex;
        onChangeRef.current?.(targetIndex, cfg.items[targetIndex]);
      }
    }

    const mirror = cfg.side === "right" ? -1 : 1;
    const tiltRadians = (cfg.tilt * Math.PI) / 180;
    const radius = tiltRadians > 0.0005 ? cfg.rowHeight / tiltRadians : 0;

    itemRefs.current.forEach((element, index) => {
      if (!element) return;
      let distanceFromSelection = index - next;
      if (cfg.loop && cfg.count > 1) {
        distanceFromSelection =
          ((distanceFromSelection % cfg.count) + cfg.count) % cfg.count;
        if (distanceFromSelection > cfg.count / 2) distanceFromSelection -= cfg.count;
      }
      const distance = Math.abs(distanceFromSelection);
      let x = 0;
      let y = distanceFromSelection * cfg.rowHeight;
      let rotation = 0;
      if (radius > 0) {
        const angle = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, distanceFromSelection * tiltRadians),
        );
        y = radius * Math.sin(angle);
        x = -mirror * radius * (1 - Math.cos(angle)) * cfg.curve;
        rotation = (mirror * angle * 180) / Math.PI;
      }
      element.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rotation.toFixed(3)}deg)`;
      element.style.opacity = String(Math.max(cfg.minOpacity, 1 - distance * cfg.fade));
      element.style.filter =
        cfg.blur > 0 && !cfg.reducedMotion
          ? `blur(${(distance * cfg.blur).toFixed(2)}px)`
          : "none";
      element.style.setProperty(
        "--ow-p",
        Math.max(0, 1 - Math.min(distance, 1)).toFixed(4),
      );
    });

    animationRef.current = settled
      ? null
      : requestAnimationFrame((nextNow) => runFrameRef.current(nextNow));
  }, []);

  useEffect(() => {
    runFrameRef.current = runFrame;
  }, [runFrame]);

  const startLoop = useCallback(() => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    lastFrameRef.current = performance.now();
    animationRef.current = requestAnimationFrame((now) => runFrameRef.current(now));
  }, []);

  const applyTarget = useCallback(
    (value: number, snap: boolean) => {
      const cfg = configRef.current;
      if (cfg.count === 0) return;
      let nextValue = value;
      if (!cfg.loop) nextValue = Math.min(Math.max(nextValue, 0), cfg.count - 1);
      if (snap) nextValue = Math.round(nextValue);
      targetRef.current = nextValue;
      startLoop();
    },
    [startLoop],
  );

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const cfg = configRef.current;
      const delta = event.deltaMode === 1 ? event.deltaY * 24 : event.deltaY;
      const step = Math.max(-1, Math.min(1, delta / cfg.rowHeight));
      applyTarget(targetRef.current + step, false);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => applyTarget(targetRef.current, true), 140);
    };
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", handleWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [applyTarget]);

  useEffect(() => {
    configRef.current = config;
    applyTarget(targetRef.current, false);
  }, [applyTarget, config]);

  useEffect(
    () => () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    },
    [],
  );

  const selectIndex = useCallback(
    (index: number) => {
      const cfg = configRef.current;
      const current = targetRef.current;
      let distance = index - (((current % cfg.count) + cfg.count) % cfg.count);
      if (cfg.loop && cfg.count > 1) {
        if (distance > cfg.count / 2) distance -= cfg.count;
        else if (distance < -cfg.count / 2) distance += cfg.count;
      }
      applyTarget(current + distance, true);
    },
    [applyTarget],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!configRef.current.draggable) return;
      const option = (event.target as Element).closest<HTMLElement>("[data-option-index]");
      dragRef.current = {
        y: event.clientY,
        start: targetRef.current,
        id: event.pointerId,
        optionIndex: option ? Number(option.dataset.optionIndex) : null,
      };
      dragMovedRef.current = false;
      setIsDragging(true);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const deltaY = event.clientY - drag.y;
      if (!dragMovedRef.current && Math.abs(deltaY) > 4) {
        dragMovedRef.current = true;
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (dragMovedRef.current) {
        applyTarget(drag.start - deltaY / configRef.current.rowHeight, false);
      }
    },
    [applyTarget],
  );

  const handlePointerEnd = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setIsDragging(false);
    if (dragMovedRef.current) applyTarget(targetRef.current, true);
    else if (drag.optionIndex !== null) selectIndex(drag.optionIndex);
    dragMovedRef.current = false;
  }, [applyTarget, selectIndex]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      let delta: number | null = null;
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") delta = -1;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") delta = 1;
      if (delta === null) return;
      event.preventDefault();
      event.stopPropagation();
      applyTarget(Math.round(targetRef.current) + delta, true);
    },
    [applyTarget],
  );

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label="选择职业方向"
      data-home-deck-interactive
      className={`option-wheel${side === "right" ? " option-wheel--right" : ""}${isDragging ? " option-wheel--dragging" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          "--ow-text-color": textColor,
          "--ow-active-color": activeColor,
          "--ow-font-size": `${fontSize}rem`,
          "--ow-inset": `${inset}px`,
        } as CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      {items.map((label, index) => (
        <button
          key={`${label}-${index}`}
          ref={(element) => {
            itemRefs.current[index] = element;
          }}
          type="button"
          role="option"
          data-option-index={index}
          aria-selected={selectedIndex === index}
          className={`option-wheel__item${selectedIndex === index ? " option-wheel__item--selected" : ""}`}
          onClick={(event) => {
            if (event.detail === 0) selectIndex(index);
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
