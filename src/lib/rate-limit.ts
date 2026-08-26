type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function consumeRateLimit(key: string) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true as const, remaining: MAX_ATTEMPTS - 1 };
  }

  if (current.count >= MAX_ATTEMPTS) {
    return {
      ok: false as const,
      retryAfterMs: current.resetAt - now,
    };
  }

  current.count += 1;
  return { ok: true as const, remaining: MAX_ATTEMPTS - current.count };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
