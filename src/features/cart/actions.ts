"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit, AuditAction } from "@/lib/audit";

// ============================================================================
// Get or create cart for current user
// ============================================================================

async function getOrCreateCart() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/cart");
  }

  // Try to find existing cart
  const { data: existingCart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existingCart) {
    return { cartId: existingCart.id, supabase, userId: user.id };
  }

  // Create new cart
  const { data: newCart, error } = await supabase
    .from("carts")
    .insert({ user_id: user.id })
    .select("id")
    .single();

  if (error || !newCart) {
    throw new Error("Failed to create cart");
  }

  return { cartId: newCart.id, supabase, userId: user.id };
}

// ============================================================================
// Add item to cart
// ============================================================================

export async function addToCart(formData: FormData) {
  const { cartId, supabase } = await getOrCreateCart();

  const productId = formData.get("productId") as string;
  const variantId = (formData.get("variantId") as string) || null;
  const quantity = parseInt(formData.get("quantity") as string) || 1;

  // Check if this product/variant combo already exists in cart
  if (variantId) {
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .eq("variant_id", variantId)
      .single();

    if (existing) {
      // Update quantity
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);

      if (error) {
        redirect(`/products?error=${encodeURIComponent("Failed to update cart")}`);
      }

      revalidatePath("/cart");
      redirect("/cart");
    }
  } else {
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .is("variant_id", null)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);

      if (error) {
        redirect(`/products?error=${encodeURIComponent("Failed to update cart")}`);
      }

      revalidatePath("/cart");
      redirect("/cart");
    }
  }

  // Insert new cart item
  const { error } = await supabase.from("cart_items").insert({
    cart_id: cartId,
    product_id: productId,
    variant_id: variantId,
    quantity,
  });

  if (error) {
    redirect(`/products?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/cart");
  redirect("/cart");
}

// ============================================================================
// Update cart item quantity
// ============================================================================

export async function updateCartQuantity(formData: FormData) {
  const supabase = await createClient();
  const itemId = formData.get("itemId") as string;
  const quantity = parseInt(formData.get("quantity") as string);

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
    if (error) {
      redirect("/cart?error=" + encodeURIComponent("Failed to remove item"));
    }
  } else {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);

    if (error) {
      redirect("/cart?error=" + encodeURIComponent(error.message));
    }
  }

  revalidatePath("/cart");
  redirect("/cart");
}

// ============================================================================
// Remove cart item
// ============================================================================

export async function removeFromCart(formData: FormData) {
  const supabase = await createClient();
  const itemId = formData.get("itemId") as string;

  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);

  if (error) {
    redirect("/cart?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/cart");
  redirect("/cart");
}

// ============================================================================
// Customer Address CRUD
// ============================================================================

export async function addAddress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const isDefault = formData.get("isDefault") === "true";

  // If setting as default, unset any existing default
  if (isDefault) {
    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true);
  }

  const { data: newAddress, error } = await supabase
    .from("customer_addresses")
    .insert({
      user_id: user.id,
      label: (formData.get("label") as string) || null,
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      region: formData.get("region") as string,
      province: formData.get("province") as string,
      city_municipality: formData.get("cityMunicipality") as string,
      barangay: formData.get("barangay") as string,
      street_address: formData.get("streetAddress") as string,
      building_unit: (formData.get("buildingUnit") as string) || null,
      postal_code: (formData.get("postalCode") as string) || null,
      delivery_notes: (formData.get("deliveryNotes") as string) || null,
      is_default: isDefault,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/account/addresses?error=${encodeURIComponent(error.message)}`);
  }

  // Audit: address added. Don't log the full address in metadata — too much PII.
  // The row id is enough to look up the actual record via the audit log.
  if (newAddress) {
    await logAudit({
      action: AuditAction.CREATE,
      resourceType: "customer_addresses",
      resourceId: newAddress.id,
      metadata: { is_default: isDefault, has_label: Boolean(formData.get("label")) },
    });
  }

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

// ============================================================================

export async function updateAddress(formData: FormData) {
  const supabase = await createClient();
  const addressId = formData.get("id") as string;
  const isDefault = formData.get("isDefault") === "true";
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Capture the current address for the audit diff BEFORE mutating.
  const { data: oldAddress } = await supabase
    .from("customer_addresses")
    .select("id, label, first_name, last_name, phone, region, province, city_municipality, barangay, street_address, building_unit, postal_code, is_default")
    .eq("id", addressId)
    .maybeSingle();

  if (isDefault) {
    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true);
  }

  const { error } = await supabase
    .from("customer_addresses")
    .update({
      label: (formData.get("label") as string) || null,
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      region: formData.get("region") as string,
      province: formData.get("province") as string,
      city_municipality: formData.get("cityMunicipality") as string,
      barangay: formData.get("barangay") as string,
      street_address: formData.get("streetAddress") as string,
      building_unit: (formData.get("buildingUnit") as string) || null,
      postal_code: (formData.get("postalCode") as string) || null,
      delivery_notes: (formData.get("deliveryNotes") as string) || null,
      is_default: isDefault,
    })
    .eq("id", addressId);

  if (error) {
    redirect(`/account/addresses?error=${encodeURIComponent(error.message)}`);
  }

  // Audit: address updated. Log diff so reviewers can see what changed.
  // We capture only the scalar fields (no PII beyond what RLS already permits).
  if (oldAddress) {
    const newSnapshot = {
      label: (formData.get("label") as string) || null,
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      region: formData.get("region") as string,
      province: formData.get("province") as string,
      city_municipality: formData.get("cityMunicipality") as string,
      barangay: formData.get("barangay") as string,
      street_address: formData.get("streetAddress") as string,
      building_unit: (formData.get("buildingUnit") as string) || null,
      postal_code: (formData.get("postalCode") as string) || null,
      is_default: isDefault,
    };
    await logAudit({
      action: AuditAction.UPDATE,
      resourceType: "customer_addresses",
      resourceId: addressId,
      oldValues: oldAddress,
      newValues: newSnapshot,
    });
  }

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

// ============================================================================

export async function deleteAddress(formData: FormData) {
  const supabase = await createClient();
  const addressId = formData.get("id") as string;

  // Capture label + is_default BEFORE deletion so the audit row is useful.
  const { data: existing } = await supabase
    .from("customer_addresses")
    .select("id, label, is_default")
    .eq("id", addressId)
    .maybeSingle();

  const { error } = await supabase
    .from("customer_addresses")
    .delete()
    .eq("id", addressId);

  if (error) {
    redirect(`/account/addresses?error=${encodeURIComponent(error.message)}`);
  }

  // Audit: address deleted.
  if (existing) {
    await logAudit({
      action: AuditAction.DELETE,
      resourceType: "customer_addresses",
      resourceId: addressId,
      oldValues: { label: existing.label, is_default: existing.is_default },
    });
  }

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}