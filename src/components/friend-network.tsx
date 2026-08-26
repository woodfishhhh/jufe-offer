"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { FriendLinkApplication } from "@/components/friend-link-application";
import type { FriendLink } from "@/data/friends";
import { getAdaptiveCanvasDpr } from "@/lib/client-performance";
import styles from "./friend-network.module.css";

const CONFIG = {
  gridSize: 28,
  gridAlpha: 0.04,
  orbitAlpha: 0.025,
  cloudDensityPower: 1.35,
  placementAttempts: 64,
  placementMinGap: 0.24,
  starDepth: 160,
  starSigma: 180,
  starVariance: 320 * 160,
  starFieldAlpha: 0.13,
  starRotateSpeed: 0.025,
  starFlickerMinGap: 4,
  starFlickerMaxGap: 10,
  starFlickerDuration: 0.5,
  wellDepth: 24,
  wellSigma: 62,
  wellVariance: 7688,
  wellCutoffSq: 34596,
  minZoom: 0.4,
  maxZoom: 4,
  hitPad: 16,
  dragThreshold: 3,
  maxRadius: 440,
  orbitMinRatio: 0.22,
  orbitSpeedBase: 0.3,
  orbitSpeedExponent: 0.85,
  hoverSlow: 0.22,
  hoverScale: 1.42,
  hoverSmooth: 10,
  hoverCloseDelay: 280,
  pingProbes: 3,
  pingTimeoutMs: 4000,
  pingGoodMs: 50,
  pingWarnMs: 120,
  maxDpr: 2,
  starDensityDivisor: 8000,
  planetSizeMin: 32,
  planetSizeMax: 48,
  maxDelta: 0.05,
  tau: Math.PI * 2,
} as const;

type Planet = FriendLink & {
  host: string;
  radius: number;
  ratio: number;
  angle: number;
  speedMultiplier: number;
  scale: number;
  size: number;
  worldX: number;
  worldY: number;
  estimatedPing: number;
  measuredPing: number | null;
  pingFailed: boolean;
  isMeasuring: boolean;
};

type StarField = {
  x: Float32Array;
  y: Float32Array;
  alpha: Float32Array;
  size: Float32Array;
};

type DragState = {
  startX: number;
  startY: number;
  viewX: number;
  viewY: number;
  moved: boolean;
};

type PinchState = {
  baseDistance: number;
  baseScale: number;
  worldX: number;
  worldY: number;
};

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function clamp(value: number, minimum: number, maximum: number) {
  return value < minimum ? minimum : value > maximum ? maximum : value;
}

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }
  return result;
}

