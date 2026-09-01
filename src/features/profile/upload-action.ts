"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit, AuditAction } from "@/lib/audit";

// ============================================================================
// Client-side avatar upload/delete
// ============================================================================
//
// The AvatarUploadInput client component needs to invoke the server action via
// startTransition (so the user sees a loading state) rather than through a
// form submit. Server actions called from <form action={...}> redirect on
// success — that's fine for full-page navigation, but for the in-place
// avatar upload we want to stay on the page and revalidate instead.
//
// These wrappers call the same underlying logic but return instead of
// redirecting, so the client component can await the action and continue.
// ============================================================================

const AVATAR_BUCKET = "avatars";
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

function avatarPath(userId: string, mime: typeof ALLOWED_AVATAR_MIME[number]): string {
  const ext = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
  return `${userId}/avatar.${ext}`;
}

export async function uploadAvatarAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not signed in");
  }

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    throw new Error("No file selected");
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error(
      `Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 2 MB.`,
    );
  }
  const mime = file.type as typeof ALLOWED_AVATAR_MIME[number];
  if (!ALLOWED_AVATAR_MIME.includes(mime)) {
    throw new Error(`Unsupported format: ${file.type || "unknown"}`);
  }

  const path = avatarPath(user.id, mime);
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      contentType: mime,
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const versionedUrl = `${publicUrl}?v=${Date.now()}`;

  await supabase
    .from("profiles")
    .update({ avatar_url: versionedUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "profiles",
    resourceId: user.id,
    newValues: { avatar_url: versionedUrl, file_size: file.size, mime_type: mime },
  });

  revalidatePath("/account/profile");
  revalidatePath("/account");
}

export async function deleteAvatarAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not signed in");
  }

  for (const ext of ["jpg", "png", "webp"]) {
    await supabase.storage.from(AVATAR_BUCKET).remove([`${user.id}/avatar.${ext}`]);
  }
  await supabase
    .from("profiles")
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  await logAudit({
    action: AuditAction.UPDATE,
    resourceType: "profiles",
    resourceId: user.id,
    newValues: { avatar_url: null },
  });

  revalidatePath("/account/profile");
  revalidatePath("/account");
}