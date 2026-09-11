import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  PageSectionsManager,
  type PageSection,
} from "@/components/admin/page-sections-manager";
import { Plus, Home, ExternalLink } from "lucide-react";
import { FadeIn } from "@/lib/motion";

export const metadata = {
  title: "Homepage Editor · Back Office",
  description: "Edit storefront homepage content sections",
};

export default async function HomepageEditorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirectTo=/admin/homepage");

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id")
    .eq("id", user.id)
    .single();
  if (profile) {
    const { data: roleData } = await supabase
      .from("roles")
      .select("name")
      .eq("id", profile.role_id)
      .single();
    if (roleData?.name !== "admin" && roleData?.name !== "super_admin") {
      redirect("/admin");
    }
  } else {
    redirect("/admin");
  }

  // Find or create the "home" page
  let { data: homePage } = await supabase
    .from("pages")
    .select("id, title, slug, status, excerpt, seo_title, seo_description, published")
    .eq("slug", "home")
    .single();

  if (!homePage) {
    // Create it
    const { data: newPage, error } = await supabase
      .from("pages")
      .insert({
        title: "Homepage",
        slug: "home",
        status: "PUBLISHED",
        published: true,
      })
      .select("id, title, slug, status, excerpt, seo_title, seo_description, published")
      .single();
    if (error) {
      redirect("/admin/pages?error=" + encodeURIComponent("Failed to create homepage page"));
    }
    homePage = newPage;
  }

  // Fetch existing sections
  const { data: rawSections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_id", homePage.id)
    .order("sort_order", { ascending: true });

  const sections = (rawSections ?? []) as unknown as PageSection[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office · Content</p>
          <h1 className="mt-2 text-display-md text-foreground flex items-center gap-2">
            <Home className="h-7 w-7 text-primary" />
            Homepage Editor
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit, and reorder content sections on your storefront homepage. Changes appear immediately — no code deployment needed.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View live site
        </a>
      </FadeIn>

      {/* Info banner */}
      <FadeIn className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Plus className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">How it works</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add sections below (hero, rich text, feature grid, CTA, banner, testimonials, FAQ, image+text).
              Drag to reorder. Changes publish instantly to the homepage above the default content.
              The homepage URL is <code className="font-mono text-foreground">/</code>.
            </p>
          </div>
        </div>
      </FadeIn>

      {/* SEO settings */}
      <FadeIn className="rounded-2xl border border-border bg-card p-6 shadow-elev-1">
        <h2 className="text-sm font-semibold text-foreground">Homepage SEO</h2>
        <p className="mt-1 text-xs text-muted-foreground">Meta tags for search engines</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SEO Title</dt>
            <dd className="mt-1 font-medium text-foreground">{homePage.seo_title || "Not set — uses default"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SEO Description</dt>
            <dd className="mt-1 font-medium text-foreground">{homePage.seo_description || "Not set — uses default"}</dd>
          </div>
        </dl>
        <Link
          href={`/admin/pages/${homePage.id}`}
          className="mt-3 inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Edit SEO & page settings
        </Link>
      </FadeIn>

      {/* Sections manager */}
      <PageSectionsManager
        pageId={homePage.id}
        sections={sections}
      />
    </div>
  );
}