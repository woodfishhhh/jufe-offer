import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { recordAnalyticsEvents } from "@/lib/analytics";
import { isAutomatedVisitor } from "@/lib/visitor-count";
import { consumeRateLimit } from "@/lib/rate-limit";
import { analyticsBatchSchema, analyticsPayloadSchema } from "@/schemas/analytics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ANALYTICS_COOKIE = "jufe_offer_analytics_visitor";
const ANALYTICS_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;
const MAX_BODY_BYTES = 64 * 1024;
const responseHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

function analyticsCookieOptions() {
  return {
    httpOnly: true,
    maxAge: ANALYTICS_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

function isValidVisitorId(value: string | undefined) {
  return Boolean(value && /^[0-9a-f-]{36}$/i.test(value));
}

function readRequestHost(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  return forwardedHost || request.headers.get("host") || request.nextUrl.host;
}

function readHostname(host: string) {
  try {
    return new URL(`http://${host}`).hostname;
  } catch {
    return host.split(":")[0] || "localhost";
  }
}

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get("user-agent");
  if (
    request.headers.get("dnt") === "1" ||
    request.headers.get("sec-gpc") === "1" ||
    isAutomatedVisitor(userAgent)
  ) {
    return NextResponse.json(
      { data: { accepted: false } },
      { headers: responseHeaders, status: 202 },
    );
  }

  const requestHost = readRequestHost(request);
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host.toLowerCase() !== requestHost.toLowerCase()) {
        return NextResponse.json(
          { error: "Cross-origin analytics requests are not accepted." },
          { headers: responseHeaders, status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Analytics request origin is invalid." },
        { headers: responseHeaders, status: 403 },
      );
    }
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Analytics payload is too large." },
      { headers: responseHeaders, status: 413 },
    );
  }

  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json(
      { error: "Analytics payload could not be read." },
      { headers: responseHeaders, status: 400 },
    );
  }
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Analytics payload is too large." },
      { headers: responseHeaders, status: 413 },
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Analytics payload is invalid." },
      { headers: responseHeaders, status: 400 },
    );
  }

  const parsedBatch = analyticsBatchSchema.safeParse(payload);
  const parsedLegacy = parsedBatch.success
    ? null
    : analyticsPayloadSchema.safeParse(payload);
  if (!parsedBatch.success && !parsedLegacy?.success) {
    return NextResponse.json(
      { error: "Analytics payload did not pass validation." },
      { headers: responseHeaders, status: 400 },
    );
  }
  const payloads = parsedBatch.success
    ? parsedBatch.data.events
    : parsedLegacy?.success
      ? [parsedLegacy.data]
      : [];

  const existingId = request.cookies.get(ANALYTICS_COOKIE)?.value;
  const visitorId = isValidVisitorId(existingId) ? existingId! : randomUUID();
  // Charge every event in a batch, so batching cannot multiply the write budget.
  const limit = consumeRateLimit(
    `analytics:${visitorId}`,
    { windowMs: 60 * 1000, maxAttempts: 120 },
    payloads.length,
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Analytics event rate limit exceeded." },
      { headers: responseHeaders, status: 429 },
    );
  }

  try {
    const accepted = await recordAnalyticsEvents({
      payloads,
      visitorId,
      userAgent,
      ownHost: readHostname(requestHost),
    });
    const response = NextResponse.json(
      { data: { accepted: accepted > 0, count: accepted } },
      { headers: responseHeaders, status: 202 },
    );
    if (!isValidVisitorId(existingId)) {
      response.cookies.set(ANALYTICS_COOKIE, visitorId, analyticsCookieOptions());
    }
    return response;
  } catch {
    return NextResponse.json(
      { error: "Analytics event could not be stored." },
      { headers: responseHeaders, status: 503 },
    );
  }
}
