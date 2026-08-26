"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit, AuditAction } from "@/lib/audit";

/**
 * Order notes server actions (admin conversation thread).
 *
 * - addOrderNote: append a note to an order
 * - editOrderNote: edit your own note (within 5 minutes)
 * - deleteOrderNote: delete your own note (or any if ORDER_DELETE)
 * - listOrderNotes: fetch all notes for an order (server-side helper)
 */

const EDIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export type NoteVisibility = "INTERNAL" | "CUSTOMER_VISIBLE";

export interface OrderNote {
  id: string;
  order_id: string;
  author_id: string;
  visibility: NoteVisibility;
  body: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface AddNoteResult {
  ok: boolean;
  note?: OrderNote;
  error?: string;
}

async function requireOrderAccess(orderId: string): Promise<
  { ok: true; userId: string; canDelete: boolean } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  // Must be staff to add/edit/delete
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single();
  const roleName = (profile as { roles?: { name?: string } | { name?: string }[] | null } | null)?.roles;
  const name = Array.isArray(roleName) ? roleName[0]?.name : roleName?.name;
  if (name !== "admin" && name !== "super_admin") {
    return { ok: false, error: "Only staff can manage order notes" };
  }

  // Verify order exists
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .single();
  if (!order) return { ok: false, error: "Order not found" };

  // Check delete permission via the existing helper
  const { data: perms } = await supabase.rpc("private_get_user_permissions", {
    p_user_id: user.id,
  });
  const canDelete = Array.isArray(perms) && (perms as string[]).includes("ORDER_DELETE");

  return { ok: true, userId: user.id, canDelete };
}

export async function addOrderNote(
  orderId: string,
  body: string,
  visibility: NoteVisibility = "INTERNAL",
): Promise<AddNoteResult> {
  const trimmed = body.trim();
  if (trimmed.length < 1 || trimmed.length > 4000) {
    return { ok: false, error: "Note must be between 1 and 4000 characters" };
  }
  if (visibility !== "INTERNAL" && visibility !== "CUSTOMER_VISIBLE") {
    return { ok: false, error: "Invalid visibility value" };
  }

  const guard = await requireOrderAccess(orderId);
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_notes")
    .insert({
      order_id: orderId,
      author_id: guard.userId,
      visibility,
      body: trimmed,
    })
    .select(
      "id, order_id, author_id, visibility, body, created_at, updated_at, author:profiles!order_notes_author_id_fkey(id, first_name, last_name, display_name, avatar_url)",
    )
    .single();

  if (error) {
    await logAudit({
      action: AuditAction.CREATE,
      resourceType: "order_note",
      resourceId: orderId,
      metadata: { source: "admin/orders/[id]", error: error.message },
    }).catch(() => {});
    return { ok: false, error: error.message };
  }

  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "order_note",
    resourceId: data.id,
    metadata: {
      order_id: orderId,
      visibility,
      source: "admin/orders/[id]",
    },
  }).catch(() => {});

  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, note: data as unknown as OrderNote };
}

export async function editOrderNote(
  noteId: string,
  body: string,
): Promise<AddNoteResult> {
  const trimmed = body.trim();
  if (trimmed.length < 1 || trimmed.length > 4000) {
    return { ok: false, error: "Note must be between 1 and 4000 characters" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  // Must be staff
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single();
  const roleName = (profile as { roles?: { name?: string } | { name?: string }[] | null } | null)?.roles;
  const name = Array.isArray(roleName) ? roleName[0]?.name : roleName?.name;
  if (name !== "admin" && name !== "super_admin") {
    return { ok: false, error: "Only staff can edit order notes" };
  }

  // Fetch the note to check edit window
  const { data: existing } = await supabase
    .from("order_notes")
    .select("id, order_id, author_id, created_at")
    .eq("id", noteId)
    .single();
  if (!existing) return { ok: false, error: "Note not found" };

  if (existing.author_id !== user.id) {
    return {
      ok: false,
      error: "You can only edit your own notes",
    };
  }

  const createdMs = new Date(existing.created_at).getTime();
  if (Date.now() - createdMs > EDIT_WINDOW_MS) {
    return {
      ok: false,
      error: `Edit window expired (${Math.round(EDIT_WINDOW_MS / 60000)} min). Delete and re-add instead.`,
    };
  }

  const { data, error } = await supabase
    .from("order_notes")
    .update({ body: trimmed })
    .eq("id", noteId)
    .select(
      "id, order_id, author_id, visibility, body, created_at, updated_at, author:profiles!order_notes_author_id_fkey(id, first_name, last_name, display_name, avatar_url)",
    )
    .single();

  if (error) return { ok: false, error: error.message };

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "order_note",
    resourceId: noteId,
    metadata: { order_id: existing.order_id, source: "admin/orders/[id]" },
  }).catch(() => {});

  revalidatePath(`/admin/orders/${existing.order_id}`);
  return { ok: true, note: data as unknown as OrderNote };
}

export async function deleteOrderNote(noteId: string): Promise<{ ok: boolean; error?: string; orderId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  // Fetch note first so we can return the order_id for revalidation
  const { data: existing } = await supabase
    .from("order_notes")
    .select("id, order_id, author_id")
    .eq("id", noteId)
    .single();
  if (!existing) return { ok: false, error: "Note not found" };

  const guard = await requireOrderAccess(existing.order_id);
  if (!guard.ok) return guard;

  // RLS will enforce: own notes OR has ORDER_DELETE
  const { error } = await supabase.from("order_notes").delete().eq("id", noteId);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "order_note",
    resourceId: noteId,
    metadata: {
      order_id: existing.order_id,
      source: "admin/orders/[id]",
    },
  }).catch(() => {});

  revalidatePath(`/admin/orders/${existing.order_id}`);
  return { ok: true, orderId: existing.order_id };
}

export async function listOrderNotes(orderId: string): Promise<OrderNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_notes")
    .select(
      "id, order_id, author_id, visibility, body, created_at, updated_at, author:profiles!order_notes_author_id_fkey(id, first_name, last_name, display_name, avatar_url)",
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.warn("[order-notes] list failed", error.message);
    return [];
  }
  return (data ?? []) as unknown as OrderNote[];
}