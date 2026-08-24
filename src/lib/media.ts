/**
 * Resolve a media storage reference to a usable URL.
 *
 * Accepts:
 *   - Full URLs (https://...)                          -> returned as-is
 *   - Supabase storage keys ("products/abc.jpg")      -> resolved to the
 *     public Storage URL using NEXT_PUBLIC_SUPABASE_URL
 *   - Public paths under /public ("/logo.svg")        -> returned as-is
 *   - Empty / null                                     -> null
 *
 * The Supabase project URL is read from NEXT_PUBLIC_SUPABASE_URL at build
 * time, so this function is safe to call from server components.
 */
export function getMediaUrl(storagePath: string | null | undefined): string | null {
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

  // Public bucket convention used by the project: bucket name is the first
  // segment of the storage path (e.g. "products/abc.jpg" -> bucket "products").
  return `${base}/storage/v1/object/public/${trimmed.replace(/^\/+/, "")}`;
}

/**
 * Convenience wrapper that returns a usable `src` for <Image> components
 * (an empty string causes Next/Image to fail, so we return null and let
 * callers render a fallback instead).
 */
export function mediaSrc(
  storagePath: string | null | undefined,
): string | null {
  return getMediaUrl(storagePath);
}