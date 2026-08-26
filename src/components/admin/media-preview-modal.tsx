"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X, Copy, Check, Trash2, Calendar, FileIcon, ExternalLink, AlertTriangle } from "lucide-react";
import Image from "next/image";

export interface MediaPreviewItem {
  /** Storage key path, e.g. "products/abc-uuid/r8prod-foo.jpg" */
  fullPath: string;
  /** Just the filename portion */
  fileName: string;
  /** Public URL to the file */
  publicUrl: string;
  /** Public MIME type (best-effort — Supabase doesn't always store this) */
  contentType?: string | null;
  /** Bytes */
  size?: number | null;
  /** ISO date string */
  createdAt?: string | null;
  /** If file is an image and we know its pixel dimensions */
  width?: number | null;
  height?: number | null;
}

export interface MediaPreviewModalProps {
  item: MediaPreviewItem | null;
  onClose: () => void;
  onDelete?: (
    item: MediaPreviewItem,
  ) => Promise<{ ok: boolean; error?: string }> | void;
  bucketName: string;
}

export function MediaPreviewModal({
  item,
  onClose,
  onDelete,
  bucketName,
}: MediaPreviewModalProps) {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Close on Escape
  React.useEffect(() => {
    if (!item) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [item, onClose]);

  if (!item) return null;

  const isImage =
    item.contentType?.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|avif|bmp|tiff?|svg)$/i.test(item.fileName);

  async function handleCopy() {
    setError(null);
    try {
      await navigator.clipboard.writeText(item!.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for older browsers / unsecured context
      const input = document.createElement("input");
      input.value = item!.publicUrl;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        setError("Copy failed — select the URL manually.");
      } finally {
        document.body.removeChild(input);
      }
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (
      !window.confirm(
        `Delete ${item!.fileName} from ${bucketName}? This cannot be undone.`,
      )
    )
      return;
    setDeleting(true);
    setError(null);
    try {
      const result = await onDelete(item!);
      // Result of {ok: false} means the action refused; keep modal open
      // and surface the error inline instead of closing.
      if (result && result.ok === false) {
        setError(result.error ?? "Delete failed");
        setDeleting(false);
        return;
      }
      onClose();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setDeleting(false);
    }
  }

  const sizeLabel =
    item.size != null
      ? item.size < 1024
        ? `${item.size} B`
        : item.size < 1024 * 1024
          ? `${(item.size / 1024).toFixed(1)} KB`
          : `${(item.size / 1024 / 1024).toFixed(2)} MB`
      : null;

  const dateLabel = item.createdAt
    ? new Date(item.createdAt).toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${item.fileName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-background shadow-elev-4">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <h2 className="truncate font-semibold text-foreground">
            {item.fileName}
          </h2>
          <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {bucketName}
          </span>
          <div className="ml-auto flex items-center gap-1">
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                title="Delete from storage"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                {deleting ? (
                  <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-destructive/30 border-t-destructive" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            <a
              href={item.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new tab"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex max-h-[70vh] flex-col sm:flex-row">
          <div className="relative flex-1 overflow-auto bg-secondary/40 p-6">
            {isImage ? (
              <div className="relative mx-auto max-h-[60vh] w-full">
                <Image
                  src={item.publicUrl}
                  alt={item.fileName}
                  width={item.width ?? 1200}
                  height={item.height ?? 1200}
                  unoptimized
                  className="mx-auto max-h-[60vh] w-auto rounded-lg object-contain"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
            ) : (
              <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
                <FileIcon className="h-16 w-16" />
                <p className="text-sm font-medium">No inline preview available</p>
                <p className="text-xs">{item.contentType ?? "Unknown file type"}</p>
                <a
                  href={item.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Open in new tab
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          {/* Metadata sidebar */}
          <aside className="w-full shrink-0 space-y-4 border-t border-border bg-card p-4 sm:w-72 sm:border-l sm:border-t-0">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Public URL
              </h3>
              <div className="mt-2 flex items-stretch gap-1">
                <input
                  type="text"
                  readOnly
                  value={item.publicUrl}
                  onClick={(e) => e.currentTarget.select()}
                  className="min-w-0 flex-1 truncate rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-[10px] text-foreground"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                  title="Copy URL"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            <dl className="space-y-2 text-xs">
              {item.contentType && (
                <div>
                  <dt className="font-medium text-muted-foreground">Type</dt>
                  <dd className="mt-0.5 font-mono text-foreground">
                    {item.contentType}
                  </dd>
                </div>
              )}
              {sizeLabel && (
                <div>
                  <dt className="font-medium text-muted-foreground">Size</dt>
                  <dd className="mt-0.5 text-foreground">{sizeLabel}</dd>
                </div>
              )}
              {(item.width ?? item.height) && (
                <div>
                  <dt className="font-medium text-muted-foreground">Dimensions</dt>
                  <dd className="mt-0.5 text-foreground">
                    {item.width ?? "?"} × {item.height ?? "?"}
                  </dd>
                </div>
              )}
              {dateLabel && (
                <div>
                  <dt className="flex items-center gap-1 font-medium text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Uploaded
                  </dt>
                  <dd className="mt-0.5 text-foreground">{dateLabel}</dd>
                </div>
              )}
              <div>
                <dt className="font-medium text-muted-foreground">Path</dt>
                <dd className="mt-0.5 break-all font-mono text-[10px] text-foreground">
                  {item.fullPath}
                </dd>
              </div>
            </dl>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
