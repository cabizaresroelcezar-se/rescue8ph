"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Eye, EyeOff } from "lucide-react";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { updateSetting } from "@/features/settings/actions";

interface Setting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  is_public: boolean;
}

const TYPE_HINT: Record<string, string> = {
  string: "Plain text. Use when the value is a single line of text.",
  number: "Number (integer or decimal). For prices, use the number type.",
  boolean: "true or false. Toggle on/off.",
  object: "JSON object with named fields (e.g. { \"street\": \"...\", \"city\": \"...\" }).",
  array: "JSON array of values (e.g. [\"a\", \"b\", \"c\"]).",
};

function inferType(v: unknown): "string" | "number" | "boolean" | "object" | "array" | "null" {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (typeof v === "object") return "object";
  if (typeof v === "number") return "number";
  if (typeof v === "boolean") return "boolean";
  return "string";
}

export function SettingsTable({ initialSettings }: { initialSettings: Setting[] }) {
  const router = useRouter();
  const [settings, setSettings] = React.useState(initialSettings);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editedValue, setEditedValue] = React.useState<string>("");
  const [editedType, setEditedType] = React.useState<
    "string" | "number" | "boolean" | "object" | "array"
  >("string");
  const [editedDesc, setEditedDesc] = React.useState<string>("");
  const [editedPublic, setEditedPublic] = React.useState<boolean>(false);
  const [jsonError, setJsonError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [savedId, setSavedId] = React.useState<string | null>(null);
  const { refresh } = useDelayedRefresh(400);

  // Keep local state in sync if server data changes
  React.useEffect(() => {
    // Sync edited state from server on initial mount or when the settings list reference changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(initialSettings);
  }, [initialSettings]);

  function startEdit(s: Setting) {
    setEditingId(s.id);
    const t = inferType(s.value);
    setEditedType(t === "null" ? "string" : t);
    setEditedValue(
      t === "object" || t === "array" ? JSON.stringify(s.value, null, 2) : String(s.value),
    );
    setEditedDesc(s.description ?? "");
    setEditedPublic(s.is_public);
    setJsonError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setJsonError(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    setJsonError(null);

    let parsed: unknown;
    if (editedType === "string") {
      parsed = editedValue;
    } else if (editedType === "number") {
      const n = Number(editedValue);
      if (Number.isNaN(n)) {
        setJsonError("Not a valid number.");
        return;
      }
      parsed = n;
    } else if (editedType === "boolean") {
      if (editedValue !== "true" && editedValue !== "false") {
        setJsonError('Boolean must be "true" or "false".');
        return;
      }
      parsed = editedValue === "true";
    } else if (editedType === "object" || editedType === "array") {
      try {
        parsed = JSON.parse(editedValue);
        if (editedType === "object" && (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))) {
          setJsonError("Must be a JSON object.");
          return;
        }
        if (editedType === "array" && !Array.isArray(parsed)) {
          setJsonError("Must be a JSON array.");
          return;
        }
      } catch (e) {
        setJsonError(`Invalid JSON: ${(e as Error).message}`);
        return;
      }
    }

    setBusy(true);
    const result = await updateSetting(editingId, {
      value: parsed,
      description: editedDesc.trim() || null,
      is_public: editedPublic,
    });
    setBusy(false);

    if (result?.error) {
      setJsonError(result.error);
      return;
    }

    setSavedId(editingId);
    setEditingId(null);
    router.refresh();
    refresh();
    setTimeout(() => setSavedId(null), 2000);
  }

  if (settings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">No settings configured yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {settings.map((s) => {
        const isEditing = editingId === s.id;
        const wasSaved = savedId === s.id;
        const t = inferType(s.value);

        return (
          <div
            key={s.id}
            className={
              "rounded-xl border bg-card p-4 shadow-elev-1 transition-colors " +
              (isEditing
                ? "border-primary/50"
                : wasSaved
                  ? "border-green-300"
                  : "border-border")
            }
          >
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <code className="rounded-md bg-secondary px-2 py-1 font-mono text-xs font-semibold text-foreground">
                    {s.key}
                  </code>
                  <span className="text-xs text-muted-foreground">
                    Editing
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                  <div>
                    <label className="text-xs font-medium text-foreground">
                      Type
                    </label>
                    <select
                      value={editedType}
                      onChange={(e) =>
                        setEditedType(
                          e.target.value as "string" | "number" | "boolean" | "object" | "array",
                        )
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    >
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="object">object</option>
                      <option value="array">array</option>
                    </select>
                    <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                      {TYPE_HINT[editedType]}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">
                      Value
                    </label>
                    {editedType === "boolean" ? (
                      <select
                        value={editedValue}
                        onChange={(e) => setEditedValue(e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : editedType === "object" || editedType === "array" ? (
                      <textarea
                        value={editedValue}
                        onChange={(e) => setEditedValue(e.target.value)}
                        rows={6}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                      />
                    ) : (
                      <input
                        type={editedType === "number" ? "number" : "text"}
                        value={editedValue}
                        onChange={(e) => setEditedValue(e.target.value)}
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
                    value={editedDesc}
                    onChange={(e) => setEditedDesc(e.target.value)}
                    placeholder="What is this setting used for?"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editedPublic}
                    onChange={(e) => setEditedPublic(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                  />
                  <span>Public (readable by anonymous visitors)</span>
                </label>

                {jsonError && (
                  <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    {jsonError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={busy}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    {busy ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="rounded-md bg-secondary px-2 py-1 font-mono text-xs font-semibold text-foreground">
                      {s.key}
                    </code>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 font-mono text-[10px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                      {t}
                    </span>
                    {s.is_public ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        <Eye className="h-2.5 w-2.5" /> Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300">
                        <EyeOff className="h-2.5 w-2.5" /> Internal
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                  )}
                  <pre className="mt-2 max-h-32 overflow-auto rounded-md bg-secondary/60 px-3 py-2 font-mono text-xs text-foreground">
                    {JSON.stringify(s.value, null, 2)}
                  </pre>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {wasSaved && (
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      Saved!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => startEdit(s)}
                    className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}