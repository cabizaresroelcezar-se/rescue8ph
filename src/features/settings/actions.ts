"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit, AuditAction } from "@/lib/audit";

/**
 * Site settings server actions.
 *
 * Permission gate: all mutations require SETTINGS_MANAGE.
 * RLS also enforces this; the explicit guard here is defence-in-depth
 * and gives nicer error messages.
 */

type Result = { error?: string; success?: true };

async function requireSettingsManage(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(name, role_permissions(permission:permissions(key)))")
    .eq("id", user.id)
    .single();

  type ProfileShape = {
    roles?: {
      name?: string;
      role_permissions?: Array<{ permission?: { key?: string } | null }>;
    } | null;
  };
  const typed = profile as ProfileShape | null;
  const role = typed?.roles?.name;
  if (role === "super_admin") return { ok: true };

  const perms = (typed?.roles?.role_permissions ?? [])
    .map((p) => p.permission?.key)
    .filter((k): k is string => Boolean(k));
  if (!perms.includes("SETTINGS_MANAGE")) {
    return { ok: false, error: "You don't have permission to manage settings." };
  }
  return { ok: true };
}

export async function updateSetting(
  id: string,
  input: { value: unknown; description?: string | null; is_public?: boolean },
): Promise<Result> {
  const guard = await requireSettingsManage();
  if (!guard.ok) return { error: guard.error };

  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .update({
      value: input.value as never,
      description: input.description ?? null,
      is_public: input.is_public ?? false,
    })
    .eq("id", id);

  if (error) {
    await logAudit({
      action: AuditAction.UPDATE,
      resourceType: "site_setting",
      resourceId: id,
      metadata: { source: "admin/settings", error: error.message },
    });
    return { error: error.message };
  }

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "site_setting",
    resourceId: id,
    metadata: { source: "admin/settings" },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout"); // public-facing settings may affect the homepage
  return { success: true };
}

export async function createSetting(input: {
  key: string;
  value: unknown;
  description?: string | null;
  is_public?: boolean;
}): Promise<Result> {
  const guard = await requireSettingsManage();
  if (!guard.ok) return { error: guard.error };

  // Key validation: lowercase letters, digits, underscores. Must start with a letter.
  if (!/^[a-z][a-z0-9_]*$/.test(input.key)) {
    return {
      error:
        'Key must be lowercase letters, digits, and underscores. Must start with a letter (e.g. "site_name", "shipping_rate").',
    };
  }
  if (input.key.length > 64) {
    return { error: "Key must be 64 characters or fewer." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .insert({
      key: input.key,
      value: input.value as never,
      description: input.description ?? null,
      is_public: input.is_public ?? false,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: `Setting "${input.key}" already exists. Pick a different key.` };
    }
    return { error: error.message };
  }

  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "site_setting",
    resourceId: data?.id,
    metadata: { key: input.key, source: "admin/settings" },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deleteSetting(id: string): Promise<Result> {
  const guard = await requireSettingsManage();
  if (!guard.ok) return { error: guard.error };

  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("site_settings")
    .select("key")
    .eq("id", id)
    .single();

  if (error || !row) return { error: "Setting not found." };

  const { error: delErr } = await supabase.from("site_settings").delete().eq("id", id);

  if (delErr) return { error: delErr.message };

  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "site_setting",
    resourceId: id,
    metadata: { key: row.key, source: "admin/settings" },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}