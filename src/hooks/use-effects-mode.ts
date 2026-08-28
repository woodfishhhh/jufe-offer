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

function getServerSnapshot(): EffectsMode {
  return "lite";
}

export function useEffectsMode() {
  return useSyncExternalStore(subscribe, getEffectsMode, getServerSnapshot);
}
