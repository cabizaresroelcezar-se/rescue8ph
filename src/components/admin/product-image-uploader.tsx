"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Upload,
  Star,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  uploadProductImages,
  deleteProductImage,
  setPrimaryProductImage,
} from "@/features/products/actions";
import { getMediaUrl } from "@/lib/media";

type ProductImage = {
  id: string;
  storagePath: string;
  altText: string | null;
  isPrimary: boolean;
};

type Props = {
  productId: string;
  images: ProductImage[];
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function ProductImageUploader({ productId, images }: Props) {
  const router = useRouter();
  const [queue, setQueue] = React.useState<File[]>([]);
  const [alts, setAlts] = React.useState<Record<string, string>>({});
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [primaryId, setPrimaryId] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid: File[] = [];
    const errors: string[] = [];
    for (const f of arr) {
      if (!f.type.startsWith("image/")) errors.push(`${f.name}: not an image`);
      else if (f.size > MAX_FILE_SIZE) errors.push(`${f.name}: over 5 MB`);
      else valid.push(f);
    }
    if (errors.length) setError(errors.join(" \u00b7 "));
    setQueue((q) => [...q, ...valid]);
  };

  const onSubmit = async () => {
    if (!queue.length) return;
    setError(null);
    setSuccess(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("productId", productId);
    for (const file of queue) {
      fd.append("files", file);
      if (alts[file.name]) fd.append(`alt_${file.name}`, alts[file.name]);
    }
    try {
      const res = await uploadProductImages(fd);
      if (res.error) setError(res.error);
      else {
        setSuccess(
          `Uploaded ${res.uploaded} image${res.uploaded === 1 ? "" : "s"}${
            res.errors?.length ? ` (${res.errors.length} failed)` : ""
          }`,
        );
        setQueue([]);
        setAlts({});
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await deleteProductImage(id);
      if (res.error) setError(res.error);
      else router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  const onPrimary = async (id: string) => {
    setPrimaryId(id);
    try {
      const res = await setPrimaryProductImage(id);
      if (res.error) setError(res.error);
      else router.refresh();
    } finally {
      setPrimaryId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag and drop dropzone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onFiles(e.dataTransfer.files);
        }}
        className={
          "group relative cursor-pointer rounded-xl border-2 border-dashed bg-card p-8 text-center transition-all " +
          (dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/40 hover:bg-secondary/50")
        }
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => e.target.files && onFiles(e.target.files)}
        />
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <Upload className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm font-semibold text-foreground">
          {dragOver ? "Drop your images here" : "Drag & drop or click to upload"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, WEBP, or GIF \u00b7 up to 5 MB each \u00b7 multiple files OK
        </p>
      </div>

      {/* Pending upload queue */}
      {queue.length > 0 && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Ready to upload ({queue.length})
            </p>
            <button
              type="button"
              onClick={() => setQueue([])}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {queue.map((file, i) => (
              <li
                key={file.name + i}
                className="flex items-start gap-3 rounded-lg border border-border bg-background p-2"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                  <input
                    type="text"
                    value={alts[file.name] ?? ""}
                    onChange={(e) =>
                      setAlts((a) => ({ ...a, [file.name]: e.target.value }))
                    }
                    placeholder="Alt text (optional)"
                    className="mt-1 h-7 w-full rounded border border-input bg-background px-2 text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setQueue([])}
              disabled={uploading}
              className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-secondary disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={uploading}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-elev-1 hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading\u2026
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" /> Upload {queue.length} image
                  {queue.length === 1 ? "" : "s"}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Status messages */}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success-foreground">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Existing images */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-eyebrow">
            {images.length} image{images.length === 1 ? "" : "s"}
          </p>
          {images.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Click the star to set as primary
            </p>
          )}
        </div>
        {images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              No images yet. Upload one above to get started.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((img) => {
              const url = getMediaUrl(img.storagePath);
              return (
                <li
                  key={img.id}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-surface">
                    {url ? (
                      <Image
                        src={url}
                        alt={img.altText || "Product image"}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
                        className="object-contain p-3"
                      />
                    ) : (
                      <ImageIcon className="m-auto h-8 w-8 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="border-t border-border p-3">
                    <p className="line-clamp-2 text-xs font-medium text-foreground">
                      {img.altText || "Untitled image"}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-muted-foreground">
                      {img.storagePath.split("/").pop()}
                    </p>
                  </div>
                  <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => onPrimary(img.id)}
                      disabled={img.isPrimary || primaryId === img.id}
                      aria-label="Set as primary"
                      className={
                        "flex h-8 w-8 items-center justify-center rounded-md shadow-elev-2 transition-colors " +
                        (img.isPrimary
                          ? "bg-amber-500 text-white"
                          : "bg-background/90 text-foreground hover:bg-amber-500 hover:text-white")
                      }
                    >
                      {primaryId === img.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Star className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(img.id)}
                      disabled={deletingId === img.id}
                      aria-label="Delete image"
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-background/90 text-destructive shadow-elev-2 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      {deletingId === img.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  {img.isPrimary && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-elev-1">
                      <Star className="h-2.5 w-2.5" />
                      Primary
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}