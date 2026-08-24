import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// ============================================================================
// Payment Webhook Handler
// ============================================================================
// This endpoint receives webhooks from payment providers (Xendit, PayMongo).
// Webhook handling must be:
//   - Verified (signature validation)
//   - Idempotent (duplicate events don't cause double processing)
//   - Safe (never expose internal errors)
//
// The external_event_id is used for idempotency.

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const payload = JSON.parse(body);

    // Extract provider and event ID
    // Provider detection (used for logging, not yet for verification)
    const externalEventId =
      payload.id || payload.event_id || payload.data?.id || null;

    if (!externalEventId) {
      return NextResponse.json(
        { error: "Missing event ID" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // --- Idempotency check ---
    // Check if this event has already been processed
    const { data: existingTxn } = await supabase
      .from("payment_transactions")
      .select("id")
      .eq("external_event_id", externalEventId)
      .single();

    if (existingTxn) {
      // Already processed — return success (idempotent)
      return NextResponse.json({ status: "ok", message: "Duplicate event ignored" });
    }

    // --- Find payment by provider_payment_id ---
    const providerPaymentId =
      payload.data?.payment_id || payload.payment_id || payload.id;

    if (!providerPaymentId) {
      return NextResponse.json(
        { error: "Missing payment ID" },
        { status: 400 },
      );
    }

    const { data: payment } = await supabase
      .from("payments")
      .select("id, order_id, amount, status")
      .eq("provider_payment_id", providerPaymentId)
      .single();

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 },
      );
    }

    // --- Determine payment status from webhook ---
    const eventType = payload.event_type || payload.type || payload.event;
    let paymentStatus: "PAID" | "FAILED" | "EXPIRED" = "PAID";

    if (eventType && eventType.includes("failed")) {
      paymentStatus = "FAILED";
    } else if (eventType && eventType.includes("expired")) {
      paymentStatus = "EXPIRED";
    }

    // --- Log the transaction (idempotency record) ---
    await supabase.from("payment_transactions").insert({
      payment_id: payment.id,
      event_type: eventType || "WEBHOOK",
      external_event_id: externalEventId,
      status: paymentStatus,
      amount: payload.data?.amount || payment.amount,
      payload: payload,
    });

    // --- Update payment status ---
    if (paymentStatus === "PAID" && payment.status === "PENDING") {
      await supabase
        .from("payments")
        .update({ status: "PAID" })
        .eq("id", payment.id);

      // Update order status
      await supabase
        .from("orders")
        .update({ status: "PAID" })
        .eq("id", payment.order_id);

      await supabase.from("order_status_history").insert({
        order_id: payment.order_id,
        from_status: "PAYMENT_PENDING",
        to_status: "PAID",
        note: "Payment confirmed via webhook",
      });
    } else if (paymentStatus === "FAILED") {
      await supabase
        .from("payments")
        .update({ status: "FAILED" })
        .eq("id", payment.id);

      await supabase
        .from("orders")
        .update({ status: "FAILED" })
        .eq("id", payment.order_id);

      await supabase.from("order_status_history").insert({
        order_id: payment.order_id,
        from_status: "PAYMENT_PENDING",
        to_status: "FAILED",
        note: "Payment failed via webhook",
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch {
    // Never reveal internal errors to the caller
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 },
    );
  }
}