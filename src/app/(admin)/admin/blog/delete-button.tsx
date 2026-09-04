"use client";

import * as React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteBlogPost } from "@/features/cms/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export function DeleteBlogButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);

  const onClick = async () => {
    if (busy) return;
    const ok = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (!ok) return;
    setBusy(true);
    const result = await deleteBlogPost(id);
    setBusy(false);
    if (result.ok) {
      toast({ title: "Success", description: "Blog post deleted.", variant: "success" });
      router.refresh();
    } else if (result.error) {
      toast({ title: "Error", description: result.error, variant: "error" });
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={`Delete ${title}`}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}