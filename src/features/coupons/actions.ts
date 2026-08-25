"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit, AuditAction } from "@/lib/audit";

/**
 * Coupon server actions. Admin-side CRUD + customer-side apply/remove.
 *
 * Coupon rules (from supabase schema):
 *   - code: unique, uppercase
 *   - discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT'
 *   - discount_value: > 0
 *   - minimum_order_amount: >= 0 (optional)
 *   - maximum_discount_amount: >= 0 (optional, caps percentage discounts)
 *   - usage_limit: > 0 (optional)
 *   - usage_count: starts at 0, increments on successful order
 *   - starts_at / expires_at: optional validity window
 *   - is_active: false disables the coupon entirely
 */

type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface CouponInput {
  code: string;
  description?: string | null;
  discount_type: DiscountType;
  discount_value: number;
  minimum_order_amount?: number | null;
  maximum_discount_amount?: number | null;
  usage_limit?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
}

// =============================================================================
// Helpers
// =============================================================================

function slugifyCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single();
  const role = (profile as { roles?: { name?: string } } | null)?.roles?.name;
  if (role !== "admin" && role !== "super_admin") {
    throw new Error("Admin access required");
  }
  return { supabase, user };
}

// =============================================================================
// Admin actions
// =============================================================================

export async function createCoupon(input: CouponInput) {
  const { supabase, user } = await requireAdmin();

  const code = slugifyCode(input.code);
  if (!code) return { error: "Coupon code is required" };
  if (input.discount_value <= 0) return { error: "Discount value must be greater than zero" };

  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code,
      description: input.description?.trim() || null,
      discount_type: input.discount_type,
      discount_value: input.discount_value,
      minimum_order_amount: input.minimum_order_amount ?? null,
      maximum_discount_amount: input.maximum_discount_amount ?? null,
      usage_limit: input.usage_limit ?? null,
      starts_at: input.starts_at ?? null,
      expires_at: input.expires_at ?? null,
      is_active: input.is_active ?? true,
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") {
      return { error: `Coupon code "${code}" already exists` };
    }
    return { error: error.message };
  }

  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "coupons",
    resourceId: data.id,
    metadata: { code, discount_type: input.discount_type, by: user.id },
  });
  revalidatePath("/admin/coupons");
  return { ok: true, id: data.id };
}

export async function updateCoupon(id: string, input: Partial<CouponInput>) {
  const { supabase, user } = await requireAdmin();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.code !== undefined) updates.code = slugifyCode(input.code);
  if (input.description !== undefined) updates.description = input.description?.trim() || null;
  if (input.discount_type !== undefined) updates.discount_type = input.discount_type;
  if (input.discount_value !== undefined) updates.discount_value = input.discount_value;
  if (input.minimum_order_amount !== undefined) updates.minimum_order_amount = input.minimum_order_amount ?? null;
  if (input.maximum_discount_amount !== undefined) updates.maximum_discount_amount = input.maximum_discount_amount ?? null;
  if (input.usage_limit !== undefined) updates.usage_limit = input.usage_limit ?? null;
  if (input.starts_at !== undefined) updates.starts_at = input.starts_at ?? null;
  if (input.expires_at !== undefined) updates.expires_at = input.expires_at ?? null;
  if (input.is_active !== undefined) updates.is_active = input.is_active;

  const { error } = await supabase.from("coupons").update(updates).eq("id", id);
  if (error) {
    if (error.code === "23505") {
      return { error: `Coupon code "${input.code}" already exists` };
    }
    return { error: error.message };
  }

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "coupons",
    resourceId: id,
    metadata: { fields: Object.keys(updates), by: user.id },
  });
  revalidatePath("/admin/coupons");
  revalidatePath(`/admin/coupons/${id}`);
  return { ok: true };
}

export async function deleteCoupon(id: string) {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { error: error.message };

  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "coupons",
    resourceId: id,
    metadata: { by: user.id },
  });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("coupons")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/coupons");
  revalidatePath(`/admin/coupons/${id}`);
  return { ok: true };
}

// =============================================================================
// Customer actions — validate + apply coupon to cart
// =============================================================================

export interface ValidatedCoupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  maximum_discount_amount: number | null;
  discount_amount: number; // computed for this subtotal
}

/**
 * Validate a coupon code against the current cart's subtotal.
 * Returns either { ok: true, coupon } or { ok: false, error }.
 */
export async function validateCoupon(
  rawCode: string,
  subtotal: number,
): Promise<
  | { ok: true; coupon: ValidatedCoupon }
  | { ok: false; error: string }
> {
  const code = slugifyCode(rawCode);
  if (!code) return { ok: false, error: "Enter a coupon code" };

  const supabase = await createClient();
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select(
      "id, code, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, usage_limit, usage_count, starts_at, expires_at, is_active",
    )
    .eq("code", code)
    .single();

  if (error || !coupon) {
    return { ok: false, error: "Coupon not found" };
  }
  if (!coupon.is_active) {
    return { ok: false, error: "This coupon is no longer active" };
  }
  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { ok: false, error: "This coupon isn't active yet" };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { ok: false, error: "This coupon has expired" };
  }
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return { ok: false, error: "This coupon has reached its usage limit" };
  }
  if (coupon.minimum_order_amount && subtotal < coupon.minimum_order_amount) {
    return {
      ok: false,
      error: `Minimum order of ₱${coupon.minimum_order_amount.toLocaleString("en-PH")} required`,
    };
  }

  // Compute discount amount
  let discount =
    coupon.discount_type === "PERCENTAGE"
      ? (subtotal * coupon.discount_value) / 100
      : coupon.discount_value;

  // Cap by maximum_discount_amount
  if (
    coupon.maximum_discount_amount &&
    discount > coupon.maximum_discount_amount
  ) {
    discount = coupon.maximum_discount_amount;
  }
  // Cap by subtotal
  if (discount > subtotal) discount = subtotal;
  discount = Math.round(discount * 100) / 100;

  return {
    ok: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      maximum_discount_amount: coupon.maximum_discount_amount,
      discount_amount: discount,
    },
  };
}

/**
 * Persist an applied coupon to the user's cart. Called after validateCoupon
 * succeeds. Stores coupon_id + cached discount_amount so the cart UI can
 * render the discount without re-computing on every request.
 */
export async function applyCouponToCart(
  couponId: string,
  discountAmount: number,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  // Get or create the user's cart
  let { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!cart) {
    const { data: newCart } = await supabase
      .from("carts")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    cart = newCart;
  }
  if (!cart) return { error: "Could not find or create your cart" };

  const { error } = await supabase
    .from("carts")
    .update({
      coupon_id: couponId,
      coupon_discount_amount: discountAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cart.id);
  if (error) return { error: error.message };

  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { ok: true };
}

/**
 * Remove the applied coupon from the user's cart.
 */
export async function removeCouponFromCart() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { error } = await supabase
    .from("carts")
    .update({
      coupon_id: null,
      coupon_discount_amount: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { ok: true };
}