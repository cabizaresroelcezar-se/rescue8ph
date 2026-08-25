"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deletePage } from "@/features/cms/actions";

export function DeletePageButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

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
    setBusy(false);
    if (result?.ok) router.push("/admin/pages");
    else if (result?.error) alert(result.error);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-destructive/30 bg-background px-2.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      Delete
    </button>
  );
}