export const ANALYTICS_RETENTION_DAYS = 180;
export const ANALYTICS_TIMEZONE = "Asia/Shanghai";
export const ANALYTICS_RANGE_OPTIONS = [7, 30, 90] as const;

const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;

export type AnalyticsEventRecord = {
  createdAt: Date;
  eventType: string;
  eventName: string | null;
  path: string;
  referrerHost: string | null;
  sessionId: string;
  visitorId: string;
  browser: string;
  operatingSystem: string;
  device: string;
  language: string | null;
  timezone: string | null;
  metricName: string | null;
  metricValue: number | null;
  metricRating: string | null;
};

export type AnalyticsRankRow = {
  label: string;
  value: number;
};

export type AnalyticsTimeRow = {
  label: string;
  pageviews: number;
  visitors: number;
};

export type AnalyticsVitalRow = {
  name: string;
  average: number;
  samples: number;
  good: number;
  needsImprovement: number;
  poor: number;
};

export type AnalyticsSummary = {
  rangeDays: number;
  generatedAt: string;
  trackingSince: string | null;
  totalVisitors: number;
  totals: {
    pageviews: number;
    visitors: number;
    sessions: number;
    events: number;
    activeVisitors30m: number;
    bounceRate: number;
    avgSessionSeconds: number;
  };
  timeSeries: AnalyticsTimeRow[];
  topPages: AnalyticsRankRow[];
  referrers: AnalyticsRankRow[];
  devices: AnalyticsRankRow[];
  browsers: AnalyticsRankRow[];
  operatingSystems: AnalyticsRankRow[];
  languages: AnalyticsRankRow[];
  timezones: AnalyticsRankRow[];
  customEvents: AnalyticsRankRow[];
  webVitals: AnalyticsVitalRow[];
};

export function normalizeAnalyticsDays(value: unknown) {
  const parsed = Number(value);
  return ANALYTICS_RANGE_OPTIONS.includes(
    parsed as (typeof ANALYTICS_RANGE_OPTIONS)[number],
  )
    ? parsed
    : 30;
}

export function cleanAnalyticsPath(value: string) {
  const trimmed = value.trim().slice(0, 512);
  if (!trimmed.startsWith("/")) return "/";
  return trimmed.split("?", 1)[0]?.split("#", 1)[0] || "/";
}

