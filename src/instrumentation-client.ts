type PerformanceSample = {
  type: string;
  name: string;
  startTime: number;
  duration: number;
  value?: number;
  blockingDuration?: number;
  renderDuration?: number;
  interactionId?: number;
};

type ClientPerformanceStore = {
  startedAt: number;
  routeTransitions: Array<{
    url: string;
    navigationType: "push" | "replace" | "traverse";
    startTime: number;
  }>;
  samples: PerformanceSample[];
};

declare global {
  interface Window {
    __JUFE_PERFORMANCE__?: ClientPerformanceStore;
  }
}

const MAX_SAMPLES = 100;
const store: ClientPerformanceStore = {
  startedAt: performance.now(),
  routeTransitions: [],
  samples: [],
};

window.__JUFE_PERFORMANCE__ = store;
performance.mark("jufe-app-init");

function remember(sample: PerformanceSample) {
  if (sample.interactionId) {
    const previousIndex = store.samples.findIndex(
      (item) => item.type === "event" && item.interactionId === sample.interactionId,
    );
    if (previousIndex >= 0) {
      if (store.samples[previousIndex].duration < sample.duration) {
        store.samples[previousIndex] = sample;
      }
      return;
    }
  }
  store.samples.push(sample);
  if (store.samples.length > MAX_SAMPLES) store.samples.shift();
}

try {
  const supported = new Set(PerformanceObserver.supportedEntryTypes);
  const observe = (type: string, durationThreshold?: number) => {
    if (!supported.has(type)) return;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          value?: number;
          hadRecentInput?: boolean;
          blockingDuration?: number;
          renderStart?: number;
          interactionId?: number;
        };
        if (type === "layout-shift" && shift.hadRecentInput) continue;
        const renderDuration =
          type === "long-animation-frame" && typeof shift.renderStart === "number"
            ? Math.max(0, entry.startTime + entry.duration - shift.renderStart)
            : undefined;
        if (
          type === "long-animation-frame" &&
          (shift.blockingDuration ?? 0) <= 0 &&
          (renderDuration ?? 0) < 50
        ) {
          continue;
        }
        if (type === "event" && (shift.interactionId ?? 0) <= 0) continue;
        remember({
          type,
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration,
          ...(typeof shift.value === "number" ? { value: shift.value } : {}),
          ...(typeof shift.blockingDuration === "number"
            ? { blockingDuration: shift.blockingDuration }
            : {}),
          ...(renderDuration === undefined ? {} : { renderDuration }),
          ...(typeof shift.interactionId === "number" && shift.interactionId > 0
            ? { interactionId: shift.interactionId }
            : {}),
        });
      }
    });
    observer.observe({
      type,
      buffered: true,
      ...(durationThreshold === undefined ? {} : { durationThreshold }),
    });
  };

  observe("longtask");
  observe("long-animation-frame");
  observe("layout-shift");
  observe("largest-contentful-paint");
  observe("event", 40);
} catch {
  // Performance instrumentation must never delay or break hydration.
}

export function onRouterTransitionStart(
  url: string,
  navigationType: "push" | "replace" | "traverse",
) {
  const startTime = performance.now();
  store.routeTransitions.push({ url, navigationType, startTime });
  if (store.routeTransitions.length > 30) store.routeTransitions.shift();
  performance.mark("jufe-route-transition", {
    detail: { url, navigationType },
  });
}
