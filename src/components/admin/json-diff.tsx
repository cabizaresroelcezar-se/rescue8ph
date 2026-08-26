"use client";

import * as React from "react";

/**
 * Renders a key-by-key diff between two JSON objects. For each key present
 * in either, show the old value (red strike), the new value (green), or
 * "added"/"removed" badges. Keys are sorted for stable visual layout.
 */
export interface JsonDiffProps {
  oldValues: Record<string, unknown> | null | undefined;
  newValues: Record<string, unknown> | null | undefined;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function valueLabel(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function JsonDiff({ oldValues, newValues }: JsonDiffProps) {
  const allKeys = React.useMemo(() => {
    const set = new Set<string>();
    if (isObject(oldValues)) for (const k of Object.keys(oldValues)) set.add(k);
    if (isObject(newValues)) for (const k of Object.keys(newValues)) set.add(k);
    return [...set].sort();
  }, [oldValues, newValues]);

  if (allKeys.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background p-3 text-center text-xs text-muted-foreground">
        No payload data recorded for this action.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <table className="w-full text-xs">
        <thead className="border-b border-border bg-surface text-left text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-1.5 font-medium">Field</th>
            <th className="px-3 py-1.5 font-medium">Before</th>
            <th className="px-3 py-1.5 font-medium">After</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {allKeys.map((key) => {
            const oldV = isObject(oldValues) ? oldValues[key] : undefined;
            const newV = isObject(newValues) ? newValues[key] : undefined;
            const changed = JSON.stringify(oldV) !== JSON.stringify(newV);
            return (
              <tr key={key} className={changed ? "bg-amber-50/30 dark:bg-amber-500/5" : ""}>
                <td className="px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
                  {key}
                </td>
                <td className="px-3 py-1.5 font-mono text-[11px] text-rose-700 line-through dark:text-rose-300">
                  {valueLabel(oldV)}
                </td>
                <td className="px-3 py-1.5 font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                  {valueLabel(newV)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}