export function isPublicAnalyticsPath(value: string) {
  const path = cleanAnalyticsPath(value).toLowerCase();
  return !["/admin", "/analytics", "/api", "/playground", "/_next"].some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function analyticsReferrerHost(value: string | undefined, ownHost: string) {
  if (!value) return null;

  try {
    const host = new URL(value).hostname.toLowerCase().slice(0, 255);
    if (!host) return null;
    return host === ownHost.toLowerCase() ? "站内" : host;
  } catch {
    return null;
  }
}

export function parseAnalyticsUserAgent(userAgent: string | null) {
  const value = userAgent ?? "";
  let browser = "Other";
  let operatingSystem = "Other";
  let device = "Desktop";

  if (/Edg\//i.test(value)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(value)) browser = "Opera";
  else if (/Firefox\//i.test(value)) browser = "Firefox";
  else if (/Chrome\/|CriOS\//i.test(value)) browser = "Chrome";
  else if (/Safari\//i.test(value)) browser = "Safari";

  if (/Windows/i.test(value)) operatingSystem = "Windows";
  else if (/Android/i.test(value)) operatingSystem = "Android";
  else if (/iPhone|iPad|iOS/i.test(value)) operatingSystem = "iOS";
  else if (/Mac OS X|Macintosh/i.test(value)) operatingSystem = "macOS";
  else if (/Linux/i.test(value)) operatingSystem = "Linux";

  if (/iPad|Tablet/i.test(value)) device = "Tablet";
  else if (/Mobile|iPhone|Android/i.test(value)) device = "Mobile";

  return { browser, operatingSystem, device };
}

export function analyticsRangeStart(days: number, now = new Date()) {
  const normalizedDays = normalizeAnalyticsDays(days);
  const shifted = new Date(now.getTime() + BEIJING_OFFSET_MS);
  return new Date(
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate() - normalizedDays + 1,
    ) - BEIJING_OFFSET_MS,
  );
}

function beijingDay(value: Date) {
  return new Date(value.getTime() + BEIJING_OFFSET_MS).toISOString().slice(0, 10);
}

function rank(
  events: AnalyticsEventRecord[],
  readLabel: (event: AnalyticsEventRecord) => string | null,
) {
  const totals = new Map<string, number>();
  for (const event of events) {
    const label = readLabel(event)?.trim();
    if (!label) continue;
    totals.set(label, (totals.get(label) ?? 0) + 1);
  }

  return Array.from(totals, ([label, value]) => ({ label, value }))
    .sort(
      (left, right) => right.value - left.value || left.label.localeCompare(right.label),
    )
    .slice(0, 12);
}

export function summarizeAnalytics(
  records: AnalyticsEventRecord[],
  totalVisitors: number,
  days: number,
  now = new Date(),
  trackingSince: Date | null = null,
): AnalyticsSummary {
  const rangeDays = normalizeAnalyticsDays(days);
  const pageviews = records.filter((record) => record.eventType === "pageview");
  const customEvents = records.filter((record) => record.eventType === "event");
  const performanceEvents = records.filter(
    (record) => record.eventType === "performance",
  );
  const visitors = new Set(pageviews.map((record) => record.visitorId));
  const sessions = new Map<string, { count: number; first: number; last: number }>();

  for (const pageview of pageviews) {
    const timestamp = pageview.createdAt.getTime();
    const current = sessions.get(pageview.sessionId);
    if (current) {
      current.count += 1;
      current.first = Math.min(current.first, timestamp);
      current.last = Math.max(current.last, timestamp);
    } else {
      sessions.set(pageview.sessionId, {
        count: 1,
        first: timestamp,
        last: timestamp,
      });
    }
  }

  const sessionRows = Array.from(sessions.values());
  const activeSince = now.getTime() - 30 * 60 * 1000;
  const activeVisitors = new Set(
    records
      .filter((record) => record.createdAt.getTime() >= activeSince)
      .map((record) => record.visitorId),
  );
  const byDay = new Map<string, { pageviews: number; visitors: Set<string> }>();

  for (const pageview of pageviews) {
    const label = beijingDay(pageview.createdAt);
    const row = byDay.get(label) ?? { pageviews: 0, visitors: new Set<string>() };
    row.pageviews += 1;
    row.visitors.add(pageview.visitorId);
    byDay.set(label, row);
  }

  const shiftedNow = new Date(now.getTime() + BEIJING_OFFSET_MS);
  const timeSeries: AnalyticsTimeRow[] = [];
  for (let offset = rangeDays - 1; offset >= 0; offset -= 1) {
    const label = new Date(
      Date.UTC(
        shiftedNow.getUTCFullYear(),
        shiftedNow.getUTCMonth(),
        shiftedNow.getUTCDate() - offset,
      ),
    )
      .toISOString()
      .slice(0, 10);
    const row = byDay.get(label);
    timeSeries.push({
      label,
      pageviews: row?.pageviews ?? 0,
      visitors: row?.visitors.size ?? 0,
    });
  }

  const vitalGroups = new Map<string, AnalyticsEventRecord[]>();
  for (const event of performanceEvents) {
    if (!event.metricName || event.metricValue === null) continue;
    const group = vitalGroups.get(event.metricName) ?? [];
    group.push(event);
    vitalGroups.set(event.metricName, group);
  }

  const webVitals = Array.from(vitalGroups, ([name, rows]) => ({
    name,
    average:
      Math.round(
        (rows.reduce((total, row) => total + (row.metricValue ?? 0), 0) / rows.length) *
          100,
      ) / 100,
    samples: rows.length,
    good: rows.filter((row) => row.metricRating === "good").length,
    needsImprovement: rows.filter((row) => row.metricRating === "needs-improvement")
      .length,
    poor: rows.filter((row) => row.metricRating === "poor").length,
  })).sort((left, right) => left.name.localeCompare(right.name));

  return {
    rangeDays,
    generatedAt: now.toISOString(),
    trackingSince: trackingSince?.toISOString() ?? null,
    totalVisitors: Math.max(0, Math.trunc(totalVisitors)),
    totals: {
      pageviews: pageviews.length,
      visitors: visitors.size,
      sessions: sessions.size,
      events: customEvents.length,
      activeVisitors30m: activeVisitors.size,
      bounceRate: sessionRows.length
        ? Math.round(
            (1000 * sessionRows.filter((session) => session.count === 1).length) /
              sessionRows.length,
          ) / 10
        : 0,
      avgSessionSeconds: sessionRows.length
        ? Math.round(
            sessionRows.reduce(
              (total, session) => total + Math.max(0, session.last - session.first),
              0,
            ) /
              sessionRows.length /
              1000,
          )
        : 0,
    },
    timeSeries,
    topPages: rank(pageviews, (event) => event.path),
    referrers: rank(pageviews, (event) => event.referrerHost),
    devices: rank(pageviews, (event) => event.device),
    browsers: rank(pageviews, (event) => event.browser),
    operatingSystems: rank(pageviews, (event) => event.operatingSystem),
    languages: rank(pageviews, (event) => event.language),
    timezones: rank(pageviews, (event) => event.timezone),
    customEvents: rank(customEvents, (event) => event.eventName),
    webVitals,
  };
}
