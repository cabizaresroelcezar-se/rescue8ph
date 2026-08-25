"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, ShieldCheck, AlertCircle } from "lucide-react";
import { StarRatingInput } from "@/components/ui/star-rating";
import { createReview, updateReview } from "@/features/reviews/actions";

interface ExistingReview {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
}

export function ReviewForm({
  productId,
  existing,
}: {
  productId: string;
  existing: ExistingReview | null;
}) {
  const router = useRouter();
  const [rating, setRating] = React.useState(existing?.rating ?? 0);
  const [title, setTitle] = React.useState(existing?.title ?? "");
  const [body, setBody] = React.useState(existing?.body ?? "");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);

  const charCount = body.length;
  const isEditing = existing !== null;
  const isPending = existing?.status === "PENDING";
  const canEdit = !existing || isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating < 1 || rating > 5) {
      setError("Please pick a star rating.");
      return;
    }
    if (body.trim().length < 10) {
      setError("Your review must be at least 10 characters.");
      return;
    }
    if (body.trim().length > 4000) {
      setError("Your review must be at most 4000 characters.");
      return;
    }

    setBusy(true);
    const result = isEditing
      ? await updateReview(existing.id, { rating, title, body })
      : await createReview({ product_id: productId, rating, title, body });

    setBusy(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setSavedAt(new Date().toLocaleTimeString("en-PH"));
    router.refresh();
  }

  if (existing && !isPending && !canEdit) {
    // Already approved/rejected/flagged — show a thank-you note + small form to edit
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-green-900">
          <ShieldCheck className="h-4 w-4" />
          You reviewed this product
        </div>
        <p className="mt-1 text-xs text-green-700">
          Your review is{" "}
          <strong className="capitalize">{existing.status.toLowerCase()}</strong>
          . Contact us if you need to update it.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-5 shadow-elev-1"
    >
      <h3 className="text-base font-semibold text-foreground">
        {isEditing ? "Update your review" : "Write a review"}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {isEditing
          ? "Reviews go back into the moderation queue when edited."
          : "Reviews are moderated before they appear on the page."}
      </p>

      <div className="mt-4 space-y-4">
        {/* Star rating */}
        <div>
          <label className="text-xs font-medium text-foreground">
            Your rating
          </label>
          <div className="mt-2">
            <StarRatingInput value={rating} onChange={setRating} size="lg" />
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="review-title"
            className="text-xs font-medium text-foreground"
          >
            Title (optional)
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="e.g. Great for our first-aid station"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        {/* Body */}
        <div>
          <label
            htmlFor="review-body"
            className="text-xs font-medium text-foreground"
          >
            Your review
          </label>
          <textarea
            id="review-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            minLength={10}
            maxLength={4000}
            required
            placeholder="What did you like or dislike? How did you use the product?"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {charCount} / 4000
          </p>
        </div>

        {error && (
          <p className="flex items-start gap-1.5 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          {savedAt && (
            <span className="text-xs text-muted-foreground">
              Saved at {savedAt}
            </span>
          )}
          <button
            type="submit"
            disabled={busy}
            className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isEditing ? "Update review" : "Submit review"}
          </button>
        </div>
      </div>
    </form>
  );
}