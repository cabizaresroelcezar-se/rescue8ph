import { createClient } from "@/lib/supabase/server";

/**
 * Audit log action types — keep in sync with the audit_logs table.
 */
export const AuditAction = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  STATUS_CHANGE: "STATUS_CHANGE",
  PRICE_OVERRIDE: "PRICE_OVERRIDE",
  REFUND: "REFUND",
  CANCEL: "CANCEL",
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

/**
 * Log an audit event. Call this from server actions after a privileged operation.
 *
 * Usage:
 *   await logAudit({
 *     action: AuditAction.CREATE,
 *     resourceType: "products",
 *     resourceId: product.id,
 *     newValues: { title: product.title, price: product.price },
 *   });
 *
 * The user_id is resolved from the current Supabase session automatically.
 */
export async function logAudit(params: {
  action: AuditActionType | string;
  resourceType: string;
  resourceId?: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("audit_logs").insert({
      user_id: user?.id || null,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId || null,
      old_values: params.oldValues || null,
      new_values: params.newValues || null,
      metadata: params.metadata || {},
    });

    if (error) {
      console.error("[audit] Failed to write audit log:", error.message);
    }
  } catch (err) {
    // Audit logging should never break the main operation
    console.error("[audit] Unexpected error:", err);
  }
}