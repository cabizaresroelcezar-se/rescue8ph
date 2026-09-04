"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, X } from "lucide-react";

export function MediaUploader({ bucketName }: { bucketName: string }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [queue, setQueue] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const onFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid: File[] = [];
    const errors: string[] = [];
    for (const f of arr) {
      if (!f.type.startsWith("image/")) errors.push(`${f.name}: not an image`);
      else if (f.size > 10 * 1024 * 1024) errors.push(`${f.name}: over 10 MB`);
      else valid.push(f);
    }
    if (errors.length) setError(errors.join(" · "));
    else setError(null);
    setQueue((q) => [...q, ...valid]);
  };

  const onSubmit = async () => {
    if (!queue.length) return;
    setError(null);
    setSuccess(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("bucket", bucketName);
    for (const file of queue) {
      formData.append("files", file);
    }

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        setSuccess(
          `Uploaded ${data.uploaded || queue.length} file${queue.length === 1 ? "" : "s"} successfully`,
        );
        setQueue([]);
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Dropzone */}
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
          "group relative cursor-pointer rounded-xl border-2 border-dashed bg-card p-6 text-center transition-all " +
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
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <Upload className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-semibold text-foreground">
          {dragOver ? "Drop images here" : "Upload to " + bucketName}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, WEBP, or GIF · up to 10 MB each
        </p>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
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
          <ul className="flex flex-wrap gap-2">
            {queue.map((file, i) => (
              <li
                key={file.name + i}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1"
              >
                <span className="truncate text-xs font-medium text-foreground">
                  {file.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  onClick={() => setQueue((q) => q.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setQueue([])}
              disabled={uploading}
              className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-secondary disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={uploading}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-elev-1 hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-3 w-3" /> Upload {queue.length} file{queue.length === 1 ? "" : "s"}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Status */}
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-700 dark:text-emerald-300">
          {success}
        </p>
      )}
    </div>
  );
}