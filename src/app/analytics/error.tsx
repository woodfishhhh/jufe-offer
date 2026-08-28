"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function AnalyticsError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[calc(100svh-8rem)] items-center justify-center bg-[#080808] px-4 py-20 text-white">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#111] p-7 text-center sm:p-10">
        <p className="font-mono text-[11px] tracking-[0.22em] text-red-300 uppercase">
          Analytics unavailable
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
          分析数据暂时无法读取
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/45">
          权限仍然受保护。你可以重试连接，或先返回首页。
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#e8bd68] px-5 text-sm font-medium text-[#17120a]"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            重试
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm text-white/60 hover:text-white"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
