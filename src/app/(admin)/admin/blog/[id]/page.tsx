import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogPostEditor } from "@/components/admin/blog-post-editor";
import { getMediaUrl } from "@/lib/media";

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: post }, { data: categories }] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("id", id).single(),
    supabase.from("blog_categories").select("id, name").order("name"),
  ]);
  if (!post) notFound();

  // Resolve the featured image URL on the server so the client-side
  // editor can display the preview without needing env vars.
  const resolvedImageUrl = getMediaUrl(post.featured_image_url, "blog");

  return (
    <BlogPostEditor
      categories={categories ?? []}
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        content: post.content ?? "",
        featured_image_url: post.featured_image_url ?? "",
        resolved_image_url: resolvedImageUrl,
        category_id: post.category_id,
        status: (post.status as "DRAFT" | "PUBLISHED" | "ARCHIVED") ?? "DRAFT",
        seo_title: post.seo_title ?? "",
        seo_description: post.seo_description ?? "",
      }}
    />
  );
}