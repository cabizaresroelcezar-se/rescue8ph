"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit, AuditAction } from "@/lib/audit";

/**
 * Review helpful-vote actions.
 *
 * voteHelpful / voteNotHelpful: insert/update a row in review_votes.
 * The DB trigger keeps product_reviews.helpful_count in sync.
 * removeVote: clears the user's vote (count decrements via trigger).
 *
 * One vote per user per review (enforced by the unique constraint).
 * Users can flip their vote (helpful -> not helpful, etc.) via UPDATE.
 */

type VoteResult = { error?: string; ok?: true; helpful_count?: number; user_vote?: boolean | null };

export async function voteOnReview(
  reviewId: string,
  isHelpful: boolean,
): Promise<VoteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to vote." };

  // Try UPDATE first (flip case), then INSERT (new vote)
  const { data: existing } = await supabase
    .from("review_votes")
    .select("id, is_helpful")
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("review_votes")
      .update({ is_helpful: isHelpful })
      .eq("id", (existing as { id: string }).id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("review_votes")
      .insert({ review_id: reviewId, user_id: user.id, is_helpful: isHelpful });
    if (error) return { error: error.message };
  }

  // Read back the new helpful_count
  const { data: review } = await supabase
    .from("product_reviews")
    .select("helpful_count, product_id")
    .eq("id", reviewId)
    .single();
  const helpfulCount = (review as { helpful_count?: number } | null)?.helpful_count ?? 0;
  const productId = (review as { product_id?: string } | null)?.product_id;

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "review_vote",
    resourceId: reviewId,
    metadata: { actor: user.id, is_helpful: isHelpful, source: "review-list" },
  });

  if (productId) revalidatePath(`/products/${productId}`);
  return { ok: true, helpful_count: helpfulCount, user_vote: isHelpful };
}

export async function removeReviewVote(reviewId: string): Promise<VoteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("review_votes")
    .delete()
    .eq("review_id", reviewId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  const { data: review } = await supabase
    .from("product_reviews")
    .select("helpful_count, product_id")
    .eq("id", reviewId)
    .single();
  const helpfulCount = (review as { helpful_count?: number } | null)?.helpful_count ?? 0;
  const productId = (review as { product_id?: string } | null)?.product_id;

  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "review_vote",
    resourceId: reviewId,
    metadata: { actor: user.id, source: "review-list" },
  });

  if (productId) revalidatePath(`/products/${productId}`);
  return { ok: true, helpful_count: helpfulCount, user_vote: null };
}

/**
 * Get the current user's votes for a set of reviews.
 * Returns a Map<reviewId, is_helpful>.
 */
export async function getUserReviewVotes(
  reviewIds: string[],
): Promise<Map<string, boolean>> {
  const result = new Map<string, boolean>();
  if (reviewIds.length === 0) return result;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return result;

  const { data } = await supabase
    .from("review_votes")
    .select("review_id, is_helpful")
    .in("review_id", reviewIds)
    .eq("user_id", user.id);

  for (const v of (data ?? []) as Array<{ review_id: string; is_helpful: boolean }>) {
    result.set(v.review_id, v.is_helpful);
  }
  return result;
}