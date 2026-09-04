"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { deleteReview } from "@/features/reviews/actions";
import { useToast } from "@/components/ui/toast";

export function DeleteReviewButton({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);
  const { refresh, pending } = useDelayedRefresh(400);

  async function onClick() {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setBusy(true);
    const result = await deleteReview(id);
    setBusy(false);
    if (result?.error) {
      toast({ title: "Error", description: result.error, variant: "error" });
      return;
    }
    toast({ title: "Success", description: "Review deleted.", variant: "success" });
    router.refresh();
    refresh();
  }

  const showSpinner = busy || pending;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label="Delete review"
      className="inline-flex h-7 items-center gap-1 rounded-md border border-destructive/30 bg-background px-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
    >
      {showSpinner ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Trash2 className="h-3 w-3" />
      )}
      Delete
    </button>
  );
}