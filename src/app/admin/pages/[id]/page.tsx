import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageForm } from "@/components/admin/page-form";
import { ListPublishToggle } from "./publish-toggle";
import { DeletePageButton } from "./delete-button";

type Props = { params: Promise<{ id: string }> };

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: page, error } = await supabase
    .from("pages")
    .select(
      "id, title, slug, excerpt, seo_title, seo_description, status, published_at",
    )
    .eq("id", id)
    .single();

  if (error || !page) notFound();

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
          seo_title: page.seo_title,
          seo_description: page.seo_description,
          status: page.status as "DRAFT" | "PUBLISHED",
        }}
      />
    </div>
  );
}