function seededRandom(seed: number) {
  let state = seed || 0x6d2b79f5;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hostFromUrl(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function estimatedPing(host: string) {
  return 30 + (hash(host) % 170);
}

function pingColor(milliseconds: number) {
  if (milliseconds < CONFIG.pingGoodMs) return "var(--friend-status-good)";
  if (milliseconds < CONFIG.pingWarnMs) return "var(--friend-status-warn)";
  return "var(--friend-status-bad)";
}

type Placement = {
  angle: number;
  ratio: number;
  x: number;
  y: number;
};

function createPlacements(friends: readonly FriendLink[]) {
  const placements = new Map<string, Placement>();
  const placed: Placement[] = [];
  const orderedFriends = [...friends].sort(
    (left, right) =>
      hash(left.url) - hash(right.url) || left.url.localeCompare(right.url),
  );

  for (const friend of orderedFriends) {
    const random = seededRandom(hash(friend.url));
    let bestPlacement: Placement | null = null;
    let bestDistance = -1;

    for (let attempt = 0; attempt < CONFIG.placementAttempts; attempt += 1) {
      const angle = random() * CONFIG.tau;
      const ratio = lerp(
        CONFIG.orbitMinRatio,
        1,
        Math.pow(random(), CONFIG.cloudDensityPower),
      );
      const candidate = {
        angle,
        ratio,
        x: Math.cos(angle) * ratio,
        y: Math.sin(angle) * ratio,
      };
      const nearestDistance = placed.reduce(
        (nearest, placement) =>
          Math.min(
            nearest,
            Math.hypot(candidate.x - placement.x, candidate.y - placement.y),
          ),
        Number.POSITIVE_INFINITY,
      );

      if (nearestDistance > bestDistance) {
        bestPlacement = candidate;
        bestDistance = nearestDistance;
      }
      if (nearestDistance >= CONFIG.placementMinGap) break;
    }

    if (bestPlacement) {
      placed.push(bestPlacement);
      placements.set(friend.url, bestPlacement);
    }
  }

  return placements;
}

function createPlanets(friends: readonly FriendLink[]): Planet[] {
  const placements = createPlacements(friends);
  return friends.map((friend) => {
    const placement = placements.get(friend.url) ?? {
      angle: 0,
      ratio: 0.5,
    };
    const host = hostFromUrl(friend.url);
    return {
      ...friend,
      host,
      radius: 0,
      ratio: placement.ratio,
      angle: placement.angle,
      speedMultiplier: 1,
      scale: 1,
      size: Math.round(lerp(CONFIG.planetSizeMin, CONFIG.planetSizeMax, placement.ratio)),
      worldX: 0,
      worldY: 0,
      estimatedPing: estimatedPing(host),
      measuredPing: null,
      pingFailed: false,
      isMeasuring: false,
    };
  });
}

function probe(url: string) {
  return new Promise<number | null>((resolve) => {
    const image = new Image();
    const startedAt = performance.now();
    let settled = false;
    const finish = (loaded: boolean) => {
      if (settled) return;
      settled = true;
      resolve(loaded ? performance.now() - startedAt : null);
    };
    image.onload = () => finish(true);
    image.onerror = () => finish(true);
    window.setTimeout(() => finish(false), CONFIG.pingTimeoutMs);
    try {
      const favicon = new URL("/favicon.ico", url);
      favicon.searchParams.set("_", `${Date.now()}${Math.random()}`);
      image.src = favicon.href;
    } catch {
      finish(false);
    }
  });
}

function createStarField(width: number, height: number): StarField {
  const count = Math.round((width * height) / CONFIG.starDensityDivisor);
  const field = {
    x: new Float32Array(count),
    y: new Float32Array(count),
    alpha: new Float32Array(count),
    size: new Float32Array(count),
  };
  for (let index = 0; index < count; index += 1) {
    field.x[index] = Math.random() * width;
    field.y[index] = Math.random() * height;
    field.alpha[index] = Math.random() * 0.26 + 0.04;
    field.size[index] = Math.random() * 1.1 + 0.3;
  }
  return field;
}

export function FriendNetwork({ friends }: { friends: readonly FriendLink[] }) {
  const planets = useMemo(() => createPlanets(friends), [friends]);
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLSpanElement>(null);
  const planetRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const hoveredRef = useRef(-1);
  const lockedRef = useRef(-1);
  const cardHoveredRef = useRef(false);
  const [cardIndex, setCardIndex] = useState(-1);
  const [, setPingRevision] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const world = worldRef.current;
    const star = starRef.current;
    const card = cardRef.current;
    if (!stage || !canvas || !world || !star || !card) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let centerX = 0;
    let centerY = 0;
    let maxRadius: number = CONFIG.maxRadius;
    let starField: StarField | null = null;
    let frame = 0;
    let lastFrame = performance.now();
    let cardIndexOnScreen = -1;
    let cardWidth = 232;
    let cardHeight = 120;
    let cardCloseStartedAt = 0;
    let drag: DragState | null = null;
    let pinch: PinchState | null = null;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointers = new Map<number, { x: number; y: number }>();
    const pointer = { x: 0, y: 0, inside: false };
    const view = { scale: 1, x: 0, y: 0, initialized: false };
    const starState = {
      angle: 0,
      flicker: 1,
      burstPower: 0,
      burstStartedAt: 0,
      burstEndsAt: 0,
      nextFlickerAt: 0,
      initialized: false,
    };
    let gridX = new Float32Array(0);
    let gridY = new Float32Array(0);
    let worldTransform = "";
    let zoomText = "";
    const activePlanets = new Array(planets.length).fill(false) as boolean[];

    const keepViewInRange = () => {
      const extent = maxRadius * view.scale;
      view.x = clamp(view.x, -extent, width + extent);
      view.y = clamp(view.y, -extent, height + extent);
    };

    const resize = () => {
      const previousCenterX = centerX;
      const previousCenterY = centerY;
      width = stage.clientWidth;
      height = stage.clientHeight;
      dpr = getAdaptiveCanvasDpr(width, height, CONFIG.maxDpr);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      centerX = width / 2;
      centerY = height / 2;
      maxRadius = Math.min(
        CONFIG.maxRadius,
        Math.max(150, Math.min(width, height) * 0.42),
      );
      if (!view.initialized) {
        view.x = centerX;
        view.y = centerY;
        view.scale = 1;
        view.initialized = true;
      } else {
        view.x += centerX - previousCenterX;
        view.y += centerY - previousCenterY;
      }
      keepViewInRange();
      starField = createStarField(width, height);
    };

    const localPoint = (event: PointerEvent | WheelEvent) => {
      const bounds = stage.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };

    const setCursor = (cursor: string) => {
      stage.style.cursor = cursor;
    };

    const measure = async (planet: Planet) => {
      if (planet.isMeasuring || planet.measuredPing !== null) return;
      planet.isMeasuring = true;
      setPingRevision((revision) => revision + 1);
      const results: number[] = [];
      for (let index = 0; index < CONFIG.pingProbes; index += 1) {
        const result = await probe(planet.url);
        if (result !== null) results.push(result);
      }
      if (results.length > 0) {
        results.sort((left, right) => left - right);
        planet.measuredPing = Math.round(results[results.length >> 1]);
      } else {
        planet.pingFailed = true;
      }
      planet.isMeasuring = false;
      setPingRevision((revision) => revision + 1);
    };

    const updateOrbit = (planet: Planet, delta: number) => {
      planet.radius = lerp(maxRadius * CONFIG.orbitMinRatio, maxRadius, planet.ratio);
      const speed = reducedMotion
        ? 0
        : CONFIG.orbitSpeedBase *
          Math.pow(
            (CONFIG.orbitMinRatio * maxRadius) / planet.radius,
            CONFIG.orbitSpeedExponent,
          );
      planet.angle += speed * planet.speedMultiplier * delta;
      planet.worldX = Math.cos(planet.angle) * planet.radius;
      planet.worldY = Math.sin(planet.angle) * planet.radius;
    };

    const updateStar = (now: number, delta: number) => {
      const seconds = now / 1000;
      if (!starState.initialized) {
        starState.nextFlickerAt =
          seconds +
          lerp(CONFIG.starFlickerMinGap, CONFIG.starFlickerMaxGap, Math.random());
        starState.initialized = true;
      }
      let target = 1;
      if (!reducedMotion) {
        starState.angle = (starState.angle + CONFIG.starRotateSpeed * delta) % CONFIG.tau;
        if (seconds >= starState.nextFlickerAt && seconds >= starState.burstEndsAt) {
          starState.burstStartedAt = seconds;
          starState.burstEndsAt = seconds + CONFIG.starFlickerDuration;
          starState.burstPower = 0.18 + Math.random() * 0.18;
        }
        if (seconds < starState.burstEndsAt) {
          const duration = starState.burstEndsAt - starState.burstStartedAt;
          const progress = duration
            ? clamp((seconds - starState.burstStartedAt) / duration, 0, 1)
            : 1;
          target =
            1 +
            starState.burstPower *
              Math.sin(progress * Math.PI) *
              (0.86 + 0.14 * Math.sin(seconds * 62));
        } else if (starState.burstEndsAt > 0) {
          starState.nextFlickerAt =
            seconds +
            lerp(CONFIG.starFlickerMinGap, CONFIG.starFlickerMaxGap, Math.random());
          starState.burstEndsAt = 0;
          starState.burstStartedAt = 0;
        }
      }
      const easing = 1 - Math.exp(-delta * 14);
      starState.flicker += (target - starState.flicker) * easing;
      star.style.setProperty("--star-rotation", `${starState.angle.toFixed(4)}rad`);
      star.style.setProperty("--star-flicker", starState.flicker.toFixed(3));
      star.style.setProperty(
        "--star-core-scale",
        (1 + (starState.flicker - 1) * 0.12).toFixed(3),
      );
    };

    const drawStars = () => {
      if (!starField) return;
      context.fillStyle = "#eee";
      for (let index = 0; index < starField.x.length; index += 1) {
        context.globalAlpha = starField.alpha[index];
        context.fillRect(
          starField.x[index],
          starField.y[index],
          starField.size[index],
          starField.size[index],
        );
      }
      context.globalAlpha = 1;
    };

    const drawStarGlow = () => {
      const radius = CONFIG.starSigma * 3 * view.scale;
      if (radius <= 1) return;
      const flicker = clamp(starState.flicker, 1, 1.4);
      const alpha = CONFIG.starFieldAlpha * flicker;
      context.save();
      const gradient = context.createRadialGradient(
        view.x,
        view.y,
        0,
        view.x,
        view.y,
        radius,
      );
      gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
      gradient.addColorStop(0.18, `rgba(190,210,255,${alpha * 0.46})`);
      gradient.addColorStop(0.54, `rgba(105,150,255,${alpha * 0.16})`);
      gradient.addColorStop(1, "rgba(105,150,255,0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(view.x, view.y, radius, 0, CONFIG.tau);
      context.fill();
      context.restore();
    };

    const drawGrid = () => {
      const scale = view.scale;
      const gridSize = CONFIG.gridSize;
      const worldLeft = -view.x / scale;
      const worldTop = -view.y / scale;
      const worldRight = (width - view.x) / scale;
      const worldBottom = (height - view.y) / scale;
      const padding = Math.ceil((CONFIG.starDepth + CONFIG.wellDepth) / gridSize) + 1;
      const firstColumn = Math.floor(worldLeft / gridSize) - padding;
      const lastColumn = Math.ceil(worldRight / gridSize) + padding;
      const firstRow = Math.floor(worldTop / gridSize) - padding;
      const lastRow = Math.ceil(worldBottom / gridSize) + padding;
      const columns = lastColumn - firstColumn + 1;
      const rows = lastRow - firstRow + 1;
      const pointCount = columns * rows;
      if (gridX.length < pointCount) {
        gridX = new Float32Array(pointCount);
        gridY = new Float32Array(pointCount);
      }

      let pointIndex = 0;
      for (let row = 0; row < rows; row += 1) {
        const worldY = (firstRow + row) * gridSize;
        for (let column = 0; column < columns; column += 1) {
          const worldX = (firstColumn + column) * gridSize;
          let pullX = 0;
          let pullY = 0;
          const starGravity = Math.exp(
            -(worldX * worldX + worldY * worldY) / CONFIG.starVariance,
          );
          const starPull = (CONFIG.starDepth / CONFIG.starSigma) * starGravity;
          pullX -= worldX * starPull;
          pullY -= worldY * starPull;

          for (const planet of planets) {
            const differenceX = worldX - planet.worldX;
            const differenceY = worldY - planet.worldY;
            const distanceSquared = differenceX * differenceX + differenceY * differenceY;
            if (distanceSquared > CONFIG.wellCutoffSq) continue;
            const gravity = Math.exp(-distanceSquared / CONFIG.wellVariance);
            const pull = (CONFIG.wellDepth / CONFIG.wellSigma) * gravity;
            pullX -= differenceX * pull;
            pullY -= differenceY * pull;
          }

          gridX[pointIndex] = view.x + (worldX + pullX) * scale;
          gridY[pointIndex] = view.y + (worldY + pullY) * scale;
          pointIndex += 1;
        }
      }

      context.lineWidth = 1;
      context.strokeStyle = `rgba(238,238,238,${CONFIG.gridAlpha})`;
      for (let row = 0; row < rows; row += 1) {
        context.beginPath();
        const start = row * columns;
        context.moveTo(gridX[start], gridY[start]);
        for (let column = 1; column < columns; column += 1) {
          context.lineTo(gridX[start + column], gridY[start + column]);
        }
        context.stroke();
      }
      for (let column = 0; column < columns; column += 1) {
        context.beginPath();
        context.moveTo(gridX[column], gridY[column]);
        for (let row = 1; row < rows; row += 1) {
          context.lineTo(gridX[row * columns + column], gridY[row * columns + column]);
        }
        context.stroke();
      }
    };

    const drawOrbits = () => {
      context.strokeStyle = `rgba(238,238,238,${CONFIG.orbitAlpha})`;
      context.lineWidth = 1;
      for (const planet of planets) {
        context.beginPath();
        context.arc(view.x, view.y, planet.radius * view.scale, 0, CONFIG.tau);
        context.stroke();
      }
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      drawStars();
      drawStarGlow();
      drawGrid();
      drawOrbits();
    };

    const hitTest = () => {
      if (!pointer.inside || (drag && drag.moved)) return -1;
      let closest = -1;
      let closestDistance = Number.POSITIVE_INFINITY;
      planets.forEach((planet, index) => {
        const x = view.x + planet.worldX * view.scale;
        const y = view.y + planet.worldY * view.scale;
        const distance = Math.hypot(x - pointer.x, y - pointer.y);
        const hitRadius = (planet.size * view.scale) / 2 + CONFIG.hitPad;
        if (distance < hitRadius && distance < closestDistance) {
          closest = index;
          closestDistance = distance;
        }
      });
      return closest;
    };

    const showCard = (now: number) => {
      const activeIndex =
        lockedRef.current >= 0
          ? lockedRef.current
          : hoveredRef.current >= 0
            ? hoveredRef.current
            : cardHoveredRef.current && cardIndexOnScreen >= 0
              ? cardIndexOnScreen
              : -1;
      if (activeIndex < 0) {
        if (
          !cardHoveredRef.current &&
          now - cardCloseStartedAt > CONFIG.hoverCloseDelay
        ) {
          if (cardIndexOnScreen !== -1) {
            cardIndexOnScreen = -1;
            setCardIndex(-1);
          }
        }
        return;
      }

      if (cardIndexOnScreen !== activeIndex) {
        cardIndexOnScreen = activeIndex;
        setCardIndex(activeIndex);
      }
      const planet = planets[activeIndex];
      const x = view.x + planet.worldX * view.scale;
      const y = view.y + planet.worldY * view.scale;
      const margin = 16;
      const offset = 22 + (planet.size * view.scale) / 2;
      const desiredX = x < width / 2 ? x + offset : x - offset - cardWidth;
      card.style.left = `${clamp(desiredX, margin, width - cardWidth - margin)}px`;
      card.style.top = `${clamp(
        y - cardHeight / 2,
        margin,
        height - cardHeight - margin,
      )}px`;
    };

    const animate = (now: number) => {
      frame = 0;
      if (document.hidden || !stageVisible) return;
      if (now - lastFrame < 1000 / 30) {
        scheduleFrame();
        return;
      }
      const delta = Math.min((now - lastFrame) / 1000, CONFIG.maxDelta);
      lastFrame = now;
      const nextWorldTransform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
      if (nextWorldTransform !== worldTransform) {
        worldTransform = nextWorldTransform;
        world.style.transform = nextWorldTransform;
      }
      const nextZoomText = `×${view.scale.toFixed(2)}`;
      if (zoomRef.current && nextZoomText !== zoomText) {
        zoomText = nextZoomText;
        zoomRef.current.textContent = nextZoomText;
      }
      updateStar(now, delta);
      planets.forEach((planet) => updateOrbit(planet, delta));

      const nextHovered = hitTest();
      if (nextHovered !== hoveredRef.current) {
        if (nextHovered < 0) cardCloseStartedAt = now;
        hoveredRef.current = nextHovered;
        if (!drag?.moved) setCursor(nextHovered >= 0 ? "pointer" : "crosshair");
        if (nextHovered >= 0) void measure(planets[nextHovered]);
      }

      const easing = 1 - Math.exp(-delta * CONFIG.hoverSmooth);
      planets.forEach((planet, index) => {
        const active =
          index === hoveredRef.current ||
          index === lockedRef.current ||
          (cardHoveredRef.current && index === cardIndexOnScreen);
        planet.speedMultiplier +=
          ((active ? CONFIG.hoverSlow : 1) - planet.speedMultiplier) * easing;
        planet.scale += ((active ? CONFIG.hoverScale : 1) - planet.scale) * easing;
        const element = planetRefs.current[index];
        if (element) {
          if (activePlanets[index] !== active) {
            activePlanets[index] = active;
            element.classList.toggle(styles.active, active);
          }
          element.style.transform = `translate(${planet.worldX}px, ${planet.worldY}px) translate(-50%, -50%) scale(${planet.scale.toFixed(3)})`;
        }
      });

      draw();
      showCard(now);
      scheduleFrame();
    };

    let stageVisible = true;
    const scheduleFrame = () => {
      if (frame || document.hidden || !stageVisible) return;
      frame = requestAnimationFrame(animate);
    };

    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as Element).closest(`.${styles.card}, [data-stage-control]`))
        return;
      stage.setPointerCapture?.(event.pointerId);
      const point = localPoint(event);
      pointers.set(event.pointerId, point);
      pointer.x = point.x;
      pointer.y = point.y;
      pointer.inside = true;
      if (pointers.size === 1) {
        drag = {
          startX: point.x,
          startY: point.y,
          viewX: view.x,
          viewY: view.y,
          moved: false,
        };
        pinch = null;
      } else if (pointers.size === 2) {
        drag = null;
        const [first, second] = [...pointers.values()];
        const middleX = (first.x + second.x) / 2;
        const middleY = (first.y + second.y) / 2;
        pinch = {
          baseDistance: Math.hypot(first.x - second.x, first.y - second.y),
          baseScale: view.scale,
          worldX: (middleX - view.x) / view.scale,
          worldY: (middleY - view.y) / view.scale,
        };
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const point = localPoint(event);
      if (pointers.has(event.pointerId)) pointers.set(event.pointerId, point);
      pointer.x = point.x;
      pointer.y = point.y;
      pointer.inside = true;
      if (pinch && pointers.size >= 2) {
        const [first, second] = [...pointers.values()];
        const distance = Math.hypot(first.x - second.x, first.y - second.y);
        const middleX = (first.x + second.x) / 2;
        const middleY = (first.y + second.y) / 2;
        view.scale = clamp(
          pinch.baseScale * (distance / Math.max(pinch.baseDistance, 1)),
          CONFIG.minZoom,
          CONFIG.maxZoom,
        );
        view.x = middleX - pinch.worldX * view.scale;
        view.y = middleY - pinch.worldY * view.scale;
        keepViewInRange();
      } else if (drag) {
        const differenceX = point.x - drag.startX;
        const differenceY = point.y - drag.startY;
        if (Math.hypot(differenceX, differenceY) > CONFIG.dragThreshold) {
          drag.moved = true;
        }
        if (drag.moved) {
          view.x = drag.viewX + differenceX;
          view.y = drag.viewY + differenceY;
          keepViewInRange();
          setCursor("grabbing");
        }
      }
    };

    const finishPointer = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) {
        if (drag && !drag.moved) {
          if (hoveredRef.current >= 0) {
            lockedRef.current =
              lockedRef.current === hoveredRef.current ? -1 : hoveredRef.current;
          } else {
            lockedRef.current = -1;
            cardCloseStartedAt = 0;
          }
        }
        drag = null;
        setCursor(hoveredRef.current >= 0 ? "pointer" : "crosshair");
      } else if (pointers.size === 1) {
        const point = [...pointers.values()][0];
        drag = {
          startX: point.x,
          startY: point.y,
          viewX: view.x,
          viewY: view.y,
          moved: true,
        };
      }
    };

    const onPointerLeave = () => {
      if (pointers.size > 0) return;
      pointer.inside = false;
      hoveredRef.current = -1;
      cardCloseStartedAt = performance.now();
      setCursor("crosshair");
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const point = localPoint(event);
      const factor = Math.exp(-event.deltaY * 0.0015);
      const nextScale = clamp(view.scale * factor, CONFIG.minZoom, CONFIG.maxZoom);
      const worldX = (point.x - view.x) / view.scale;
      const worldY = (point.y - view.y) / view.scale;
      view.scale = nextScale;
      view.x = point.x - worldX * nextScale;
      view.y = point.y - worldY * nextScale;
      keepViewInRange();
    };

    const resetView = () => {
      view.scale = 1;
      view.x = centerX;
      view.y = centerY;
      keepViewInRange();
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        return;
      }
      lastFrame = performance.now();
      scheduleFrame();
    };
    const visibilityObserver = new IntersectionObserver((entries) => {
      stageVisible = entries[entries.length - 1]?.isIntersecting ?? true;
      if (!stageVisible) {
        cancelAnimationFrame(frame);
        frame = 0;
        return;
      }
      lastFrame = performance.now();
      scheduleFrame();
    });
    const cardObserver = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1]?.contentRect;
      if (!box) return;
      cardWidth = box.width || cardWidth;
      cardHeight = box.height || cardHeight;
    });

    resize();
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", finishPointer);
    stage.addEventListener("pointercancel", finishPointer);
    stage.addEventListener("pointerleave", onPointerLeave);
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("dblclick", resetView);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionQuery.addEventListener("change", onMotionChange);
    visibilityObserver.observe(stage);
    cardObserver.observe(card);
    scheduleFrame();

    return () => {
      cancelAnimationFrame(frame);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", finishPointer);
      stage.removeEventListener("pointercancel", finishPointer);
      stage.removeEventListener("pointerleave", onPointerLeave);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("dblclick", resetView);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener("change", onMotionChange);
      visibilityObserver.disconnect();
      cardObserver.disconnect();
      canvas.width = 1;
      canvas.height = 1;
    };
  }, [planets]);

  const selectedPlanet = cardIndex >= 0 ? planets[cardIndex] : null;
  const selectedPing = selectedPlanet
    ? (selectedPlanet.measuredPing ?? selectedPlanet.estimatedPing)
    : 0;

  const openWithKeyboard = (index: number) => {
    lockedRef.current = index;
    hoveredRef.current = index;
    setCardIndex(index);
  };

  const handleKeyboardClick = (
    event: ReactMouseEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.detail === 0) openWithKeyboard(index);
  };

  return (
    <section
      ref={stageRef}
      className={`${styles.stage} friend-network-stage`}
      aria-label="友链星图。滚轮缩放，拖拽平移，双击复位。"
    >
      <canvas ref={canvasRef} className={styles.space} aria-hidden="true" />
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      <div ref={worldRef} className={styles.world}>
        <div ref={starRef} className={styles.starWrap} aria-hidden="true">
          <div className={styles.starRay} />
          <div className={`${styles.starRay} ${styles.rayTwo}`} />
          <div className={`${styles.starRay} ${styles.rayThree}`} />
          <div className={styles.star} />
        </div>
        <div className={styles.planets}>
          {planets.map((planet, index) => (
            <button
              key={planet.url}
              ref={(element) => {
                planetRefs.current[index] = element;
              }}
              type="button"
              className={styles.planet}
              style={{ width: planet.size, height: planet.size }}
              aria-label={`查看友链：${planet.name}`}
              onFocus={() => openWithKeyboard(index)}
              onClick={(event) => handleKeyboardClick(event, index)}
            >
              {planet.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={planet.icon} alt="" draggable="false" />
              ) : (
                <span className={styles.letter} aria-hidden="true">
                  {(planet.name[0] || "?").toUpperCase()}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <FriendLinkApplication
        className={`site-header__chip ${styles.submitLink}`}
        iconClassName={styles.submitLinkIcon}
      />

      <div className={styles.legend} aria-hidden="true">
        <span>
          <i className={styles.good} /> &lt; 70ms
        </span>
        <span>
          <i className={styles.warn} /> &lt; 160ms
        </span>
        <span>
          <i className={styles.bad} /> high
        </span>
      </div>
      <div className={`${styles.hud} ${styles.hudBottomLeft}`} aria-hidden="true">
        &gt; friend network / <b>live ping</b>
      </div>
      <div className={`${styles.hud} ${styles.hudBottomRight}`} aria-hidden="true">
        » scroll: zoom · drag: pan
        <br />
        dbl-click: reset ·{" "}
        <span ref={zoomRef} className={styles.zoom}>
          ×1.00
        </span>
      </div>

      <div
        ref={cardRef}
        className={`${styles.card} ${selectedPlanet ? styles.cardOpen : ""}`}
        onPointerEnter={() => {
          cardHoveredRef.current = true;
        }}
        onPointerLeave={() => {
          cardHoveredRef.current = false;
        }}
        hidden={!selectedPlanet}
        aria-hidden={!selectedPlanet}
      >
        {selectedPlanet ? (
          <>
            <div className={styles.cardTag}>
              FRIEND · {String(cardIndex + 1).padStart(2, "0")}
            </div>
            <div className={styles.cardName}>{selectedPlanet.name}</div>
            <div className={styles.cardHost}>{selectedPlanet.host}</div>
            {selectedPlanet.description ? (
              <div className={styles.cardDescription}>{selectedPlanet.description}</div>
            ) : null}
            <div className={styles.cardPing}>
              <span className={styles.cardPingKey}>PING</span>
              <span
                className={styles.cardPingValue}
                style={{ color: pingColor(selectedPing) }}
              >
                {selectedPing}
                <span className={styles.unit}>ms</span>
              </span>
            </div>
            <div className={styles.cardSource}>
              <span
                className={`${styles.cardDot} ${
                  selectedPlanet.measuredPing !== null
                    ? styles.dotMeasured
                    : selectedPlanet.pingFailed
                      ? styles.dotBad
                      : styles.dotEstimated
                }`}
              />
              {selectedPlanet.measuredPing !== null
                ? "measured · favicon rtt"
                : selectedPlanet.pingFailed
                  ? "est. · unreachable"
                  : selectedPlanet.isMeasuring
                    ? "probing…"
                    : "est."}
            </div>
            <a
              className={styles.visit}
              href={selectedPlanet.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              VISIT →
            </a>
          </>
        ) : null}
      </div>
    </section>
  );
}
