"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import type { ReactNode } from "react";
import type { FriendLink } from "@/data/friends";
import { useEffectsMode } from "@/hooks/use-effects-mode";

const FriendNetwork = dynamic(
  () => import("@/components/friend-network").then((module) => module.FriendNetwork),
  { ssr: false },
);

export function FriendsSurface({
  friends,
  children,
  forceDirectory,
}: {
  friends: readonly FriendLink[];
  children: ReactNode;
  forceDirectory: boolean;
}) {
  const effectsMode = useEffectsMode();

  if (effectsMode !== "enhanced" || forceDirectory) {
    return children;
  }

  return (
    <div className="friends-enhanced">
      <FriendNetwork friends={friends} />
      <Link href="/friends?view=directory" className="friends-enhanced__directory">
        <LayoutGrid aria-hidden="true" />
        目录视图
      </Link>
    </div>
  );
}
