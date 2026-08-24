"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

  const { error } = await supabase.from("customer_addresses").insert({
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
  });

  if (error) {
    redirect(`/account/addresses?error=${encodeURIComponent(error.message)}`);
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

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

// ============================================================================

export async function deleteAddress(formData: FormData) {
  const supabase = await createClient();
  const addressId = formData.get("id") as string;

  const { error } = await supabase
    .from("customer_addresses")
    .delete()
    .eq("id", addressId);

  if (error) {
    redirect(`/account/addresses?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}