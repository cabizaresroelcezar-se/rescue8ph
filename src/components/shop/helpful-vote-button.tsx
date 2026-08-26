"use client";

import * as React from "react";
import { ThumbsUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDelayedRefresh } from "@/hooks/use-delayed-refresh";
import { voteOnReview, removeReviewVote } from "@/features/review-votes/actions";

export function HelpfulVoteButton({
  reviewId,
  initialCount,
  initialUserVote,
  signedIn,
}: {
  reviewId: string;
  initialCount: number;
  initialUserVote: boolean | null;
  signedIn: boolean;
}) {
  const router = useRouter();
  const { refresh } = useDelayedRefresh(400);
  const [count, setCount] = React.useState(initialCount);
  const [userVote, setUserVote] = React.useState<boolean | null>(initialUserVote);
  const [busy, setBusy] = React.useState(false);

  async function onClick() {
    if (!signedIn) {
      router.push(`/auth/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (busy) return;

    const willVote = userVote !== true;
    // Optimistic update
    const delta = userVote === true ? -1 : userVote === false ? 1 : 1;
    const previousVote = userVote;
    const previousCount = count;
    setUserVote(willVote);
    setCount(count + delta);

    setBusy(true);
    const result = willVote
      ? await voteOnReview(reviewId, true)
      : await removeReviewVote(reviewId);
    setBusy(false);

    if (result?.error) {
      // Revert
      setUserVote(previousVote);
      setCount(previousCount);
      alert(result.error);
      return;
    }

    // Sync with server truth
    if (typeof result.helpful_count === "number") setCount(result.helpful_count);
    if ("user_vote" in result && result.user_vote !== undefined) setUserVote(result.user_vote);
    router.refresh();
    refresh();
  }

  const isVoted = userVote === true;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={isVoted}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60 " +
        (isVoted
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-secondary hover:text-foreground")
      }
    >
      {busy ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <ThumbsUp className={"h-3 w-3 " + (isVoted ? "fill-current" : "")} />
      )}
      Helpful
      {count > 0 && (
        <span
          className={
            "ml-0.5 text-[11px] " + (isVoted ? "font-semibold" : "text-muted-foreground")
          }
        >
          ({count})
        </span>
      )}
    </button>
  );
}