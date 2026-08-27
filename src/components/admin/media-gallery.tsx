"use client";

import * as React from "react";
import {
  MediaPreviewModal,
  type MediaPreviewItem,
} from "@/components/admin/media-preview-modal";
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
  /** Files in the active bucket. Folders come through with `fullPath` ending in `/`. */
  files: MediaFileData[];
  bucketName: string;
}

export function MediaGallery({ files, bucketName }: MediaGalleryProps) {
  const [active, setActive] = React.useState<MediaPreviewItem | null>(null);

  function handleDelete(item: MediaPreviewItem) {
    return deleteMediaFile(bucketName, item.fullPath);
  }

  // Don't early-return null here — the parent passes a `<FadeIn>` that
  // should always render *something*. If files is empty, we still want
  // the FadeIn animation to fire and the surrounding layout to be stable.
  // The parent's ternary already handles the empty case.

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {files.map((file) => (
          <button
            key={file.fullPath}
            type="button"
            onClick={() => setActive(file)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elev-3"
          >
            <div className="relative h-[calc(100%-3rem)] w-full overflow-hidden bg-surface">
              {file.contentType?.startsWith("image/") ||
              /\.(png|jpe?g|gif|webp|avif|bmp|tiff?|svg)$/i.test(
                file.fileName,
              ) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={file.publicUrl}
                  alt={file.fileName}
                  loading="lazy"
                  className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                  <span className="text-xs">No preview</span>
                </div>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 border-t border-border bg-card p-2">
              <p className="truncate text-[10px] font-medium text-foreground">
                {file.fileName.split("/").pop()}
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
        ))}
      </div>

      <MediaPreviewModal
        key={active?.fullPath ?? "empty"}
        item={active}
        onClose={() => setActive(null)}
        onDelete={handleDelete}
        bucketName={bucketName}
      />
    </>
  );
}
