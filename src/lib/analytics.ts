import "server-only";

import {
  ANALYTICS_RETENTION_DAYS,
  analyticsRangeStart,
  analyticsReferrerHost,
  cleanAnalyticsPath,
  isPublicAnalyticsPath,
  normalizeAnalyticsDays,
  parseAnalyticsUserAgent,
  summarizeAnalytics,
} from "@/lib/analytics-core";
import { prisma } from "@/lib/prisma";
import { VISITOR_COUNT_BASELINE, VISITOR_COUNT_KEY } from "@/lib/visitor-count";
import type { AnalyticsPayload } from "@/schemas/analytics";

let lastCleanupDay = "";

function cleanOptionalText(value: string | undefined, limit: number) {
  const cleaned = value?.trim().slice(0, limit);
  return cleaned || null;
}

function normalizeMetric(payload: AnalyticsPayload) {
  if (payload.type !== "performance") {
    return { metricName: null, metricValue: null, metricRating: null };
  }

  return {
    metricName: String(payload.data?.metric ?? "").toUpperCase(),
    metricValue: Number(payload.data?.value),
    metricRating: cleanOptionalText(String(payload.data?.rating ?? ""), 24),
  };
}

async function cleanupAnalyticsIfDue(now: Date) {
  const currentDay = now.toISOString().slice(0, 10);
  if (lastCleanupDay === currentDay) return;

  await prisma.analyticsEvent.deleteMany({
    where: {
      createdAt: {
        lt: new Date(now.getTime() - ANALYTICS_RETENTION_DAYS * 24 * 60 * 60 * 1000),
      },
    },
  });
  lastCleanupDay = currentDay;
}

export async function recordAnalyticsEvent({
  payload,
  visitorId,
  userAgent,
  ownHost,
  now = new Date(),
}: {
  payload: AnalyticsPayload;
  visitorId: string;
  userAgent: string | null;
  ownHost: string;
  now?: Date;
}) {
  const path = cleanAnalyticsPath(payload.path);
  if (!isPublicAnalyticsPath(path)) return false;

  const agent = parseAnalyticsUserAgent(userAgent);
  const metric = normalizeMetric(payload);
  const data = payload.data ?? {};

  await prisma.analyticsEvent.create({
    data: {
      eventType: payload.type,
      eventName: cleanOptionalText(payload.name, 80),
      path,
      title: cleanOptionalText(payload.title, 200),
      referrerHost: analyticsReferrerHost(payload.referrer, ownHost),
      sessionId: payload.sessionId,
      visitorId,
      browser: agent.browser,
      operatingSystem: agent.operatingSystem,
      device: agent.device,
      language: cleanOptionalText(payload.language, 32),
      timezone: cleanOptionalText(payload.timezone, 64),
      ...metric,
      dataJson: JSON.stringify(data),
      createdAt: now,
    },
  });

  await cleanupAnalyticsIfDue(now);
  return true;
}

export async function getAnalyticsSummary(days: number, now = new Date()) {
  const rangeDays = normalizeAnalyticsDays(days);
  const start = analyticsRangeStart(rangeDays, now);
  const [events, metric, earliest] = await prisma.$transaction([
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: start, lte: now } },
      orderBy: { createdAt: "asc" },
      select: {
        createdAt: true,
        eventType: true,
        eventName: true,
        path: true,
        referrerHost: true,
        sessionId: true,
        visitorId: true,
        browser: true,
        operatingSystem: true,
        device: true,
        language: true,
        timezone: true,
        metricName: true,
        metricValue: true,
        metricRating: true,
      },
    }),
    prisma.siteMetric.findUnique({
      where: { key: VISITOR_COUNT_KEY },
      select: { value: true },
    }),
    prisma.analyticsEvent.aggregate({ _min: { createdAt: true } }),
  ]);

  return summarizeAnalytics(
    events,
    metric?.value ?? VISITOR_COUNT_BASELINE,
    rangeDays,
    now,
    earliest._min.createdAt,
  );
}
