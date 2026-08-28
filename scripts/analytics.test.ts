import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  analyticsRangeStart,
  analyticsReferrerHost,
  cleanAnalyticsPath,
  isPublicAnalyticsPath,
  parseAnalyticsUserAgent,
  summarizeAnalytics,
  type AnalyticsEventRecord,
} from "../src/lib/analytics-core";
import { analyticsPayloadSchema } from "../src/schemas/analytics";

function record(
  overrides: Partial<AnalyticsEventRecord> & Pick<AnalyticsEventRecord, "createdAt">,
): AnalyticsEventRecord {
  return {
    eventType: "pageview",
    eventName: null,
    path: "/",
    referrerHost: null,
    sessionId: "session-one",
    visitorId: "visitor-one",
    browser: "Chrome",
    operatingSystem: "Windows",
    device: "Desktop",
    language: "zh-CN",
    timezone: "Asia/Shanghai",
    metricName: null,
    metricValue: null,
    metricRating: null,
    ...overrides,
  };
}

test("analytics keeps only public paths and referrer hosts", () => {
  assert.equal(cleanAnalyticsPath("/resources?q=secret#form"), "/resources");
  assert.equal(cleanAnalyticsPath("https://evil.example/path"), "/");
  assert.equal(isPublicAnalyticsPath("/resources"), true);
  assert.equal(isPublicAnalyticsPath("/analytics"), false);
  assert.equal(isPublicAnalyticsPath("/api/admin/analytics/summary"), false);
  assert.equal(
    analyticsReferrerHost("https://www.google.com/search?q=jufe", "jufe.test"),
    "www.google.com",
  );
  assert.equal(
    analyticsReferrerHost("https://jufe.test/resources?private=1", "jufe.test"),
    "站内",
  );
});

test("analytics recognizes common browser, operating system and device families", () => {
  assert.deepEqual(
    parseAnalyticsUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
    ),
    { browser: "Safari", operatingSystem: "iOS", device: "Mobile" },
  );
  assert.deepEqual(
    parseAnalyticsUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36 Edg/140.0",
    ),
    { browser: "Edge", operatingSystem: "Windows", device: "Desktop" },
  );
});

test("analytics summary uses Beijing days and computes private dashboard metrics", () => {
  const now = new Date("2026-08-28T04:00:00.000Z");
  const records = [
    record({
      createdAt: new Date("2026-08-28T03:20:00.000Z"),
      referrerHost: "www.google.com",
    }),
    record({
      createdAt: new Date("2026-08-28T03:25:00.000Z"),
      path: "/resources",
      referrerHost: "站内",
    }),
    record({
      createdAt: new Date("2026-08-28T03:45:00.000Z"),
      sessionId: "session-two",
      visitorId: "visitor-two",
      browser: "Safari",
      operatingSystem: "iOS",
      device: "Mobile",
    }),
    record({
      createdAt: new Date("2026-08-28T03:50:00.000Z"),
      eventType: "event",
      eventName: "open-analytics",
    }),
    record({
      createdAt: new Date("2026-08-28T03:51:00.000Z"),
      eventType: "performance",
      eventName: "web-vital",
      metricName: "LCP",
      metricValue: 2000,
      metricRating: "good",
    }),
    record({
      createdAt: new Date("2026-08-28T03:52:00.000Z"),
      eventType: "performance",
      eventName: "web-vital",
      metricName: "LCP",
      metricValue: 3000,
      metricRating: "needs-improvement",
    }),
  ];

  const summary = summarizeAnalytics(records, 675, 7, now, records[0]!.createdAt);

  assert.equal(analyticsRangeStart(7, now).toISOString(), "2026-08-21T16:00:00.000Z");
  assert.equal(summary.totalVisitors, 675);
  assert.deepEqual(summary.totals, {
    pageviews: 3,
    visitors: 2,
    sessions: 2,
    events: 1,
    activeVisitors30m: 2,
    bounceRate: 50,
    avgSessionSeconds: 150,
  });
  assert.deepEqual(summary.timeSeries.at(-1), {
    label: "2026-08-28",
    pageviews: 3,
    visitors: 2,
  });
  assert.deepEqual(summary.topPages[0], { label: "/", value: 2 });
  assert.deepEqual(summary.customEvents[0], { label: "open-analytics", value: 1 });
  assert.deepEqual(summary.webVitals[0], {
    name: "LCP",
    average: 2500,
    samples: 2,
    good: 1,
    needsImprovement: 1,
    poor: 0,
  });
});

test("analytics payload schema rejects unsupported performance data", () => {
  const base = {
    type: "performance",
    name: "web-vital",
    path: "/",
    sessionId: "session-one",
  } as const;

  assert.equal(
    analyticsPayloadSchema.safeParse({
      ...base,
      data: { metric: "LCP", value: 2300, rating: "good" },
    }).success,
    true,
  );
  assert.equal(
    analyticsPayloadSchema.safeParse({
      ...base,
      data: { metric: "SECRET", value: -1 },
    }).success,
    false,
  );
});

test("analytics page and summary API both enforce the admin session", () => {
  const page = readFileSync("src/app/analytics/page.tsx", "utf8");
  const api = readFileSync("src/app/api/admin/analytics/summary/route.ts", "utf8");
  const badge = readFileSync("src/components/home/visitor-count-badge.tsx", "utf8");

  assert.match(page, /readAdminSession\(\)/);
  assert.match(api, /readAdminSession\(\)/);
  assert.match(api, /private, no-store/);
  assert.match(badge, /href="\/analytics"/);
});
