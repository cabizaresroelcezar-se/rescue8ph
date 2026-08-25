"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { toggleCouponActive } from "@/features/coupons/actions";
import { cn } from "@/lib/utils";

type Status = "active" | "inactive" | "expired" | "scheduled" | "limit-reached";

const STATUS_LABEL: Record<Status, string> = {
  active: "Active",
  inactive: "Inactive",
  expired: "Expired",
  scheduled: "Scheduled",
  "limit-reached": "Limit reached",
};

const STATUS_TONE: Record<Status, string> = {
  active: "border-green-200 bg-green-50 text-green-700",
  inactive: "border-yellow-200 bg-yellow-50 text-yellow-700",
  expired: "border-border bg-secondary text-muted-foreground",
  scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  "limit-reached": "border-border bg-secondary text-muted-foreground",
};

export function CouponActiveToggle({
  id,
  initial,
  status,
}: {
  id: string;
  initial: boolean;
  status: Status;
}) {
  const [busy, setBusy] = React.useState(false);
  const [optimistic, setOptimistic] = React.useState(initial);
  const [error, setError] = React.useState<string | null>(null);
  const { refresh, pending } = useDelayedRefresh(400);

  React.useEffect(() => {
    // Reset optimistic state when the prop changes (legitimate prop reset)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptimistic(initial);
  }, [initial]);

  async function onClick() {
    if (busy) return;
    const next = !optimistic;
    setError(null);
    setBusy(true);
    setOptimistic(next);
    const result = await toggleCouponActive(id, next);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      setOptimistic(optimistic);
    } else {
      refresh();
    }
  }

  // If status is expired/scheduled/limit-reached, the effective state
  // isn't just is_active — show that status instead, but still allow toggling.
  const displayStatus: Status = !optimistic ? "inactive" : status;
  const showSpinner = busy || pending;

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
          STATUS_TONE[displayStatus],
        )}
      >
        {STATUS_LABEL[displayStatus]}
      </span>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-label={optimistic ? "Deactivate coupon" : "Activate coupon"}
        className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
      >
        {showSpinner ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : optimistic ? (
          "Deactivate"
        ) : (
          "Activate"
        )}
      </button>
      {error && (
        <span className="ml-1 text-xs text-destructive">{error}</span>
      )}
    </div>
  );
}