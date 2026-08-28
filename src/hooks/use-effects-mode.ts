"use client";

import { useSyncExternalStore } from "react";
import {
  getEffectsMode,
  subscribeToPerformanceHints,
  type EffectsMode,
} from "@/lib/client-performance";

function subscribe(callback: () => void) {
  return subscribeToPerformanceHints(callback);
}

function getServerSnapshot(): EffectsMode | "pending" {
  return "pending";
}

export function useEffectsMode() {
  return useSyncExternalStore(subscribe, getEffectsMode, getServerSnapshot);
}
