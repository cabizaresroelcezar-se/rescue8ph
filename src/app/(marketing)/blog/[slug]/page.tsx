import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/blog" className="hover:text-foreground">Blog</Link>
        {" / "}
        <span className="text-foreground">{post.title}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
      {post.published_at && (
        <p className="mt-2 text-sm text-muted-foreground">
          Published on {new Date(post.published_at).toLocaleDateString("en-PH", {
            year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      )}
      {post.excerpt && (
        <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
      )}

      <div className="mt-8 whitespace-pre-line text-muted-foreground">
        {post.content}
      </div>
    </article>
  );
}