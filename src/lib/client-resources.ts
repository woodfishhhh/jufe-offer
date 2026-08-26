import type { ResourceDto } from "@/lib/resources";
import { readApiError } from "@/lib/utils";

const RESOURCE_CACHE_TTL = 60_000;
const resourceListCache = new Map<string, { data: ResourceDto[]; cachedAt: number }>();
const resourceListRequests = new Map<string, Promise<ResourceDto[]>>();

export function getCachedResourceList(queryString: string) {
  const entry = resourceListCache.get(queryString);
  if (!entry || Date.now() - entry.cachedAt > RESOURCE_CACHE_TTL) return null;
  return entry.data;
}

export async function requestResourceList(queryString: string) {
  const cached = getCachedResourceList(queryString);
  if (cached) return cached;
  const pending = resourceListRequests.get(queryString);
  if (pending) return pending;

  const request = (async () => {
    const response = await fetch(
      `/api/resources${queryString ? `?${queryString}` : ""}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      const apiError = await readApiError(response);
      throw new Error(apiError.message);
    }
    const payload = (await response.json()) as { data: ResourceDto[] };
    resourceListCache.set(queryString, { data: payload.data, cachedAt: Date.now() });
    return payload.data;
  })().finally(() => resourceListRequests.delete(queryString));

  resourceListRequests.set(queryString, request);
  return request;
}

export function invalidateResourceListCache() {
  resourceListCache.clear();
}
