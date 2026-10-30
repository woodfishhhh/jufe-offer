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
import { WEB_VITAL_METRICS, type AnalyticsPayload } from "@/schemas/analytics";

let lastCleanupDay = "";
const webVitalNames = new Set<string>(WEB_VITAL_METRICS);

function cleanOptionalText(value: string | undefined, limit: number) {
  const cleaned = value?.trim().slice(0, limit);
  return cleaned || null;
}

function normalizeMetric(payload: AnalyticsPayload) {
  if (payload.type !== "performance") {
    return { metricName: null, metricValue: null, metricRating: null };
  }

  const rawName = String(payload.data?.metric ?? "");
  const upperName = rawName.toUpperCase();
  return {
    metricName: webVitalNames.has(upperName) ? upperName : rawName,
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

export async function recordAnalyticsEvents({
  payloads,
  visitorId,
  userAgent,
  ownHost,
  now = new Date(),
}: {
  payloads: AnalyticsPayload[];
  visitorId: string;
  userAgent: string | null;
  ownHost: string;
  now?: Date;
}) {
  const acceptedPayloads = payloads
    .map((payload) => ({ payload, path: cleanAnalyticsPath(payload.path) }))
    .filter(({ path }) => isPublicAnalyticsPath(path));
  if (acceptedPayloads.length === 0) return 0;

  const agent = parseAnalyticsUserAgent(userAgent);
  const operations = acceptedPayloads.map(({ payload, path }) => {
    const metric = normalizeMetric(payload);
    const data = payload.data ?? {};
    const create = {
      eventId: payload.eventId ?? null,
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
      viewport: cleanOptionalText(payload.viewport, 32),
      effectsMode: cleanOptionalText(payload.effectsMode, 24),
      revision: cleanOptionalText(payload.revision, 64),
      navigationType: cleanOptionalText(payload.navigationType, 32),
      ...metric,
      dataJson: JSON.stringify(data),
      createdAt: now,
    };

    if (!payload.eventId) return prisma.analyticsEvent.create({ data: create });
    const update = { ...create, createdAt: undefined };
    return prisma.analyticsEvent.upsert({
      where: {
        visitorId_eventId: {
          visitorId,
          eventId: payload.eventId,
        },
      },
      create,
      update,
    });
  });

  await prisma.$transaction(operations);
  await cleanupAnalyticsIfDue(now);
  return acceptedPayloads.length;
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
        viewport: true,
        effectsMode: true,
        revision: true,
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
