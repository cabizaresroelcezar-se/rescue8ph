"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { togglePublishPage } from "@/features/cms/actions";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function ListPublishToggle({
  id,
  initial,
}: {
  id: string;
  initial: "DRAFT" | "PUBLISHED";
}) {
  const [status, setStatus] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);
  const { refresh, pending } = useDelayedRefresh(600);
  const { toast } = useToast();

  async function onClick() {
    if (busy) return;
    setBusy(true);
    const next = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    // Optimistic update so the badge flips immediately
    setStatus(next);
    const result = await togglePublishPage(id);
    setBusy(false);
    if (result?.ok) {
      toast({
        title: "Success",
        description: next === "PUBLISHED" ? "Page published." : "Page unpublished.",
        variant: "success",
      });
      refresh(); // debounced re-fetch
    } else if (result?.error) {
      // Revert on error
      setStatus(status);
      toast({ title: "Error", description: result.error, variant: "error" });
    }
  }

  const isPublished = status === "PUBLISHED";
  const isRefreshing = pending && !busy;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={isPublished}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors disabled:opacity-60",
        isPublished
          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
          : "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
      )}
    >
      {busy || isRefreshing ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <span
          aria-hidden
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isPublished ? "bg-green-500" : "bg-yellow-500",
          )}
        />
      )}
      {isPublished ? "Published" : "Draft"}
    </button>
  );
}