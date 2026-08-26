import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "jufe_offer_session";
const DUMMY_PASSWORD_HASH = "$2a$12$CwzGqzq0mGqzq0mGqzq0eOQh3m1m1m1m1m1m1m1m1m1m1m1m1m1m";

type SessionPayload = {
  sub: "admin";
  iat: number;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    return null;
  }
  return secret;
}

function getAdminPasswordHash() {
  const raw = (process.env.ADMIN_PASSWORD_HASH ?? "").trim();
  if (!raw) {
    return "";
  }

  if (raw.startsWith("$2")) {
    return raw;
  }

  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0) {
    const decoded = Buffer.from(raw, "hex").toString("utf8");
    if (decoded.startsWith("$2")) {
      return decoded;
    }
  }

  return raw.replaceAll("$$", "$");
}

function sign(payload: SessionPayload, secret: string) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function safeEqualString(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    timingSafeEqual(leftBuffer, leftBuffer);
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyToken(token: string, secret: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  if (!safeEqualString(signature, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (payload.sub !== "admin" || typeof payload.iat !== "number") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function createSessionToken() {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }
  return sign({ sub: "admin", iat: Date.now() }, secret);
}

export async function readAdminSession() {
  const secret = getSessionSecret();
  if (!secret) {
    return false;
  }

  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return false;
  }

  return Boolean(verifyToken(token, secret));
}

export function parseSessionFromCookieHeader(cookieHeader: string | null) {
  const secret = getSessionSecret();
  if (!secret || !cookieHeader) {
    return false;
  }

  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);

  if (!token) {
    return false;
  }

  return Boolean(verifyToken(token, secret));
}

export async function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedHash = getAdminPasswordHash();

  if (!expectedUsername || !expectedHash || !getSessionSecret()) {
    return { configured: false as const, ok: false as const };
  }

  const usernameMatched = safeEqualString(username, expectedUsername);
  const hashToCheck = usernameMatched ? expectedHash : DUMMY_PASSWORD_HASH;

  let passwordMatched = false;
  try {
    passwordMatched = await bcrypt.compare(password, hashToCheck);
  } catch {
    passwordMatched = false;
  }

  return {
    configured: true as const,
    ok: usernameMatched && passwordMatched,
  };
}

export { SESSION_COOKIE };
