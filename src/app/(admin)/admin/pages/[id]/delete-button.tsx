"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deletePage } from "@/features/cms/actions";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";

export function DeletePageButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const { refresh, pending } = useDelayedRefresh(400);

  async function onClick() {
    if (
      !confirm(
        `Delete page "${title}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    setBusy(true);
    const result = await deletePage(id);
    if (result?.ok) {
      // Brief delay so the user sees the "Deleting..." state, then navigate
      setTimeout(() => router.push("/admin/pages"), 350);
      refresh(); // ensure list view is up-to-date
      return;
    }
    setBusy(false);
    if (result?.error) alert(result.error);
  }

  const isLoading = busy || pending;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-destructive/30 bg-background px-2.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}