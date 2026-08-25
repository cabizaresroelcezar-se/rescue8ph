"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit, AuditAction } from "@/lib/audit";

/**
 * User & Role management server actions. Restricted to super_admin only.
 * All actions audit-logged.
 */

async function requireSuperAdmin() {
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
  if (role !== "super_admin") {
    throw new Error("Super admin access required");
  }
  return { supabase, user };
}

/**
 * Promote or demote a user by assigning them a role_id.
 * Looks up the role by name.
 */
export async function updateUserRole(
  userId: string,
  roleName: "super_admin" | "admin" | "customer",
) {
  const { supabase, user } = await requireSuperAdmin();

  // Prevent self-demotion (a super admin cannot demote themselves)
  if (userId === user.id && roleName !== "super_admin") {
    return { error: "You cannot change your own role" };
  }

  const { data: role } = await supabase
    .from("roles")
    .select("id")
    .eq("name", roleName)
    .single();
  if (!role) return { error: `Role "${roleName}" not found` };

  const { error } = await supabase
    .from("profiles")
    .update({ role_id: role.id, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) return { error: error.message };

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "profiles",
    resourceId: userId,
    metadata: { new_role: roleName, changed_by: user.id },
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true };
}

/**
 * Toggle a permission for a role (add or remove from role_permissions).
 */
export async function toggleRolePermission(
  roleName: "super_admin" | "admin" | "customer",
  permissionCode: string,
  grant: boolean,
) {
  const { supabase, user } = await requireSuperAdmin();

  // Safety: don't allow editing super_admin permissions
  if (roleName === "super_admin") {
    return { error: "Super admin always has all permissions" };
  }

  const [{ data: role }, { data: permission }] = await Promise.all([
    supabase.from("roles").select("id").eq("name", roleName).single(),
    supabase
      .from("permissions")
      .select("id")
      .eq("code", permissionCode)
      .single(),
  ]);
  if (!role || !permission) {
    return { error: "Role or permission not found" };
  }

  if (grant) {
    const { error } = await supabase
      .from("role_permissions")
      .upsert(
        { role_id: role.id, permission_id: permission.id },
        { onConflict: "role_id,permission_id" },
      );
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", role.id)
      .eq("permission_id", permission.id);
    if (error) return { error: error.message };
  }

  await logAudit({
    action: grant ? AuditAction.CREATE : AuditAction.DELETE,
    resourceType: "role_permissions",
    resourceId: `${role.id}:${permission.id}`,
    metadata: { role: roleName, permission: permissionCode, by: user.id },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

/**
 * Update a profile's basic fields (first_name, last_name, phone).
 * Super admin can edit any profile; admins can edit their own.
 */
export async function updateUserProfile(
  userId: string,
  fields: { first_name?: string; last_name?: string; phone?: string },
) {
  const { supabase } = await requireSuperAdmin();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (fields.first_name !== undefined) updates.first_name = fields.first_name.trim() || null;
  if (fields.last_name !== undefined) updates.last_name = fields.last_name.trim() || null;
  if (fields.phone !== undefined) updates.phone = fields.phone.trim() || null;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (error) return { error: error.message };

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "profiles",
    resourceId: userId,
    metadata: { fields: Object.keys(updates) },
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true };
}