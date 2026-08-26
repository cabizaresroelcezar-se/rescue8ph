"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit, AuditAction } from "@/lib/audit";

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string) || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const price = parseFloat(formData.get("price") as string) || 0;

  const { data: newProduct, error } = await supabase.from("products").insert({
    title,
    slug,
    short_description: formData.get("shortDescription") as string || null,
    description: formData.get("description") as string || null,
    price,
    compare_at_price: formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null,
    sku: formData.get("sku") as string || null,
    status: (formData.get("status") as string) || "DRAFT",
    featured: formData.get("featured") === "true",
    weight_grams: formData.get("weightGrams") ? parseInt(formData.get("weightGrams") as string) : null,
    seo_title: formData.get("seoTitle") as string || null,
    seo_description: formData.get("seoDescription") as string || null,
    created_by: user.id,
    published_at: formData.get("status") === "ACTIVE" ? new Date().toISOString() : null,
  }).select("id").single();

  if (error) {
    redirect(`/admin/products/new?error=${encodeURIComponent(error.message)}`);
  }

  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "products",
    resourceId: newProduct?.id,
    newValues: { title, slug, price, status: formData.get("status") },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${newProduct?.id}`);
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string) || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const price = parseFloat(formData.get("price") as string) || 0;
  const status = formData.get("status") as string;

  const { error } = await supabase.from("products").update({
    title,
    slug,
    short_description: formData.get("shortDescription") as string || null,
    description: formData.get("description") as string || null,
    price,
    compare_at_price: formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null,
    sku: formData.get("sku") as string || null,
    status,
    featured: formData.get("featured") === "true",
    weight_grams: formData.get("weightGrams") ? parseInt(formData.get("weightGrams") as string) : null,
    seo_title: formData.get("seoTitle") as string || null,
    seo_description: formData.get("seoDescription") as string || null,
    updated_by: user.id,
    published_at: status === "ACTIVE" ? new Date().toISOString() : null,
  }).eq("id", id);

  if (error) {
    redirect(`/admin/products/${id}?error=${encodeURIComponent(error.message)}`);
  }

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "products",
    resourceId: id,
    newValues: { title, slug, price, status, featured: formData.get("featured") === "true" },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

// ============================================================================
// PRODUCT IMAGES
// ============================================================================

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function slugifyFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uploadProductImages(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const productId = formData.get("productId") as string;
  const files = formData.getAll("files") as File[];
  if (!productId) return { error: "Missing productId" };
  if (!files.length) return { error: "No files selected" };

  const uploaded: { storage_path: string; alt_text: string }[] = [];
  const errors: string[] = [];

  // Find current max sort_order so we can append
  const { data: existing } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);
  let nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: exceeds 5 MB limit`);
      continue;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: must be JPG, PNG, WEBP, or GIF`);
      continue;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = slugifyFileName(file.name.replace(/\.[^.]+$/, "")) || "image";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}.${ext}`;
    const storagePath = `${productId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      errors.push(`${file.name}: ${uploadError.message}`);
      continue;
    }

    const alt = formData.get(`alt_${file.name}`) as string | null;

    const { error: rowError } = await supabase.from("product_images").insert({
      product_id: productId,
      storage_path: storagePath,
      alt_text: alt || file.name.replace(/\.[^.]+$/, ""),
      sort_order: nextOrder++,
      is_primary: false,
    });

    if (rowError) {
      errors.push(`${file.name}: ${rowError.message}`);
      // Try to clean up the uploaded file
      await supabase.storage.from("products").remove([storagePath]);
      continue;
    }

    uploaded.push({ storage_path: storagePath, alt_text: alt || file.name });
  }

  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "product_images",
    resourceId: productId,
    metadata: { count: uploaded.length, errors: errors.length },
  });

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  revalidatePath("/");

  return { uploaded: uploaded.length, errors };
}

export async function deleteProductImage(imageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: img } = await supabase
    .from("product_images")
    .select("id, product_id, storage_path")
    .eq("id", imageId)
    .single();

  if (!img) return { error: "Image not found" };

  // Remove the file from Storage first
  const { error: storageError } = await supabase.storage
    .from("products")
    .remove([img.storage_path]);

  if (storageError) {
    // Continue — best-effort cleanup
    console.warn("Storage delete failed:", storageError.message);
  }

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) return { error: error.message };

  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "product_images",
    resourceId: imageId,
    metadata: { product_id: img.product_id, storage_path: img.storage_path },
  });

  revalidatePath(`/admin/products/${img.product_id}`);
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true };
}

export async function setPrimaryProductImage(imageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: img } = await supabase
    .from("product_images")
    .select("id, product_id")
    .eq("id", imageId)
    .single();

  if (!img) return { error: "Image not found" };

  // Clear the current primary, then set this one
  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", img.product_id);

  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/products/${img.product_id}`);
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true };
}

export async function updateProductImageAlt(imageId: string, altText: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: img } = await supabase
    .from("product_images")
    .select("id, product_id")
    .eq("id", imageId)
    .single();

  if (!img) return { error: "Image not found" };

  const { error } = await supabase
    .from("product_images")
    .update({ alt_text: altText })
    .eq("id", imageId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/products/${img.product_id}`);

  return { success: true };
}
/**
 * Replace a product's category assignments (junction table).
 * Uses a delete-all-then-insert pattern for atomicity within the
 * action; small N (categories per product <= ~10), so it's fine.
 */
export async function setProductCategories(
  productId: string,
  categoryIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  // Verify staff
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single();
  const roleData = (profile as { roles?: { name?: string } | { name?: string }[] | null } | null)?.roles;
  const roleName = Array.isArray(roleData) ? roleData[0]?.name : roleData?.name;
  if (roleName !== "admin" && roleName !== "super_admin") {
    return { ok: false, error: "Only staff can edit product categories" };
  }

  // Validate all category IDs exist + are PUBLISHED/DRAFT
  if (categoryIds.length > 0) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id")
      .in("id", categoryIds);
    const found = new Set((cats ?? []).map((c) => c.id));
    const missing = categoryIds.filter((id) => !found.has(id));
    if (missing.length > 0) {
      return { ok: false, error: `Unknown category IDs: ${missing.join(", ")}` };
    }
  }

  // Replace-all pattern
  const { error: delErr } = await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", productId);
  if (delErr) return { ok: false, error: delErr.message };

  if (categoryIds.length > 0) {
    const rows = categoryIds.map((category_id) => ({
      product_id: productId,
      category_id,
    }));
    const { error: insErr } = await supabase
      .from("product_categories")
      .insert(rows);
    if (insErr) return { ok: false, error: insErr.message };
  }

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "products",
    resourceId: productId,
    newValues: { category_ids: categoryIds },
  }).catch(() => {});

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true };
}
