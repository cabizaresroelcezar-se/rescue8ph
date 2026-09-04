"use client";

import * as React from "react";
import {
  ShieldCheck,
  ShieldX,
  Flag,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import {
  moderateReview,
  staffDeleteReview,
} from "@/features/reviews/actions";
import { useToast } from "@/components/ui/toast";

type Status = "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";

export function ReviewModerationActions({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: Status;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = React.useState<string | null>(null);
  const { refresh, pending } = useDelayedRefresh(400);

  async function setStatus(status: Exclude<Status, "PENDING">) {
    if (busy) return;
    setBusy(status);
    const result = await moderateReview(id, status);
    setBusy(null);
    if (result?.error) {
      toast({ title: "Error", description: result.error, variant: "error" });
      return;
    }
    toast({
      title: "Success",
      description: `Review marked as ${status.toLowerCase()}.`,
      variant: "success",
    });
    router.refresh();
    refresh();
  }

  async function onDelete() {
    if (
      !confirm(
        "Permanently delete this review? This cannot be undone.",
      )
    )
      return;
    setBusy("delete");
    const result = await staffDeleteReview(id);
    setBusy(null);
    if (result?.error) {
      toast({ title: "Error", description: result.error, variant: "error" });
      return;
    }
    toast({ title: "Success", description: "Review deleted.", variant: "success" });
    router.refresh();
    refresh();
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      {currentStatus !== "APPROVED" && (
        <button
          type="button"
          onClick={() => setStatus("APPROVED")}
          disabled={busy !== null}
          className="inline-flex h-7 items-center gap-1 rounded-md border border-green-300 bg-background px-2 text-xs font-medium text-green-700 transition-colors hover:bg-green-50 disabled:opacity-60"
        >
          {busy === "APPROVED" || (pending && busy === null) ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ShieldCheck className="h-3 w-3" />
          )}
          Approve
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button
          type="button"
          onClick={() => setStatus("REJECTED")}
          disabled={busy !== null}
          className="inline-flex h-7 items-center gap-1 rounded-md border border-destructive/30 bg-background px-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
        >
          {busy === "REJECTED" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ShieldX className="h-3 w-3" />
          )}
          Reject
        </button>
      )}
      {currentStatus !== "FLAGGED" && (
        <button
          type="button"
          onClick={() => setStatus("FLAGGED")}
          disabled={busy !== null}
          className="inline-flex h-7 items-center gap-1 rounded-md border border-orange-300 bg-background px-2 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-50 disabled:opacity-60"
        >
          {busy === "FLAGGED" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Flag className="h-3 w-3" />
          )}
          Flag
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        disabled={busy !== null}
        aria-label="Delete review"
        className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-60"
      >
        {busy === "delete" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}