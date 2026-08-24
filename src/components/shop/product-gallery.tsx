"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ZoomIn } from "lucide-react";

type Image_ = { src: string; alt: string };

export function ProductGallery({ images, title }: { images: Image_[]; title: string }) {
  const [index, setIndex] = React.useState(0);
  const [zoom, setZoom] = React.useState(false);
  const [origin, setOrigin] = React.useState("50% 50%");

  const fallback: Image_ = { src: "", alt: title };
  const all = images.length > 0 ? images : [fallback];
  const current = all[Math.min(index, all.length - 1)];

  return (
    <div className="grid gap-3">
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-xl border border-border bg-surface",
          current.src && "cursor-zoom-in"
        )}
        onMouseEnter={() => current.src && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={(e) => {
          if (!current.src) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setOrigin(`${x}% ${y}%`);
        }}
      >
        {current.src ? (
          <Image
            src={current.src}
            alt={current.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className={cn(
              "object-contain p-6 transition-transform duration-[var(--duration-slower)] ease-[var(--ease-out-quart)]",
              zoom && "scale-150"
            )}
            style={zoom ? { transformOrigin: origin } : undefined}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-6xl font-light text-muted-foreground/20">+</span>
          </div>
        )}

        {current.src && !zoom && (
          <div
            aria-hidden
            className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-foreground/80 px-2 py-1 text-[11px] font-medium text-background backdrop-blur"
          >
            <ZoomIn className="h-3 w-3" />
            Hover to zoom
          </div>
        )}
      </div>

      {all.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {all.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border bg-surface transition-all",
                i === index
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-foreground/30"
              )}
            >
              {img.src ? (
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="96px"
                  className="object-contain p-2"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-lg text-muted-foreground/30">
                  +
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
