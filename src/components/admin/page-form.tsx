"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  ArrowLeft,
  Pencil,
  ImageIcon,
  Clock,
  CalendarClock,
  X,
  History,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { createPage, updatePage } from "@/features/cms/actions";
import {
  autosavePageDraft,
  listPageRevisions,
  restorePageRevision,
  schedulePagePublish,
  cancelScheduledPublish,
  publishNowFromSchedule,
  type PageRevision,
} from "@/features/cms/enhancements";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

const AUTOSAVE_DEBOUNCE_MS = 1500;

export interface PageFormInitial {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  body?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  featured_image_url?: string | null;
  status?: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  publish_at?: string | null;
  published_at?: string | null;
  published_by?: string | null;
  updated_at?: string | null;
  og_image_url?: string | null;
}

type SaveState = "idle" | "saving" | "saved" | "error";

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
  const [featuredImageUrl, setFeaturedImageUrl] = React.useState(
    initial?.featured_image_url ?? "",
  );
  const [status, setStatus] = React.useState<"DRAFT" | "PUBLISHED">(
    initial?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
  );
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Autosave state
  const [autosaveState, setAutosaveState] = React.useState<SaveState>("idle");
  const [savedAt, setSavedAt] = React.useState<string | null>(
    initial?.updated_at ?? null,
  );

  // Schedule publish
  const [scheduleDate, setScheduleDate] = React.useState<string>(
    initial?.publish_at ? initial.publish_at.slice(0, 16) : "",
  );
  const [scheduleError, setScheduleError] = React.useState<string | null>(null);

  // Revisions
  const [revisions, setRevisions] = React.useState<PageRevision[]>([]);
  const [revisionsOpen, setRevisionsOpen] = React.useState(false);

  // Featured image preview
  const [featuredImagePreview, setFeaturedImagePreview] = React.useState<string | null>(
    initial?.featured_image_url ?? null,
  );

  const router = useRouter();
  const { refresh, pending } = useDelayedRefresh(700);

  const lastSavedSnapshot = React.useRef<string>("");
  const initialSnapshot = React.useRef<string>(
    JSON.stringify({
      title,
      slug,
      excerpt,
      body,
      seoTitle,
      seoDescription,
      featuredImageUrl,
    }),
  );

  // ============================================================
  // Autosave: debounced save on field changes
  // ============================================================
  React.useEffect(() => {
    if (!isEdit) return; // autosave only for existing pages

    const snapshot = JSON.stringify({
      title,
      slug,
      excerpt,
      body,
      seoTitle,
      seoDescription,
      featuredImageUrl,
    });
    if (snapshot === lastSavedSnapshot.current) return;
    if (snapshot === initialSnapshot.current) return;

    setAutosaveState("saving");
    const t = setTimeout(async () => {
      const result = await autosavePageDraft({
        id: initial!.id!,
        title,
        slug,
        body,
        excerpt: excerpt || null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        featured_image_url: featuredImageUrl || null,
      });
      if (result.ok) {
        lastSavedSnapshot.current = snapshot;
        setSavedAt(result.savedAt);
        setAutosaveState("saved");
        // Briefly show "saved", then fade back to "idle"
        setTimeout(() => setAutosaveState("idle"), 2200);
      } else {
        setAutosaveState("error");
        setError(result.error ?? "Save failed");
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [
    isEdit,
    title,
    slug,
    excerpt,
    body,
    seoTitle,
    seoDescription,
    featuredImageUrl,
    initial,
  ]);

  // Load revisions when edit opens
  React.useEffect(() => {
    if (!isEdit || !initial?.id) return;
    listPageRevisions(initial.id).then(setRevisions);
  }, [isEdit, initial?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.set("title", title);
    fd.set("slug", slug || slugifyInline(title));
    fd.set("excerpt", excerpt);
    fd.set("body", body);
    fd.set("seo_title", seoTitle);
    fd.set("seo_description", seoDescription);
    fd.set("status", status);
    fd.set("featured_image_url", featuredImageUrl);
    if (isEdit && initial?.id) fd.set("id", initial.id);

    try {
      const result = isEdit ? await updatePage(fd) : await createPage(fd);
      // createPage redirects on success; updatePage returns { ok: true }.
      // If we land here without a redirect or error, treat as ok.
      if (result && "error" in result) {
        setError(result.error ?? "Save failed");
      } else {
        refresh();
        if (!isEdit) {
          // The server redirected. If for some reason it didn't, refresh.
          router.refresh();
        }
      }
    } catch (err) {
      // Redirects throw a NEXT_REDIRECT error in Next 15. Swallow it.
      if (err && typeof err === "object" && "digest" in err) {
        throw err;
      }
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSchedule = async () => {
    if (!initial?.id || !scheduleDate) return;
    setScheduleError(null);
    const result = await schedulePagePublish(initial.id, new Date(scheduleDate).toISOString());
    if (!result.ok) {
      setScheduleError(result.error ?? "Schedule failed");
      return;
    }
    refresh();
    router.refresh();
  };

  const handleCancelSchedule = async () => {
    if (!initial?.id) return;
    const result = await cancelScheduledPublish(initial.id);
    if (!result.ok) {
      setScheduleError(result.error ?? "Cancel failed");
      return;
    }
    refresh();
    router.refresh();
  };

  const handlePublishNow = async () => {
    if (!initial?.id) return;
    const result = await publishNowFromSchedule(initial.id);
    if (!result.ok) {
      setScheduleError(result.error ?? "Publish failed");
      return;
    }
    refresh();
    router.refresh();
  };

  const handleRestore = async (revisionId: string) => {
    if (!initial?.id) return;
    if (!confirm("Restore this revision? Current content will be saved as a new revision first.")) return;
    const result = await restorePageRevision(initial.id, revisionId);
    if (!result.ok) {
      setError(result.error ?? "Restore failed");
      return;
    }
    refresh();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="font-medium text-foreground">{title || "(untitled)"}</span>
          <span>·</span>
          <span>/{slug || slugifyInline(title) || "(slug)"}</span>
          <SaveIndicator state={autosaveState} savedAt={savedAt} pending={pending} />
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href="/admin/pages" variant="ghost" size="sm">
            <ArrowLeft className="h-3.5 w-3.5" /> All pages
          </ButtonLink>
          <button
            type="button"
            onClick={() => setRevisionsOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground hover:bg-surface"
          >
            <History className="h-3 w-3" />
            History {revisions.length > 0 && `(${revisions.length})`}
          </button>
          <button
            type="submit"
            disabled={busy || !title.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            {isEdit ? "Save & publish" : "Create page"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column — main editor */}
        <div className="space-y-5 lg:col-span-2">
          {/* Title + slug */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <label className="block text-xs font-medium text-muted-foreground">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                // Auto-slug on first edit only
                if (!slug && !isEdit) {
                  setSlug(slugifyInline(e.target.value));
                }
              }}
              placeholder="Page title"
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <label className="mt-3 block text-xs font-medium text-muted-foreground">
              Slug
            </label>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="page-slug"
                className="block w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <label className="block text-xs font-medium text-muted-foreground">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Short summary shown in previews and search results."
              className="mt-1 block w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Body (rich text editor) */}
          <div className="rounded-xl border border-border bg-card shadow-elev-1">
            <div className="border-b border-border bg-surface px-3 py-2">
              <h3 className="text-xs font-semibold text-foreground">Body</h3>
              <p className="text-[10px] text-muted-foreground">
                Rich text editor — bold, headings, lists, links, images, code.
              </p>
            </div>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Start writing your page content..."
              minHeight="20rem"
            />
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <h3 className="text-xs font-semibold text-foreground">SEO & social</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  SEO title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  maxLength={70}
                  placeholder={title || "Page title"}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {seoTitle.length}/70
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  SEO description
                </label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={2}
                  maxLength={160}
                  placeholder="Shown in search results and social previews."
                  className="mt-1 block w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {seoDescription.length}/160
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — meta + status + schedule + history */}
        <div className="space-y-5">
          {/* Publish card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <h3 className="text-sm font-semibold text-foreground">Publish</h3>
            <div className="mt-3 space-y-2 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  checked={status === "DRAFT"}
                  onChange={() => setStatus("DRAFT")}
                  className="h-3 w-3 accent-primary"
                />
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Draft</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  checked={status === "PUBLISHED"}
                  onChange={() => setStatus("PUBLISHED")}
                  className="h-3 w-3 accent-primary"
                />
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Published</span>
              </label>

              {isEdit && initial?.status === "SCHEDULED" && (
                <div className="mt-3 rounded-md border border-amber-300/40 bg-amber-50/40 p-3 text-xs dark:bg-amber-500/10">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
                    <CalendarClock className="h-3 w-3" />
                    Scheduled
                  </div>
                  <p className="mt-1 text-amber-900/80 dark:text-amber-200/80">
                    Will publish on{" "}
                    {initial.publish_at
                      ? new Date(initial.publish_at).toLocaleString("en-PH")
                      : "(unset)"}
                  </p>
                  <div className="mt-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={handlePublishNow}
                      className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-emerald-700"
                    >
                      Publish now
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelSchedule}
                      className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium text-foreground hover:bg-surface"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {isEdit && initial?.status === "PUBLISHED" && initial?.published_at && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Published {new Date(initial.published_at).toLocaleString("en-PH")}
                </p>
              )}
            </div>
          </div>

          {/* Schedule card (only when DRAFT and edit mode) */}
          {isEdit && initial?.status !== "SCHEDULED" && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
              <h3 className="text-sm font-semibold text-foreground">Schedule</h3>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Publish this page automatically at a future time.
              </p>
              <div className="mt-3 space-y-2">
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="block w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSchedule}
                  disabled={!scheduleDate}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground hover:bg-surface disabled:opacity-50"
                >
                  <CalendarClock className="h-3 w-3" />
                  Schedule
                </button>
                {scheduleError && (
                  <p className="text-[10px] text-destructive">{scheduleError}</p>
                )}
              </div>
            </div>
          )}

          {/* Featured image */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
            <h3 className="text-sm font-semibold text-foreground">
              <ImageIcon className="mr-1 inline h-3.5 w-3.5" />
              Featured image
            </h3>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Shown in social cards and page headers.
            </p>
            <div className="mt-3 space-y-2">
              {featuredImagePreview && (
                <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredImagePreview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImagePreview(null);
                      setFeaturedImageUrl("");
                    }}
                    className="absolute right-1 top-1 rounded bg-background/80 p-1 text-foreground hover:bg-background"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <input
                type="url"
                value={featuredImageUrl}
                onChange={(e) => {
                  setFeaturedImageUrl(e.target.value);
                  setFeaturedImagePreview(e.target.value || null);
                }}
                placeholder="https://..."
                className="block w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <p className="text-[10px] text-muted-foreground">
                Use a URL or paste from the Media library (coming soon).
              </p>
            </div>
          </div>

          {/* Published-by attribution */}
          {isEdit && initial?.published_by && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-elev-1 text-xs">
              <h3 className="font-semibold text-foreground">Publication</h3>
              <p className="mt-2 text-muted-foreground">
                Published by{" "}
                <span className="font-medium text-foreground">
                  {initial.published_by.slice(0, 8)}…
                </span>
              </p>
              {initial?.published_at && (
                <p className="mt-1 text-muted-foreground">
                  On{" "}
                  <time className="text-foreground">
                    {new Date(initial.published_at).toLocaleString("en-PH")}
                  </time>
                </p>
              )}
            </div>
          )}

          {/* Save indicator */}
          <SaveIndicatorCard state={autosaveState} savedAt={savedAt} pending={pending} />
        </div>
      </div>

      {/* Revisions drawer */}
      {revisionsOpen && (
        <RevisionsDrawer
          revisions={revisions}
          onClose={() => setRevisionsOpen(false)}
          onRestore={handleRestore}
        />
      )}
    </form>
  );
}

function SaveIndicator({
  state,
  savedAt,
  pending,
}: {
  state: SaveState;
  savedAt: string | null;
  pending: boolean;
}) {
  if (state === "saving" || pending) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving…
      </span>
    );
  }
  if (state === "saved" && savedAt) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <CheckCircle2 className="h-3 w-3" />
        Saved
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-destructive">
        Save failed
      </span>
    );
  }
  if (savedAt) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        Last saved {new Date(savedAt).toLocaleTimeString("en-PH")}
      </span>
    );
  }
  return null;
}

