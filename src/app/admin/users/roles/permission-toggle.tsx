"use client";

import * as React from "react";
import { Check, X, Loader2, Lock } from "lucide-react";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { toggleRolePermission } from "@/features/users/actions";
import { cn } from "@/lib/utils";

export function PermissionToggle({
  roleName,
  permissionCode,
  granted,
  locked,
}: {
  roleName: "admin" | "customer" | "super_admin";
  permissionCode: string;
  granted: boolean;
  locked: boolean;
}) {
  const [busy, setBusy] = React.useState(false);
  const [optimistic, setOptimistic] = React.useState(granted);
  const [error, setError] = React.useState<string | null>(null);
  const { refresh, pending } = useDelayedRefresh(400);

  React.useEffect(() => {
    // Reset optimistic state when the prop changes (legitimate prop reset)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptimistic(granted);
  }, [granted]);

  async function onClick() {
    if (busy || locked) return;
    const next = !optimistic;
    setError(null);
    setBusy(true);
    setOptimistic(next);
    const result = await toggleRolePermission(roleName, permissionCode, next);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      setOptimistic(optimistic); // revert
    } else {
      refresh();
    }
  }

  if (locked) {
    return (
      <span
        aria-label={`${roleName} always has ${permissionCode}`}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent"
      >
        <Lock className="h-3 w-3" />
      </span>
    );
  }

  const showLoader = busy || pending;
  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-pressed={optimistic}
        aria-label={`${optimistic ? "Revoke" : "Grant"} ${permissionCode} for ${roleName}`}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors disabled:opacity-60",
          optimistic
            ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            : "border-border bg-background text-muted-foreground hover:bg-secondary",
        )}
      >
        {showLoader ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : optimistic ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
      </button>
      {error && (
        <span className="text-[10px] text-destructive" title={error}>
          !
        </span>
      )}
    </div>
  );
}