"use client";

import * as React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteFaq, updateFaq } from "@/features/cms/actions";
import { useRouter } from "next/navigation";

export function FaqRow({
  id,
  question,
  answer,
  sortOrder,
  isEnabled,
}: {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isEnabled: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [q, setQ] = React.useState(question);
  const [a, setA] = React.useState(answer);
  const [enabled, setEnabled] = React.useState(isEnabled);
  const [busy, setBusy] = React.useState(false);

  const onSave = async () => {
    setBusy(true);
    const result = await updateFaq({
      id,
      question: q,
      answer: a,
      sort_order: sortOrder,
      is_enabled: enabled,
    });
    setBusy(false);
    if (result.ok) {
      setEditing(false);
      router.refresh();
    }
  };

  const onDelete = async () => {
    if (!window.confirm("Delete this FAQ?")) return;
    setBusy(true);
    const result = await deleteFaq(id);
    setBusy(false);
    if (result.ok) router.refresh();
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {editing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            rows={3}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-foreground">Show on storefront</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={busy}
              className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setQ(question);
                setA(answer);
                setEnabled(isEnabled);
              }}
              className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-foreground">{question}</h4>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{answer}</p>
            {!isEnabled && (
              <span className="mt-1 inline-flex rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Hidden
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium text-foreground hover:bg-secondary"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              aria-label="Delete FAQ"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}