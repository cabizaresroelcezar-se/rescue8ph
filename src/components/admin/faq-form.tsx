"use client";

import * as React from "react";
import { Plus, Loader2 } from "lucide-react";
import { createFaq } from "@/features/cms/actions";
import { useRouter } from "next/navigation";

export function FaqForm() {
  const router = useRouter();
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    setBusy(true);
    setError(null);
    const result = await createFaq({ question: question.trim(), answer: answer.trim() });
    setBusy(false);
    if (result.ok) {
      setQuestion("");
      setAnswer("");
      router.refresh();
    } else if (result.error) {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What areas do you deliver to?"
          className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Answer</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          placeholder="Provide a clear, helpful answer."
          className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={busy || !question.trim() || !answer.trim()}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Add FAQ
      </button>
    </form>
  );
}