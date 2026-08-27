"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, GitPullRequest } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ISSUE_BASE_URL = "https://github.com/woodfishhhh/jufe-offer/issues/new";

type FriendLinkDraft = {
  name: string;
  url: string;
  friendPageUrl: string;
  avatar: string;
  description: string;
  contact: string;
  siteConfirmed: boolean;
  editingConfirmed: boolean;
};

type FieldErrors = Partial<Record<keyof FriendLinkDraft | "checks", string>>;

const EMPTY_DRAFT: FriendLinkDraft = {
  name: "",
  url: "",
  friendPageUrl: "",
  avatar: "",
  description: "",
  contact: "",
  siteConfirmed: false,
  editingConfirmed: false,
};

function normalizeLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isPublicHttpUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      host !== "localhost" &&
      host !== "127.0.0.1" &&
      host !== "0.0.0.0" &&
      host !== "::1"
    );
  } catch {
    return false;
  }
}

function validateDraft(draft: FriendLinkDraft) {
  const errors: FieldErrors = {};
  if (!draft.name.trim()) errors.name = "请填写站点名称。";
  if (!isPublicHttpUrl(draft.url)) errors.url = "请填写可公开访问的 HTTP(S) 地址。";
  if (!isPublicHttpUrl(draft.friendPageUrl)) {
    errors.friendPageUrl = "请填写可公开访问的友链页地址。";
  }
  if (!isPublicHttpUrl(draft.avatar)) {
    errors.avatar = "请填写可公开访问的头像或站点图标地址。";
  }
  if (!draft.description.trim()) errors.description = "请填写站点简介。";
  if (!draft.siteConfirmed || !draft.editingConfirmed) {
    errors.checks = "请确认下方两项声明。";
  }
  return errors;
}

function buildIssueUrl(draft: FriendLinkDraft) {
  const name = normalizeLine(draft.name);
  const params = new URLSearchParams({
    title: `[友链申请] ${name}`,
    body: [
      "## 友链申请",
      "",
      "### 站点名称",
      name,
      "",
      "### 站点地址",
      normalizeLine(draft.url),
      "",
      "### 友链页地址",
      normalizeLine(draft.friendPageUrl),
      "",
      "### 头像或站点图标",
      normalizeLine(draft.avatar),
      "",
      "### 站点简介",
      draft.description.trim(),
      "",
      "### 联系方式",
      normalizeLine(draft.contact) || "未提供",
      "",
      "### 提交确认",
      "- [x] 我确认站点可以正常访问，且内容适合公开展示。",
      "- [x] 我同意江财OFFER根据页面展示需要调整简介文字。",
    ].join("\n"),
  });
  return `${ISSUE_BASE_URL}?${params.toString()}`;
}

type FriendLinkApplicationProps = {
  className: string;
  iconClassName: string;
};

