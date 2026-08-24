/**
 * Resolve a media storage reference to a usable URL.
 *
 * Accepts:
 *   - Full URLs (https://...)                          -> returned as-is
 *   - Supabase storage keys relative to a bucket
 *     (e.g. "<product-uuid>/abc.jpg")                  -> resolved using
 *     NEXT_PUBLIC_SUPABASE_URL. If the path doesn't already start with the
 *     bucket name, the bucketName parameter is prepended.
 *   - Public paths under /public ("/logo.svg")        -> returned as-is
 *   - Empty / null                                     -> null
 *
 * The Supabase project URL is read from NEXT_PUBLIC_SUPABASE_URL at build
 * time, so this function is safe to call from server components.
 *
 * @param storagePath  Path stored in DB (or full URL).
 * @param bucketName   Bucket the object lives in. Default: "products".
 *                     Pass "blog", "banners", "avatars", or "pages" as needed.
 */
export function getMediaUrl(
  storagePath: string | null | undefined,
  bucketName: string = "products",
): string | null {
  if (!storagePath) return null;
  const trimmed = storagePath.trim();
  if (!trimmed) return null;

  // Already an absolute URL (http, https, data, blob) or root-relative path
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^data:/i.test(trimmed) ||
    /^blob:/i.test(trimmed) ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }

  const base =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ?? "";
  if (!base) return null;

  // If the stored path already starts with the bucket name (legacy uploads,
  // or when a CMS uploads with the bucket included), use it as-is.
  // Otherwise, prepend the bucket so the public URL is well-formed.
  const path = trimmed.replace(/^\/+/, "");
  const finalPath = path.startsWith(`${bucketName}/`)
    ? path
    : `${bucketName}/${path}`;

  return `${base}/storage/v1/object/public/${finalPath}`;
}

/**
 * Convenience wrapper that returns a usable `src` for <Image> components
 * (an empty string causes Next/Image to fail, so we return null and let
 * callers render a fallback instead).
 */
export function mediaSrc(
  storagePath: string | null | undefined,
  bucketName?: string,
): string | null {
  return getMediaUrl(storagePath, bucketName);
}