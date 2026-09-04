"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

// ============================================================================
// Confirm dialog — modal for delete/destructive actions
// ============================================================================
// Usage:
//   <ConfirmDialog
//     trigger="Delete item"
//     title="Delete this item?"
//     description="This action cannot be undone."
//     confirmLabel="Delete"
//     onConfirm={async () => { await deleteThing(); }}
//   />
// ============================================================================

interface ConfirmDialogProps {
  trigger: React.ReactNode;
  triggerClassName?: string;
  triggerVariant?: "default" | "destructive" | "ghost";
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void>;
  onSuccess?: () => void;
  successMessage?: string;
}

export function ConfirmDialog({
  trigger,
  triggerClassName = "",
  triggerVariant = "default",
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onSuccess,
  successMessage,
}: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const variantClass =
    triggerVariant === "destructive"
      ? "text-destructive hover:text-destructive"
      : triggerVariant === "ghost"
        ? "text-muted-foreground hover:text-foreground"
        : "text-foreground";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName || `text-xs ${variantClass} hover:underline`}
      >
        {trigger}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busy) setOpen(false);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-elev-4">
            <div className="flex items-start gap-3 border-b border-border bg-card px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">{title}</h2>
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="mx-5 mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-border bg-card px-5 py-3">
              <button
                type="button"
                onClick={() => !busy && setOpen(false)}
                disabled={busy}
                className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3.5 text-sm font-medium hover:bg-secondary disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={busy}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground shadow-elev-1 hover:bg-destructive/90 disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Working…
                  </>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}