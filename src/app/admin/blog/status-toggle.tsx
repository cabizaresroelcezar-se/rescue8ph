"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { togglePublishBlogPost } from "@/features/cms/actions";
import { cn } from "@/lib/utils";

export function BlogStatusToggle({
  id,
  initial,
}: {
  id: string;
  initial: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
  const [status, setStatus] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    const result = await togglePublishBlogPost(id);
    setBusy(false);
    if (result.ok && result.status) {
      setStatus(result.status as typeof status);
    }
  };

  const tone =
    status === "PUBLISHED"
      ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
      : status === "ARCHIVED"
      ? "bg-secondary text-muted-foreground"
      : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50",
        tone
      )}
      title={status === "PUBLISHED" ? "Click to unpublish" : "Click to publish"}
    >
      {busy ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-500"
          )}
        />
      )}
      {status}
    </button>
  );
}