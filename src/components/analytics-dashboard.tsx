"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Clock3,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type {
  AnalyticsRankRow,
  AnalyticsSummary,
  AnalyticsTimeRow,
  AnalyticsVitalRow,
} from "@/lib/analytics-core";
import { ANALYTICS_RANGE_OPTIONS } from "@/lib/analytics-core";
import { cn, readApiError } from "@/lib/utils";

type SummaryResponse = { data?: AnalyticsSummary };

function formatNumber(value: number) {
  return value.toLocaleString("zh-CN");
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds} 秒`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return remaining ? `${minutes} 分 ${remaining} 秒` : `${minutes} 分`;
}

function formatTimestamp(value: string | null) {
  if (!value) return "等待第一条分析记录";
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

function KpiCard({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <article
      className={cn(
        "min-w-0 rounded-[1.6rem] border p-5",
        accent
          ? "border-[#e8bd68]/35 bg-[#e8bd68]/[0.08]"
          : "border-white/[0.08] bg-white/[0.035]",
      )}
    >
      <p className="text-xs tracking-[0.18em] text-white/40 uppercase">{label}</p>
      <p
        className={cn(
          "mt-4 font-[family-name:var(--font-syne)] text-3xl font-semibold tracking-[-0.05em] sm:text-4xl",
          accent ? "text-[#f1cd85]" : "text-white",
        )}
      >
        {value}
      </p>
      <p className="mt-3 truncate text-xs text-white/35" title={detail}>
        {detail}
      </p>
    </article>
  );
}

function Chart({ rows }: { rows: AnalyticsTimeRow[] }) {
  const geometry = useMemo(() => {
    const width = 720;
    const height = 260;
    const left = 34;
    const right = 16;
    const top = 18;
    const bottom = 38;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const max = Math.max(1, ...rows.flatMap((row) => [row.pageviews, row.visitors]));
    const point = (value: number, index: number) => ({
      x: left + (index / Math.max(1, rows.length - 1)) * plotWidth,
      y: top + plotHeight - (value / max) * plotHeight,
    });
    const points = (read: (row: AnalyticsTimeRow) => number) =>
      rows.map((row, index) => point(read(row), index));
    const pageviews = points((row) => row.pageviews);
    const visitors = points((row) => row.visitors);
    const line = (values: typeof pageviews) =>
      values.map(({ x, y }, index) => `${index ? "L" : "M"}${x},${y}`).join(" ");
    const area = pageviews.length
      ? `${line(pageviews)} L${pageviews.at(-1)?.x},${top + plotHeight} L${pageviews[0]?.x},${top + plotHeight} Z`
      : "";

    return { area, height, left, line, max, pageviews, plotHeight, top, visitors, width };
  }, [rows]);

  const labels = rows.length
    ? [rows[0], rows[Math.floor((rows.length - 1) / 2)], rows.at(-1)].filter(
        (row): row is AnalyticsTimeRow => Boolean(row),
      )
    : [];

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/45">
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#e8bd68]" />
          浏览量
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#ef4f5f]" />
          访客
        </span>
        <span className="ml-auto font-mono">峰值 {formatNumber(geometry.max)}</span>
      </div>
      <svg
        role="img"
        aria-label="浏览量与访客趋势图"
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        className="h-auto w-full overflow-visible"
      >
        <defs>
          <linearGradient id="analytics-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#e8bd68" stopOpacity="0.24" />
            <stop offset="1" stopColor="#e8bd68" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((position) => {
          const y = geometry.top + geometry.plotHeight * position;
          return (
            <line
              key={position}
              x1={geometry.left}
              x2={geometry.width - 16}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 8"
            />
          );
        })}
        <path d={geometry.area} fill="url(#analytics-area)" />
        <path
          d={geometry.line(geometry.pageviews)}
          fill="none"
          stroke="#e8bd68"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        <path
          d={geometry.line(geometry.visitors)}
          fill="none"
          stroke="#ef4f5f"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
        {labels.map((row, index) => {
          const x =
            geometry.left +
            (rows.indexOf(row) / Math.max(1, rows.length - 1)) *
              (geometry.width - geometry.left - 16);
          return (
            <text
              key={`${row.label}-${index}`}
              x={x}
              y={geometry.height - 8}
              textAnchor={
                index === 0 ? "start" : index === labels.length - 1 ? "end" : "middle"
              }
              fill="rgba(255,255,255,0.35)"
              fontSize="11"
            >
              {row.label.slice(5).replace("-", "/")}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function RankPanel({
  title,
  rows,
  empty = "暂无记录",
}: {
  title: string;
  rows: AnalyticsRankRow[];
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
      <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-[-0.02em]">
        {title}
      </h2>
      {rows.length ? (
        <ol className="mt-5 space-y-4">
          {rows.map((row) => (
            <li key={row.label} className="min-w-0">
              <div className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate text-white/65" title={row.label}>
                  {row.label}
                </span>
                <span className="font-mono text-xs text-white/40">
                  {formatNumber(row.value)}
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[#e8bd68]/75"
                  style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-8 min-h-24 text-sm text-white/30">{empty}</p>
      )}
    </section>
  );
}

function VitalPanel({ rows }: { rows: AnalyticsVitalRow[] }) {
  const metricOrder = ["LCP", "CLS", "FCP", "TTFB"];
  const sorted = [...rows].sort(
    (left, right) => metricOrder.indexOf(left.name) - metricOrder.indexOf(right.name),
  );

  return (
    <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 lg:col-span-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-[-0.02em]">
            Web Vitals
          </h2>
          <p className="mt-1 text-xs text-white/35">真实访客端性能样本</p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-white/40">
          <span>
            <i className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-400" />
            良好
          </span>
          <span>
            <i className="mr-1.5 inline-block size-1.5 rounded-full bg-amber-400" />
            待改善
          </span>
          <span>
            <i className="mr-1.5 inline-block size-1.5 rounded-full bg-red-400" />
            较差
          </span>
        </div>
      </div>
      {sorted.length ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {sorted.map((row) => {
            const total = Math.max(1, row.samples);
            return (
              <article
                key={row.name}
                className="rounded-2xl border border-white/[0.07] bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-white/40">{row.name}</p>
                    <p className="mt-2 text-xl font-semibold">
                      {row.name === "CLS"
                        ? row.average.toFixed(3)
                        : `${Math.round(row.average)} ms`}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/[0.06] px-2 py-1 font-mono text-[10px] text-white/35">
                    {row.samples} 样本
                  </span>
                </div>
                <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <span
                    className="bg-emerald-400"
                    style={{ width: `${(row.good / total) * 100}%` }}
                  />
                  <span
                    className="bg-amber-400"
                    style={{ width: `${(row.needsImprovement / total) * 100}%` }}
                  />
                  <span
                    className="bg-red-400"
                    style={{ width: `${(row.poor / total) * 100}%` }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-8 min-h-20 text-sm text-white/30">等待真实访客产生性能样本。</p>
      )}
    </section>
  );
}

export function AnalyticsDashboard({
  initialSummary,
}: {
  initialSummary: AnalyticsSummary;
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(days: number) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/analytics/summary?days=${days}`, {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (response.status === 401) {
        window.location.replace("/analytics");
        return;
      }
      if (!response.ok) throw new Error((await readApiError(response)).message);
      const payload = (await response.json()) as SummaryResponse;
      if (!payload.data) throw new Error("分析数据格式不正确。");
      setSummary(payload.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "分析数据暂时无法读取。");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.replace("/analytics");
  }

  return (
    <div className="min-h-[calc(100svh-8rem)] overflow-x-clip bg-[#080808] text-white">
      <div className="mx-auto max-w-[92rem] px-4 pt-[calc(var(--nav-clearance)+1.5rem)] pb-10 sm:px-6 sm:pb-14 lg:px-8">
        <header className="flex flex-col gap-7 border-b border-white/[0.08] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#e8bd68]">
              <ShieldCheck aria-hidden="true" className="size-4" />
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase">
                Admin only
              </span>
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-syne)] text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              Visitor Analytics
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">
              第一方匿名分析：查看访问趋势、来源、设备与真实用户性能，不保存 IP
              或完整来源链接。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-white/55 transition-colors hover:border-white/20 hover:text-white"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              返回站点
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-white/55 transition-colors hover:border-red-400/30 hover:text-red-300"
            >
              <LogOut aria-hidden="true" className="size-4" />
              退出
            </button>
          </div>
        </header>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-fit rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
            {ANALYTICS_RANGE_OPTIONS.map((days) => (
              <button
                key={days}
                type="button"
                aria-pressed={summary.rangeDays === days}
                disabled={loading}
                onClick={() => void load(days)}
                className={cn(
                  "min-h-11 rounded-full px-4 text-sm transition-colors disabled:opacity-50",
                  summary.rangeDays === days
                    ? "bg-white text-black"
                    : "text-white/45 hover:text-white",
                )}
              >
                {days} 天
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/35">
            <span className="inline-flex items-center gap-2">
              <Clock3 aria-hidden="true" className="size-3.5" />
              更新于 {formatTimestamp(summary.generatedAt)}
            </span>
            <button
              type="button"
              aria-label="刷新分析数据"
              disabled={loading}
              onClick={() => void load(summary.rangeDays)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                aria-hidden="true"
                className={cn("size-4", loading && "animate-spin")}
              />
            </button>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-2xl border border-red-400/15 bg-red-400/[0.08] px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        ) : null}

        <section
          aria-label="核心指标"
          className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          <KpiCard
            label="累计访客"
            value={formatNumber(summary.totalVisitors)}
            detail="从 675 基准继续累计"
            accent
          />
          <KpiCard
            label="浏览量"
            value={formatNumber(summary.totals.pageviews)}
            detail={`最近 ${summary.rangeDays} 天`}
          />
          <KpiCard
            label="独立访客"
            value={formatNumber(summary.totals.visitors)}
            detail={`最近 ${summary.rangeDays} 天`}
          />
          <KpiCard
            label="会话"
            value={formatNumber(summary.totals.sessions)}
            detail={`平均 ${formatDuration(summary.totals.avgSessionSeconds)}`}
          />
          <KpiCard
            label="跳出率"
            value={`${summary.totals.bounceRate.toFixed(1)}%`}
            detail="仅浏览一个页面的会话"
          />
          <KpiCard
            label="30 分钟活跃"
            value={formatNumber(summary.totals.activeVisitors30m)}
            detail={`${formatNumber(summary.totals.events)} 个自定义事件`}
          />
        </section>

        <section className="mt-4 rounded-[1.9rem] border border-white/[0.08] bg-white/[0.03] p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase">
                Traffic trend
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-syne)] text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                浏览趋势
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/[0.08] px-3 py-2 text-xs text-emerald-300">
              <Activity aria-hidden="true" className="size-3.5" />
              实时采集中
            </span>
          </div>
          <Chart rows={summary.timeSeries} />
        </section>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <RankPanel title="热门页面" rows={summary.topPages} />
          <RankPanel title="访问来源" rows={summary.referrers} />
          <RankPanel title="设备类型" rows={summary.devices} />
          <RankPanel title="浏览器" rows={summary.browsers} />
          <RankPanel title="操作系统" rows={summary.operatingSystems} />
          <RankPanel title="语言" rows={summary.languages} />
          <RankPanel title="时区" rows={summary.timezones} />
          <RankPanel
            title="交互事件"
            rows={summary.customEvents}
            empty="等待带标记的站内交互。"
          />
          <VitalPanel rows={summary.webVitals} />
        </div>

        <footer className="mt-8 flex flex-col gap-2 border-t border-white/[0.08] pt-6 text-xs leading-6 text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p>
            详细趋势自 {formatTimestamp(summary.trackingSince)} 起累计；675
            基准不会反向伪造历史趋势。
          </p>
          <p>原始匿名事件保留 180 天 · 北京时间统计</p>
        </footer>
      </div>
    </div>
  );
}
