"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isPublicAnalyticsPath } from "@/lib/analytics-core";

const SESSION_STORAGE_KEY = "jufe-offer:analytics-session:v1";

type AnalyticsData = Record<string, boolean | number | string>;
type AnalyticsPayload = {
  type: "event" | "pageview" | "performance";
  name?: string;
  path: string;
  title?: string;
  referrer?: string;
  sessionId: string;
  language?: string;
  timezone?: string;
  data?: AnalyticsData;
};

let sessionId = "";
let lastTrackedPath = "";
let initialPageviewSent = false;
let metricsStarted = false;
let sendQueue: Promise<void> = Promise.resolve();

function getSessionId() {
  if (sessionId) return sessionId;

  try {
    sessionId = window.sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
  } catch {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

function analyticsAllowed() {
  const navigatorWithPrivacy = navigator as Navigator & {
    globalPrivacyControl?: boolean;
  };
  return (
    navigator.doNotTrack !== "1" &&
    navigator.doNotTrack !== "yes" &&
    navigatorWithPrivacy.globalPrivacyControl !== true
  );
}

function sendAnalytics(payload: AnalyticsPayload) {
  if (!analyticsAllowed() || !isPublicAnalyticsPath(payload.path)) return;

  sendQueue = sendQueue
    .then(async () => {
      await fetch("/api/analytics/collect", {
        body: JSON.stringify({
          ...payload,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        method: "POST",
      });
    })
    .catch(() => undefined);
}

function readDeclarativeEvent(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const element = target.closest<HTMLElement>("[data-analytics-event]");
  const name = element?.dataset.analyticsEvent;
  if (!element || !name) return null;

  const data: AnalyticsData = {};
  for (const [key, value] of Object.entries(element.dataset)) {
    if (!key.startsWith("analyticsEvent") || key === "analyticsEvent" || !value) {
      continue;
    }
    const field = key.slice("analyticsEvent".length);
    if (!field) continue;
    data[`${field[0]?.toLowerCase()}${field.slice(1)}`] = value.slice(0, 160);
  }

  return { data, name: name.slice(0, 80) };
}

type MetricName = "CLS" | "FCP" | "LCP" | "TTFB";

function metricRating(name: MetricName, value: number) {
  const thresholds = {
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    LCP: [2500, 4000],
    TTFB: [800, 1800],
  }[name];
  if (value <= thresholds[0]) return "good";
  if (value <= thresholds[1]) return "needs-improvement";
  return "poor";
}

function observeWebVitals(path: string) {
  if (metricsStarted || !analyticsAllowed() || !isPublicAnalyticsPath(path)) return;
  metricsStarted = true;

  const report = (metric: MetricName, value: number) => {
    if (!Number.isFinite(value) || value < 0) return;
    sendAnalytics({
      type: "performance",
      name: "web-vital",
      path,
      sessionId: getSessionId(),
      data: {
        metric,
        rating: metricRating(metric, value),
        value: Number(value.toFixed(metric === "CLS" ? 4 : 1)),
      },
    });
  };

  const navigation = performance.getEntriesByType("navigation")[0] as
    PerformanceNavigationTiming | undefined;
  if (navigation) report("TTFB", navigation.responseStart);

  const paint = performance.getEntriesByName("first-contentful-paint")[0];
  if (paint) report("FCP", paint.startTime);

  let cls = 0;
  let lcp = 0;
  let flushed = false;
  const observers: PerformanceObserver[] = [];

  if (globalThis.PerformanceObserver?.supportedEntryTypes.includes("layout-shift")) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (!shift.hadRecentInput) cls += shift.value ?? 0;
      }
    });
    observer.observe({ buffered: true, type: "layout-shift" });
    observers.push(observer);
  }

  if (
    globalThis.PerformanceObserver?.supportedEntryTypes.includes(
      "largest-contentful-paint",
    )
  ) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const entry = entries.at(-1);
      if (entry) lcp = entry.startTime;
    });
    observer.observe({ buffered: true, type: "largest-contentful-paint" });
    observers.push(observer);
  }

  const flush = () => {
    if (flushed) return;
    flushed = true;
    observers.forEach((observer) => observer.disconnect());
    if (globalThis.PerformanceObserver?.supportedEntryTypes.includes("layout-shift")) {
      report("CLS", cls);
    }
    if (lcp > 0) report("LCP", lcp);
  };

  window.addEventListener("pagehide", flush, { once: true });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") flush();
    },
    { once: true },
  );
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!analyticsAllowed() || !isPublicAnalyticsPath(pathname)) return;
    if (lastTrackedPath === pathname) return;

    const initial = !initialPageviewSent;
    lastTrackedPath = pathname;
    initialPageviewSent = true;
    queueMicrotask(() => {
      sendAnalytics({
        type: "pageview",
        path: pathname,
        title: document.title,
        referrer: initial ? document.referrer : undefined,
        sessionId: getSessionId(),
      });
      if (initial) observeWebVitals(pathname);
    });
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const analyticsEvent = readDeclarativeEvent(event.target);
      if (!analyticsEvent || !isPublicAnalyticsPath(window.location.pathname)) return;
      sendAnalytics({
        type: "event",
        name: analyticsEvent.name,
        data: analyticsEvent.data,
        path: window.location.pathname,
        sessionId: getSessionId(),
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
