"use client";

import { useState } from "react";

export function FriendMark({ name, icon }: { name: string; icon?: string }) {
  const [failed, setFailed] = useState(false);
  if (!icon || failed) {
    return (
      <span
        aria-hidden="true"
        className="bg-foreground font-display text-background flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold tracking-wide"
      >
        {name.slice(0, 1)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={icon}
      alt=""
      width={40}
      height={40}
      className="border-border size-10 shrink-0 rounded-xl border object-cover"
      onError={() => setFailed(true)}
    />
  );
}
