import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createMetadata, articleSchema } from "@/lib/seo";
import { getMediaUrl } from "@/lib/media";
import { Markdown } from "@/components/marketing/markdown";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, slug, seo_title, seo_description, published_at, featured_image_url")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();

  if (!post) return {};
  const img = getMediaUrl(post.featured_image_url);

  return createMetadata({
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    path: `/blog/${post.slug}`,
    type: "article",
    image: img ?? undefined,
  });
}

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, content, featured_image_url, published_at, category_id, blog_categories(name, slug), profiles!blog_posts_author_id_fkey(first_name, last_name)"
    )
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();

  if (!post) notFound();

  const { data: related } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, featured_image_url, published_at, blog_categories(name, slug)"
    )
    .eq("status", "PUBLISHED")
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(3);

  const img = getMediaUrl(post.featured_image_url);
  const cat = post.blog_categories as { name: string; slug: string } | null;
  const author = post.profiles as unknown as
    | { first_name: string | null; last_name: string | null }
    | null;
  const authorName =
    author && (author.first_name || author.last_name)
      ? `${author.first_name ?? ""} ${author.last_name ?? ""}`.trim()
      : "Rescue 8 Philippines";
  const readMinutes = estimateReadTime(post.content ?? "");

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            ...articleSchema({
              title: post.title,
              description: post.excerpt || post.title,
              slug: post.slug,
              author: authorName,
              publishedAt: post.published_at || post.created_at,
              image: img ?? undefined,
            }),
          }),
        }}
      />

      {/* Hero */}
      <header className="relative isolate overflow-hidden border-b border-border bg-gradient-to-br from-surface via-background to-surface py-12 sm:py-16">
        <div className="container-prose relative">
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/blog" className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Blog
            </Link>
            <span>/</span>
            {cat && <span className="text-muted-foreground">{cat.name}</span>}
          </nav>

          <h1 className="text-display-xl text-foreground">{post.title}</h1>
          {post.excerpt && (
            <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Draft"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readMinutes} min read
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              {authorName}
            </span>
            {cat && (
              <Link
                href={{ pathname: "/blog", query: { category: cat.slug } }}
                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20"
              >
                {cat.name}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Featured image */}
      {img && (
        <div className="container-prose mt-0 sm:mt-0">
          <div className="relative -mx-4 aspect-[16/9] overflow-hidden rounded-none sm:mx-0 sm:rounded-2xl sm:border sm:border-border">
            <Image
              src={img}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              priority
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="container-prose py-12">
        <Markdown source={post.content ?? ""} />

        {/* Back to blog */}
        <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> All posts
          </Link>
          {cat && (
            <Link
              href={{ pathname: "/blog", query: { category: cat.slug } }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              More in {cat.name} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Related posts */}
      {related && related.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="container-page py-12 sm:py-16">
            <h2 className="text-2xl font-bold text-foreground">Related posts</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => {
                const rImg = getMediaUrl(r.featured_image_url);
                const rCat = r.blog_categories as { name: string } | null;
                return (
                  <Link
                    key={r.id}
                    href={`/blog/${r.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elev-2"
                  >
                    {rImg ? (
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={rImg}
                          alt={r.title}
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
                      {rCat && (
                        <span className="inline-flex w-fit items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {rCat.name}
                        </span>
                      )}
                      <h3 className="mt-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                        {r.title}
                      </h3>
                      {r.excerpt && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                          {r.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}