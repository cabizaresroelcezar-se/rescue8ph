import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Blog",
  description: "Insights and articles on EMS, rescue, safety, and emergency preparedness from Rescue 8 Philippines.",
  path: "/blog",
});

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, featured_image_url, published_at")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <p className="mt-2 text-muted-foreground">
        Insights, news, and guides on EMS, rescue, and safety
      </p>

      <div className="mt-10 space-y-6">
        {(posts || []).map((post) => (
          <a
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block rounded-lg border bg-white p-6 transition-colors hover:border-primary"
          >
            <h2 className="text-xl font-bold hover:text-primary">{post.title}</h2>
            {post.excerpt && (
              <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
            )}
            {post.published_at && (
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(post.published_at).toLocaleDateString("en-PH", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            )}
          </a>
        ))}
        {!posts || posts.length === 0 ? (
          <div className="rounded-lg border p-12 text-center text-muted-foreground">
            No blog posts yet. Check back soon for updates!
          </div>
        ) : null}
      </div>
    </div>
  );
}