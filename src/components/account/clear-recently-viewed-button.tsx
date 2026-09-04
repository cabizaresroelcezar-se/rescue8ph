"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { clearRecentlyViewed } from "@/features/recently-viewed/actions";
import { useToast } from "@/components/ui/toast";

export function ClearRecentlyViewedButton() {
  const router = useRouter();
  const { toast } = useToast();
  const { refresh } = useDelayedRefresh(400);
  const [busy, setBusy] = React.useState(false);

  async function onClick() {
    if (!confirm("Clear your recently viewed products? This cannot be undone.")) return;
    setBusy(true);
    const result = await clearRecentlyViewed();
    setBusy(false);
    if (result?.error) {
      toast({ title: "Error", description: result.error, variant: "error" });
      return;
    }
    toast({ title: "Success", description: "Recently viewed products cleared.", variant: "success" });
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