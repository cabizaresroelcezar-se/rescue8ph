import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ImageIcon,
  FolderOpen,
  FileText,
} from "lucide-react";
import { FadeIn } from "@/lib/motion";
import { MediaGallery } from "@/components/admin/media-gallery";
import { MediaUploader } from "@/components/admin/media-uploader";

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
    { name: "blog", label: "Blog", icon: FileText, color: "blue" },
    { name: "banners", label: "Banners", icon: ImageIcon, color: "accent" },
    { name: "avatars", label: "Avatars", icon: FolderOpen, color: "muted" },
  ] as const;

  const activeBucket =
    buckets.find((b) => b.name === (params.bucket ?? "products")) ?? buckets[0];

  // List files in the active bucket
  const { data: rawFiles } = await supabase.storage
    .from(activeBucket.name)
    .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });

  // Files come back with id always set for actual files. Folder
  // placeholders have no id. We render ALL entries (both real files
  // and empty folders if present) — the gallery component handles
  // each case in its tile.
  const fileEntries = (rawFiles ?? []).map((f) => ({
    fullPath: f.name,
    fileName: f.name,
    publicUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${activeBucket.name}/${f.name}`,
    contentType:
      ((f as { metadata?: { mimetype?: string } }).metadata?.mimetype ??
        null) as string | null,
    size:
      ((f as { metadata?: { size?: number } }).metadata?.size ??
        null) as number | null,
    createdAt: (f.created_at ?? null) as string | null,
  }));

  return (
    <div className="space-y-8">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office</p>
          <h1 className="mt-2 text-display-md text-foreground">
            Media Library
          </h1>
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

      {/* Upload area */}
      <FadeIn>
        <MediaUploader bucketName={activeBucket.name} />
      </FadeIn>

      {/* Files grid */}
      {fileEntries.length === 0 ? (
        <FadeIn className="rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-semibold text-foreground">
            No files in {activeBucket.label} yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Uploaded files will appear here. The easiest way to upload is
            through a product page — open any product and use the image
            uploader.
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
        <FadeIn>
          <MediaGallery files={fileEntries} bucketName={activeBucket.name} />
        </FadeIn>
      )}
    </div>
  );
}
