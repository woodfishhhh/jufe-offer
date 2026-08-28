import { type NextRequest } from "next/server";
import { getAnalyticsSummary } from "@/lib/analytics";
import { readAdminSession } from "@/lib/auth";
import { normalizeAnalyticsDays } from "@/lib/analytics-core";
import { jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function preventCaching(response: Response) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function GET(request: NextRequest) {
  if (!(await readAdminSession())) {
    return preventCaching(jsonError("请先登录管理员账号。", 401));
  }

  try {
    const days = normalizeAnalyticsDays(request.nextUrl.searchParams.get("days"));
    return preventCaching(jsonOk(await getAnalyticsSummary(days)));
  } catch {
    return preventCaching(jsonError("分析数据暂时无法读取，请稍后重试。", 503));
  }
}
