"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Check, Copy, Inbox, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { ExternalLink } from "@/components/external-link";
import {
  CandidateReviewDialog,
  type CandidateReviewAction,
} from "@/components/resources/candidate-review-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CANDIDATE_CATEGORY_LABELS,
  CANDIDATE_SOURCE_TYPE_LABELS,
} from "@/data/candidates";
import { cn, readApiError } from "@/lib/utils";
import type { CandidateDto } from "@/types/candidate";

type CandidateListResponse = {
  data: {
    items: CandidateDto[];
    total: number;
    limit: number;
  };
};

type ReviewTarget = {
  action: CandidateReviewAction;
  candidate: CandidateDto;
};

export function CandidateReviewPanel({
  onResourceApproved,
}: {
  onResourceApproved: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CandidateDto[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const loadCandidates = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/admin/candidates?status=PENDING", {
        cache: "no-store",
      });
      if (!response.ok) {
        const error = await readApiError(response);
        setLoadError(error.message);
        return;
      }

      const payload = (await response.json()) as CandidateListResponse;
      setItems(payload.data.items);
      setTotal(payload.data.total);
      setLimit(payload.data.limit);
    } catch {
      setLoadError("候选列表暂时无法加载，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialCandidates() {
      try {
        const response = await fetch("/api/admin/candidates?status=PENDING", {
          cache: "no-store",
        });
        if (cancelled) return;
        if (!response.ok) {
          const error = await readApiError(response);
          setLoadError(error.message);
          return;
        }

        const payload = (await response.json()) as CandidateListResponse;
        if (!cancelled) {
          setItems(payload.data.items);
          setTotal(payload.data.total);
          setLimit(payload.data.limit);
        }
      } catch {
        if (!cancelled) {
          setLoadError("候选列表暂时无法加载，请稍后重试。");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadInitialCandidates();
    return () => {
      cancelled = true;
    };
  }, []);

  async function confirmReview(reviewNote?: string) {
    if (!reviewTarget) return;
    setSubmitting(true);
    setReviewError("");

    try {
      const response = await fetch(
        `/api/admin/candidates/${reviewTarget.candidate.id}/${reviewTarget.action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewTarget.action === "approve" ? {} : { reviewNote }),
        },
      );
      if (!response.ok) {
        const error = await readApiError(response);
        setReviewError(error.message);
        return;
      }

      const successMessage =
        reviewTarget.action === "approve"
          ? "候选已通过并发布。"
          : reviewTarget.action === "reject"
            ? "候选已拒绝。"
            : "候选已标记重复。";
      toast.success(successMessage);
      const approved = reviewTarget.action === "approve";
      setReviewTarget(null);
      await loadCandidates(false);
      if (approved) {
        await onResourceApproved();
      }
    } catch {
      setReviewError("审核操作失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => {
          setOpen(true);
          void loadCandidates();
        }}
      >
        <Inbox />
        待审核
        <span className="bg-foreground text-background min-w-6 rounded-full px-1.5 py-0.5 text-center font-mono text-xs">
          {loading && items.length === 0 ? "…" : total}
        </span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="border-border gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl"
        >
          <SheetHeader className="border-border border-b px-5 py-5 pr-14 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SheetTitle className="font-display text-xl font-semibold tracking-[-0.03em]">
                  待审核候选
                </SheetTitle>
                <SheetDescription className="mt-1.5 leading-6">
                  仅管理员可见。通过后写入正式资源，原始证据继续保留。
                </SheetDescription>
              </div>
              <Badge variant="outline" className="shrink-0 font-mono">
                {total}
              </Badge>
            </div>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            {total > limit ? (
              <p className="bg-muted/65 text-muted-foreground mb-4 rounded-2xl px-4 py-3 text-xs leading-5">
                共 {total} 条，当前按发现时间显示最早的 {limit} 条。
              </p>
            ) : null}

            {loading ? (
              <div className="space-y-3" aria-label="正在加载待审核候选">
                {[0, 1, 2].map((index) => (
                  <Skeleton key={index} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : loadError ? (
              <div className="py-16 text-center">
                <p className="font-display text-lg font-semibold">加载失败</p>
                <p className="text-muted-foreground mt-2 text-sm">{loadError}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="mt-5"
                  onClick={() => void loadCandidates()}
                >
                  <RefreshCw />
                  重新加载
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="py-20 text-center">
                <div className="border-border mx-auto flex size-12 items-center justify-center rounded-full border">
                  <Check className="size-5" />
                </div>
                <p className="font-display mt-4 text-xl font-semibold">没有待审核候选</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  OpenClaw 提交的不确定内容会出现在这里。
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onReview={(action) => {
                      setReviewError("");
                      setReviewTarget({ action, candidate });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {reviewTarget ? (
        <CandidateReviewDialog
          key={`${reviewTarget.candidate.id}:${reviewTarget.action}`}
          action={reviewTarget.action}
          candidate={reviewTarget.candidate}
          submitting={submitting}
          error={reviewError}
          onClose={() => {
            if (!submitting) setReviewTarget(null);
          }}
          onConfirm={confirmReview}
        />
      ) : null}
    </>
  );
}

function CandidateCard({
  candidate,
  onReview,
}: {
  candidate: CandidateDto;
  onReview: (action: CandidateReviewAction) => void;
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="border-border border-b px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{CANDIDATE_CATEGORY_LABELS[candidate.category]}</Badge>
          <Badge variant="outline">
            {CANDIDATE_SOURCE_TYPE_LABELS[candidate.sourceType]}
          </Badge>
          <span className="text-muted-foreground ml-auto font-mono text-[11px]">
            {formatDateTime(candidate.discoveredAt)}
          </span>
        </div>
        <CardTitle className="font-display mt-4 text-xl leading-7 font-semibold tracking-[-0.03em]">
          {candidate.title}
        </CardTitle>
        <p className="text-muted-foreground mt-2 text-xs">
          来源：{candidate.sourceName}
          {candidate.deadline
            ? ` · 截止 ${formatDateTime(candidate.deadline)}`
            : " · 未提供截止时间"}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 px-5 py-5">
        <p className="text-sm leading-7">{candidate.summary}</p>

        {candidate.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {candidate.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                #{tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <ExternalLink
            href={candidate.sourceUrl}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            原始来源
            <ArrowUpRight />
          </ExternalLink>
          {candidate.officialUrl ? (
            <ExternalLink
              href={candidate.officialUrl}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              官方链接
              <ArrowUpRight />
            </ExternalLink>
          ) : null}
        </div>

        {candidate.rawExcerpt ? (
          <details className="border-border bg-muted/45 group rounded-2xl border px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium select-none">
              查看原始证据
            </summary>
            <p className="text-muted-foreground mt-3 max-h-64 overflow-y-auto text-xs leading-6 break-words whitespace-pre-wrap">
              {candidate.rawExcerpt}
            </p>
          </details>
        ) : null}
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 px-5 py-4 sm:flex sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="col-span-2 sm:order-first sm:mr-auto"
          onClick={() => onReview("duplicate")}
        >
          <Copy />
          标记重复
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onReview("reject")}
        >
          <X />
          拒绝
        </Button>
        <Button type="button" size="sm" onClick={() => onReview("approve")}>
          <Check />
          通过
        </Button>
      </CardFooter>
    </Card>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
