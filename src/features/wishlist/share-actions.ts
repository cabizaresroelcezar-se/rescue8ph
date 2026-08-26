"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit, AuditAction } from "@/lib/audit";

/**
 * Wishlist sharing — lets a user publish a /wishlist/<token> URL that
 * anyone (signed-in or anon) can open to see their saved products.
 *
 * Security model:
 * - Token is the row's UUID (128 bits of entropy) — not enumerable.
 * - Owner can revoke at any time via updateShareLink(revoke: true).
 * - Public reads go through RLS (revoked/expired rows are invisible to non-owners).
 * - The visitor sees a curated card list — no PII, no email, no owner name.
 */

export interface ShareLinkResult {
  /** The public token (UUID-shaped string). */
  token: string;
  /** The full URL to share, derived on the client to honor `NEXT_PUBLIC_SITE_URL`. */
  path: `/wishlist/${string}`;
}

export async function getActiveShareLink(): Promise<ShareLinkResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("wishlist_share_links")
    .select("id, revoked_at, expires_at")
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .or("expires_at.is.null,expires_at.gt.now()")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    token: data.id,
    path: `/wishlist/${data.id}`,
  };
}

/**
 * Get or create the user's active wishlist share link. Reuses the most
 * recent non-revoked link if one exists; creates a new row otherwise.
 */
export async function getOrCreateShareLink(): Promise<
  { ok: true; result: ShareLinkResult } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const existing = await getActiveShareLink();
  if (existing) {
    return { ok: true, result: existing };
  }

  const { data: inserted, error } = await supabase
    .from("wishlist_share_links")
    .insert({ user_id: user.id })
    .select("id")
    .single();

  if (error || !inserted) {
    return { ok: false, error: error?.message ?? "Failed to create share link" };
  }

  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "wishlist_share_links",
    resourceId: inserted.id,
    newValues: { user_id: user.id },
  }).catch(() => {});

  revalidatePath("/account/wishlist");
  return {
    ok: true,
    result: {
      token: inserted.id,
      path: `/wishlist/${inserted.id}`,
    },
  };
}

/**
 * Revoke a share link — sets `revoked_at = now()`. Any subsequent visit to
 * /wishlist/<token> returns 404.
 */
export async function revokeShareLink(
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase
    .from("wishlist_share_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", token)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "wishlist_share_links",
    resourceId: token,
    newValues: { revoked_at: "now" },
  }).catch(() => {});

  revalidatePath("/account/wishlist");
  return { ok: true };
}

/**
 * Public read — fetches the wishlist items for the user behind a token.
 * Returns null if the token is invalid/revoked/expired.
 */
export interface SharedProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  short_description: string | null;
  image_url: string | null;
  image_alt: string | null;
}

export interface SharedWishlist {
  ownerLabel: string; // anonymized — generic "A Rescue 8 customer"
  productCount: number;
  products: SharedProduct[];
}

export async function getSharedWishlist(
  token: string,
): Promise<SharedWishlist | null> {
  const supabase = await createClient();

  // RLS ensures only non-revoked non-expired rows are visible to anon.
  const { data: link, error: linkErr } = await supabase
    .from("wishlist_share_links")
    .select("id, user_id")
    .eq("id", token)
    .maybeSingle();

  if (linkErr || !link) return null;

  const ownerId = (link as { user_id: string }).user_id;

  const { data: rows, error: rowsErr } = await supabase
    .from("wishlist")
    .select(
      "product_id, product:products(id, title, slug, price, compare_at_price, status, short_description, product_images(storage_path, alt_text, is_primary, sort_order))",
    )
    .eq("user_id", ownerId);

  if (rowsErr) return null;

  const products: SharedProduct[] = [];
  for (const row of rows ?? []) {
    const prod = (
      Array.isArray(row)
        ? row[0]
        : (row as { product: unknown }).product
    ) as null | {
      id: string;
      title: string;
      slug: string;
      price: number;
      compare_at_price: number | null;
      status: string;
      short_description: string | null;
      product_images: Array<{
        storage_path: string;
        alt_text: string | null;
        is_primary: boolean;
        sort_order: number;
      }>;
    };

    if (!prod || prod.status !== "ACTIVE") continue;

    const imgs = Array.isArray(prod.product_images)
      ? prod.product_images
      : [];
    const sorted = [...imgs].sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.sort_order - b.sort_order;
    });
    const primary = sorted[0];

    products.push({
      id: prod.id,
      title: prod.title,
      slug: prod.slug,
      price: prod.price,
      compare_at_price: prod.compare_at_price,
      short_description: prod.short_description,
      image_url: primary?.storage_path ?? null,
      image_alt: primary?.alt_text ?? prod.title,
    });
  }

  return {
    ownerLabel: "A Rescue 8 customer",
    productCount: products.length,
    products,
  };
}
