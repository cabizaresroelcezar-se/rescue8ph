import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ArrowRight, ImageIcon, FolderOpen, FileText } from "lucide-react";
import { FadeIn, Stagger } from "@/lib/motion";

export const metadata = {
  title: "Media Library · Back Office",
  description: "Manage uploaded product images and other media.",
};

type SearchParams = { bucket?: string };

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirectTo=/admin/media");

  const buckets = [
    { name: "products", label: "Products", icon: ImageIcon, color: "primary" },
    { name: "blog",     label: "Blog",     icon: FileText,  color: "blue"    },
    { name: "banners",  label: "Banners",  icon: ImageIcon, color: "accent"  },
    { name: "avatars",  label: "Avatars",  icon: FolderOpen,color: "muted"   },
  ] as const;

  const activeBucket = buckets.find((b) => b.name === (params.bucket ?? "products")) ?? buckets[0];

  // List files in the active bucket
  const { data: files } = await supabase.storage
    .from(activeBucket.name)
    .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });

  // Get the products to map file -> product
  const { data: productImages } = activeBucket.name === "products"
    ? await supabase
        .from("product_images")
        .select("id, storage_path, alt_text, is_primary, product_id, product:products(title, slug)")
    : { data: [] };

  // Build a lookup of storage_path -> product info
    const productInfoByPath: Record<string, { id: string; title: string; slug: string; alt: string | null }> = {};
    for (const pi of productImages ?? []) {
      const prod = pi.product as { title?: string; slug?: string } | { title?: string; slug?: string }[] | null;
      const first = Array.isArray(prod) ? prod[0] : prod;
      productInfoByPath[pi.storage_path] = {
        id: pi.product_id,
        title: first?.title || "Untitled",
        slug: first?.slug || "",
        alt: pi.alt_text,
      };
    }

  return (
    <div className="space-y-8">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office</p>
          <h1 className="mt-2 text-display-md text-foreground">Media Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse all uploaded media organized by bucket.
          </p>
        </div>
      </FadeIn>

      {/* Bucket tabs */}
      <FadeIn className="flex flex-wrap items-center gap-2">
        {buckets.map((b) => {
          const Icon = b.icon;
          const isActive = activeBucket.name === b.name;
          return (
            <Link
              key={b.name}
              href={`/admin/media?bucket=${b.name}`}
              className={
                "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors " +
                (isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-elev-1"
                  : "border-border bg-background hover:border-primary/40 hover:bg-secondary")
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {b.label}
            </Link>
          );
        })}
      </FadeIn>

      {/* Files grid */}
      {!files || files.length === 0 ? (
        <FadeIn className="rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-semibold text-foreground">
            No files in {activeBucket.label} yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Uploaded files will appear here. The easiest way to upload is through a
            product page \u2014 open any product and use the image uploader.
          </p>
          <Link
            href="/admin/products"
            className="mt-4 inline-flex h-9 items-center gap-1 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Go to products
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </FadeIn>
      ) : (
        <Stagger className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {files.map((file) => {
            const isFolder = !file.id;
            const path = file.name;
            const product = productInfoByPath[path];
            return (
              <div
                key={file.id ?? file.name}
                className="group relative overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-surface">
                  {isFolder ? (
                    <FolderOpen className="m-auto h-10 w-10 text-muted-foreground/40" />
                  ) : (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${activeBucket.name}/${file.name}`}
                      alt={product?.alt || file.name}
                      fill
                      sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-contain p-2"
                    />
                  )}
                </div>
                <div className="border-t border-border p-3">
                  <p className="truncate text-xs font-medium text-foreground">
                    {file.name}
                  </p>
                  {product && (
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="mt-1 flex items-center gap-1 truncate text-[10px] text-primary hover:underline"
                    >
                      <ArrowRight className="h-2.5 w-2.5" />
                      {product.title}
                    </Link>
                  )}
                  {file.metadata?.size && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {(file.metadata.size / 1024).toFixed(0)} KB
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}