type ConnectionHints = EventTarget & {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithHints = Navigator & {
  connection?: ConnectionHints;
  deviceMemory?: number;
};

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

export function subscribeToPerformanceHints(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (navigator as NavigatorWithHints).connection;
  motion.addEventListener("change", callback);
  connection?.addEventListener("change", callback);
  window.addEventListener("resize", callback, { passive: true });
  return () => {
    motion.removeEventListener("change", callback);
    connection?.removeEventListener("change", callback);
    window.removeEventListener("resize", callback);
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
