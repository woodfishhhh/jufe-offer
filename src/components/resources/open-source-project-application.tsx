"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, GitPullRequest } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const ISSUE_BASE_URL = "https://github.com/woodfishhhh/jufe-offer/issues/new";

type OpenSourceProjectDraft = {
  name: string;
  url: string;
  description: string;
  relation: string;
  tags: string;
  contact: string;
  projectConfirmed: boolean;
  editingConfirmed: boolean;
};

type FieldErrors = Partial<Record<keyof OpenSourceProjectDraft | "checks", string>>;

const EMPTY_DRAFT: OpenSourceProjectDraft = {
  name: "",
  url: "",
  description: "",
  relation: "",
  tags: "",
  contact: "",
  projectConfirmed: false,
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

function validateDraft(draft: OpenSourceProjectDraft) {
  const errors: FieldErrors = {};
  if (!draft.name.trim()) errors.name = "请填写项目名称。";
  if (!isPublicHttpUrl(draft.url)) errors.url = "请填写可公开访问的 HTTP(S) 项目地址。";
  if (!draft.description.trim()) errors.description = "请填写项目简介。";
  if (!draft.relation.trim()) errors.relation = "请说明你与项目的关系。";
  if (!draft.projectConfirmed || !draft.editingConfirmed) {
    errors.checks = "请确认下方两项声明。";
  }
  return errors;
}

function buildIssueUrl(draft: OpenSourceProjectDraft) {
  const name = normalizeLine(draft.name);
  const params = new URLSearchParams({
    title: `[开源项目提交] ${name}`,
    body: [
      "## 开源项目提交",
      "",
      "### 项目名称",
      name,
      "",
      "### 项目地址",
      normalizeLine(draft.url),
      "",
      "### 项目简介",
      draft.description.trim(),
      "",
      "### 与项目的关系",
      draft.relation.trim(),
      "",
      "### 项目标签",
      normalizeLine(draft.tags) || "未提供",
      "",
      "### 联系方式",
      normalizeLine(draft.contact) || "未提供",
      "",
      "### 提交确认",
      "- [x] 我确认项目由本校同学创立或参与，且项目地址可以公开访问。",
      "- [x] 我同意江财OFFER根据页面展示需要调整项目简介或标签。",
    ].join("\n"),
  });
  return `${ISSUE_BASE_URL}?${params.toString()}`;
}

export function OpenSourceProjectApplication({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [errors, setErrors] = useState<FieldErrors>({});

  function updateDraft<Key extends keyof OpenSourceProjectDraft>(
    key: Key,
    value: OpenSourceProjectDraft[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key] && !current.checks) return current;
      const next = { ...current };
      delete next[key];
      if (key === "projectConfirmed" || key === "editingConfirmed") delete next.checks;
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
      <Button
        type="button"
        className={cn("gap-2", className)}
        aria-label="填写项目资料并前往 GitHub 提交申请"
        onClick={() => setOpen(true)}
      >
        <GitPullRequest className="size-4" aria-hidden="true" />
        提交自己的项目
      </Button>

      <Modal open={open} title="提交开源项目" onClose={() => setOpen(false)} wide>
        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          <div className="border-border bg-muted/45 rounded-2xl border px-4 py-3">
            <p className="font-medium">填写后将打开预填好的 GitHub Issue 草稿</p>
            <p className="text-muted-foreground mt-1 text-xs leading-5">
              信息只用于生成跳转链接，不会保存在本站；请登录 GitHub 后检查内容并提交。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="open-source-project-name">项目名称</Label>
              <Input
                id="open-source-project-name"
                value={draft.name}
                maxLength={80}
                placeholder="例如：江财校园助手"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? "open-source-project-name-error" : undefined
                }
                onChange={(event) => updateDraft("name", event.target.value)}
              />
              {errors.name ? (
                <p
                  id="open-source-project-name-error"
                  className="text-destructive text-xs"
                >
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="open-source-project-url">项目地址</Label>
              <Input
                id="open-source-project-url"
                type="url"
                inputMode="url"
                value={draft.url}
                placeholder="https://github.com/your-name/project"
                aria-invalid={Boolean(errors.url)}
                aria-describedby={
                  errors.url ? "open-source-project-url-error" : undefined
                }
                onChange={(event) => updateDraft("url", event.target.value)}
              />
              {errors.url ? (
                <p
                  id="open-source-project-url-error"
                  className="text-destructive text-xs"
                >
                  {errors.url}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  请填写仓库或项目主页的公开地址。
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="open-source-project-description">项目简介</Label>
              <Textarea
                id="open-source-project-description"
                value={draft.description}
                maxLength={300}
                placeholder="用一两句话介绍项目解决了什么问题，以及适合哪些同学使用或参与。"
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description ? "open-source-project-description-error" : undefined
                }
                onChange={(event) => updateDraft("description", event.target.value)}
              />
              <div className="flex justify-between gap-3 text-xs">
                {errors.description ? (
                  <p
                    id="open-source-project-description-error"
                    className="text-destructive"
                  >
                    {errors.description}
                  </p>
                ) : (
                  <span className="text-muted-foreground">建议控制在 80 个字以内</span>
                )}
                <span className="text-muted-foreground ml-auto tabular-nums">
                  {draft.description.length}/300
                </span>
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="open-source-project-relation">你与项目的关系</Label>
              <Input
                id="open-source-project-relation"
                value={draft.relation}
                maxLength={120}
                placeholder="例如：发起人、核心贡献者、参与开发者、推荐人"
                aria-invalid={Boolean(errors.relation)}
                aria-describedby={
                  errors.relation ? "open-source-project-relation-error" : undefined
                }
                onChange={(event) => updateDraft("relation", event.target.value)}
              />
              {errors.relation ? (
                <p
                  id="open-source-project-relation-error"
                  className="text-destructive text-xs"
                >
                  {errors.relation}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="open-source-project-tags">项目标签（可选）</Label>
              <Input
                id="open-source-project-tags"
                value={draft.tags}
                maxLength={160}
                placeholder="例如：校园、工具、前端"
                onChange={(event) => updateDraft("tags", event.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                多个标签请用逗号或空格分隔。
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="open-source-project-contact">联系方式（可选）</Label>
              <Input
                id="open-source-project-contact"
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
                checked={draft.projectConfirmed}
                className="mt-1 size-4 shrink-0 accent-[var(--brand-red)]"
                onChange={(event) =>
                  updateDraft("projectConfirmed", event.target.checked)
                }
              />
              <span>我确认项目由本校同学创立或参与，且项目地址可以公开访问。</span>
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
              <span>我同意江财OFFER根据页面展示需要调整项目简介或标签。</span>
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
