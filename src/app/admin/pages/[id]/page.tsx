import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageForm } from "@/components/admin/page-form";
import {
  PageSectionsManager,
  type PageSection,
} from "@/components/admin/page-sections-manager";
import { ListPublishToggle } from "./publish-toggle";
import { DeletePageButton } from "./delete-button";
import { ExternalLink } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: page, error } = await supabase
    .from("pages")
    .select(
      "id, title, slug, excerpt, body, seo_title, seo_description, status, published_at",
    )
    .eq("id", id)
    .single();

  if (error || !page) notFound();

  // Sections fetch is best-effort: if the table doesn't exist yet
  // or the query fails, fall back to an empty array so the rest
  // of the edit UI still loads instead of crashing with a 500.
  let sections: unknown[] = [];
  try {
    const { data } = await supabase
      .from("page_sections")
      .select("id, page_id, section_type, sort_order, is_enabled, content")
      .eq("page_id", id)
      .order("sort_order", { ascending: true });
    sections = data ?? [];
  } catch (err) {
    console.warn("[admin/pages/[id]] section fetch failed", err);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* Action bar above the form for quick access */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="font-medium text-foreground">{page.title}</span>
          <span>·</span>
          <span>/{page.slug}</span>
          {page.published_at && (
            <>
              <span>·</span>
              <span className="text-xs">
                Published{" "}
                {new Date(page.published_at).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {page.status === "PUBLISHED" && (
            <Link
              href={`/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View
            </Link>
          )}
          <ListPublishToggle
            id={page.id}
            initial={page.status as "DRAFT" | "PUBLISHED"}
          />
          <DeletePageButton id={page.id} title={page.title} />
        </div>
      </div>

      <PageForm
        initial={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          excerpt: page.excerpt,
          body: page.body ?? "",
          seo_title: page.seo_title,
          seo_description: page.seo_description,
          status: page.status as "DRAFT" | "PUBLISHED",
        }}
      />

      <PageSectionsManager
        pageId={page.id}
        sections={(sections ?? []) as unknown as PageSection[]}
      />
    </div>
  );
}