"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  analyticsAllowed,
  flushAnalytics,
  initializeAnalyticsTransport,
  queueAnalytics,
  type ClientAnalyticsData,
} from "@/lib/client-analytics";
import { isPublicAnalyticsPath } from "@/lib/analytics-core";
import { completeRouteTransition } from "@/lib/client-rum";

let lastTrackedPath = "";
let initialPageviewSent = false;

function readDeclarativeEvent(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const element = target.closest<HTMLElement>("[data-analytics-event]");
  const name = element?.dataset.analyticsEvent;
  if (!element || !name) return null;

  const data: ClientAnalyticsData = {};
  for (const [key, value] of Object.entries(element.dataset)) {
    if (!key.startsWith("analyticsEvent") || key === "analyticsEvent" || !value) {
      continue;
    }
    const field = key.slice("analyticsEvent".length);
    if (!field) continue;
    data[`${field[0]?.toLowerCase()}${field.slice(1)}`] = value.slice(0, 160);
  }

  return { data, name: name.slice(0, 80) };
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    initializeAnalyticsTransport();
  }, []);

  useEffect(() => {
    if (!analyticsAllowed() || !isPublicAnalyticsPath(pathname)) return;
    if (lastTrackedPath === pathname) return;

    if (lastTrackedPath) flushAnalytics();
    const initial = !initialPageviewSent;
    lastTrackedPath = pathname;
    initialPageviewSent = true;
    queueMicrotask(() => {
      queueAnalytics({
        type: "pageview",
        path: pathname,
        title: document.title,
        referrer: initial ? document.referrer : undefined,
      });
      if (!initial) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => completeRouteTransition(pathname));
        });
      }
    });
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const analyticsEvent = readDeclarativeEvent(event.target);
      if (!analyticsEvent || !isPublicAnalyticsPath(window.location.pathname)) return;
      queueAnalytics({
        type: "event",
        name: analyticsEvent.name,
        data: analyticsEvent.data,
        path: window.location.pathname,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
