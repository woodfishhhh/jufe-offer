import {
  createClientPerformanceStore,
  flushPerformance,
  rememberPerformanceSample,
  startRouteTransition,
} from "@/lib/client-rum";

const store = createClientPerformanceStore();
window.__JUFE_PERFORMANCE__ = store;
performance.mark("jufe:app-init");

try {
  const supported = new Set(PerformanceObserver.supportedEntryTypes);
  const observe = (type: "longtask" | "long-animation-frame") => {
    if (!supported.has(type)) return;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const timing = entry as PerformanceEntry & {
          blockingDuration?: number;
          renderStart?: number;
        };
        const renderDuration =
          type === "long-animation-frame" && typeof timing.renderStart === "number"
            ? Math.max(0, entry.startTime + entry.duration - timing.renderStart)
            : undefined;
        if (
          type === "long-animation-frame" &&
          (timing.blockingDuration ?? 0) <= 0 &&
          (renderDuration ?? 0) < 50
        ) {
          continue;
        }
        rememberPerformanceSample(store, {
          type,
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration,
          ...(typeof timing.blockingDuration === "number"
            ? { blockingDuration: timing.blockingDuration }
            : {}),
          ...(renderDuration === undefined ? {} : { renderDuration }),
        });
      }
    });
    observer.observe({ type, buffered: true });
  };

  observe("longtask");
  observe("long-animation-frame");
  window.addEventListener("pagehide", () => flushPerformance(store));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushPerformance(store);
  });
} catch {
  // Performance instrumentation must never delay or break hydration.
}

export function onRouterTransitionStart(
  url: string,
  navigationType: "push" | "replace" | "traverse",
) {
  startRouteTransition(store, url, navigationType);
}
