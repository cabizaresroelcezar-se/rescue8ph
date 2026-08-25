"use client";

import * as React from "react";
import { Save, Loader2, ArrowLeft, Eye, Pencil, FileText } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { createPage, updatePage } from "@/features/cms/actions";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { Markdown } from "@/components/marketing/markdown";
import { cn } from "@/lib/utils";

export interface PageFormInitial {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  body?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  status?: "DRAFT" | "PUBLISHED";
}

export function PageForm({ initial }: { initial?: PageFormInitial }) {
  const isEdit = Boolean(initial?.id);

  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = React.useState(initial?.excerpt ?? "");
  const [body, setBody] = React.useState(initial?.body ?? "");
  const [seoTitle, setSeoTitle] = React.useState(initial?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = React.useState(
    initial?.seo_description ?? "",
  );
  const [status, setStatus] = React.useState<"DRAFT" | "PUBLISHED">(
    initial?.status ?? "DRAFT",
  );
  const [bodyTab, setBodyTab] = React.useState<"write" | "preview">("write");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const { refresh, pending } = useDelayedRefresh(700);

  const autoSlug = React.useMemo(() => slugify(title), [title]);
  const wordCount = React.useMemo(
    () => body.trim().split(/\s+/).filter(Boolean).length,
    [body],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData();
    if (isEdit) fd.set("id", initial!.id!);
    fd.set("title", title);
    fd.set("slug", slug || autoSlug);
    fd.set("excerpt", excerpt);
    fd.set("body", body);
    fd.set("seo_title", seoTitle);
    fd.set("seo_description", seoDescription);
    fd.set("status", status);

    const result = isEdit ? await updatePage(fd) : await createPage(fd);
    setBusy(false);

    if (result?.error) {
      setError(result.error);
    } else if (isEdit) {
      setSavedAt(new Date().toLocaleTimeString("en-PH"));
      refresh();
    }
    // createPage redirects on success
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
            {busy || pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {pending && !busy
              ? "Saved"
              : isEdit
                ? "Save changes"
                : "Create page"}
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
        <div className="space-y-5">
          {/* Title + slug */}
          <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-elev-1">
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
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary shown in previews and search results."
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          {/* Body editor with tabs */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-elev-1">
            <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2">
              <div className="flex items-center gap-1">
                <TabButton
                  active={bodyTab === "write"}
                  onClick={() => setBodyTab("write")}
                  icon={<Pencil className="h-3.5 w-3.5" />}
                  label="Write"
                />
                <TabButton
                  active={bodyTab === "preview"}
                  onClick={() => setBodyTab("preview")}
                  icon={<Eye className="h-3.5 w-3.5" />}
                  label="Preview"
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
            </div>

            {bodyTab === "write" ? (
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={22}
                placeholder={`# Heading\n\nWrite your page content here using Markdown.\n\n- Use **bold**, *italic*, and [links](https://example.com)\n- Lists, blockquotes, and code blocks are supported\n- Leave blank for a placeholder section`}
                className="block w-full resize-y border-0 bg-background px-4 py-3 font-mono text-sm outline-none placeholder:text-muted-foreground/50"
              />
            ) : (
              <div className="min-h-[280px] px-4 py-3">
                {body.trim() ? (
                  <Markdown source={body} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nothing to preview yet. Add content in the Write tab.
                  </p>
                )}
              </div>
            )}
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
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <FileText className="h-3.5 w-3.5" /> SEO
            </h3>
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

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-elev-1"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
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