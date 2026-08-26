"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
};

export function Modal({ open, title, onClose, children, wide = false }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className={cn(wide && "sm:max-w-2xl")}>
        <DialogHeader className="border-border border-b pr-12 pb-5">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[72vh] overflow-y-auto pt-1">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
