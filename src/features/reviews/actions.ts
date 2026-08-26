"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit, AuditAction } from "@/lib/audit";

/**
 * Product review server actions.
 *
 * - createReview: customer submits a new review (status=PENDING)
 * - updateReview: customer edits their own PENDING review
 * - deleteReview: customer deletes their own review
 * - moderateReview: staff approves/rejects/flags a review
 * - getReviewStats: returns aggregate rating + count for a product
 */

export interface ReviewInput {
  product_id: string;
  rating: number;
  title?: string | null;
  body: string;
}

// =============================================================================
// Helpers
// =============================================================================

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

async function requireStaff() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single();
  const role = (profile as { roles?: { name?: string } } | null)?.roles?.name;
  if (role !== "admin" && role !== "super_admin") {
    throw new Error("Staff access required");
  }
  return { supabase, user };
}

// =============================================================================
// Customer actions
// =============================================================================

export async function createReview(input: ReviewInput) {
  const { supabase, user } = await requireUser();

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { error: "Rating must be between 1 and 5 stars" };
  }
  const body = input.body?.trim() ?? "";
  if (body.length < 10) {
    return { error: "Review must be at least 10 characters" };
  }
  if (body.length > 4000) {
    return { error: "Review must be at most 4000 characters" };
  }
  const title = input.title?.trim() || null;
  if (title && title.length > 200) {
    return { error: "Title must be at most 200 characters" };
  }

  // Verify the product exists and is ACTIVE
  const { data: product } = await supabase
    .from("products")
    .select("id, status")
    .eq("id", input.product_id)
    .eq("status", "ACTIVE")
    .single();
  if (!product) return { error: "Product not found" };

  // Check for verified purchase: any order_items row for this user+product
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_items(product_id)")
    .eq("user_id", user.id);
  const isVerifiedPurchase = (orders ?? []).some((o) => {
    const items = (o as { order_items?: { product_id: string }[] | { product_id: string } | null })
      .order_items;
    if (!items) return false;
    const list = Array.isArray(items) ? items : [items];
    return list.some((i) => i?.product_id === input.product_id);
  });

  // Upsert: if the user already has a review for this product, update it
  const { data, error } = await supabase
    .from("product_reviews")
    .upsert(
      {
        product_id: input.product_id,
        user_id: user.id,
        rating: input.rating,
        title,
        body,
        is_verified_purchase: isVerifiedPurchase,
        status: "PENDING",
      },
      { onConflict: "product_id,user_id" },
    )
    .select("id")
    .single();

  if (error) {
    if (error.code === "42501") return { error: "You don't have permission to review this product" };
    return { error: error.message };
  }

  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "product_reviews",
    resourceId: data.id,
    metadata: { product_id: input.product_id, rating: input.rating, by: user.id },
  });

  revalidatePath(`/products`);
  revalidatePath(`/products/[slug]`, "page");
  revalidatePath(`/admin/reviews`);
  return { ok: true, id: data.id };
}

export async function updateReview(reviewId: string, input: Partial<ReviewInput>) {
  const { supabase, user } = await requireUser();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.rating !== undefined) {
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      return { error: "Rating must be between 1 and 5 stars" };
    }
    updates.rating = input.rating;
  }
  if (input.title !== undefined) {
    updates.title = input.title?.trim() || null;
  }
  if (input.body !== undefined) {
    const body = input.body.trim();
    if (body.length < 10) return { error: "Review must be at least 10 characters" };
    if (body.length > 4000) return { error: "Review must be at most 4000 characters" };
    updates.body = body;
    // Editing the body resets to PENDING so staff re-moderates
    updates.status = "PENDING";
  }

  const { error } = await supabase
    .from("product_reviews")
    .update(updates)
    .eq("id", reviewId)
    .eq("user_id", user.id)
    .eq("status", "PENDING"); // can only edit own PENDING reviews

  if (error) {
    if (error.code === "PGRST116") return { error: "Review not found or already approved" };
    return { error: error.message };
  }

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "product_reviews",
    resourceId: reviewId,
    metadata: { fields: Object.keys(updates), by: user.id },
  });

  revalidatePath(`/admin/reviews`);
  return { ok: true };
}

export async function deleteReview(reviewId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "product_reviews",
    resourceId: reviewId,
    metadata: { by: user.id },
  });

  revalidatePath(`/admin/reviews`);
  return { ok: true };
}

// =============================================================================
// Staff actions
// =============================================================================

export async function moderateReview(
  reviewId: string,
  status: "APPROVED" | "REJECTED" | "FLAGGED",
  reason?: string,
) {
  const { supabase, user } = await requireStaff();

  const updates: Record<string, unknown> = {
    status,
    moderated_by: user.id,
    moderated_at: new Date().toISOString(),
    moderation_reason: reason?.trim() || null,
  };

  const { error } = await supabase
    .from("product_reviews")
    .update(updates)
    .eq("id", reviewId);
  if (error) return { error: error.message };

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "product_reviews",
    resourceId: reviewId,
    metadata: { status, reason: reason ?? null, by: user.id },
  });

  revalidatePath(`/admin/reviews`);
  revalidatePath(`/admin/reviews/${reviewId}`);
  return { ok: true };
}

export async function staffDeleteReview(reviewId: string) {
  const { supabase, user } = await requireStaff();
  const { error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", reviewId);
  if (error) return { error: error.message };

  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "product_reviews",
    resourceId: reviewId,
    metadata: { by: user.id, staff_action: true },
  });

  revalidatePath(`/admin/reviews`);
  return { ok: true };
}

// =============================================================================
// Aggregate stats
// =============================================================================

export interface ReviewStats {
  total: number;
  average: number; // rounded to 1 decimal
  counts: Record<1 | 2 | 3 | 4 | 5, number>; // histogram of star ratings
}

export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("status", "APPROVED");

  const counts: ReviewStats["counts"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews ?? []) {
    const rating = r.rating as 1 | 2 | 3 | 4 | 5;
    if (rating >= 1 && rating <= 5) {
      counts[rating]++;
      sum += rating;
    }
  }
  const total = (reviews ?? []).length;
  const average = total === 0 ? 0 : Math.round((sum / total) * 10) / 10;
  return { total, average, counts };
}

/**
 * Bulk version of getReviewStats — fetches aggregate stats for many
 * products in a single query. Returns a Map keyed by productId. Use this
 * on product listing pages to avoid an N+1 query storm.
 */
export async function getBulkReviewStats(
  productIds: string[],
): Promise<Map<string, { total: number; average: number }>> {
  const result = new Map<string, { total: number; average: number }>();
  if (productIds.length === 0) return result;

  const supabase = await createClient();
  const { data } = await supabase
    .from("product_reviews")
    .select("product_id, rating")
    .in("product_id", productIds)
    .eq("status", "APPROVED");

  const sums = new Map<string, { total: number; sum: number }>();
  for (const r of (data ?? []) as Array<{ product_id: string; rating: number }>) {
    const cur = sums.get(r.product_id) ?? { total: 0, sum: 0 };
    cur.total++;
    cur.sum += r.rating;
    sums.set(r.product_id, cur);
  }

  for (const id of productIds) {
    const s = sums.get(id);
    if (!s) {
      result.set(id, { total: 0, average: 0 });
    } else {
      result.set(id, {
        total: s.total,
        average: Math.round((s.sum / s.total) * 10) / 10,
      });
    }
  }
  return result;
}