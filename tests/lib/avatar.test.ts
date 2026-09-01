import { describe, it, expect } from "vitest";
import { validateAvatarFile, avatarStoragePath, AVATAR_MAX_BYTES } from "@/lib/profile/avatar";

describe("validateAvatarFile", () => {
  it("accepts a small JPEG", () => {
    const result = validateAvatarFile({ size: 100_000, type: "image/jpeg" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.mime).toBe("image/jpeg");
  });

  it("accepts PNG", () => {
    expect(validateAvatarFile({ size: 100, type: "image/png" }).ok).toBe(true);
  });

  it("accepts WebP", () => {
    expect(validateAvatarFile({ size: 100, type: "image/webp" }).ok).toBe(true);
  });

  it("rejects files over 2 MB", () => {
    const result = validateAvatarFile({ size: AVATAR_MAX_BYTES + 1, type: "image/jpeg" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/too large/i);
  });

  it("accepts a file at exactly 2 MB (boundary)", () => {
    expect(validateAvatarFile({ size: AVATAR_MAX_BYTES, type: "image/png" }).ok).toBe(true);
  });

  it("rejects unsupported MIME types", () => {
    for (const badType of ["image/gif", "image/svg+xml", "image/bmp", "application/pdf", "video/mp4"]) {
      const result = validateAvatarFile({ size: 1000, type: badType });
      expect(result.ok, `${badType} should be rejected`).toBe(false);
    }
  });

  it("rejects empty/missing MIME", () => {
    expect(validateAvatarFile({ size: 1000, type: "" }).ok).toBe(false);
  });

  it("includes file size in error message", () => {
    const result = validateAvatarFile({ size: 5_000_000, type: "image/jpeg" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      // 5_000_000 bytes / 1024 / 1024 = 4.77 MB → toFixed(1) → "4.8"
      expect(result.error).toMatch(/4\.8/);
    }
  });
});

describe("avatarStoragePath", () => {
  it("uses .jpg for jpeg", () => {
    expect(avatarStoragePath("user-1", "image/jpeg")).toBe("user-1/avatar.jpg");
  });

  it("uses .png for png", () => {
    expect(avatarStoragePath("user-1", "image/png")).toBe("user-1/avatar.png");
  });

  it("uses .webp for webp", () => {
    expect(avatarStoragePath("user-1", "image/webp")).toBe("user-1/avatar.webp");
  });

  it("uses canonical 'avatar' filename regardless of user-supplied filename", () => {
    // Even if user uploads "my-photo.jpeg", we store at avatar.jpg
    expect(avatarStoragePath("abc-123", "image/jpeg")).toBe("abc-123/avatar.jpg");
  });
});