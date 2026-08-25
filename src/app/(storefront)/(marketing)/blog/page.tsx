import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";
import { getMediaUrl } from "@/lib/media";
import { BlogFilter } from "@/components/marketing/blog-filter";

export const metadata = createMetadata({
  title: "Blog",
  description:
    "Insights and articles on EMS, rescue, safety, and emergency preparedness from Rescue 8 Philippines.",
  path: "/blog",
});

type Search = { category?: string };

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();
  const [{ data: posts }, { data: categories }] = await Promise.all([
    supabase
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, featured_image_url, published_at, content, category_id, blog_categories(name, slug)"
      )
      .eq("status", "PUBLISHED")
      .order("published_at", { ascending: false }),
    supabase.from("blog_categories").select("id, name, slug").order("name"),
  ]);

  let list = posts ?? [];
  if (category) {
    const cat = (categories ?? []).find((c) => c.slug === category);
    if (cat) list = list.filter((p) => p.category_id === cat.id);
  }

  const [featured, ...rest] = list;
  const featuredImage = featured ? getMediaUrl(featured.featured_image_url) : null;
  const wordCount = featured ? (featured.content ?? "").trim().split(/\s+/).filter(Boolean).length : 0;
  const readMinutes = Math.max(1, Math.round(wordCount / 200));

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-surface via-background to-surface py-14">
        <div className="container-page">
          <p className="text-eyebrow text-muted-foreground">Resources</p>
          <h1 className="mt-2 text-display-xl text-foreground">Rescue 8 Blog</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Practical guides, product insights, and field-tested tips on EMS, rescue, first aid,
            and emergency preparedness — written for the Philippine front line.
          </p>
        </div>
      </section>

      {/* Category filter */}
      <section className="border-b border-border bg-background">
        <div className="container-page py-5">
          <BlogFilter
            categories={(categories ?? []).map((c) => ({ name: c.name, slug: c.slug }))}
            active={category ?? null}
          />
        </div>
      </section>

      {/* Featured post */}
      {featured && (
        <section className="border-b border-border bg-background">
          <div className="container-page py-12">
            <Link
              href={`/blog/${featured.slug}`}
              className="group grid gap-6 overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-elev-3 lg:grid-cols-[1.4fr_1fr]"
            >
              {featuredImage ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden lg:aspect-auto">
                  <Image
                    src={featuredImage}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 lg:aspect-auto">
                  <Tag className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
              <div className="flex flex-col justify-center p-6 lg:p-10">
                {featured.blog_categories && (
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-primary">
                    Featured · {(featured.blog_categories as unknown as { name: string } | null)?.name}
                  </span>
                )}
                <h2 className="mt-4 text-3xl font-bold text-foreground transition-colors group-hover:text-primary lg:text-4xl">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-3 line-clamp-3 text-base text-muted-foreground">
                    {featured.excerpt}
                  </p>
                )}
                <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
                  {featured.published_at && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(featured.published_at).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />~{readMinutes} min read
                  </span>
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Post grid */}
      <section className="bg-surface">
        <div className="container-page py-12 sm:py-16">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <Tag className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <h2 className="mt-4 text-xl font-semibold text-foreground">No posts yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back soon for EMS, rescue, and first-aid insights.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => {
                const img = getMediaUrl(post.featured_image_url);
                const cat = post.blog_categories as unknown as { name: string; slug: string } | null;
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elev-2"
                  >
                    {img ? (
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={img}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-primary/15 to-accent/15">
                        <Tag className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      {cat && (
                        <span className="inline-flex w-fit items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {cat.name}
                        </span>
                      )}
                      <h3 className="mt-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-auto pt-4 flex items-center gap-3 text-xs text-muted-foreground">
                        {post.published_at && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.published_at).toLocaleDateString("en-PH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}