import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import { Markdown } from "@/components/marketing/markdown";
import {
  PageSectionRenderer,
  type PageSection,
} from "@/components/marketing/page-section-renderer";

type Props = { params: Promise<{ slug: string }> };

// Reserved storefront paths that should NEVER be served as a CMS page,
// even if a draft page exists with that slug. Keeps hardcoded routes
// (e.g. /products, /blog) authoritative.
const RESERVED_SLUGS = new Set([
  "products",
  "cart",
  "checkout",
  "auth",
  "account",
  "admin",
  "blog",
  "about",
  "services",
  "contact",
  "faq",
  "privacy",
  "terms",
  "api",
]);

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) return {};
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("title, excerpt, seo_title, seo_description")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();
  if (!page) return {};
  return createMetadata({
    title: page.seo_title || page.title,
    description: page.seo_description || page.excerpt || undefined,
    path: `/${slug}`,
  });
}

export default async function StorefrontPage({ params }: Props) {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) notFound();

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select(
      "id, title, slug, excerpt, body, seo_title, seo_description, published_at",
    )
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();

  if (!page) notFound();

  const { data: sections } = await supabase
    .from("page_sections")
    .select("id, section_type, sort_order, is_enabled, content")
    .eq("page_id", page.id)
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true });

  const published = page.published_at
    ? new Date(page.published_at).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const body = page.body?.trim() ?? "";

  return (
    <article>
      {/* Hero */}
      <header className="relative isolate overflow-hidden border-b border-border bg-gradient-to-br from-surface via-background to-surface py-14 sm:py-20">
        <div className="container-page relative">
          <nav
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
            <span>/</span>
            <span className="text-foreground">{page.title}</span>
          </nav>

          <h1 className="text-display-xl text-foreground">{page.title}</h1>
          {page.excerpt && (
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {page.excerpt}
            </p>
          )}
          {published && (
            <p className="mt-4 text-xs text-muted-foreground">
              Published {published}
            </p>
          )}
        </div>
      </header>

      {/* Sections (composable blocks) */}
      {(sections ?? []).map((s) => (
        <PageSectionRenderer
          key={(s as unknown as PageSection).id}
          section={s as unknown as PageSection}
        />
      ))}

      {/* Body (Markdown) */}
      <div className="container-prose py-12">
        {body ? (
          <Markdown source={body} />
        ) : page.excerpt ? (
          <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-base text-muted-foreground">
            {page.excerpt}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This page has no content yet. Edit it from{" "}
            <Link
              href={`/admin/pages`}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              /admin/pages
            </Link>
            .
          </p>
        )}
      </div>
    </article>
  );
}