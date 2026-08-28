import { timingSafeEqual } from "node:crypto";

import type { NextRequest } from "next/server";

import { readAdminSession } from "@/lib/auth";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    timingSafeEqual(leftBuffer, leftBuffer);
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function hasResourceAdminBearer(request: NextRequest) {
  const configuredToken = process.env.RESOURCE_ADMIN_API_TOKEN?.trim();
  if (!configuredToken || configuredToken.length < 32) return false;

  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const providedToken = match?.[1]?.trim();
  return Boolean(providedToken && safeEqual(providedToken, configuredToken));
}

export async function hasResourceAdminAccess(request: NextRequest) {
  return hasResourceAdminBearer(request) || (await readAdminSession());
}
