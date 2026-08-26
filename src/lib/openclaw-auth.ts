import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

type OpenClawAuthResult =
  { ok: true } | { ok: false; status: 401 | 503; message: string };

function safeEqual(left: string, right: string) {
  const leftDigest = createHash("sha256").update(left, "utf8").digest();
  const rightDigest = createHash("sha256").update(right, "utf8").digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

export function authenticateOpenClaw(
  authorizationHeader: string | null,
): OpenClawAuthResult {
  const configuredToken = process.env.OPENCLAW_INGEST_TOKEN;
  if (!configuredToken || configuredToken.length < 32) {
    return {
      ok: false,
      status: 503,
      message: "OpenClaw 入库接口暂不可用。",
    };
  }

  const match = authorizationHeader?.match(/^Bearer ([^\s]+)$/);
  if (!match || !safeEqual(match[1], configuredToken)) {
    return {
      ok: false,
      status: 401,
      message: "OpenClaw 入库凭证无效。",
    };
  }

  return { ok: true };
}
