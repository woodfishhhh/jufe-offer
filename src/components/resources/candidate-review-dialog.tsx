"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CandidateDto } from "@/types/candidate";

export type CandidateReviewAction = "approve" | "reject" | "duplicate";

const actionCopy: Record<
  CandidateReviewAction,
  { title: string; description: string; confirm: string }
> = {
  approve: {
    title: "确认通过候选",
    description: "通过后会立即创建正式资源，并保留这条候选及其原始证据。",
    confirm: "确认通过",
  },
  reject: {
    title: "确认拒绝候选",
    description: "拒绝后 OpenClaw 不能再覆盖这条候选。",
    confirm: "确认拒绝",
  },
  duplicate: {
    title: "确认标记重复",
    description: "标记后不会创建正式资源，候选记录仍会保留。",
    confirm: "标记重复",
  },
};

type Props = {
  action: CandidateReviewAction | null;
  candidate: CandidateDto | null;
  submitting: boolean;
  error: string;
  onClose: () => void;
  onConfirm: (reviewNote?: string) => Promise<void>;
};

export function CandidateReviewDialog({
  action,
  candidate,
  submitting,
  error,
  onClose,
  onConfirm,
}: Props) {
  const [reviewNote, setReviewNote] = useState("");
  const copy = action ? actionCopy[action] : null;

  return (
    <Modal
      open={Boolean(action && candidate)}
      title={copy?.title ?? "审核候选"}
      onClose={onClose}
    >
      <p className="text-muted-foreground text-sm leading-7">{copy?.description}</p>
      <p className="border-border bg-muted/55 mt-4 rounded-2xl border px-4 py-3 text-sm font-medium">
        {candidate?.title}
      </p>

      {action === "reject" || action === "duplicate" ? (
        <div className="mt-5 space-y-2">
          <Label htmlFor="candidate-review-note">审核备注（可选）</Label>
          <Textarea
            id="candidate-review-note"
            value={reviewNote}
            onChange={(event) => setReviewNote(event.target.value)}
            maxLength={300}
            rows={4}
            placeholder="简要说明原因，最多 300 个字"
          />
          <p className="text-muted-foreground text-right text-xs">
            {reviewNote.length}/300
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="bg-destructive/10 text-destructive mt-4 rounded-2xl px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" size="lg" onClick={onClose}>
          取消
        </Button>
        <Button
          type="button"
          size="lg"
          variant={action === "reject" ? "destructive" : "default"}
          disabled={submitting}
          onClick={() => void onConfirm(reviewNote.trim() || undefined)}
        >
          {submitting ? "处理中…" : copy?.confirm}
        </Button>
      </div>
    </Modal>
  );
}
