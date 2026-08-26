import { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  getSessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/auth";
import { getClientIp, jsonError, jsonOk, zodErrorResponse } from "@/lib/http";
import { consumeRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/schemas/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = consumeRateLimit(`login:${ip}`);

  if (!limit.ok) {
    return jsonError("尝试次数过多，请稍后再试。", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求格式不正确。", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const result = await verifyAdminCredentials(
      parsed.data.username,
      parsed.data.password,
    );

    if (!result.configured) {
      return jsonError("服务暂不可用，请检查服务器配置。", 500);
    }

    if (!result.ok) {
      return jsonError("用户名或密码错误。", 401);
    }

    resetRateLimit(`login:${ip}`);
    const token = createSessionToken();
    const response = jsonOk({ authenticated: true });
    response.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());
    return response;
  } catch {
    return jsonError("登录失败，请稍后重试。", 500);
  }
}
