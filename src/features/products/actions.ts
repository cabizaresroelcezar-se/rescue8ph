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
  }).select("id");

  if (error) {
    redirect(`/admin/products/new?error=${encodeURIComponent(error.message)}`);
  }

  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "products",
    resourceId: newProduct?.[0]?.id,
    newValues: { title, slug, price, status: formData.get("status") },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
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