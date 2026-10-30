import { z } from "zod";

export const WEB_VITAL_METRICS = ["CLS", "FCP", "LCP", "TTFB", "INP"] as const;
export const CUSTOM_ANALYTICS_METRICS = [
  "route-transition",
  "home:model-ready",
  "home:enhancement-ready",
  "resources:data-ready",
  "resources:masonry-ready",
  "friends:first-frame",
  "longtask",
  "long-animation-frame",
] as const;

const webVitalMetrics = new Set<string>(WEB_VITAL_METRICS);
const customAnalyticsMetrics = new Set<string>(CUSTOM_ANALYTICS_METRICS);

// Web Vitals stay case-insensitive like the original collector; custom metric names are exact.
function isSupportedPerformanceMetric(metric: string) {
  return customAnalyticsMetrics.has(metric) || webVitalMetrics.has(metric.toUpperCase());
}

const analyticsDataValueSchema = z.union([
  z.boolean(),
  z.number().finite(),
  z.string().max(160),
]);

export const analyticsPayloadSchema = z
  .strictObject({
    eventId: z.string().trim().min(8).max(80).optional(),
    type: z.enum(["event", "pageview", "performance"]),
    name: z.string().trim().min(1).max(80).optional(),
    path: z.string().trim().min(1).max(512),
    title: z.string().trim().max(200).optional(),
    referrer: z.string().trim().max(1024).optional(),
    sessionId: z.string().trim().min(8).max(80),
    language: z.string().trim().max(32).optional(),
    timezone: z.string().trim().max(64).optional(),
    viewport: z
      .string()
      .trim()
      .regex(/^\d{1,5}x\d{1,5}$/)
      .optional(),
    effectsMode: z.enum(["lite", "enhanced"]).optional(),
    revision: z.string().trim().min(1).max(64).optional(),
    navigationType: z.string().trim().min(1).max(32).optional(),
    data: z.record(z.string().max(48), analyticsDataValueSchema).optional(),
  })
  .superRefine((payload, context) => {
    if (payload.type !== "pageview" && !payload.name) {
      context.addIssue({
        code: "custom",
        message: "事件名称不能为空。",
        path: ["name"],
      });
    }

    if (payload.type !== "performance") return;

    const metric = payload.data?.metric;
    const value = payload.data?.value;
    if (typeof metric !== "string" || !isSupportedPerformanceMetric(metric)) {
      context.addIssue({
        code: "custom",
        message: "性能指标不受支持。",
        path: ["data", "metric"],
      });
    }
    if (typeof value !== "number" || value < 0 || value > 86_400_000) {
      context.addIssue({
        code: "custom",
        message: "性能指标数值不正确。",
        path: ["data", "value"],
      });
    }
  });

export const analyticsBatchSchema = z.strictObject({
  batchId: z.string().trim().min(8).max(80),
  events: z.array(analyticsPayloadSchema).min(1).max(32),
});

export type AnalyticsPayload = z.infer<typeof analyticsPayloadSchema>;
export type AnalyticsBatch = z.infer<typeof analyticsBatchSchema>;
