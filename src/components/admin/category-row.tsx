"use client";

import * as React from "react";
import { Loader2, Trash2, FileText } from "lucide-react";
import { deleteBlogCategory } from "@/features/cms/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export function CategoryRow({
  id,
  name,
  slug,
  description,
  postCount,
}: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);

  const onDelete = async () => {
    if (
      !window.confirm(
        postCount > 0
          ? `Delete category "${name}"? It has ${postCount} post(s) which will become uncategorized.`
          : `Delete category "${name}"?`
      )
    )
      return;
    setBusy(true);
    const result = await deleteBlogCategory(id);
    setBusy(false);
    if (result.ok) {
      toast({ title: "Success", description: "Category deleted.", variant: "success" });
      router.refresh();
    } else if (result.error) {
      toast({ title: "Error", description: result.error, variant: "error" });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-foreground">{name}</h4>
          <code className="mt-0.5 inline-block rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {slug}
          </code>
          {description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{description}</p>
          )}
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" /> {postCount} post{postCount === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          aria-label={`Delete category ${name}`}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}