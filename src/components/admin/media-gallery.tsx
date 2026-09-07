"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Trash2, ExternalLink, FileIcon, AlertTriangle, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { deleteMediaFile } from "@/features/media/actions";

export interface MediaFileData {
  fullPath: string;
  fileName: string;
  publicUrl: string;
  contentType?: string | null;
  size?: number | null;
  createdAt?: string | null;
}

export interface MediaGalleryProps {
  files: MediaFileData[];
  bucketName: string;
}

export function MediaGallery({ files, bucketName }: MediaGalleryProps) {
  const [active, setActive] = React.useState<MediaFileData | null>(files[0] ?? null);
  const { toast } = useToast();
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const isImage = (f: MediaFileData | null) => {
    if (!f) return false;
    return f.contentType?.startsWith("image/") ||
      /\.(png|jpe?g|gif|webp|avif|bmp|tiff?|svg)$/i.test(f.fileName);
  };

  async function handleCopy() {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast({ title: "URL copied", variant: "success" });
    } catch {
      toast({ title: "Copy failed", description: "Select the URL manually", variant: "error" });
    }
  }

  async function handleDelete() {
    if (!active) return;
    if (!confirm(`Delete ${active.fileName}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const result = await deleteMediaFile(bucketName, active.fullPath);
      if (result.ok) {
        toast({ title: "File deleted", description: active.fileName, variant: "success" });
        setActive(null);
        router.refresh();
      } else {
        toast({ title: "Delete failed", description: result.error, variant: "error" });
      }
    } catch (e) {
      toast({ title: "Delete failed", description: e instanceof Error ? e.message : "Unknown error", variant: "error" });
    } finally {
      setDeleting(false);
    }
  }

  const sizeLabel = active?.size != null
    ? active.size < 1024
      ? `${active.size} B`
      : active.size < 1024 * 1024
        ? `${(active.size / 1024).toFixed(1)} KB`
        : `${(active.size / 1024 / 1024).toFixed(2)} MB`
    : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      {/* Gallery grid */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {files.map((file) => {
          const img = isImage(file);
          const isActive = active?.fullPath === file.fullPath;
          return (
            <button
              key={file.fullPath}
              type="button"
              onClick={() => setActive(file)}
              className={`group relative aspect-square overflow-hidden rounded-xl border text-left transition-all hover:shadow-elev-2 ${
                isActive ? "border-primary ring-2 ring-primary/30" : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="relative h-[calc(100%-2.5rem)] w-full overflow-hidden bg-surface">
                {img ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={file.publicUrl}
                    alt={file.fileName}
                    loading="lazy"
                    className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                    <FileIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 border-t border-border bg-card p-2">
                <p className="truncate text-[10px] font-medium text-foreground">
                  {file.fileName}
                </p>
                {file.size != null && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {file.size < 1024 * 1024
                      ? `${Math.round(file.size / 1024)} KB`
                      : `${(file.size / 1024 / 1024).toFixed(1)} MB`}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Right panel: preview + details */}
      {active && (
        <aside className="sticky top-4 space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Preview</h3>
            <div className="flex items-center gap-1">
              <a
                href={active.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new tab"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                title="Delete file"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Image preview */}
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {isImage(active) ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={active.publicUrl}
                alt={active.fileName}
                className="mx-auto max-h-[300px] w-auto object-contain p-2"
              />
            ) : (
              <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
                <FileIcon className="h-12 w-12" />
                <p className="text-xs">No inline preview</p>
                <a
                  href={active.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Open in new tab
                </a>
              </div>
            )}
          </div>

          {/* File info */}
            <div className="space-y-2 text-xs">
            <div>
              <p className="break-all text-xs font-medium text-foreground">{active.fileName}</p>
              <p className="mt-0.5 break-all text-[10px] text-muted-foreground">{active.fullPath}</p>
            </div>
            {active.contentType && (
              <p className="text-muted-foreground">
                Type: <span className="font-mono text-foreground">{active.contentType}</span>
              </p>
            )}
            {sizeLabel && (
              <p className="text-muted-foreground">
                Size: <span className="text-foreground">{sizeLabel}</span>
              </p>
            )}
            {active.createdAt && (
              <p className="text-muted-foreground">
                Uploaded: <span className="text-foreground">
                  {new Date(active.createdAt).toLocaleString("en-PH", {
                    year: "numeric", month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </p>
            )}
          </div>

          {/* Public URL copy field */}
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Public URL
            </p>
            <div className="flex items-stretch gap-1">
              <input
                type="text"
                readOnly
                value={active.publicUrl}
                onClick={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 truncate rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-[10px] text-foreground"
              />
              <button
                type="button"
                onClick={handleCopy}
                title="Copy URL"
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}