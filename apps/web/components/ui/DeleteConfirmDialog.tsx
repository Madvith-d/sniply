"use client";

import { useEffect } from "react";

interface DeleteConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  title = "Delete this link?",
  description = "This cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={onCancel}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="relative w-full max-w-md brutal-card bg-card p-5 sm:p-6 shadow-[10px_10px_0_var(--shadow-color)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-3">
          <div>
            <h2 id="delete-dialog-title" className="text-xl font-extrabold font-heading">
              {title}
            </h2>
            <p className="mt-1 text-sm text-ink/70">{description}</p>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-[8px] border-[2.5px] border-ink bg-paper px-4 py-2 text-sm font-bold font-heading text-ink shadow-[3px_3px_0_var(--shadow-color)] transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--shadow-color)]"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-[8px] border-[2.5px] border-ink bg-red px-4 py-2 text-sm font-bold font-heading text-[#101010] shadow-[3px_3px_0_var(--shadow-color)] transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--shadow-color)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Deleting…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}