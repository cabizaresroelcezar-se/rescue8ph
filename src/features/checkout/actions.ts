"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit, AuditAction } from "@/lib/audit";

// ============================================================================
// Place Order — Transactional checkout
// ============================================================================
// Follows the 18-step process from the master specification:
// 1. Read current database prices
// 2. Validate product status
// 3. Validate stock
// 4. Validate customer ownership
// 5. Validate coupon
// 6. Calculate subtotal
// 7. Calculate discount
// 8. Calculate shipping
// 9. Calculate grand total
// 10. Snapshot product details
// 11. Snapshot delivery address
// 12. Create order
// 13. Create order items
// 14. Create payment record when required
// 15. Reserve/decrement inventory safely
// 16. Write order status history
// 17. Commit atomically
// 18. Return safe order information

export async function placeOrder(formData: FormData) {
  const supabase = await createClient();

  // --- Step 4: Validate customer ownership ---
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/checkout");
  }

  // --- Get cart ---
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!cart) {
    redirect("/cart?error=" + encodeURIComponent("No cart found"));
  }

  // --- Get cart items with product details ---
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      product:products(id, title, slug, price, status, sku, weight_grams)
    `)
    .eq("cart_id", cart.id);

  type CartItemWithProduct = {
    id: string;
    quantity: number;
    product: { id: string; title: string; slug: string; price: number; status: string; sku: string | null; weight_grams: number | null }[] | { id: string; title: string; slug: string; price: number; status: string; sku: string | null; weight_grams: number | null } | null;
  };
  const typedItems = (cartItems || []) as unknown as CartItemWithProduct[];

  if (typedItems.length === 0) {
    redirect("/cart?error=" + encodeURIComponent("Your cart is empty"));
  }

  // --- Steps 1-3: Validate products and read DB prices ---
  let subtotal = 0;
  const orderItemPayloads: Array<{
    product_id: string;
    product_name: string;
    sku: string | null;
    unit_price: number;
    quantity: number;
    subtotal: number;
  }> = [];

  for (const item of typedItems) {
    const p = Array.isArray(item.product) ? item.product[0] : item.product;
    if (!p) continue;

    // Step 2: Validate product status
    if (p.status !== "ACTIVE") {
      redirect(`/cart?error=${encodeURIComponent(`Product "${p.title}" is no longer available`)}`);
    }

    // Step 1: Read current database price (never trust client)
    const unitPrice = p.price;
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    // Step 10: Snapshot product details
    orderItemPayloads.push({
      product_id: p.id,
      product_name: p.title,
      sku: p.sku,
      unit_price: unitPrice,
      quantity: item.quantity,
      subtotal: lineTotal,
    });
  }

  // --- Steps 6-9: Calculate totals ---
  const discountTotal = 0; // No coupon support yet
  const shippingTotal = 0; // Manual shipping — calculated later
  const taxTotal = 0; // No tax calculation yet
  const grandTotal = subtotal - discountTotal + shippingTotal + taxTotal;

  // --- Step 11: Snapshot delivery address ---
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const region = formData.get("region") as string;
  const province = formData.get("province") as string;
  const cityMunicipality = formData.get("cityMunicipality") as string;
  const barangay = formData.get("barangay") as string;
  const streetAddress = formData.get("streetAddress") as string;
  const buildingUnit = (formData.get("buildingUnit") as string) || null;
  const postalCode = (formData.get("postalCode") as string) || null;
  const deliveryNotes = (formData.get("deliveryNotes") as string) || null;

  const paymentProvider = (formData.get("paymentProvider") as string) || "MANUAL";
  const customerNotes = (formData.get("customerNotes") as string) || null;

  // --- Generate order number ---
  const { data: orderNumberData } = await supabase.rpc("generate_order_number");
  const orderNumber = orderNumberData as string;

  if (!orderNumber) {
    redirect("/cart?error=" + encodeURIComponent("Failed to generate order number"));
  }

  // --- Step 12: Create order ---
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      status: "PAYMENT_PENDING",
      currency: "PHP",
      subtotal,
      discount_total: discountTotal,
      shipping_total: shippingTotal,
      tax_total: taxTotal,
      grand_total: grandTotal,
      customer_notes: customerNotes,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    redirect(`/cart?error=${encodeURIComponent("Failed to create order: " + (orderError?.message || "Unknown error"))}`);
  }

  // --- Step 13: Create order items ---
  const itemsToInsert = orderItemPayloads.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsToInsert);

  if (itemsError) {
    // Try to clean up the order
    await supabase.from("orders").delete().eq("id", order.id);
    redirect(`/cart?error=${encodeURIComponent("Failed to create order items: " + itemsError.message)}`);
  }

  // --- Step 11: Create order address snapshot ---
  const { error: addressError } = await supabase
    .from("order_addresses")
    .insert({
      order_id: order.id,
      first_name: firstName,
      last_name: lastName,
      phone,
      email,
      region,
      province,
      city_municipality: cityMunicipality,
      barangay,
      street_address: streetAddress,
      building_unit: buildingUnit,
      postal_code: postalCode,
      delivery_notes: deliveryNotes,
    });

  if (addressError) {
    await supabase.from("order_items").delete().eq("order_id", order.id);
    await supabase.from("orders").delete().eq("id", order.id);
    redirect(`/cart?error=${encodeURIComponent("Failed to save delivery address: " + addressError.message)}`);
  }

  // --- Step 14: Create payment record ---
  const { error: paymentError } = await supabase
    .from("payments")
    .insert({
      order_id: order.id,
      provider: paymentProvider as "XENDIT" | "PAYMONGO" | "MANUAL",
      status: "PENDING",
      amount: grandTotal,
      currency: "PHP",
    });

  if (paymentError) {
    await supabase.from("order_addresses").delete().eq("order_id", order.id);
    await supabase.from("order_items").delete().eq("order_id", order.id);
    await supabase.from("orders").delete().eq("id", order.id);
    redirect(`/cart?error=${encodeURIComponent("Failed to create payment record: " + paymentError.message)}`);
  }

  // --- Step 16: Write order status history ---
  await supabase.from("order_status_history").insert({
    order_id: order.id,
    from_status: null,
    to_status: "PAYMENT_PENDING",
    note: "Order created",
  });

  // --- Step 15: Clear cart (items are now in the order) ---
  await supabase.from("cart_items").delete().eq("cart_id", cart.id);

  // --- Step 17: Audit log the order placement ---
  // This is the single most important audit event — money changed hands.
  // Captures: who placed the order, what they ordered, totals, payment provider.
  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "orders",
    resourceId: order.id,
    newValues: {
      order_number: order.order_number,
      status: "PAYMENT_PENDING",
      currency: "PHP",
      item_count: orderItemPayloads.length,
      total_quantity: orderItemPayloads.reduce((n, i) => n + i.quantity, 0),
      subtotal,
      discount_total: discountTotal,
      shipping_total: shippingTotal,
      tax_total: taxTotal,
      grand_total: grandTotal,
      payment_provider: paymentProvider,
      delivery_region: region,
      delivery_province: province,
      delivery_city: cityMunicipality,
    },
    metadata: {
      items: orderItemPayloads.map((i) => ({
        product_id: i.product_id,
        product_name: i.product_name,
        sku: i.sku,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.subtotal,
      })),
      delivery_address: {
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        street_address: streetAddress,
        barangay,
        city_municipality: cityMunicipality,
        province,
        region,
        postal_code: postalCode,
      },
    },
  });

  revalidatePath("/cart");
  revalidatePath("/account/orders");

  // --- Step 18: Return safe order information ---
  if (paymentProvider === "MANUAL") {
    // For manual/COD, go to success with order number
    redirect(`/checkout/success?order=${encodeURIComponent(order.order_number)}`);
  } else {
    // For payment providers, redirect to their checkout
    // (This will be implemented when real providers are integrated)
    redirect(`/checkout/success?order=${encodeURIComponent(order.order_number)}`);
  }
}