/**
 * Avatar file validation — extracted from the uploadAvatar server action
 * for testability. Returns a discriminated union so callers can pattern-match
 * on the result.
 *
 * Rules (kept in sync with supabase/migrations/20260824000200_storage_buckets_and_wishlist.sql):
 *   - Max size: 2 MB (matches bucket file_size_limit)
 *   - Allowed types: image/jpeg, image/png, image/webp
 */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const ALLOWED_AVATAR_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedAvatarMime = typeof ALLOWED_AVATAR_MIME[number];

export type AvatarValidation =
  | { ok: true; mime: AllowedAvatarMime }
  | { ok: false; error: string };

export function validateAvatarFile(file: { size: number; type: string }): AvatarValidation {
  if (file.size > AVATAR_MAX_BYTES) {
    return {
      ok: false,
      error: `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 2 MB.`,
    };
  }
  if (!ALLOWED_AVATAR_MIME.includes(file.type as AllowedAvatarMime)) {
    return {
      ok: false,
      error: `Unsupported image format: ${file.type || "unknown"}. Use JPG, PNG, or WebP.`,
    };
  }
  return { ok: true, mime: file.type as AllowedAvatarMime };
}

/**
 * Build the canonical storage path for a user's avatar. Always uses "avatar"
 * as the filename so we get a single canonical path per user. Extension is
 * inferred from MIME — we never trust the user-supplied filename.
 */
export function avatarStoragePath(userId: string, mime: AllowedAvatarMime): string {
  const ext = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
  return `${userId}/avatar.${ext}`;
}