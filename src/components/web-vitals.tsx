"use client";

import { useReportWebVitals } from "next/web-vitals";
import { queuePerformanceMetric } from "@/lib/client-analytics";

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

const SUPPORTED_WEB_VITALS = new Set(["CLS", "FCP", "LCP", "TTFB", "INP"]);

const reportWebVitals: ReportWebVitalsCallback = (metric) => {
  if (!SUPPORTED_WEB_VITALS.has(metric.name)) return;
  queuePerformanceMetric({
    metric: metric.name,
    value: metric.value,
    rating: metric.rating,
    navigationType: metric.navigationType,
    data: {
      delta: Number(metric.delta.toFixed(metric.name === "CLS" ? 4 : 1)),
    },
    dedupeKey: `web-vital:${metric.id}:${metric.name}`,
  });
};

export function WebVitals() {
  useReportWebVitals(reportWebVitals);
  return null;
}
