import { createClient } from "@/lib/supabase/server";

/**
 * Gets the current authenticated user from the server session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Gets the current authenticated user's profile including role.
 * Returns null if not authenticated or profile not found.
 */
export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      *,
      role:roles (
        id,
        name,
        role_permissions (
          permission:permissions (
            code
          )
        )
      )
    `,
    )
    .eq("id", user.id)
    .single();

  return profile;
}

/**
 * Gets the current user's permission codes.
 * Returns empty array if not authenticated.
 */
export async function getCurrentPermissions(): Promise<string[]> {
  const profile = await getCurrentProfile();
  if (!profile?.role?.role_permissions) return [];
  return profile.role.role_permissions
    .map((rp: { permission?: { code: string } }) => rp.permission?.code)
    .filter((code: string | undefined): code is string => Boolean(code));
}

/**
 * Checks if the current user has a specific permission.
 */
export async function hasPermission(permissionCode: string): Promise<boolean> {
  const permissions = await getCurrentPermissions();
  return permissions.includes(permissionCode);
}

/**
 * Checks if the current user has a specific role.
 */
export async function hasRole(roleName: string): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role?.name === roleName;
}

/**
 * Requires authentication. Throws if not authenticated.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }
  return user;
}

/**
 * Requires a specific permission. Throws if not authorized.
 */
export async function requirePermission(permissionCode: string) {
  const user = await requireAuth();
  const hasPermissionFlag = await hasPermission(permissionCode);
  if (!hasPermissionFlag) {
    throw new Error(`Forbidden: ${permissionCode} permission required`);
  }
  return user;
}

/**
 * Requires admin or super_admin role. Throws if not authorized.
 */
export async function requireAdmin() {
  const user = await requireAuth();
  const isAdmin = await hasRole("admin");
  const isSuperAdmin = await hasRole("super_admin");
  if (!isAdmin && !isSuperAdmin) {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}