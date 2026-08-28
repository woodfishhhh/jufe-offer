"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { FriendLink } from "@/data/friends";

const FriendNetwork = dynamic(
  () => import("@/components/friend-network").then((module) => module.FriendNetwork),
  {
    ssr: false,
    loading: () => (
      <div className="friend-orbit__loading" role="status">
        <span>正在点亮星图</span>
      </div>
    ),
  },
);

export function FriendOrbit({ friends }: { friends: readonly FriendLink[] }) {
  return (
    <div className="friend-orbit">
      <FriendNetwork friends={friends} />
      <Link href="/friends" className="friend-orbit__back">
        <ArrowLeft aria-hidden="true" />
        返回友链目录
      </Link>
    </div>
  );
}
