"use client";

import * as React from "react";

// ============================================================================
// Toast notification system — lightweight, no external deps
// ============================================================================
// Usage:
//   const { toast } = useToast();
//   toast({ title: "Saved", description: "Profile updated successfully" });
// ============================================================================

type ToastVariant = "success" | "error" | "info" | "loading";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
  removing?: boolean;
}

interface ToastContextValue {
  toast: (opts: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
  update: (id: string, opts: Partial<Omit<ToastItem, "id">>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    return {
      toast: () => "",
      dismiss: () => {},
      update: () => {},
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    // Mark as removing for exit animation
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, removing: true } : t));
    // Remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const update = React.useCallback((id: string, opts: Partial<Omit<ToastItem, "id">>) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, ...opts } : t));
    // If updating to a non-loading variant with no duration, set auto-dismiss
    if (opts.variant && opts.variant !== "loading") {
      const duration = opts.duration ?? 3500;
      setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  const toast = React.useCallback(
    (opts: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const duration = opts.duration ?? (opts.variant === "loading" ? 0 : 3500);
      setToasts((prev) => [...prev, { ...opts, id, duration }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss, update }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 sm:bottom-6 sm:right-6"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const styles: Record<ToastVariant, string> = {
    success:
      "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100",
    error:
      "border-destructive/40 bg-destructive/10 text-destructive dark:text-destructive-foreground",
    info: "border-border bg-card text-foreground",
    loading: "border-primary/40 bg-primary/5 text-foreground",
  };

  const icons: Record<ToastVariant, string> = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    loading: "○",
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-elev-4 min-w-[280px] max-w-[400px] transition-all duration-300 ${
        styles[toast.variant]
      } ${toast.removing ? "translate-y-2 opacity-0" : "animate-fade-up"}`}
    >
      <span className="mt-0.5 text-sm font-bold shrink-0">
        {toast.variant === "loading" ? (
          <span className="inline-block animate-spin">↻</span>
        ) : (
          icons[toast.variant]
        )}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs opacity-80">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-xs opacity-50 hover:opacity-100"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}