"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit, AuditAction } from "@/lib/audit";

// ============================================================================
// Mark Payment as Paid (admin action for manual payments)
// ============================================================================

export async function markPaymentPaid(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const paymentId = formData.get("paymentId") as string;
  const orderId = formData.get("orderId") as string;

  // Update payment status
  const { error: payError } = await supabase
    .from("payments")
    .update({
      status: "PAID",
      provider_payment_id: `MANUAL-CONFIRMED-${Date.now()}`,
    })
    .eq("id", paymentId);

  if (payError) {
    redirect(`/admin/orders/${orderId}?error=${encodeURIComponent(payError.message)}`);
  }

  // Log payment transaction
  await supabase.from("payment_transactions").insert({
    payment_id: paymentId,
    event_type: "PAYMENT_CONFIRMED",
    status: "PAID",
    payload: { confirmed_by: user.id, method: "MANUAL" },
  });

  // Update order status to PAID
  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (order) {
    await supabase.from("orders").update({ status: "PAID" }).eq("id", orderId);

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      from_status: order.status as "PAYMENT_PENDING",
      to_status: "PAID",
      note: "Payment confirmed (manual/COD)",
      changed_by: user.id,
    });

    await logAudit({
      action: AuditAction.STATUS_CHANGE,
      resourceType: "orders",
      resourceId: orderId,
      oldValues: { status: order.status },
      newValues: { status: "PAID" },
      metadata: { paymentId, method: "MANUAL" },
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?message=${encodeURIComponent("Payment marked as paid")}`);
}

// ============================================================================
// Mark Order Status (admin action)
// ============================================================================

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("status") as string;
  const note = (formData.get("note") as string) || null;

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (!order) {
    redirect("/admin/orders");
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    redirect(`/admin/orders/${orderId}?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    from_status: order.status as "PENDING" | "PAYMENT_PENDING" | "PAID" | "PROCESSING" | "READY_TO_SHIP" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED",
    to_status: newStatus as "PENDING" | "PAYMENT_PENDING" | "PAID" | "PROCESSING" | "READY_TO_SHIP" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED",
    note,
    changed_by: user.id,
  });

  await logAudit({
    action: AuditAction.STATUS_CHANGE,
    resourceType: "orders",
    resourceId: orderId,
    oldValues: { status: order.status },
    newValues: { status: newStatus },
    metadata: { note },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?message=${encodeURIComponent("Order status updated to " + newStatus.replace(/_/g, " "))}`);
}

// ============================================================================
// Cancel Order (admin action)
// ============================================================================

export async function cancelOrder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const orderId = formData.get("orderId") as string;
  const reason = (formData.get("reason") as string) || "Cancelled by admin";

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (!order) redirect("/admin/orders");

  const { error } = await supabase
    .from("orders")
    .update({ status: "CANCELLED" })
    .eq("id", orderId);

  if (error) {
    redirect(`/admin/orders/${orderId}?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    from_status: order.status as "PENDING" | "PAYMENT_PENDING" | "PAID" | "PROCESSING" | "READY_TO_SHIP" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED",
    to_status: "CANCELLED",
    note: reason,
    changed_by: user.id,
  });

  await logAudit({
    action: AuditAction.CANCEL,
    resourceType: "orders",
    resourceId: orderId,
    oldValues: { status: order.status },
    newValues: { status: "CANCELLED" },
    metadata: { reason },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?message=${encodeURIComponent("Order cancelled")}`);
}

// ============================================================================
// Create Shipment (admin action)
// ============================================================================

export async function createShipment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const orderId = formData.get("orderId") as string;
  const provider = formData.get("provider") as string;
  const serviceName = formData.get("serviceName") as string;
  const trackingNumber = (formData.get("trackingNumber") as string) || null;
  const shippingCost = parseFloat(formData.get("shippingCost") as string) || 0;
  const estimatedDelivery = (formData.get("estimatedDelivery") as string) || null;

  const { error: shipError } = await supabase
    .from("shipments")
    .insert({
      order_id: orderId,
      provider: provider as "MANUAL" | "LALAMOVE" | "JNT" | "LBC",
      status: "BOOKED",
      tracking_number: trackingNumber,
      service_name: serviceName,
      shipping_cost: shippingCost,
      estimated_delivery_text: estimatedDelivery,
    });

  if (shipError) {
    redirect(`/admin/orders/${orderId}?error=${encodeURIComponent(shipError.message)}`);
  }

  // Update order shipping total and status
  await supabase
    .from("orders")
    .update({
      shipping_total: shippingCost,
      status: "READY_TO_SHIP",
    })
    .eq("id", orderId);

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    from_status: "PAID" as const,
    to_status: "READY_TO_SHIP",
    note: `Shipment created via ${provider} - ${serviceName}`,
    changed_by: user.id,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?message=${encodeURIComponent("Shipment created")}`);
}

// ============================================================================
// Update Shipment Status (admin action)
// ============================================================================

export async function updateShipmentStatus(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const shipmentId = formData.get("shipmentId") as string;
  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("status") as string;
  const description = (formData.get("description") as string) || null;

  const { data: shipment } = await supabase
    .from("shipments")
    .select("status, tracking_number")
    .eq("id", shipmentId)
    .single();

  if (!shipment) redirect(`/admin/orders/${orderId}`);

  const { error } = await supabase
    .from("shipments")
    .update({ status: newStatus })
    .eq("id", shipmentId);

  if (error) {
    redirect(`/admin/orders/${orderId}?error=${encodeURIComponent(error.message)}`);
  }

  // Log shipment event
  await supabase.from("shipment_events").insert({
    shipment_id: shipmentId,
    status: newStatus as "PENDING" | "QUOTED" | "BOOKED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED" | "CANCELLED",
    description,
  });

  // Update order status based on shipment status
  let orderStatus = null;
  if (newStatus === "PICKED_UP") orderStatus = "SHIPPED";
  else if (newStatus === "IN_TRANSIT") orderStatus = "SHIPPED";
  else if (newStatus === "OUT_FOR_DELIVERY") orderStatus = "OUT_FOR_DELIVERY";
  else if (newStatus === "DELIVERED") orderStatus = "DELIVERED";

  if (orderStatus) {
    await supabase.from("orders").update({ status: orderStatus }).eq("id", orderId);
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      from_status: null,
      to_status: orderStatus as "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED",
      note: `Shipment ${newStatus.replace(/_/g, " ").toLowerCase()}`,
      changed_by: user.id,
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?message=${encodeURIComponent("Shipment status updated")}`);
}