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
  const { supabase, user } = await requireAdmin();
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

// =============================================================================
// PAGE SECTIONS (composable blocks on a CMS page)
// =============================================================================

export type SectionType =
  | "HERO"
  | "FEATURE_GRID"
  | "PRODUCT_GRID"
  | "IMAGE_TEXT"
  | "SERVICE_GRID"
  | "TESTIMONIALS"
  | "FAQ"
  | "BLOG_GRID"
  | "CTA"
  | "RICH_TEXT"
  | "BANNER";

export interface PageSectionInput {
  page_id: string;
  section_type: SectionType;
  sort_order?: number;
  is_enabled?: boolean;
  content?: Record<string, unknown>;
}

export async function createPageSection(input: PageSectionInput) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("page_sections")
    .insert({
      page_id: input.page_id,
      section_type: input.section_type,
      sort_order: input.sort_order ?? 0,
      is_enabled: input.is_enabled ?? true,
      content: input.content ?? {},
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "page_sections",
    resourceId: data.id,
  });
  revalidatePath(`/admin/pages`);
  revalidatePath(`/admin/pages/${input.page_id}`);
  return { ok: true, id: data.id };
}

export async function updatePageSection(
  id: string,
  input: Partial<PageSectionInput>,
) {
  const { supabase } = await requireAdmin();
  const updates: Record<string, unknown> = {};
  if (input.section_type !== undefined) updates.section_type = input.section_type;
  if (input.sort_order !== undefined) updates.sort_order = input.sort_order;
  if (input.is_enabled !== undefined) updates.is_enabled = input.is_enabled;
  if (input.content !== undefined) updates.content = input.content;
  const { data: existing, error: fetchErr } = await supabase
    .from("page_sections")
    .select("page_id")
    .eq("id", id)
    .single();
  if (fetchErr || !existing) return { error: "Section not found" };

  const { error } = await supabase
    .from("page_sections")
    .update(updates)
    .eq("id", id);
  if (error) return { error: error.message };

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "page_sections",
    resourceId: id,
  });
  revalidatePath(`/admin/pages/${existing.page_id}`);
  return { ok: true };
}

export async function deletePageSection(id: string) {
  const { supabase } = await requireAdmin();
  const { data: existing, error: fetchErr } = await supabase
    .from("page_sections")
    .select("page_id")
    .eq("id", id)
    .single();
  if (fetchErr || !existing) return { error: "Section not found" };

  const { error } = await supabase.from("page_sections").delete().eq("id", id);
  if (error) return { error: error.message };

  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "page_sections",
    resourceId: id,
  });
  revalidatePath(`/admin/pages/${existing.page_id}`);
  return { ok: true };
}

// =============================================================================
// PAGES (CMS pages)
// =============================================================================

export async function createPage(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "");
  const seoTitle = String(formData.get("seo_title") ?? "").trim() || null;
  const seoDescription =
    String(formData.get("seo_description") ?? "").trim() || null;
  const status =
    (String(formData.get("status") ?? "DRAFT") as "DRAFT" | "PUBLISHED");

  if (!title) return { error: "Title is required" };

  const slug = slugify(slugRaw || title);
  if (!slug) return { error: "Slug could not be generated" };

  const { data, error } = await supabase
    .from("pages")
    .insert({
      title,
      slug,
      excerpt,
      body,
      seo_title: seoTitle,
      seo_description: seoDescription,
      status,
      published_at: status === "PUBLISHED" ? new Date().toISOString() : null,
      created_by: user.id,
      updated_by: user.id,
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") {
      return { error: `Slug "${slug}" is already in use` };
    }
    return { error: error.message };
  }

  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "pages",
    resourceId: data.id,
  });
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${data.id}`);
}

export async function updatePage(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing page id" };

  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "");
  const seoTitle = String(formData.get("seo_title") ?? "").trim() || null;
  const seoDescription =
    String(formData.get("seo_description") ?? "").trim() || null;
  const status =
    (String(formData.get("status") ?? "DRAFT") as "DRAFT" | "PUBLISHED");

  if (!title) return { error: "Title is required" };

  const slug = slugify(slugRaw || title);
  if (!slug) return { error: "Slug could not be generated" };

  // Determine if we're transitioning to PUBLISHED for the first time
  const { data: existing } = await supabase
    .from("pages")
    .select("status, published_at")
    .eq("id", id)
    .single();
  if (!existing) return { error: "Page not found" };

  const updates: Record<string, unknown> = {
    title,
    slug,
    excerpt,
    body,
    seo_title: seoTitle,
    seo_description: seoDescription,
    status,
    updated_by: user.id,
  };

  // Set published_at when transitioning to PUBLISHED for the first time;
  // do NOT touch it on subsequent edits.
  if (status === "PUBLISHED" && !existing.published_at) {
    updates.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("pages").update(updates).eq("id", id);
  if (error) {
    if (error.code === "23505") {
      return { error: `Slug "${slug}" is already in use` };
    }
    return { error: error.message };
  }

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "pages",
    resourceId: id,
  });
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${id}`);
  return { ok: true };
}

export async function togglePublishPage(id: string) {
  const { supabase } = await requireAdmin();
  const { data: page, error: fetchErr } = await supabase
    .from("pages")
    .select("status, published_at")
    .eq("id", id)
    .single();
  if (fetchErr || !page) return { error: fetchErr?.message ?? "Page not found" };

  const next = page.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  const updates: Record<string, unknown> = { status: next };
  if (next === "PUBLISHED" && !page.published_at) {
    updates.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("pages")
    .update(updates)
    .eq("id", id);
  if (error) return { error: error.message };

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "pages",
    resourceId: id,
  });
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${id}`);
  return { ok: true };
}

export async function deletePage(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) return { error: error.message };
  await logAudit({
    action: AuditAction.DELETE,
    resourceType: "pages",
    resourceId: id,
  });
  revalidatePath("/admin/pages");
  return { ok: true };
}