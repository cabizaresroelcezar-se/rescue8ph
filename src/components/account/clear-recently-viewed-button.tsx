"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { clearRecentlyViewed } from "@/features/recently-viewed/actions";

export function ClearRecentlyViewedButton() {
  const router = useRouter();
  const { refresh } = useDelayedRefresh(400);
  const [busy, setBusy] = React.useState(false);

  async function onClick() {
    if (!confirm("Clear your recently viewed products? This cannot be undone.")) return;
    setBusy(true);
    const result = await clearRecentlyViewed();
    setBusy(false);
    if (result?.error) {
      alert(result.error);
      return;
    }
    router.refresh();
    refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-60"
    >
      {busy ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Trash2 className="h-3 w-3" />
      )}
      Clear all
    </button>
  );
}