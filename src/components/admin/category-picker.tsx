"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Search, X } from "lucide-react";
import { setProductCategories } from "@/features/products/actions";

/**
 * Multi-select category picker for the admin product form.
 *
 * - Server-fetched list of categories (PUBLISHED or DRAFT, all visible
 *   to staff).
 * - Local search filter for fast navigation in long lists.
 * - Selected IDs persist across re-renders; on change, save the
 *   full selection (replace-all) via setProductCategories().
 * - Shows a brief "Saving..." indicator while the server action runs.
 */

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";
  parent_id?: string | null;
}

export interface CategoryPickerProps {
  productId: string;
  categories: CategoryOption[];
  initialSelectedIds: string[];
}

export function CategoryPicker({
  productId,
  categories,
  initialSelectedIds,
}: CategoryPickerProps) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(initialSelectedIds),
  );
  const [search, setSearch] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedTick, setSavedTick] = React.useState(0);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [categories, search]);

  // Sort: selected first, then by name
  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aSel = selected.has(a.id);
      const bSel = selected.has(b.id);
      if (aSel !== bSel) return aSel ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [filtered, selected]);

  const toggle = async (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    setSaving(true);
    setError(null);
    const result = await setProductCategories(productId, Array.from(next));
    setSaving(false);
    if (!result.ok) {
      // Revert
      setSelected(selected);
      setError(result.error ?? "Failed to save categories");
    } else {
      setSavedTick((t) => t + 1);
      // Soft refresh so the admin list / storefront picks up the change
      router.refresh();
    }
  };

  const selectedList = categories.filter((c) => selected.has(c.id));

  return (
    <div className="space-y-3">
      {/* Selected chips */}
      <div className="min-h-[2rem]">
        {selectedList.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No categories assigned. Pick from the list below.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedList.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/25"
                title="Click to remove"
              >
                {c.name}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search + status indicator */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-md border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1 text-xs">
          {saving ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Saving…</span>
            </>
          ) : savedTick > 0 && !error ? (
            <>
              <Check className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600">Saved</span>
            </>
          ) : null}
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* Category list */}
      <div className="max-h-64 overflow-y-auto rounded-md border border-border bg-background">
        {sorted.length === 0 ? (
          <p className="p-4 text-center text-xs text-muted-foreground">
            No categories match &ldquo;{search}&rdquo;.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {sorted.map((c) => {
              const isSelected = selected.has(c.id);
              const statusTone =
                c.status === "PUBLISHED"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : c.status === "DRAFT"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300";
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => toggle(c.id)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition hover:bg-surface ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </span>
                      <span className="font-medium text-foreground">{c.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        /{c.slug}
                      </span>
                    </span>
                    <span
                      className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide ${statusTone}`}
                    >
                      {c.status}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground">
        {selected.size} of {categories.length} categories selected · changes save automatically
      </p>
    </div>
  );
}