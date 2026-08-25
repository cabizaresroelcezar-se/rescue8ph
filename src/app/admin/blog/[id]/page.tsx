import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogPostEditor } from "@/components/admin/blog-post-editor";

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: post }, { data: categories }] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("id", id).single(),
    supabase.from("blog_categories").select("id, name").order("name"),
  ]);
  if (!post) notFound();

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
        category_id: post.category_id,
        status: (post.status as "DRAFT" | "PUBLISHED" | "ARCHIVED") ?? "DRAFT",
        seo_title: post.seo_title ?? "",
        seo_description: post.seo_description ?? "",
      }}
    />
  );
}