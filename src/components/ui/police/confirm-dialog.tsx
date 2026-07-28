"use client";

import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

// ── Confirm Dialog ───────────────────────────────────────────
// Standardized confirmation dialog for destructive actions.
//
// Usage:
//   <ConfirmDialog
//     open={showDialog}
//     onOpenChange={setShowDialog}
//     title="Delete Officer?"
//     message="This action cannot be undone."
//     confirmLabel="Delete"
//     variant="danger"
//     onConfirm={() => handleDelete()}
//   />

type DialogVariant = "danger" | "warning" | "info";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  onConfirm: () => void;
  loading?: boolean;
};

const variantStyles: Record<DialogVariant, string> = {
  danger:  "bg-[var(--tpf-status-danger)] hover:opacity-90",
  warning: "bg-[var(--tpf-status-warning)] hover:opacity-90 text-white",
  info:    "bg-[var(--tpf-blue)] hover:bg-[#1D4ED8]",
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = "Thibitisha",
  cancelLabel = "Ghairi",
  variant = "danger",
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="tpf-overlay" />
        <Dialog.Content className="tpf-modal flex flex-col gap-5 p-6">
          <div className="flex items-start justify-between">
            <Dialog.Title className="tpf-font-h3 text-[var(--tpf-text)]">
              {title}
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-[var(--tpf-text-4)] hover:bg-[var(--tpf-surface-2)] transition-colors">
              <X size={16} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-[13px] text-[var(--tpf-text-2)] leading-relaxed">
            {message}
          </Dialog.Description>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Dialog.Close className="tpf-btn tpf-btn-secondary">
              {cancelLabel}
            </Dialog.Close>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                "tpf-btn tpf-btn-primary text-white",
                variantStyles[variant],
                loading && "opacity-60 pointer-events-none"
              )}
            >
              {loading ? "Inatenda..." : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
