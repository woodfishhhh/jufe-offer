import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { AnalyticsLoginGate } from "@/components/analytics-login-gate";
import { getAnalyticsSummary } from "@/lib/analytics";
import { readAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visitor Analytics",
  description: "JUFE Offer 管理员站点分析控制台。",
  robots: { index: false, follow: false },
};

export default async function AnalyticsPage() {
  if (!(await readAdminSession())) {
    return <AnalyticsLoginGate />;
  }

  const summary = await getAnalyticsSummary(30);
  return <AnalyticsDashboard initialSummary={summary} />;
}
