"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { createSetting } from "@/features/settings/actions";

export function NewSettingButton() {
  const router = useRouter();
  const { refresh } = useDelayedRefresh(400);
  const [open, setOpen] = React.useState(false);
  const [key, setKey] = React.useState("");
  const [valueType, setValueType] = React.useState<
    "string" | "number" | "boolean" | "object" | "array"
  >("string");
  const [value, setValue] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  function reset() {
    setKey("");
    setValueType("string");
    setValue("");
    setDescription("");
    setIsPublic(false);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let parsed: unknown;
    if (valueType === "string") parsed = value;
    else if (valueType === "number") {
      const n = Number(value);
      if (Number.isNaN(n)) {
        setError("Not a valid number.");
        return;
      }
      parsed = n;
    } else if (valueType === "boolean") {
      if (value !== "true" && value !== "false") {
        setError('Boolean must be "true" or "false".');
        return;
      }
      parsed = value === "true";
    } else {
      try {
        parsed = JSON.parse(value);
        if (valueType === "object" && (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))) {
          setError("Must be a JSON object.");
          return;
        }
        if (valueType === "array" && !Array.isArray(parsed)) {
          setError("Must be a JSON array.");
          return;
        }
      } catch (err) {
        setError(`Invalid JSON: ${(err as Error).message}`);
        return;
      }
    }

    setBusy(true);
    const result = await createSetting({
      key,
      value: parsed,
      description: description.trim() || null,
      is_public: isPublic,
    });
    setBusy(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    reset();
    router.refresh();
    refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        New setting
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg space-y-4 rounded-2xl border border-border bg-card p-6 shadow-elev-3"
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground">New setting</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Configuration keys are referenced by the storefront and admin.
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground">Key</label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="e.g. shipping_rate, social_twitter, support_email"
            required
            maxLength={64}
            pattern="[a-z][a-z0-9_]*"
            autoFocus
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
            Lowercase letters, digits, and underscores. Must start with a letter.
          </p>
        </div>

        <div className="grid grid-cols-[120px_1fr] gap-3">
          <div>
            <label className="text-xs font-medium text-foreground">Type</label>
            <select
              value={valueType}
              onChange={(e) =>
                setValueType(
                  e.target.value as "string" | "number" | "boolean" | "object" | "array",
                )
              }
              className="mt-1 w-full rounded-md border border-input bg-background px-2 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="object">object</option>
              <option value="array">array</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Value</label>
            {valueType === "boolean" ? (
              <select
                value={value || "false"}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-2 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : valueType === "object" || valueType === "array" ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={4}
                placeholder={valueType === "object" ? '{ "key": "value" }' : '["a", "b"]'}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            ) : (
              <input
                type={valueType === "number" ? "number" : "text"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground">
            Description (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this setting used for?"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
          />
          <span>Public (readable by anonymous visitors)</span>
        </label>

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              reset();
            }}
            className="h-9 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !key.trim()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create
          </button>
        </div>
      </form>
    </div>
  );
}