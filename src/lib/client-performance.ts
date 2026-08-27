type ConnectionHints = EventTarget & {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithHints = Navigator & {
  connection?: ConnectionHints;
  deviceMemory?: number;
};

const canvasReleaseTimers = new WeakMap<
  HTMLCanvasElement,
  ReturnType<typeof setTimeout>
>();

export function cancelDeferredCanvasRelease(canvas: HTMLCanvasElement) {
  const timer = canvasReleaseTimers.get(canvas);
  if (timer === undefined) return;
  globalThis.clearTimeout(timer);
  canvasReleaseTimers.delete(canvas);
}

export function scheduleDeferredCanvasRelease(
  canvas: HTMLCanvasElement,
  release: () => void,
) {
  cancelDeferredCanvasRelease(canvas);
  const timer = globalThis.setTimeout(() => {
    canvasReleaseTimers.delete(canvas);
    release();
  }, 400);
  canvasReleaseTimers.set(canvas, timer);
}

export function shouldReduceEffects() {
  if (typeof window === "undefined") return true;
  const navigatorWithHints = navigator as NavigatorWithHints;
  const connection = navigatorWithHints.connection;

  return (
    document.documentElement.dataset.effects === "off" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    connection?.saveData === true ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g" ||
    (navigatorWithHints.deviceMemory ?? 4) <= 2 ||
    navigator.hardwareConcurrency <= 2
  );
}

export function shouldAvoidFullPageCanvas() {
  if (typeof window === "undefined") return true;
  return (
    shouldReduceEffects() ||
    window.matchMedia("(max-width: 767px) and (pointer: coarse)").matches
  );
}

export function supportsWebGL2() {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: true,
    });
    const supported = Boolean(context && !context.isContextLost());
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return supported;
  } catch {
    return false;
  }
}

/**
 * Keep large, full-viewport effects inside a predictable pixel budget while
 * still allowing small decorative canvases to render at high density.
 */
export function getAdaptiveCanvasDpr(width: number, height: number, maximum = 2) {
  if (typeof window === "undefined") return 1;
  const nativeDpr = Math.min(window.devicePixelRatio || 1, maximum);
  const area = Math.max(width, 1) * Math.max(height, 1);
  const areaLimit = area >= 1_000_000 ? 1.25 : area >= 500_000 ? 1.5 : maximum;
  return Math.max(1, Math.min(nativeDpr, areaLimit));
}

export function subscribeToPerformanceHints(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (navigator as NavigatorWithHints).connection;
  const root = document.documentElement;
  const effectsObserver =
    typeof MutationObserver === "undefined" ? null : new MutationObserver(callback);

  motion.addEventListener("change", callback);
  connection?.addEventListener("change", callback);
  window.addEventListener("resize", callback, { passive: true });
  effectsObserver?.observe(root, {
    attributes: true,
    attributeFilter: ["data-effects"],
  });
  return () => {
    motion.removeEventListener("change", callback);
    connection?.removeEventListener("change", callback);
    window.removeEventListener("resize", callback);
    effectsObserver?.disconnect();
  };
}

export function scheduleIdle(callback: () => void, timeout = 900) {
  if (typeof window === "undefined") return () => {};
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = globalThis.setTimeout(callback, Math.min(timeout, 250));
  return () => globalThis.clearTimeout(id);
}
