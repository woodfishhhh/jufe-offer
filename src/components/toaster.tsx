"use client";

import { Toaster } from "@/components/ui/sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      closeButton
      toastOptions={{
        className: "font-sans",
      }}
    />
  );
}
