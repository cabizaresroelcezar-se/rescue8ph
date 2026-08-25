"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { togglePublishPage } from "@/features/cms/actions";
import { cn } from "@/lib/utils";

export function ListPublishToggle({
  id,
  initial,
}: {
  id: string;
  initial: "DRAFT" | "PUBLISHED";
}) {
  const router = useRouter();
  const [status, setStatus] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);

  async function onClick() {
    setBusy(true);
    const result = await togglePublishPage(id);
    setBusy(false);
    if (result?.ok) {
      setStatus(status === "PUBLISHED" ? "DRAFT" : "PUBLISHED");
      router.refresh();
    }
  }

  const isPublished = status === "PUBLISHED";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={isPublished}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors disabled:opacity-50",
        isPublished
          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
          : "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
      )}
    >
      {busy ? (
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