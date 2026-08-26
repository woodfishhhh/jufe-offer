"use client";

import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import type { ResourceDto } from "@/lib/resources";

type Props = {
  resource: ResourceDto | null;
  submitting: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteResourceDialog({
  resource,
  submitting,
  error,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal open={Boolean(resource)} title="确认删除资源" onClose={onClose}>
      <p className="text-muted-foreground text-sm leading-7">
        即将删除资源
        <strong className="text-foreground mx-1 font-semibold">
          「{resource?.title}」
        </strong>
        。删除后无法恢复。
      </p>
      {error ? (
        <p className="bg-destructive/10 text-destructive mt-3 rounded-2xl px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" onClick={onClose} variant="outline" size="lg">
          取消
        </Button>
        <Button
          type="button"
          disabled={submitting}
          onClick={() => void onConfirm()}
          variant="destructive"
          size="lg"
        >
          {submitting ? "删除中…" : "确认删除"}
        </Button>
      </div>
    </Modal>
  );
}
