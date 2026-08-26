"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, Trash2, Pencil, Globe, EyeOff, Lock } from "lucide-react";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import {
  addOrderNote,
  editOrderNote,
  deleteOrderNote,
  type NoteVisibility,
  type OrderNote,
} from "@/features/order-notes/actions";
import { formatDateTimePh } from "@/lib/format";

const EDIT_WINDOW_MS = 5 * 60 * 1000;

interface OrderNotesTimelineProps {
  orderId: string;
  initialNotes: OrderNote[];
  currentUserId: string;
  canDeleteAny: boolean;
}

export function OrderNotesTimeline({
  orderId,
  initialNotes,
  currentUserId,
  canDeleteAny,
}: OrderNotesTimelineProps) {
  const router = useRouter();
  const { refresh } = useDelayedRefresh(400);
  const [notes, setNotes] = React.useState<OrderNote[]>(initialNotes);
  const [body, setBody] = React.useState("");
  const [visibility, setVisibility] = React.useState<NoteVisibility>("INTERNAL");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingBody, setEditingBody] = React.useState("");
  // Suppress the lint rule: we want a stable 'now' timestamp for the
  // edit-window check. Recomputing on every render would make the UI
  // flicker (the edit button would appear/disappear each re-render).
  // eslint-disable-next-line react-hooks/purity
  const now = React.useMemo(() => Date.now(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    const result = await addOrderNote(orderId, trimmed, visibility);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Failed to add note");
      return;
    }
    setBody("");
    setNotes((prev) => [result.note!, ...prev]);
    refresh();
    // Hard refresh to re-pull with author profile join
    router.refresh();
  };

  const handleEditStart = (note: OrderNote) => {
    setEditingId(note.id);
    setEditingBody(note.body);
    setError(null);
  };

  const handleEditSave = async (noteId: string) => {
    const trimmed = editingBody.trim();
    if (!trimmed) return;
    setError(null);
    const result = await editOrderNote(noteId, trimmed);
    if (!result.ok) {
      setError(result.error ?? "Failed to edit note");
      return;
    }
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, body: trimmed, updated_at: new Date().toISOString() } : n)),
    );
    setEditingId(null);
    setEditingBody("");
    router.refresh();
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    setError(null);
    const result = await deleteOrderNote(noteId);
    if (!result.ok) {
      setError(result.error ?? "Failed to delete note");
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    router.refresh();
  };

  const canEdit = (note: OrderNote) =>
    note.author_id === currentUserId &&
    now - new Date(note.created_at).getTime() < EDIT_WINDOW_MS;

  const canDelete = (note: OrderNote) =>
    note.author_id === currentUserId || canDeleteAny;

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-elev-1">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Internal notes</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Conversation thread for staff coordination on this order. Not shown to customers unless marked &quot;Customer visible&quot;.
          </p>
        </div>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </span>
      </header>

      {/* Add form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={4000}
          placeholder="Add a note for the team..."
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          disabled={submitting}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground has-[:checked]:border-primary">
              <input
                type="radio"
                name="visibility"
                value="INTERNAL"
                checked={visibility === "INTERNAL"}
                onChange={() => setVisibility("INTERNAL")}
                className="h-3 w-3 accent-primary"
              />
              <Lock className="h-3 w-3 text-muted-foreground" />
              Internal
            </label>
            <label className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground has-[:checked]:border-primary">
              <input
                type="radio"
                name="visibility"
                value="CUSTOMER_VISIBLE"
                checked={visibility === "CUSTOMER_VISIBLE"}
                onChange={() => setVisibility("CUSTOMER_VISIBLE")}
                className="h-3 w-3 accent-primary"
              />
              <Globe className="h-3 w-3 text-muted-foreground" />
              Customer visible
            </label>
          </div>
          <button
            type="submit"
            disabled={!body.trim() || submitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
            {submitting ? "Posting..." : "Post note"}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}

      {/* Timeline */}
      {notes.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border bg-surface p-6 text-center text-xs text-muted-foreground">
          No notes yet. The first note above will be posted as {visibility === "INTERNAL" ? "an internal" : "a customer-visible"} entry.
        </p>
      ) : (
        <ol className="mt-6 space-y-3">
          {notes.map((n) => {
            const authorName =
              n.author?.display_name ||
              [n.author?.first_name, n.author?.last_name].filter(Boolean).join(" ") ||
              "Unknown";
            const initials = authorName
              .split(/\s+/)
              .map((p) => p[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase() || "?";

            return (
              <li
                key={n.id}
                className={`rounded-lg border p-4 ${
                  n.visibility === "CUSTOMER_VISIBLE"
                    ? "border-emerald-300/40 bg-emerald-50/40 dark:bg-emerald-500/5"
                    : "border-border bg-background"
                }`}
              >
                <header className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{authorName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDateTimePh(new Date(n.created_at))}
                        {n.updated_at !== n.created_at && " · edited"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        n.visibility === "CUSTOMER_VISIBLE"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-surface text-muted-foreground"
                      }`}
                    >
                      {n.visibility === "CUSTOMER_VISIBLE" ? (
                        <Globe className="h-2.5 w-2.5" />
                      ) : (
                        <EyeOff className="h-2.5 w-2.5" />
                      )}
                      {n.visibility === "CUSTOMER_VISIBLE" ? "Customer visible" : "Internal"}
                    </span>
                    {!editingId && canEdit(n) && (
                      <button
                        type="button"
                        onClick={() => handleEditStart(n)}
                        className="rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
                        title="Edit note (5 min window)"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    )}
                    {!editingId && canDelete(n) && (
                      <button
                        type="button"
                        onClick={() => handleDelete(n.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Delete note"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </header>

                {editingId === n.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingBody}
                      onChange={(e) => setEditingBody(e.target.value)}
                      rows={3}
                      maxLength={4000}
                      className="w-full resize-y rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditingBody("");
                        }}
                        className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-surface"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditSave(n.id)}
                        className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-line text-sm text-foreground/90">{n.body}</p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}