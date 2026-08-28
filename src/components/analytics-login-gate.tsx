"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readApiError } from "@/lib/utils";

export function AnalyticsLoginGate() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        setError((await readApiError(response)).message);
        return;
      }
      window.location.replace("/analytics");
    } catch {
      setError("登录失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100svh-8rem)] bg-[#080808] px-4 pt-[calc(var(--nav-clearance)+1.25rem)] pb-20 text-white sm:px-6">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <LockKeyhole aria-hidden="true" className="size-6 text-[#e8bd68]" />
        </div>
        <p className="font-mono text-[11px] tracking-[0.26em] text-[#e8bd68] uppercase">
          Private analytics
        </p>
        <h1 className="mt-3 text-center font-[family-name:var(--font-syne)] text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          站点分析仅限管理员
        </h1>
        <p className="mt-4 max-w-sm text-center text-sm leading-7 text-white/50">
          访客统计、来源和性能数据不会公开展示。登录后才能进入分析控制台。
        </p>

        <form
          onSubmit={login}
          className="mt-9 w-full rounded-[2rem] border border-white/10 bg-[#111] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.5)] sm:p-7"
        >
          <div className="space-y-2">
            <Label htmlFor="analytics-username" className="text-white/75">
              管理员用户名
            </Label>
            <Input
              id="analytics-username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:border-[#e8bd68]/60 focus-visible:ring-[#e8bd68]/15"
              placeholder="Username"
              required
            />
          </div>
          <div className="mt-5 space-y-2">
            <Label htmlFor="analytics-password" className="text-white/75">
              密码
            </Label>
            <Input
              id="analytics-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:border-[#e8bd68]/60 focus-visible:ring-[#e8bd68]/15"
              placeholder="Password"
              required
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-5 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="mt-6 w-full bg-[#e8bd68] text-[#17120a] hover:bg-[#f3d38e]"
          >
            <ShieldCheck aria-hidden="true" />
            {submitting ? "验证中…" : "验证并进入"}
          </Button>
        </form>

        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center gap-2 px-3 text-sm text-white/45 transition-colors hover:text-white"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          返回首页
        </Link>
      </div>
    </div>
  );
}
