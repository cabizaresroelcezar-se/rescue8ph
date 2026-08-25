import Link from "next/link";
import { HelpCircle, Tag, Layers, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button-link";
import { FaqForm } from "@/components/admin/faq-form";
import { CategoryForm } from "@/components/admin/category-form";
import { FaqRow } from "@/components/admin/faq-row";
import { CategoryRow } from "@/components/admin/category-row";

export default async function AdminContentPage() {
  const supabase = await createClient();
  const [
    { data: faqs },
    { data: categories },
    { data: pages },
  ] = await Promise.all([
    supabase
      .from("faqs")
      .select("id, question, answer, sort_order, is_enabled")
      .order("sort_order"),
    supabase
      .from("blog_categories")
      .select(
        "id, name, slug, description, _count:blog_posts(count)",
      )
      .order("name"),
    supabase
      .from("pages")
      .select("id, slug, title, status, _count:page_sections(count)")
      .order("slug"),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Content Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage FAQs, blog categories, and storefront pages from one place.
        </p>
      </header>

      {/* FAQs */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">FAQs</h2>
          <span className="text-sm text-muted-foreground">
            ({faqs?.length ?? 0})
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <FaqForm />
        </div>
        <div className="space-y-2">
          {(faqs ?? []).map((f) => (
            <FaqRow
              key={f.id}
              id={f.id}
              question={f.question}
              answer={f.answer}
              sortOrder={f.sort_order}
              isEnabled={f.is_enabled}
            />
          ))}
          {(!faqs || faqs.length === 0) && (
            <p className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No FAQs yet. Add your first one above.
            </p>
          )}
        </div>
      </section>

      {/* Blog categories */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Blog categories
          </h2>
          <span className="text-sm text-muted-foreground">
            ({categories?.length ?? 0})
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <CategoryForm />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(categories ?? []).map((c) => {
            const count = (
              c as unknown as { _count?: { blog_posts?: number } }
            )._count?.blog_posts ?? 0;
            return (
              <CategoryRow
                key={c.id}
                id={c.id}
                name={c.name}
                slug={c.slug}
                description={c.description}
                postCount={count}
              />
            );
          })}
          {(!categories || categories.length === 0) && (
            <p className="col-span-full rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No categories yet. Create one above to organize blog posts.
            </p>
          )}
        </div>
      </section>

      {/* Pages */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Pages</h2>
            <span className="text-sm text-muted-foreground">
              ({pages?.length ?? 0})
            </span>
          </div>
          <ButtonLink href="/admin/pages/new" size="sm">
            New page
          </ButtonLink>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Sections</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(pages ?? []).map((p) => {
                const count = (
                  p as unknown as { _count?: { page_sections?: number } }
                )._count?.page_sections ?? 0;
                return (
                  <tr key={p.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                        /{p.slug}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-foreground">{p.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium " +
                          (p.status === "PUBLISHED"
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700")
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {count} section{count === 1 ? "" : "s"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {p.status === "PUBLISHED" && (
                          <Link
                            href={`/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View ${p.title}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/pages/${p.id}`}
                          className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!pages || pages.length === 0) && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                  >
                    No pages defined. Click <strong>New page</strong> to create
                    one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}