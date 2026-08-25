"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit, AuditAction } from "@/lib/audit";

// =============================================================================
// Helpers
// =============================================================================

async function requireAdmin() {
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
  if (role !== "admin" && role !== "super_admin") {
    throw new Error("Admin access required");
  }
  return { supabase, user };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// =============================================================================
// BLOG CATEGORIES
// =============================================================================

export type BlogCategoryInput = {
  name: string;
  slug?: string;
  description?: string;
};

export async function createBlogCategory(input: BlogCategoryInput) {
  const { supabase } = await requireAdmin();
  const slug = input.slug || slugify(input.name);
  const { error } = await supabase
    .from("blog_categories")
    .insert({ name: input.name, slug, description: input.description ?? null });
  if (error) return { error: error.message };
  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "blog_categories",
    resourceId: slug,
  });
  revalidatePath("/admin/content");
  return { ok: true, slug };
}

export async function deleteBlogCategory(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("blog_categories").delete().eq("id", id);
  if (error) return { error: error.message };
  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "blog_categories",
    resourceId: id,
  });
  revalidatePath("/admin/content");
  return { ok: true };
}

// =============================================================================
// BLOG POSTS
// =============================================================================

export type BlogPostInput = {
  id?: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  category_id?: string | null;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  seo_title?: string;
  seo_description?: string;
};

export async function createBlogPost(input: BlogPostInput) {
  const { supabase } = await requireAdmin();
  const slug = input.slug || slugify(input.title);
  const status = input.status || "DRAFT";

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: input.title,
      slug,
      excerpt: input.excerpt ?? null,
      content: input.content,
      featured_image_url: input.featured_image_url ?? null,
      category_id: input.category_id ?? null,
      status,
      seo_title: input.seo_title ?? null,
      seo_description: input.seo_description ?? null,
      author_id: user.id,
      published_at: status === "PUBLISHED" ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .single();

  if (error) return { error: error.message };
  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "blog_posts",
    resourceId: data.id,
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { ok: true, slug: data.slug, id: data.id };
}

export async function updateBlogPost(input: BlogPostInput) {
  if (!input.id) return { error: "Missing post id" };
  const { supabase } = await requireAdmin();
  const status = input.status || "DRAFT";

  // Auto-set published_at when transitioning to PUBLISHED for the first time
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("published_at, status")
    .eq("id", input.id)
    .single();
  const published_at =
    status === "PUBLISHED" && !existing?.published_at
      ? new Date().toISOString()
      : (existing?.published_at ?? null);

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title: input.title,
      slug: input.slug || slugify(input.title),
      excerpt: input.excerpt ?? null,
      content: input.content,
      featured_image_url: input.featured_image_url ?? null,
      category_id: input.category_id ?? null,
      status,
      seo_title: input.seo_title ?? null,
      seo_description: input.seo_description ?? null,
      published_at,
    })
    .eq("id", input.id);

  if (error) return { error: error.message };
  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "blog_posts",
    resourceId: input.id,
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { ok: true };
}

export async function togglePublishBlogPost(id: string) {
  const { supabase } = await requireAdmin();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("status, published_at")
    .eq("id", id)
    .single();
  if (!post) return { error: "Post not found" };
  const next = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  const { error } = await supabase
    .from("blog_posts")
    .update({
      status: next,
      published_at:
        next === "PUBLISHED" && !post.published_at
          ? new Date().toISOString()
          : post.published_at,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "blog_posts",
    resourceId: id,
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { ok: true, status: next };
}

export async function deleteBlogPost(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { error: error.message };
  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "blog_posts",
    resourceId: id,
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { ok: true };
}

export async function deleteBlogPostAndRedirect(id: string) {
  await deleteBlogPost(id);
  redirect("/admin/blog");
}

// =============================================================================
// FAQs
// =============================================================================

export async function createFaq(input: { question: string; answer: string; sort_order?: number }) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("faqs")
    .insert({
      question: input.question,
      answer: input.answer,
      sort_order: input.sort_order ?? 0,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "faqs",
    resourceId: data.id,
  });
  revalidatePath("/admin/content");
  revalidatePath("/faq");
  return { ok: true };
}

export async function updateFaq(input: {
  id: string;
  question: string;
  answer: string;
  sort_order?: number;
  is_enabled?: boolean;
}) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("faqs")
    .update({
      question: input.question,
      answer: input.answer,
      sort_order: input.sort_order ?? 0,
      is_enabled: input.is_enabled ?? true,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "faqs",
    resourceId: input.id,
  });
  revalidatePath("/admin/content");
  revalidatePath("/faq");
  return { ok: true };
}

export async function deleteFaq(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) return { error: error.message };
  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "faqs",
    resourceId: id,
  });
  revalidatePath("/admin/content");
  revalidatePath("/faq");
  return { ok: true };
}

// =============================================================================
// PAGE SECTIONS (high-level: toggle a section's enabled state)
// =============================================================================

export async function togglePageSection(id: string) {
  const { supabase } = await requireAdmin();
  const { data: section } = await supabase
    .from("page_sections")
    .select("is_enabled")
    .eq("id", id)
    .single();
  if (!section) return { error: "Section not found" };
  const { error } = await supabase
    .from("page_sections")
    .update({ is_enabled: !section.is_enabled })
    .eq("id", id);
  if (error) return { error: error.message };
  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "page_sections",
    resourceId: id,
  });
  revalidatePath("/admin/content");
  return { ok: true };
}