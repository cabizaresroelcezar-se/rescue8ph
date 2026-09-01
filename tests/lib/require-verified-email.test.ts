import { describe, it, expect, beforeEach, vi } from "vitest";

// ============================================================================
// Test isolation: each test starts with a fresh mock state.
// ============================================================================

let mockUser: {
  id: string;
  email: string;
  email_confirmed_at: string | null;
} | null = null;

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: mockUser }, error: null }),
    },
    from: () => ({
      insert: () => ({ data: null, error: null }),
    }),
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    // Throw so the test can catch and inspect the URL.
    throw new Error(`__REDIRECT__:${url}`);
  },
}));

vi.mock("@/lib/audit", () => ({
  AuditAction: {
    EMAIL_VERIFICATION_BLOCKED: "EMAIL_VERIFICATION_BLOCKED",
  },
  logAudit: async () => ({ error: null }),
}));

// NOW import the helper (after mocks are registered)
import { requireVerifiedEmail, isVerified } from "@/lib/auth/require-verified-email";

// ============================================================================
// requireVerifiedEmail
// ============================================================================

describe("requireVerifiedEmail", () => {
  beforeEach(() => {
    mockUser = null;
  });

  it("redirects to /auth/login when no user is signed in", async () => {
    await expect(requireVerifiedEmail("/checkout")).rejects.toThrow(
      /__REDIRECT__:\/auth\/login\?redirectTo=%2Fcheckout/,
    );
  });

  it("returns silently when user is signed in AND email is confirmed", async () => {
    mockUser = {
      id: "user-1",
      email: "alice@example.com",
      email_confirmed_at: "2026-09-01T00:00:00Z",
    };

    // Should NOT throw or redirect
    await expect(requireVerifiedEmail("/checkout")).resolves.toBeUndefined();
  });

  it("redirects to /auth/verify-email when user is signed in but email NOT confirmed", async () => {
    mockUser = {
      id: "user-1",
      email: "bob@example.com",
      email_confirmed_at: null,
    };

    await expect(requireVerifiedEmail("/checkout")).rejects.toThrow(
      /__REDIRECT__:\/auth\/verify-email\?email=bob%40example\.com/,
    );
  });

  it("preserves the redirectTo in the login redirect URL", async () => {
    mockUser = null;

    await expect(requireVerifiedEmail("/account/orders")).rejects.toThrow(
      /redirectTo=%2Faccount%2Forders/,
    );
  });
});

// ============================================================================
// isVerified
// ============================================================================

describe("isVerified", () => {
  beforeEach(() => {
    mockUser = null;
  });

  it("returns verified=false when no user", async () => {
    const result = await isVerified();
    expect(result).toEqual({
      verified: false,
      email: null,
      userId: null,
    });
  });

  it("returns verified=true when user has email_confirmed_at", async () => {
    mockUser = {
      id: "user-2",
      email: "carol@example.com",
      email_confirmed_at: "2026-08-30T00:00:00Z",
    };

    const result = await isVerified();
    expect(result).toEqual({
      verified: true,
      email: "carol@example.com",
      userId: "user-2",
    });
  });

  it("returns verified=false when user is signed in but email not confirmed", async () => {
    mockUser = {
      id: "user-3",
      email: "dave@example.com",
      email_confirmed_at: null,
    };

    const result = await isVerified();
    expect(result).toEqual({
      verified: false,
      email: "dave@example.com",
      userId: "user-3",
    });
  });
});