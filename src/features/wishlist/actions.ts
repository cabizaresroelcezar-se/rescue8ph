"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit, AuditAction } from "@/lib/audit";

export async function toggleWishlist(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to save items", requiresAuth: true };

  // Check if already in wishlist
  const { data: existing } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: error.message };

    await logAudit({
      action: AuditAction.DELETE,
      resourceType: "wishlist",
      resourceId: existing.id,
      metadata: { user_id: user.id, product_id: productId },
    });

    revalidatePath("/account/wishlist");
    return { success: true, action: "removed" as const };
  }

  const { data: row, error } = await supabase
    .from("wishlist")
    .insert({ user_id: user.id, product_id: productId })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      // Race condition: already in wishlist. Treat as success.
      return { success: true, action: "added" as const };
    }
    return { error: error.message };
  }

  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "wishlist",
    resourceId: row?.id,
    metadata: { user_id: user.id, product_id: productId },
  });

  revalidatePath("/account/wishlist");
  return { success: true, action: "added" as const };
}

export async function getWishlistIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("wishlist")
    .select("product_id")
    .eq("user_id", user.id);

  return (data ?? []).map((r) => r.product_id);
}

export async function getWishlistCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("wishlist")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return count ?? 0;
}

export async function removeFromWishlist(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (!existing) return { success: true };

  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("id", existing.id);

  if (error) return { error: error.message };

  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "wishlist",
    resourceId: existing.id,
    metadata: { user_id: user.id, product_id: productId },
  });

  revalidatePath("/account/wishlist");
  return { success: true };
}
