"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit, AuditAction } from "@/lib/audit";

/**
 * Media-library server actions — currently used for storage delete.
 * The product_images table has its own CRUD; this is the bucket-level
 * delete for the media library page (admin-only).
 *
 * Safety notes:
 *  - Only admins and super_admins may delete
 *  - Files referenced by product_images are blocked from bucket delete
 *    (delete from the product page first)
 *  - Every successful delete writes to private.audit_log
 */

const PROTECTED_BUCKETS = new Set<string>([]);

export async function deleteMediaFile(
  bucket: string,
  filePath: string,
): Promise<{ ok: boolean; error?: string }> {
  if (PROTECTED_BUCKETS.has(bucket)) {
    return { ok: false, error: `Bucket '${bucket}' is protected from deletion.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  // Staff-only check — media library is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single();
  const roleData = (profile as { roles?: { name?: string } | { name?: string }[] | null } | null)?.roles;
  const roleName = Array.isArray(roleData) ? roleData[0]?.name : roleData?.name;
  if (roleName !== "admin" && roleName !== "super_admin") {
    return { ok: false, error: "Only admins can delete media files." };
  }

  // If this is the products bucket, refuse without cascade-cleanup.
  if (bucket === "products") {
    const { data: refs } = await supabase
      .from("product_images")
      .select("id")
      .eq("storage_path", filePath)
      .limit(1);
    if (refs && refs.length > 0) {
      return {
        ok: false,
        error: `File is referenced by a product image. Delete it from the product page first.`,
      };
    }
  }

  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "media",
    resourceId: `${bucket}/${filePath}` as unknown as string,
    metadata: { bucket, file_path: filePath },
  }).catch(() => {});

  revalidatePath("/admin/media");
  return { ok: true };
}
