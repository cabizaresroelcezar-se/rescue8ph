"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit, AuditAction } from "@/lib/audit";

/**
 * CMS enhancements server actions.
 *
 * - autosavePageDraft: silent debounced save (no revalidate, no redirect)
 * - listPageRevisions: history for the side panel
 * - restorePageRevision: revert to an earlier version
 * - schedulePagePublish: set a future publish_at timestamp
 * - cancelScheduledPublish: clear publish_at, keep status
 * - publishNowFromSchedule: publish a scheduled page immediately
 */

export type PageRevision = {
  id: string;
  page_id: string;
  version: number;
  title: string;
  slug: string;
  body: string | null;
  excerpt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  featured_image_url: string | null;
  status: string;
  author_id: string;
  change_note: string | null;
  created_at: string;
  author?: {
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
  } | null;
};

async function requireStaff(): Promise<{ supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never; userId: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single();
  const roleData = (profile as { roles?: { name?: string } | { name?: string }[] | null } | null)?.roles;
  const roleName = Array.isArray(roleData) ? roleData[0]?.name : roleData?.name;
  if (roleName !== "admin" && roleName !== "super_admin") {
    return { error: "Only staff can perform this action" };
  }
  return { supabase, userId: user.id };
}

/**
 * Autosave the page draft. Fires every 5-10s while the user is editing.
 *
 * Behavior:
 * - Only updates the editable fields (title, slug, body, excerpt, SEO,
 *   featured image)
 * - Keeps the existing status (does not auto-publish)
 * - Skips revalidatePath (we use router.refresh in the client for the
 *   "saved at" timestamp)
 * - Returns the savedAt timestamp on success
 */
export async function autosavePageDraft(input: {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  featured_image_url: string | null;
}): Promise<{ ok: true; savedAt: string } | { ok: false; error: string }> {
  const guard = await requireStaff();
  if ("error" in guard) return { ok: false, error: guard.error };

  if (!input.title.trim()) return { ok: false, error: "Title is required" };
  if (!input.slug.trim()) return { ok: false, error: "Slug is required" };

  const { data, error } = await guard.supabase
    .from("pages")
    .update({
      title: input.title.trim(),
      slug: input.slug.trim(),
      body: input.body,
      excerpt: input.excerpt,
      seo_title: input.seo_title,
      seo_description: input.seo_description,
      featured_image_url: input.featured_image_url,
      updated_by: guard.userId,
    })
    .eq("id", input.id)
    .select("updated_at")
    .single();

  if (error) return { ok: false, error: error.message };

  // Audit only the first save of a session (best-effort; this fires often)
  return { ok: true, savedAt: data?.updated_at ?? new Date().toISOString() };
}

export async function listPageRevisions(pageId: string): Promise<PageRevision[]> {
  const guard = await requireStaff();
  if ("error" in guard) return [];

  const { data, error } = await guard.supabase
    .from("page_revisions")
    .select(
      "id, page_id, version, title, slug, body, excerpt, seo_title, seo_description, featured_image_url, status, author_id, change_note, created_at, author:profiles!page_revisions_author_id_fkey(first_name, last_name, display_name)",
    )
    .eq("page_id", pageId)
    .order("version", { ascending: false })
    .limit(20);
  if (error) {
    console.warn("[cms] list revisions failed", error.message);
    return [];
  }
  return (data ?? []) as unknown as PageRevision[];
}

/**
 * Restore an earlier revision: copies the revision's content fields
 * back into the live page (and creates a new revision as a "restored
 * from version N" entry).
 */
export async function restorePageRevision(
  pageId: string,
  revisionId: string,
): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireStaff();
  if ("error" in guard) return { ok: false, error: guard.error };

  const { data: revision, error: revErr } = await guard.supabase
    .from("page_revisions")
    .select("*")
    .eq("id", revisionId)
    .eq("page_id", pageId)
    .single();
  if (revErr || !revision) return { ok: false, error: "Revision not found" };

  // Update the live page. The trigger will record a new revision
  // marked as "restored from vN".
  const { error: updateErr } = await guard.supabase
    .from("pages")
    .update({
      title: (revision as PageRevision).title,
      slug: (revision as PageRevision).slug,
      body: (revision as PageRevision).body,
      excerpt: (revision as PageRevision).excerpt,
      seo_title: (revision as PageRevision).seo_title,
      seo_description: (revision as PageRevision).seo_description,
      featured_image_url: (revision as PageRevision).featured_image_url,
      updated_by: guard.userId,
    })
    .eq("id", pageId);
  if (updateErr) return { ok: false, error: updateErr.message };

  // Tag the new revision with a change_note explaining what happened.
  // The trigger fires AFTER UPDATE, so we add a follow-up update on
  // the most recent revision (the one just created).
  const { data: latestRev } = await guard.supabase
    .from("page_revisions")
    .select("id")
    .eq("page_id", pageId)
    .order("version", { ascending: false })
    .limit(1)
    .single();
  if (latestRev) {
    await guard.supabase
      .from("page_revisions")
      .update({ change_note: `Restored from v${(revision as PageRevision).version}` })
      .eq("id", latestRev.id);
  }

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "pages",
    resourceId: pageId,
    metadata: {
      source: "admin/pages/[id]",
      action_type: "restore_revision",
      from_version: (revision as PageRevision).version,
    },
  }).catch(() => {});

  revalidatePath(`/admin/pages/${pageId}`);
  return { ok: true };
}

export async function schedulePagePublish(
  pageId: string,
  publishAt: string,
): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireStaff();
  if ("error" in guard) return { ok: false, error: guard.error };

  const when = new Date(publishAt);
  if (Number.isNaN(when.getTime())) {
    return { ok: false, error: "Invalid publish_at timestamp" };
  }
  if (when.getTime() <= Date.now()) {
    return { ok: false, error: "publish_at must be in the future" };
  }

  const { error } = await guard.supabase
    .from("pages")
    .update({
      publish_at: when.toISOString(),
      status: "SCHEDULED",
      updated_by: guard.userId,
    })
    .eq("id", pageId);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "pages",
    resourceId: pageId,
    metadata: { source: "admin/pages/[id]", action_type: "schedule_publish", publish_at: when.toISOString() },
  }).catch(() => {});

  revalidatePath(`/admin/pages/${pageId}`);
  return { ok: true };
}

export async function cancelScheduledPublish(
  pageId: string,
): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireStaff();
  if ("error" in guard) return { ok: false, error: guard.error };

  const { error } = await guard.supabase
    .from("pages")
    .update({
      publish_at: null,
      status: "DRAFT",
      updated_by: guard.userId,
    })
    .eq("id", pageId);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "pages",
    resourceId: pageId,
    metadata: { source: "admin/pages/[id]", action_type: "cancel_scheduled" },
  }).catch(() => {});

  revalidatePath(`/admin/pages/${pageId}`);
  return { ok: true };
}

export async function publishNowFromSchedule(
  pageId: string,
): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireStaff();
  if ("error" in guard) return { ok: false, error: guard.error };

  const now = new Date().toISOString();
  const { error } = await guard.supabase
    .from("pages")
    .update({
      status: "PUBLISHED",
      published_at: now,
      published_by: guard.userId,
      publish_at: null,
      updated_by: guard.userId,
    })
    .eq("id", pageId);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "pages",
    resourceId: pageId,
    metadata: { source: "admin/pages/[id]", action_type: "publish_now" },
  }).catch(() => {});

  revalidatePath(`/admin/pages/${pageId}`);
  revalidatePath("/admin/pages");
  return { ok: true };
}