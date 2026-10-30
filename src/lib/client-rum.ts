import {
  flushAnalytics,
  queuePerformanceMetric,
  type ClientAnalyticsData,
} from "@/lib/client-analytics";

export const CUSTOM_PERFORMANCE_METRICS = [
  "route-transition",
  "home:model-ready",
  "home:enhancement-ready",
  "resources:data-ready",
  "resources:masonry-ready",
  "friends:first-frame",
  "longtask",
  "long-animation-frame",
] as const;

export type CustomPerformanceMetric = (typeof CUSTOM_PERFORMANCE_METRICS)[number];

export type PerformanceSample = {
  type: "longtask" | "long-animation-frame";
  name: string;
  startTime: number;
  duration: number;
  blockingDuration?: number;
  renderDuration?: number;
};

type PerformanceAggregate = {
  count: number;
  totalDuration: number;
  maxDuration: number;
  totalBlockingDuration: number;
  totalRenderDuration: number;
};

export type RouteTransitionSample = {
  url: string;
  navigationType: "push" | "replace" | "traverse";
  startTime: number;
  completed: boolean;
};

export type ClientPerformanceStore = {
  startedAt: number;
  routeTransitions: RouteTransitionSample[];
  samples: PerformanceSample[];
  aggregates: Partial<Record<"longtask" | "long-animation-frame", PerformanceAggregate>>;
};

declare global {
  interface Window {
    __JUFE_PERFORMANCE__?: ClientPerformanceStore;
  }
}

const MAX_SAMPLES = 100;

function pathFromUrl(url: string) {
  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    return url.split("?", 1)[0] || "/";
  }
}

export function createClientPerformanceStore(): ClientPerformanceStore {
  return {
    startedAt: performance.now(),
    routeTransitions: [],
    samples: [],
    aggregates: {},
  };
}

export function rememberPerformanceSample(
  store: ClientPerformanceStore,
  sample: PerformanceSample,
) {
  store.samples.push(sample);
  if (store.samples.length > MAX_SAMPLES) store.samples.shift();

  const aggregate = store.aggregates[sample.type] ?? {
    count: 0,
    totalDuration: 0,
    maxDuration: 0,
    totalBlockingDuration: 0,
    totalRenderDuration: 0,
  };
  aggregate.count += 1;
  aggregate.totalDuration += sample.duration;
  aggregate.maxDuration = Math.max(aggregate.maxDuration, sample.duration);
  aggregate.totalBlockingDuration += sample.blockingDuration ?? 0;
  aggregate.totalRenderDuration += sample.renderDuration ?? 0;
  store.aggregates[sample.type] = aggregate;
}

export function reportPerformanceReady(
  metric: Exclude<
    CustomPerformanceMetric,
    "longtask" | "long-animation-frame" | "route-transition"
  >,
  data: ClientAnalyticsData = {},
) {
  if (typeof window === "undefined") return;
  const now = performance.now();
  const path = window.location.pathname;
  const transition = window.__JUFE_PERFORMANCE__?.routeTransitions
    .filter((item) => pathFromUrl(item.url) === path)
    .at(-1);
  const startedAt = transition?.startTime ?? 0;
  performance.mark(`jufe:${metric}`, { detail: { path, ...data } });
  queuePerformanceMetric({
    metric,
    value: Math.max(0, now - startedAt),
    path,
    data,
    dedupeKey: `${performance.timeOrigin}:${path}:${metric}`,
  });
}

export function startRouteTransition(
  store: ClientPerformanceStore,
  url: string,
  navigationType: RouteTransitionSample["navigationType"],
) {
  reportPerformanceAggregates(store, true);
  const startTime = performance.now();
  store.routeTransitions.push({
    url,
    navigationType,
    startTime,
    completed: false,
  });
  if (store.routeTransitions.length > 30) store.routeTransitions.shift();
  performance.mark("jufe:route-transition:start", {
    detail: { url, navigationType },
  });
}

export function completeRouteTransition(path: string) {
  if (typeof window === "undefined") return;
  const store = window.__JUFE_PERFORMANCE__;
  const transition = store?.routeTransitions
    .filter((item) => !item.completed && pathFromUrl(item.url) === path)
    .at(-1);
  if (!transition) return;

  transition.completed = true;
  const endTime = performance.now();
  performance.mark("jufe:route-transition:end", {
    detail: { path, navigationType: transition.navigationType },
  });
  performance.measure("jufe:route-transition", {
    start: transition.startTime,
    end: endTime,
    detail: { path, navigationType: transition.navigationType },
  });
  queuePerformanceMetric({
    metric: "route-transition",
    value: Math.max(0, endTime - transition.startTime),
    path,
    navigationType: transition.navigationType,
    dedupeKey: `${performance.timeOrigin}:${transition.startTime}:route-transition`,
  });
}

export function reportPerformanceAggregates(
  store: ClientPerformanceStore,
  reset = false,
) {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  for (const metric of ["longtask", "long-animation-frame"] as const) {
    const aggregate = store.aggregates[metric];
    if (!aggregate?.count) continue;
    queuePerformanceMetric({
      metric,
      value: aggregate.totalDuration,
      path,
      data: {
        count: aggregate.count,
        maxDuration: Number(aggregate.maxDuration.toFixed(1)),
        totalBlockingDuration: Number(aggregate.totalBlockingDuration.toFixed(1)),
        totalRenderDuration: Number(aggregate.totalRenderDuration.toFixed(1)),
      },
      dedupeKey: `${performance.timeOrigin}:${path}:${metric}`,
    });
  }
  if (reset) store.aggregates = {};
}

export function flushPerformance(store: ClientPerformanceStore) {
  reportPerformanceAggregates(store);
  flushAnalytics();
}
