"use client";

import * as React from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileFilters({
  categories,
  activeCategory,
  min,
  max,
}: {
  categories: { name: string; slug: string }[];
  activeCategory?: string;
  min?: string;
  max?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [localMin, setLocalMin] = React.useState(min ?? "");
  const [localMax, setLocalMax] = React.useState(max ?? "");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground shadow-elev-1 transition-colors hover:bg-secondary lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background shadow-elev-4",
              "animate-slide-in-right"
            )}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-4 py-3">
              <h2 className="text-base font-semibold">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6 p-4">
              <div>
                <h3 className="text-sm font-semibold">Categories</h3>
                <ul className="mt-2 space-y-1.5 text-sm">
                  <li>
                    <Link
                      href="/products"
                      onClick={() => setOpen(false)}
                      className={
                        "block rounded-md px-2.5 py-1.5 " +
                        (!activeCategory
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-secondary")
                      }
                    >
                      All
                    </Link>
                  </li>
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/products?category=${c.slug}`}
                        onClick={() => setOpen(false)}
                        className={
                          "block rounded-md px-2.5 py-1.5 " +
                          (activeCategory === c.slug
                            ? "bg-primary/10 font-semibold text-primary"
                            : "text-muted-foreground hover:bg-secondary")
                        }
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <form action="/products" method="get" className="space-y-3">
                {activeCategory && (
                  <input type="hidden" name="category" value={activeCategory} />
                )}
                <h3 className="text-sm font-semibold">Price (PHP)</h3>
                <div className="flex items-center gap-2">
                  <input
                    name="min"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={localMin}
                    onChange={(e) => setLocalMin(e.target.value)}
                    placeholder="Min"
                    className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                  />
                  <span className="text-muted-foreground">–</span>
                  <input
                    name="max"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={localMax}
                    onChange={(e) => setLocalMax(e.target.value)}
                    placeholder="Max"
                    className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                >
                  Apply
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
