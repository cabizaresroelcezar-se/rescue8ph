"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit, AuditAction } from "@/lib/audit";

/**
 * Recently viewed products — anonymized tracking + per-user retrieval.
 *
 * The product detail page calls trackProductView() inside a useEffect
 * after mount. The /account page calls getRecentlyViewed() server-side.
 */

const MAX_RECENT = 20;

/**
 * Track that the current user viewed this product. No-op for anonymous
 * visitors (we'd need a cookie-based identifier for that, deferred).
 */
export async function trackProductView(productId: string): Promise<{ error?: string; ok?: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: true }; // silently skip anonymous

  // Upsert (user_id, product_id) so re-visits bump the timestamp
  const { error } = await supabase
    .from("recently_viewed")
    .upsert(
      { user_id: user.id, product_id: productId, viewed_at: new Date().toISOString() },
      { onConflict: "user_id,product_id" },
    );

  if (error) {
    return { error: error.message };
  }

  // Cap to the MAX_RECENT most-recent views: delete any older rows for this user.
  // Doing it via a subquery avoids an extra round-trip.
  const { error: capErr } = await supabase.rpc("cap_recently_viewed" as never, {
    p_user_id: user.id,
    p_max: MAX_RECENT,
  } as never);

  // If the RPC doesn't exist yet (no migration run), fall back to a 2-step query.
  // This keeps the action working even before the user runs the SQL.
  if (capErr && /cap_recently_viewed/.test(capErr.message)) {
    const { data: allViews } = await supabase
      .from("recently_viewed")
      .select("id")
      .eq("user_id", user.id)
      .order("viewed_at", { ascending: false });

    if (allViews && allViews.length > MAX_RECENT) {
      const idsToDelete = allViews.slice(MAX_RECENT).map((v) => (v as { id: string }).id);
      await supabase.from("recently_viewed").delete().in("id", idsToDelete);
    }
  }

  return { ok: true };
}

export interface RecentlyViewedItem {
  id: string; // recently_viewed.id
  product_id: string;
  title: string;
  slug: string;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  image: { src: string; alt: string } | null;
  viewed_at: string;
}

/**
 * Get the current user's recently viewed products (latest first).
 * Used by /account dashboard.
 */
export async function getRecentlyViewed(): Promise<RecentlyViewedItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: views } = await supabase
    .from("recently_viewed")
    .select(
      "id, viewed_at, product:products(id, title, slug, short_description, price, compare_at_price)",
    )
    .eq("user_id", user.id)
    .order("viewed_at", { ascending: false })
    .limit(MAX_RECENT);

  const items: RecentlyViewedItem[] = [];
  for (const v of views ?? []) {
    const product = (v as { product?: unknown }).product;
    if (!product) continue;
    const p = product as {
      id: string;
      title: string;
      slug: string;
      short_description: string | null;
      price: number;
      compare_at_price: number | null;
    };
    items.push({
      id: (v as { id: string }).id,
      product_id: p.id,
      title: p.title,
      slug: p.slug,
      short_description: p.short_description,
      price: p.price,
      compare_at_price: p.compare_at_price,
      image: null,
      viewed_at: (v as { viewed_at: string }).viewed_at,
    });
  }

  // Hydrate primary images
  if (items.length > 0) {
    const productIds = items.map((i) => i.product_id);
    const { data: images } = await supabase
      .from("product_images")
      .select("product_id, storage_path, alt_text, is_primary, sort_order")
      .in("product_id", productIds)
      .order("sort_order", { ascending: true });

    const { getMediaUrl } = await import("@/lib/media");

    const byProduct: Record<string, { src: string; alt: string }> = {};
    for (const img of images ?? []) {
      const i = img as {
        product_id: string;
        storage_path: string;
        alt_text: string | null;
        is_primary: boolean;
      };
      const url = getMediaUrl(i.storage_path);
      if (!url) continue;
      const existing = byProduct[i.product_id];
      if (!existing || i.is_primary) {
        byProduct[i.product_id] = { src: url, alt: i.alt_text || "" };
      }
    }
    for (const item of items) {
      item.image = byProduct[item.product_id] ?? null;
    }
  }

  return items;
}

/**
 * Clear all recently viewed products for the current user.
 */
export async function clearRecentlyViewed(): Promise<{ error?: string; ok?: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("recently_viewed")
    .delete()
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "recently_viewed",
    metadata: { actor: user.id, source: "account/recently-viewed" },
  });

  revalidatePath("/account");
  return { ok: true };
}