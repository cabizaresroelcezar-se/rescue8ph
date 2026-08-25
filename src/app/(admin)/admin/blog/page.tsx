import Link from "next/link";
import { Plus, Pencil, Eye, Calendar, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button-link";
import { BlogStatusToggle } from "./status-toggle";
import { DeleteBlogButton } from "./delete-button";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, status, published_at, created_at, excerpt, blog_categories(name, slug)"
    )
    .order("created_at", { ascending: false });

  const list = posts ?? [];
  const publishedCount = list.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = list.filter((p) => p.status === "DRAFT").length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Blog</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Write, manage, and publish articles about EMS, rescue, and safety.
          </p>
        </div>
        <ButtonLink href="/admin/blog/new">
          <Plus className="h-4 w-4" /> New post
        </ButtonLink>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total posts" value={list.length} icon={FileText} />
        <StatCard label="Published" value={publishedCount} tone="success" icon={Eye} />
        <StatCard label="Drafts" value={draftCount} tone="muted" icon={Pencil} />
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-3 text-base font-semibold text-foreground">No blog posts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Start writing your first post to share EMS, rescue, and safety insights.
          </p>
          <ButtonLink href="/admin/blog/new" className="mt-4">
            <Plus className="h-4 w-4" /> Create post
          </ButtonLink>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Updated</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((p) => {
                  const cat = p.blog_categories as unknown as { name?: string; slug?: string } | null;
                  return (
                    <tr key={p.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/blog/${p.id}`}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {p.title}
                        </Link>
                        {p.excerpt && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {p.excerpt}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <BlogStatusToggle id={p.id} initial={p.status as "DRAFT" | "PUBLISHED" | "ARCHIVED"} />
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                                              {cat?.name ? (
                                                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                                                  {cat.name}
                                                </span>
                                              ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                              )}
                                            </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {p.published_at
                            ? new Date(p.published_at).toLocaleDateString()
                            : new Date(p.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          {p.status === "PUBLISHED" && (
                            <Link
                              href={`/blog/${p.slug}`}
                              target="_blank"
                              aria-label="View live"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/blog/${p.id}`}
                            aria-label="Edit"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <DeleteBlogButton id={p.id} title={p.title} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "muted";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "muted"
      ? "text-muted-foreground"
      : "text-foreground";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}