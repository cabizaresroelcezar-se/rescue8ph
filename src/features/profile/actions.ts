"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { logAudit, AuditAction } from "@/lib/audit";

// ============================================================================
// Constants
// ============================================================================

const AVATAR_BUCKET = "avatars";
const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB — matches bucket policy
const ALLOWED_AVATAR_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedAvatarMime = typeof ALLOWED_AVATAR_MIME[number];

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build the storage path for a user's avatar. Always uses "avatar" as the
 * filename so we get a single canonical path per user. The extension is
 * inferred from the file type (jpeg→jpg, png→png, webp→webp) — we never
 * trust the user-supplied filename.
 */
function avatarPath(userId: string, mime: AllowedAvatarMime): string {
  const ext = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
  return `${userId}/avatar.${ext}`;
}

function validateAvatarFile(file: File): { ok: true; mime: AllowedAvatarMime } | { ok: false; error: string } {
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

// ============================================================================
// Upload Avatar
// ============================================================================
//
// Replaces the user's existing avatar (if any). Stores at the canonical path
// {user_id}/avatar.{ext} and writes the public URL back to profiles.avatar_url.
//
// We intentionally don't generate derivative sizes (thumb, medium, large).
// For v1 a single public URL is enough; the next.config.ts image optimizer
// will handle resize-on-the-fly for any consumer.
// ============================================================================

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/account/profile");
  }

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    redirect("/account/profile?error=" + encodeURIComponent("No file selected."));
  }

  const validation = validateAvatarFile(file);
  if (!validation.ok) {
    redirect(
      "/account/profile?error=" + encodeURIComponent((validation as { error: string }).error),
    );
  }
  const mime = (validation as { mime: AllowedAvatarMime }).mime;

  const path = avatarPath(user.id, mime);

  // Read the file as ArrayBuffer and convert to Blob — Next.js FormData entries
  // expose the file as a Blob via the arrayBuffer() method, but uploading the
  // file directly via supabase.storage.from().upload() is the documented path.
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      contentType: mime,
      cacheControl: "3600", // 1 hour — CDN-friendly but busts on replace
      upsert: true, // overwrite existing avatar
    });

  if (uploadError) {
    console.error("uploadAvatar error:", uploadError);
    redirect("/account/profile?error=" + encodeURIComponent("Upload failed: " + uploadError.message));
  }

  // Get the public URL — Supabase returns a token-based URL that we want
  // cached for a long time since we control when to invalidate (replace).
  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  // Append a cache-buster based on the upload timestamp so clients always
  // see the latest image even when the underlying URL is the same. This
  // handles the "avatar replaced but browser shows old image" scenario.
  const versionedUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: versionedUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("uploadAvatar profile update error:", updateError);
    redirect(
      "/account/profile?error=" +
        encodeURIComponent("Upload succeeded but profile update failed: " + updateError.message),
    );
  }

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "profiles",
    resourceId: user.id,
    newValues: {
      avatar_url: versionedUrl,
      file_size: file.size,
      mime_type: mime,
    },
  });

  revalidatePath("/account/profile");
  revalidatePath("/account");
  redirect("/account/profile?message=" + encodeURIComponent("Profile photo updated."));
}

// ============================================================================
// Delete Avatar
// ============================================================================
//
// Removes the avatar file from storage and nulls avatar_url in profiles.
// We don't try to be clever about which extension exists at the user's
// folder — we just attempt to delete the three known extensions. Supabase
// returns success even when the file doesn't exist for that path.
// ============================================================================

export async function deleteAvatar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/account/profile");
  }

  // Try to remove all three possible extensions. We swallow per-path errors
  // because the user might not have an avatar at any of them.
  for (const ext of ["jpg", "png", "webp"]) {
    await supabase.storage.from(AVATAR_BUCKET).remove([`${user.id}/avatar.${ext}`]);
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("deleteAvatar profile update error:", updateError);
    redirect(
      "/account/profile?error=" +
        encodeURIComponent("Could not update profile: " + updateError.message),
    );
  }

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "profiles",
    resourceId: user.id,
    newValues: { avatar_url: null },
  });

  revalidatePath("/account/profile");
  revalidatePath("/account");
  redirect("/account/profile?message=" + encodeURIComponent("Profile photo removed."));
}

// ============================================================================
// Request Email Change
// ============================================================================
//
// Supabase's updateUser({ email }) sends a "change email" confirmation to
// the user's CURRENT email address — they have to click the link in that
// email first to authorize the change. Once they do, Supabase sends a
// confirmation to the NEW address.
//
// This is double-opt-in, which is the standard pattern for email changes.
// We log the request so admins can spot suspicious activity (e.g., someone
// repeatedly trying to change their email to a known scam domain).
// ============================================================================

export async function requestEmailChange(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/account/profile");
  }

  const newEmail = (formData.get("newEmail") as string)?.trim().toLowerCase();

  if (!newEmail) {
    redirect("/account/profile?error=" + encodeURIComponent("Please enter a new email address."));
  }

  // Basic email format validation. Zod's .email() does the same check but
  // we don't import zod here for one use.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    redirect("/account/profile?error=" + encodeURIComponent("Please enter a valid email address."));
  }

  if (newEmail === user.email?.toLowerCase()) {
    redirect(
      "/account/profile?error=" +
        encodeURIComponent("New email is the same as your current email."),
    );
  }

  const origin = (await headers()).get("origin");

  // Supabase's updateUser({ email }) sends a "confirm email change" link to
  // BOTH the old and new addresses. emailRedirectTo is the URL the user lands
  // on after confirming from either side. The new email is only applied after
  // BOTH links are clicked.
  const { error } = await supabase.auth.updateUser({
    email: newEmail,
    // @ts-expect-error — Supabase types UserAttributes without options for email change
    // but the SDK accepts it at runtime. Tracked upstream; remove when fixed.
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/account/profile?message=` +
        encodeURIComponent("Email updated successfully."),
    },
  });

  if (error) {
    redirect("/account/profile?error=" + encodeURIComponent(error.message));
  }

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "auth.users",
    resourceId: user.id,
    metadata: {
      old_email: user.email,
      new_email: newEmail,
      // We log "requested" not "confirmed" because Supabase hasn't actually
      // changed the email yet — the user still needs to click both confirmation
      // links (one to authorize, one to verify the new address).
      status: "requested",
    },
  });

  redirect(
    "/account/profile?message=" +
      encodeURIComponent(
        "Check both your old AND new email inboxes for confirmation links. Your email won't change until you click both.",
      ),
  );
}