/* eslint-disable @next/next/no-img-element */
"use client";

import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";

import {
  getTechnologyIcon,
  getTechnologyIconSpriteStyle,
  TECHNOLOGY_ICON_FALLBACK,
  TECHNOLOGY_ICON_SPRITE_SRC,
} from "@/data/technology-icons";

type CareerTechStackMatterProps = {
  technologies: readonly string[];
};

type CapsuleBody = {
  body: Matter.Body;
  element: HTMLButtonElement;
  width: number;
  height: number;
};

type MatterMouseWithHandlers = Matter.Mouse & {
  mousedown: EventListener;
  mousemove: EventListener;
  mouseup: EventListener;
  mousewheel: EventListener;
};

const WALL_THICKNESS = 96;
const STEP_MS = 1000 / 60;

export function CareerTechStackMatter({ technologies }: CareerTechStackMatterProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [spriteFailed, setSpriteFailed] = useState(false);
  const technologyKey = technologies.join("|");

  useEffect(() => {
    const sprite = new Image();
    sprite.onerror = () => setSpriteFailed(true);
    sprite.src = TECHNOLOGY_ICON_SPRITE_SRC;

    return () => {
      sprite.onerror = null;
    };
  }, []);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let engine: Matter.Engine | null = null;
    let mouse: Matter.Mouse | null = null;
    let mouseConstraint: Matter.MouseConstraint | null = null;
    let capsules: CapsuleBody[] = [];
    let animationFrame = 0;
    let resizeTimer = 0;
    let lastTimestamp = 0;
    let accumulatedTime = 0;
    let draggingBody: Matter.Body | null = null;
    const initialBounds = field.getBoundingClientRect();
    let observedWidth = initialBounds.width;
    let observedHeight = initialBounds.height;

    const syncBodies = () => {
      for (const capsule of capsules) {
        capsule.element.style.transform = `translate(${capsule.body.position.x - capsule.width / 2}px, ${capsule.body.position.y - capsule.height / 2}px) rotate(${capsule.body.angle}rad)`;
      }
    };

    const tick = (timestamp: number) => {
      if (!engine) return;
      if (lastTimestamp === 0) lastTimestamp = timestamp;
      accumulatedTime += Math.min(48, timestamp - lastTimestamp);
      lastTimestamp = timestamp;

      while (accumulatedTime >= STEP_MS) {
        Matter.Engine.update(engine, STEP_MS);
        accumulatedTime -= STEP_MS;
      }

      if (draggingBody) {
        const angle = draggingBody.angle;
        const nearestTurn = Math.round(angle / (Math.PI * 2)) * Math.PI * 2;
        Matter.Body.setAngle(draggingBody, angle + (nearestTurn - angle) * 0.14);
        Matter.Body.setAngularVelocity(draggingBody, 0);
      }

      syncBodies();
      animationFrame = window.requestAnimationFrame(tick);
    };

    const detachMouseListeners = () => {
      if (!mouse) return;
      const matterMouse = mouse as MatterMouseWithHandlers;
      const element = matterMouse.element;
      element.removeEventListener("mousemove", matterMouse.mousemove);
      element.removeEventListener("mousedown", matterMouse.mousedown);
      element.removeEventListener("mouseup", matterMouse.mouseup);
      element.removeEventListener("wheel", matterMouse.mousewheel);
      element.removeEventListener("touchmove", matterMouse.mousemove);
      element.removeEventListener("touchstart", matterMouse.mousedown);
      element.removeEventListener("touchend", matterMouse.mouseup);
      Matter.Mouse.clearSourceEvents(mouse);
    };

    const destroyWorld = () => {
      window.cancelAnimationFrame(animationFrame);
      detachMouseListeners();
      if (engine) {
        Matter.Composite.clear(engine.world, false);
        Matter.Engine.clear(engine);
      }
      for (const capsule of capsules) {
        capsule.element.style.removeProperty("transform");
        capsule.element.style.removeProperty("z-index");
      }
      engine = null;
      mouse = null;
      mouseConstraint = null;
      capsules = [];
      draggingBody = null;
      lastTimestamp = 0;
      accumulatedTime = 0;
    };

    const buildWorld = () => {
      destroyWorld();
      const elements = Array.from(
        field.querySelectorAll<HTMLButtonElement>("[data-career-capsule]"),
      );
      const bounds = field.getBoundingClientRect();
      if (!elements.length || bounds.width <= 0 || bounds.height <= 0) return;

      engine = Matter.Engine.create({
        gravity: { x: 0, y: 0.62 },
        positionIterations: 7,
        velocityIterations: 5,
        constraintIterations: 3,
      });

      mouse = Matter.Mouse.create(field);
      const matterMouse = mouse as MatterMouseWithHandlers;
      matterMouse.element.removeEventListener("wheel", matterMouse.mousewheel);
      Matter.Mouse.setOffset(mouse, { x: 0, y: 0 });
      mouse.pixelRatio = 1;
      mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.22,
          damping: 0.16,
          render: { visible: false },
        },
      });

      const walls = [
        Matter.Bodies.rectangle(
          bounds.width / 2,
          bounds.height + WALL_THICKNESS / 2,
          bounds.width + WALL_THICKNESS * 2,
          WALL_THICKNESS,
          { isStatic: true },
        ),
        Matter.Bodies.rectangle(
          bounds.width / 2,
          -WALL_THICKNESS / 2,
          bounds.width + WALL_THICKNESS * 2,
          WALL_THICKNESS,
          { isStatic: true },
        ),
        Matter.Bodies.rectangle(
          -WALL_THICKNESS / 2,
          bounds.height / 2,
          WALL_THICKNESS,
          bounds.height + WALL_THICKNESS * 2,
          { isStatic: true },
        ),
        Matter.Bodies.rectangle(
          bounds.width + WALL_THICKNESS / 2,
          bounds.height / 2,
          WALL_THICKNESS,
          bounds.height + WALL_THICKNESS * 2,
          { isStatic: true },
        ),
      ];

      const gutter = Math.min(34, bounds.width * 0.05);
      const itemGap = bounds.width < 640 ? 5 : 9;
      let cursorX = gutter;
      let cursorY = gutter;
      let rowHeight = 0;
      capsules = elements.map((element, index) => {
        const width = element.offsetWidth;
        const height = element.offsetHeight;

        if (cursorX > gutter && cursorX + width > bounds.width - gutter) {
          cursorX = gutter;
          cursorY += rowHeight + itemGap;
          rowHeight = 0;
        }

        const x = Math.min(bounds.width - gutter - width / 2, cursorX + width / 2);
        const y = Math.min(bounds.height - gutter - height / 2, cursorY + height / 2);
        cursorX += width + itemGap;
        rowHeight = Math.max(rowHeight, height);
        const body = Matter.Bodies.rectangle(x, y, width, height, {
          restitution: 0.7,
          friction: 0.014,
          frictionStatic: 0,
          frictionAir: 0.012,
          density: 0.0018,
          slop: 0.05,
          chamfer: { radius: height / 2 },
        });
        Matter.Body.setVelocity(body, {
          x: ((index % 5) - 2) * 0.16,
          y: 0.2 + (index % 4) * 0.12,
        });
        Matter.Body.setAngularVelocity(body, ((index % 7) - 3) * 0.008);
        return { body, element, width, height };
      });

      Matter.Composite.add(engine.world, [
        ...walls,
        ...capsules.map((capsule) => capsule.body),
        mouseConstraint,
      ]);

      Matter.Events.on(mouseConstraint, "startdrag", (event) => {
        const body = (event as typeof event & { body: Matter.Body }).body;
        const capsule = capsules.find((item) => item.body === body);
        if (!capsule) return;
        draggingBody = body;
        capsule.element.style.zIndex = "4";
        capsule.element.classList.add("is-dragging");
      });
      Matter.Events.on(mouseConstraint, "enddrag", (event) => {
        const body = (event as typeof event & { body: Matter.Body }).body;
        const capsule = capsules.find((item) => item.body === body);
        if (!capsule) return;
        draggingBody = null;
        capsule.element.style.zIndex = "1";
        capsule.element.classList.remove("is-dragging");
      });

      syncBodies();
      animationFrame = window.requestAnimationFrame(tick);
    };

    const activateCapsule = (event: MouseEvent) => {
      const element = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-career-capsule]",
      );
      const capsule = capsules.find((item) => item.element === element);
      if (!capsule) return;
      Matter.Body.setVelocity(capsule.body, {
        x: (Math.random() - 0.5) * 8,
        y: -5 - Math.random() * 2,
      });
      Matter.Body.setAngularVelocity(capsule.body, (Math.random() - 0.5) * 0.24);
    };

    field.addEventListener("click", activateCapsule);
    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (
        Math.abs(width - observedWidth) < 0.5 &&
        Math.abs(height - observedHeight) < 0.5
      ) {
        return;
      }
      observedWidth = width;
      observedHeight = height;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(buildWorld, 180);
    });
    resizeObserver.observe(field);
    const startFrame = window.requestAnimationFrame(buildWorld);

    return () => {
      window.cancelAnimationFrame(startFrame);
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      field.removeEventListener("click", activateCapsule);
      destroyWorld();
    };
  }, [technologyKey]);

  return (
    <div
      ref={fieldRef}
      className="career-matter-field"
      data-home-deck-wheel-pass
      aria-label="技术栈互动区域，可拖动或点击技术标签"
    >
      <div className="career-matter-field__watermark" aria-hidden="true">
        <span>TECH STACK</span>
      </div>
      {technologies.map((technology) => {
        const spriteStyle = getTechnologyIconSpriteStyle(technology);

        return (
          <button
            key={technology}
            type="button"
            className="career-matter-capsule"
            data-career-capsule
            aria-label={`${technology}，可拖动`}
          >
            {spriteStyle && !spriteFailed ? (
              <span
                className="career-matter-capsule__icon"
                style={spriteStyle}
                aria-hidden="true"
              />
            ) : (
              <img
                className="career-matter-capsule__icon"
                src={getTechnologyIcon(technology)}
                alt=""
                draggable="false"
                aria-hidden="true"
                onError={(event) => {
                  if (event.currentTarget.src !== TECHNOLOGY_ICON_FALLBACK) {
                    event.currentTarget.src = TECHNOLOGY_ICON_FALLBACK;
                  }
                }}
              />
            )}
            <span>{technology}</span>
          </button>
        );
      })}
    </div>
  );
}
