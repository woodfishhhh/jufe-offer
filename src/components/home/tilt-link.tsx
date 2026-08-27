"use client";

import { useRef, type PointerEvent } from "react";

type TiltLinkProps = React.ComponentProps<"a">;

export function TiltLink({ children, className, ...props }: TiltLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });

  function applyTilt() {
    frameRef.current = null;
    const link = linkRef.current;
    if (!link) return;
    link.style.transition = "none";
    link.style.transform = `perspective(900px) rotateX(${targetRef.current.x}deg) rotateY(${targetRef.current.y}deg)`;
  }

  function scheduleTilt(x: number, y: number) {
    targetRef.current = { x, y };
    if (frameRef.current === null) frameRef.current = requestAnimationFrame(applyTilt);
  }

  function handlePointerMove(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    scheduleTilt(y * -6, x * 7);
  }

  function handlePointerLeave() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    const link = linkRef.current;
    if (link) link.style.transition = "transform 220ms var(--ease-out)";
    scheduleTilt(0, 0);
  }

  return (
    <a
      ref={linkRef}
      className={`community-repo-card ${className ?? ""}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
    </a>
  );
}