export function FriendLinkApplication({
  className,
  iconClassName,
}: FriendLinkApplicationProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [errors, setErrors] = useState<FieldErrors>({});

  function updateDraft<Key extends keyof FriendLinkDraft>(
    key: Key,
    value: FriendLinkDraft[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key] && !current.checks) return current;
      const next = { ...current };
      delete next[key];
      if (key === "siteConfirmed" || key === "editingConfirmed") delete next.checks;
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    window.open(buildIssueUrl(draft), "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className={className}
        data-stage-control
        aria-label="填写友链信息并前往 GitHub 提交申请"
        onClick={() => setOpen(true)}
      >
        <span className={iconClassName} aria-hidden="true">
          <GitPullRequest size={16} strokeWidth={2} />
        </span>
        <span>提交友链</span>
      </button>

      <Modal open={open} title="提交友链申请" onClose={() => setOpen(false)} wide>
        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          <div className="border-border bg-muted/45 rounded-2xl border px-4 py-3">
            <p className="font-medium">填写后将打开预填好的 GitHub Issue 草稿</p>
            <p className="text-muted-foreground mt-1 text-xs leading-5">
              申请信息只用于生成跳转链接，不会保存在本站；请登录 GitHub 后检查并提交。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="friend-site-name">站点名称</Label>
              <Input
                id="friend-site-name"
                value={draft.name}
                maxLength={60}
                placeholder="例如：江财OFFER"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "friend-site-name-error" : undefined}
                onChange={(event) => updateDraft("name", event.target.value)}
              />
              {errors.name ? (
                <p id="friend-site-name-error" className="text-destructive text-xs">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="friend-site-url">站点地址</Label>
              <Input
                id="friend-site-url"
                type="url"
                inputMode="url"
                value={draft.url}
                placeholder="https://example.com/"
                aria-invalid={Boolean(errors.url)}
                aria-describedby={errors.url ? "friend-site-url-error" : undefined}
                onChange={(event) => updateDraft("url", event.target.value)}
              />
              {errors.url ? (
                <p id="friend-site-url-error" className="text-destructive text-xs">
                  {errors.url}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="friend-page-url">友链页地址</Label>
              <Input
                id="friend-page-url"
                type="url"
                inputMode="url"
                value={draft.friendPageUrl}
                placeholder="https://example.com/links/"
                aria-invalid={Boolean(errors.friendPageUrl)}
                aria-describedby={
                  errors.friendPageUrl ? "friend-page-url-error" : undefined
                }
                onChange={(event) => updateDraft("friendPageUrl", event.target.value)}
              />
              {errors.friendPageUrl ? (
                <p id="friend-page-url-error" className="text-destructive text-xs">
                  {errors.friendPageUrl}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  机器人会在这个页面检查江财OFFER的反向友链。
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="friend-avatar-url">头像或站点图标</Label>
              <Input
                id="friend-avatar-url"
                type="url"
                inputMode="url"
                value={draft.avatar}
                placeholder="https://example.com/avatar.png"
                aria-invalid={Boolean(errors.avatar)}
                aria-describedby={errors.avatar ? "friend-avatar-url-error" : undefined}
                onChange={(event) => updateDraft("avatar", event.target.value)}
              />
              {errors.avatar ? (
                <p id="friend-avatar-url-error" className="text-destructive text-xs">
                  {errors.avatar}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="friend-description">站点简介</Label>
              <Textarea
                id="friend-description"
                value={draft.description}
                maxLength={160}
                placeholder="用一句话介绍你的站点"
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description ? "friend-description-error" : undefined
                }
                onChange={(event) => updateDraft("description", event.target.value)}
              />
              <div className="flex justify-between gap-3 text-xs">
                {errors.description ? (
                  <p id="friend-description-error" className="text-destructive">
                    {errors.description}
                  </p>
                ) : (
                  <span className="text-muted-foreground">建议控制在 30 个字以内</span>
                )}
                <span className="text-muted-foreground ml-auto tabular-nums">
                  {draft.description.length}/160
                </span>
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="friend-contact">联系方式（可选）</Label>
              <Input
                id="friend-contact"
                value={draft.contact}
                maxLength={100}
                placeholder="GitHub 用户名、邮箱或其他联系方式"
                onChange={(event) => updateDraft("contact", event.target.value)}
              />
            </div>
          </div>

          <fieldset className="border-border space-y-3 rounded-2xl border p-4">
            <legend className="px-1 text-sm font-medium">提交确认</legend>
            <label className="text-muted-foreground flex cursor-pointer items-start gap-3 text-sm leading-6">
              <input
                type="checkbox"
                checked={draft.siteConfirmed}
                className="mt-1 size-4 shrink-0 accent-[var(--brand-red)]"
                onChange={(event) => updateDraft("siteConfirmed", event.target.checked)}
              />
              <span>我确认站点可以正常访问，且内容适合公开展示。</span>
            </label>
            <label className="text-muted-foreground flex cursor-pointer items-start gap-3 text-sm leading-6">
              <input
                type="checkbox"
                checked={draft.editingConfirmed}
                className="mt-1 size-4 shrink-0 accent-[var(--brand-red)]"
                onChange={(event) =>
                  updateDraft("editingConfirmed", event.target.checked)
                }
              />
              <span>我同意江财OFFER根据页面展示需要调整简介文字。</span>
            </label>
            {errors.checks ? (
              <p className="text-destructive text-xs" role="alert">
                {errors.checks}
              </p>
            ) : null}
          </fieldset>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              再看看
            </Button>
            <Button type="submit" className="gap-2">
              前往 GitHub 提交
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
