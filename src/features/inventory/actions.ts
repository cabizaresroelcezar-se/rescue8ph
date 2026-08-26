"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit, AuditAction } from "@/lib/audit";

/**
 * Create an inventory row for a product. The inventory table enforces
 * unique(product_id), so this will fail with a 23505 if the product
 * already has inventory — callers should use updateInventoryStock instead.
 *
 * Side effect: also writes the initial stock ON HAND as an inventory_movements
 * row of type 'RECEIPT' so the audit trail matches the new row.
 */

export interface CreateInventoryInput {
  productId: string;
  /** initial on-hand qty — must be >= 0 */
  quantityOnHand: number;
  /** items reserved (committed to orders but not yet shipped) — must be <= qtyOnHand */
  quantityReserved?: number;
  /** reorder threshold; below this count the row is flagged "low stock" */
  reorderLevel?: number;
  /** optional note attached to the initial movement entry */
  note?: string;
}

export async function createInventory(
  input: CreateInventoryInput,
): Promise<{ ok: boolean; inventoryId?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  // Permission check: staff only (inventory is admin-scoped)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single();
  const roleData = (profile as { roles?: { name?: string } | { name?: string }[] | null } | null)?.roles;
  const roleName = Array.isArray(roleData) ? roleData[0]?.name : roleData?.name;
  if (roleName !== "admin" && roleName !== "super_admin") {
    return { ok: false, error: "Only admins can add inventory" };
  }

  // Validate product exists + is ACTIVE/visible to staff (we'll trust server anyway)
  const { data: product } = await supabase
    .from("products")
    .select("id, title, sku")
    .eq("id", input.productId)
    .maybeSingle();
  if (!product) return { ok: false, error: "Product not found" };

  // Bounds
  const qtyOnHand = Math.max(0, Math.floor(input.quantityOnHand));
  const qtyReserved = Math.max(
    0,
    Math.min(
      qtyOnHand,
      Math.floor(input.quantityReserved ?? 0),
    ),
  );
  const reorderLevel = Math.max(0, Math.floor(input.reorderLevel ?? 5));

  // Insert inventory row (unique constraint will throw 23505 if duplicate)
  const { data: inv, error: invErr } = await supabase
    .from("inventory")
    .insert({
      product_id: input.productId,
      quantity_on_hand: qtyOnHand,
      quantity_reserved: qtyReserved,
      reorder_level: reorderLevel,
    })
    .select("id")
    .single();

  if (invErr || !inv) {
    if (invErr?.code === "23505") {
      return {
        ok: false,
        error: "Inventory already exists for this product. Edit it instead.",
      };
    }
    return { ok: false, error: invErr?.message ?? "Insert failed" };
  }

  // Initial movement entry — record the initial stock as a PURCHASE
  // movement (incoming stock from supplier / opening balance).
  if (qtyOnHand > 0) {
    await supabase.from("inventory_movements").insert({
      product_id: input.productId,
      movement_type: "PURCHASE",
      quantity: qtyOnHand,
      reference_type: "manual",
      notes: input.note?.trim() || "Initial stock on inventory creation",
      created_by: user.id,
    });
  }

  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "inventory",
    resourceId: inv.id,
    metadata: {
      product_id: input.productId,
      quantity_on_hand: qtyOnHand,
      quantity_reserved: qtyReserved,
      reorder_level: reorderLevel,
    },
  }).catch(() => {});

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { ok: true, inventoryId: inv.id };
}

/** For the product picker: returns ACTIVE products that don't have inventory yet. */
export async function getProductsWithoutInventory(): Promise<
  Array<{ id: string; title: string; sku: string | null; price: number; status: string }>
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("products")
    .select("id, title, sku, price, status, inventory:inventory(product_id)")
    .order("title", { ascending: true })
    .limit(500);
  if (error || !data) return [];

  // Filter out products that already have an inventory row
  return data
    .filter((p) => {
      const inv = p.inventory as unknown;
      const arr = Array.isArray(inv) ? inv : inv ? [inv] : [];
      return arr.length === 0;
    })
    .map((p) => ({
      id: p.id,
      title: p.title,
      sku: p.sku,
      price: p.price,
      status: p.status,
    }));
}
