type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitPolicy = {
  windowMs: number;
  maxAttempts: number;
};

const buckets = new Map<string, Bucket>();

const DEFAULT_POLICY: RateLimitPolicy = {
  windowMs: 15 * 60 * 1000,
  maxAttempts: 8,
};

function cleanExpiredBuckets(now: number) {
  if (buckets.size < 1024) return;

  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
  }
}

export function consumeRateLimit(
  key: string,
  policy: RateLimitPolicy = DEFAULT_POLICY,
  cost = 1,
) {
  const now = Date.now();
  cleanExpiredBuckets(now);
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    if (cost > policy.maxAttempts) {
      return { ok: false as const, retryAfterMs: policy.windowMs };
    }
    buckets.set(key, { count: cost, resetAt: now + policy.windowMs });
    return { ok: true as const, remaining: policy.maxAttempts - cost };
  }

  if (current.count + cost > policy.maxAttempts) {
    return {
      ok: false as const,
      retryAfterMs: current.resetAt - now,
    };
  }

  current.count += cost;
  return { ok: true as const, remaining: policy.maxAttempts - current.count };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
