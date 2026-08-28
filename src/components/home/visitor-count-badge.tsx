"use client";

import { useEffect, useState } from "react";

const VISITOR_COUNT_STORAGE_KEY = "jufe-offer:visitor-counted:v1";

type VisitorCountResponse = {
  total?: unknown;
};

type CountedMarker = {
  storageAvailable: boolean;
  counted: boolean;
};

let visitorCountRequest: Promise<number> | null = null;

function readCountedMarker(): CountedMarker {
  try {
    return {
      storageAvailable: true,
      counted: window.localStorage.getItem(VISITOR_COUNT_STORAGE_KEY) === "1",
    };
  } catch {
    return { storageAvailable: false, counted: false };
  }
}

function writeCountedMarker() {
  try {
    window.localStorage.setItem(VISITOR_COUNT_STORAGE_KEY, "1");
  } catch {
    // The server cookie still prevents duplicate counting when storage is unavailable.
  }
}

async function requestCount(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(`Visitor count request failed: ${response.status}`);
  }

  const payload = (await response.json()) as VisitorCountResponse;
  if (
    typeof payload.total !== "number" ||
    !Number.isFinite(payload.total) ||
    payload.total < 0
  ) {
    throw new Error("Visitor count response is invalid.");
  }

  return Math.trunc(payload.total);
}

async function hydrateVisitorCount() {
  const marker = readCountedMarker();
  const shouldCountVisit = marker.storageAvailable && !marker.counted;
  const total = shouldCountVisit
    ? await requestCount("/api/visitor-count/visit", { method: "POST" })
    : await requestCount("/api/visitor-count");

  if (shouldCountVisit) {
    writeCountedMarker();
  }

  return total;
}

function getVisitorCountRequest() {
  visitorCountRequest ??= hydrateVisitorCount();
  return visitorCountRequest;
}

export function VisitorCountBadge() {
  const [total, setTotal] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;

    void getVisitorCountRequest()
      .then((nextTotal) => {
        if (active) setTotal(nextTotal);
      })
      .catch(() => {
        if (active) setHasError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (hasError) return null;

  return (
    <span
      data-testid="visitor-count-badge"
      role="status"
      aria-live="polite"
      aria-label={total === null ? "正在读取网站浏览人数" : `网站浏览人数 ${total}`}
      className="border-border bg-background/72 text-muted-foreground mt-5 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[11px] tracking-[0.26em] uppercase backdrop-blur-md"
    >
      <span>Visitors</span>
      <span className="text-foreground font-mono tracking-normal">
        {total === null ? "..." : total.toLocaleString("zh-CN")}
      </span>
    </span>
  );
}
