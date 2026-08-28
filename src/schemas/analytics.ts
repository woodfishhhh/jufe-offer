import { z } from "zod";

const analyticsDataValueSchema = z.union([
  z.boolean(),
  z.number().finite(),
  z.string().max(160),
]);

export const analyticsPayloadSchema = z
  .strictObject({
    type: z.enum(["event", "pageview", "performance"]),
    name: z.string().trim().min(1).max(80).optional(),
    path: z.string().trim().min(1).max(512),
    title: z.string().trim().max(200).optional(),
    referrer: z.string().trim().max(1024).optional(),
    sessionId: z.string().trim().min(8).max(80),
    language: z.string().trim().max(32).optional(),
    timezone: z.string().trim().max(64).optional(),
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
    if (
      typeof metric !== "string" ||
      !["CLS", "FCP", "LCP", "TTFB"].includes(metric.toUpperCase())
    ) {
      context.addIssue({
        code: "custom",
        message: "性能指标不受支持。",
        path: ["data", "metric"],
      });
    }
    if (typeof value !== "number" || value < 0 || value > 600_000) {
      context.addIssue({
        code: "custom",
        message: "性能指标数值不正确。",
        path: ["data", "value"],
      });
    }
  });

export type AnalyticsPayload = z.infer<typeof analyticsPayloadSchema>;
