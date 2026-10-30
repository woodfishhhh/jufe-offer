import { getEffectsMode } from "@/lib/client-performance";

const ANALYTICS_ENDPOINT = "/api/analytics/collect";
const SESSION_STORAGE_KEY = "jufe-offer:analytics-session:v1";
const FLUSH_DELAY_MS = 5_000;
const MAX_BATCH_EVENTS = 24;
const WEB_VITAL_NAMES = new Set(["CLS", "FCP", "LCP", "TTFB", "INP"]);

export type ClientAnalyticsData = Record<string, boolean | number | string>;

type ClientAnalyticsPayload = {
  eventId: string;
  type: "event" | "pageview" | "performance";
  name?: string;
  path: string;
  title?: string;
  referrer?: string;
  sessionId: string;
  language?: string;
  timezone?: string;
  viewport?: string;
  effectsMode?: "lite" | "enhanced";
  revision?: string;
  navigationType?: string;
  data?: ClientAnalyticsData;
};

type QueueOptions = {
  dedupeKey?: string;
  flush?: boolean;
};

let sessionId = "";
let flushTimer = 0;
let transportInitialized = false;
let fallbackEventCounter = 0;
const pendingEvents = new Map<string, ClientAnalyticsPayload>();
const stableEventIds = new Map<string, string>();

function randomId() {
  try {
    return crypto.randomUUID();
  } catch {
    fallbackEventCounter += 1;
    return `${Date.now().toString(36)}-${fallbackEventCounter.toString(36)}`;
  }
}

function getSessionId() {
  if (sessionId) return sessionId;

  try {
    sessionId = window.sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
    if (!sessionId) {
      sessionId = randomId();
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
  } catch {
    sessionId = randomId();
  }
  return sessionId;
}

export function analyticsAllowed() {
  if (typeof navigator === "undefined") return false;
  const navigatorWithPrivacy = navigator as Navigator & {
    globalPrivacyControl?: boolean;
  };
  return (
    navigator.doNotTrack !== "1" &&
    navigator.doNotTrack !== "yes" &&
    navigatorWithPrivacy.globalPrivacyControl !== true
  );
}

function publicPath(path: string) {
  const normalized = path.trim().split("?", 1)[0]?.split("#", 1)[0] || "/";
  const lower = normalized.toLowerCase();
  return !["/admin", "/analytics", "/api", "/playground", "/_next"].some(
    (prefix) => lower === prefix || lower.startsWith(`${prefix}/`),
  );
}

function currentContext() {
  const viewport = `${Math.max(0, Math.round(window.innerWidth))}x${Math.max(
    0,
    Math.round(window.innerHeight),
  )}`;
  return {
    effectsMode: getEffectsMode(),
    language: navigator.language,
    revision: document.documentElement.dataset.revision?.slice(0, 64) || "unknown",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    viewport,
  } as const;
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = 0;
    flushAnalytics();
  }, FLUSH_DELAY_MS);
}

function sendBatch(events: ClientAnalyticsPayload[]) {
  const body = JSON.stringify({
    batchId: randomId(),
    events,
  });

  try {
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(ANALYTICS_ENDPOINT, blob)) return;
    }
  } catch {
    // A keepalive request below is the compatibility fallback.
  }

  void fetch(ANALYTICS_ENDPOINT, {
    body,
    cache: "no-store",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST",
  }).catch(() => undefined);
}

export function flushAnalytics() {
  if (typeof window === "undefined" || pendingEvents.size === 0) return;
  if (flushTimer) {
    window.clearTimeout(flushTimer);
    flushTimer = 0;
  }
  const events = Array.from(pendingEvents.values());
  pendingEvents.clear();
  sendBatch(events);
}

export function initializeAnalyticsTransport() {
  if (transportInitialized || typeof window === "undefined") return;
  transportInitialized = true;
  window.addEventListener("pagehide", flushAnalytics);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushAnalytics();
  });
}

export function queueAnalytics(
  payload: Omit<
    ClientAnalyticsPayload,
    | "effectsMode"
    | "eventId"
    | "language"
    | "revision"
    | "sessionId"
    | "timezone"
    | "viewport"
  >,
  options: QueueOptions = {},
) {
  if (typeof window === "undefined" || !analyticsAllowed() || !publicPath(payload.path)) {
    return;
  }

  const eventId = options.dedupeKey
    ? (stableEventIds.get(options.dedupeKey) ?? randomId())
    : randomId();
  if (options.dedupeKey) stableEventIds.set(options.dedupeKey, eventId);

  pendingEvents.set(eventId, {
    ...payload,
    ...currentContext(),
    eventId,
    sessionId: getSessionId(),
  });

  if (options.flush || pendingEvents.size >= MAX_BATCH_EVENTS) flushAnalytics();
  else scheduleFlush();
}

export function queuePerformanceMetric({
  metric,
  value,
  path = window.location.pathname,
  rating,
  navigationType,
  data,
  dedupeKey,
}: {
  metric: string;
  value: number;
  path?: string;
  rating?: string;
  navigationType?: string;
  data?: ClientAnalyticsData;
  dedupeKey: string;
}) {
  if (!Number.isFinite(value) || value < 0) return;
  queueAnalytics(
    {
      type: "performance",
      name: WEB_VITAL_NAMES.has(metric) ? "web-vital" : "custom-metric",
      path,
      navigationType,
      data: {
        ...data,
        metric,
        ...(rating ? { rating } : {}),
        value: Number(value.toFixed(metric === "CLS" ? 4 : 1)),
      },
    },
    { dedupeKey },
  );
}
