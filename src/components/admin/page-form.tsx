"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { createPage, updatePage } from "@/features/cms/actions";

export interface PageFormInitial {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  status?: "DRAFT" | "PUBLISHED";
}

export function PageForm({ initial }: { initial?: PageFormInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = React.useState(initial?.excerpt ?? "");
  const [seoTitle, setSeoTitle] = React.useState(initial?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = React.useState(
    initial?.seo_description ?? "",
  );
  const [status, setStatus] = React.useState<"DRAFT" | "PUBLISHED">(
    initial?.status ?? "DRAFT",
  );
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);

  const autoSlug = React.useMemo(() => slugify(title), [title]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData();
    if (isEdit) fd.set("id", initial!.id!);
    fd.set("title", title);
    fd.set("slug", slug || autoSlug);
    fd.set("excerpt", excerpt);
    fd.set("seo_title", seoTitle);
    fd.set("seo_description", seoDescription);
    fd.set("status", status);

    const result = isEdit ? await updatePage(fd) : await createPage(fd);
    setBusy(false);

    if (result?.error) {
      setError(result.error);
    } else if (isEdit) {
      setSavedAt(new Date().toLocaleTimeString("en-PH"));
      router.refresh();
    }
    // createPage redirects to /admin/pages/[id] on success
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ButtonLink href="/admin/pages" variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </ButtonLink>
          <span>{isEdit ? "Edit page" : "New page"}</span>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="text-xs text-muted-foreground">
              Saved at {savedAt}
            </span>
          )}
          <button
            type="submit"
            disabled={busy || !title.trim()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEdit ? "Save changes" : "Create page"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Main two-column grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column — content */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-elev-1">
          <div>
            <label htmlFor="title" className="text-xs font-medium text-foreground">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Shipping Policy"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-base font-semibold outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label htmlFor="slug" className="text-xs font-medium text-foreground">
              Slug
              <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                Leave blank to auto-generate from title
              </span>
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={autoSlug || "page-url-slug"}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            {slug || autoSlug ? (
              <p className="mt-1 text-xs text-muted-foreground">
                /{slug || autoSlug}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="excerpt" className="text-xs font-medium text-foreground">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A short summary of the page (used in previews and search results)."
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        {/* Right column — meta + status */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <h3 className="text-sm font-semibold text-foreground">Publish</h3>
            <div className="mt-3 space-y-2 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  checked={status === "DRAFT"}
                  onChange={() => setStatus("DRAFT")}
                  className="h-4 w-4 text-primary"
                />
                <span>Draft — visible only to admins</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  checked={status === "PUBLISHED"}
                  onChange={() => setStatus("PUBLISHED")}
                  className="h-4 w-4 text-primary"
                />
                <span>Published — visible to everyone</span>
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <h3 className="text-sm font-semibold text-foreground">SEO</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Optional. Falls back to the title and excerpt when left blank.
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <label
                  htmlFor="seo_title"
                  className="text-xs font-medium text-foreground"
                >
                  SEO title
                </label>
                <input
                  id="seo_title"
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  maxLength={70}
                  placeholder="Custom title for search engines"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {seoTitle.length}/70
                </p>
              </div>
              <div>
                <label
                  htmlFor="seo_description"
                  className="text-xs font-medium text-foreground"
                >
                  SEO description
                </label>
                <textarea
                  id="seo_description"
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  maxLength={160}
                  placeholder="Custom description for search engines"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {seoDescription.length}/160
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}