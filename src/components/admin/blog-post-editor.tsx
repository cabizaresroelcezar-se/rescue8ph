"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, Loader2, ArrowLeft, ImageIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { createBlogPost, updateBlogPost } from "@/features/cms/actions";

type BlogPostEditorProps = {
  categories: { id: string; name: string }[];
  initial?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image_url: string;
    resolved_image_url?: string | null;
    category_id: string | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    seo_title: string;
    seo_description: string;
  };
};

export function BlogPostEditor({ categories, initial }: BlogPostEditorProps) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = React.useState(initial?.excerpt ?? "");
  const [content, setContent] = React.useState(initial?.content ?? "");
  const [featuredImage, setFeaturedImage] = React.useState(initial?.featured_image_url ?? "");
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(initial?.resolved_image_url ?? null);
  const [categoryId, setCategoryId] = React.useState(initial?.category_id ?? "");
  const [status, setStatus] = React.useState(initial?.status ?? "DRAFT");
  const [seoTitle, setSeoTitle] = React.useState(initial?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = React.useState(initial?.seo_description ?? "");
  const [showSeo, setShowSeo] = React.useState(Boolean(initial?.seo_title || initial?.seo_description));
  const [error, setError] = React.useState<string | null>(null);

  const isEdit = Boolean(initial?.id);

  const onSubmit = async (nextStatus: typeof status) => {
    if (busy) return;
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!content.trim()) {
      setError("Content is required");
      return;
    }
    setError(null);
    setBusy(true);
    const input = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      content,
      featured_image_url: featuredImage.trim() || undefined,
      category_id: categoryId || null,
      status: nextStatus,
      seo_title: seoTitle.trim() || undefined,
      seo_description: seoDescription.trim() || undefined,
      ...(isEdit ? { id: initial!.id } : {}),
    };
    const result = isEdit ? await updateBlogPost(input) : await createBlogPost(input);
    setBusy(false);
    if (result.ok) {
      if (isEdit) router.refresh();
      else router.push(`/admin/blog/${(result as unknown as { id: string }).id}`);
    } else if (result.error) {
      setError(result.error);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ButtonLink href="/admin/blog" variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </ButtonLink>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isEdit ? "Edit post" : "New post"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {wordCount} words · ~{readMinutes} min read
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy || !isEdit || status !== "PUBLISHED"}
            onClick={() => initial && window.open(`/blog/${initial.slug}`, "_blank")}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <Eye className="h-4 w-4" /> View
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSubmit("DRAFT")}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save draft
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSubmit("PUBLISHED")}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {status === "PUBLISHED" ? "Update" : "Publish"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-lg border border-border bg-card px-4 py-3 text-2xl font-bold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            placeholder="Excerpt — short summary shown in lists and meta description (optional)"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="block w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            placeholder="Write your post content here. Markdown is supported."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="block w-full rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          {/* SEO section */}
          <div className="rounded-lg border border-border bg-card p-4">
            <button
              type="button"
              onClick={() => setShowSeo((s) => !s)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-sm font-semibold text-foreground">SEO settings</span>
              <span className="text-xs text-muted-foreground">{showSeo ? "Hide" : "Show"}</span>
            </button>
            {showSeo && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">SEO title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={title || "Defaults to title"}
                    className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">SEO description</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder={excerpt || "Defaults to excerpt"}
                    rows={2}
                    className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Status</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <p className="mt-2 text-xs text-muted-foreground">
              Drafts are only visible in admin. Publishing makes the post live at /blog/{slug || "your-slug"}.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Slug</h3>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated from title"
              className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="mt-2 text-xs text-muted-foreground">Leave blank to auto-generate from title.</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Category</h3>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">— Uncategorized —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Featured image</h3>
            <div className="mt-2 space-y-2">
              {previewUrl ? (
                <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Featured" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-border bg-secondary text-xs text-muted-foreground">
                  <ImageIcon className="mr-2 h-4 w-4" /> No image
                </div>
              )}
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => {
                  setFeaturedImage(e.target.value);
                  // If the user types a full URL, use it directly for preview.
                  // If it's a relative path (e.g. from the media library), we
                  // can't resolve it client-side, so clear the preview.
                  const val = e.target.value.trim();
                  if (/^https?:\/\//i.test(val) || val.startsWith("/")) {
                    setPreviewUrl(val);
                  } else if (val === "") {
                    setPreviewUrl(null);
                  } else {
                    // Relative storage path — can't resolve client-side.
                    // Keep the old preview if any, or clear it.
                    setPreviewUrl(null);
                  }
                }}
                placeholder="path/to/image.jpg or https://..."
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground">
                Paste a storage path (e.g. folder/file.jpg) or a full URL.
                Upload via /admin/media first, then paste the path here.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}