function SaveIndicatorCard({
  state,
  savedAt,
  pending,
}: {
  state: SaveState;
  savedAt: string | null;
  pending: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-elev-1">
      <SaveIndicator state={state} savedAt={savedAt} pending={pending} />
      <p className="mt-1 text-[10px] text-muted-foreground">
        Drafts auto-save 1.5s after you stop typing. The History button shows
        every saved revision.
      </p>
    </div>
  );
}

function RevisionsDrawer({
  revisions,
  onClose,
  onRestore,
}: {
  revisions: PageRevision[];
  onClose: () => void;
  onRestore: (id: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-md flex-col overflow-hidden bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Revision history
            </h2>
            <span className="rounded-full bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
              {revisions.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {revisions.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-surface p-6 text-center text-xs text-muted-foreground">
              No revisions yet. They appear here after you save changes.
            </p>
          ) : (
            <ol className="space-y-2">
              {revisions.map((r) => {
                const authorName =
                  r.author?.display_name ||
                  [r.author?.first_name, r.author?.last_name].filter(Boolean).join(" ") ||
                  "Unknown";
                return (
                  <li
                    key={r.id}
                    className="rounded-md border border-border bg-background p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          v{r.version}
                          {r.change_note && (
                            <span className="ml-1.5 font-normal text-muted-foreground">
                              — {r.change_note}
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {authorName} · {new Date(r.created_at).toLocaleString("en-PH")}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-muted-foreground">
                          &ldquo;{r.title}&rdquo; /{r.slug}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRestore(r.id)}
                        title="Restore this revision"
                        className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-1 text-[10px] text-foreground hover:bg-surface"
                      >
                        <RotateCcw className="h-2.5 w-2.5" />
                        Restore
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
        <footer className="border-t border-border bg-surface px-4 py-2 text-[10px] text-muted-foreground">
          Restoring creates a new revision with the older content.
        </footer>
      </aside>
    </div>
  );
}

function slugifyInline(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}