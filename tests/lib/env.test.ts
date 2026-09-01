import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateEnv } from "@/lib/env";

describe("validateEnv", () => {
  // Snapshot env at import time so we can restore it after each test.
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    // Wipe known env vars so each test controls the entire input.
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.XENDIT_SECRET_KEY;
    delete process.env.PAYMONGO_SECRET_KEY;
  });

  afterEach(() => {
    // Restore original env so we don't leak state between tests.
    process.env = { ...ORIGINAL_ENV };
  });

  it("reports missing required vars when nothing is set", () => {
    const { missing, warnings } = validateEnv();
    expect(missing).toEqual(
      expect.arrayContaining(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]),
    );
    expect(missing.length).toBe(2);
    // Optional ones should appear as warnings too
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("treats empty string the same as unset", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
    const { missing } = validateEnv();
    expect(missing).toEqual(
      expect.arrayContaining(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]),
    );
  });

  it("returns empty missing array when all required vars are set", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-123";
    const { missing } = validateEnv();
    expect(missing).toEqual([]);
  });

  it("still warns about unset optional vars even when required are set", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-123";
    const { warnings } = validateEnv();
    expect(warnings).toEqual(
      expect.arrayContaining([
        "SUPABASE_SERVICE_ROLE_KEY",
        "NEXT_PUBLIC_SITE_URL",
        "XENDIT_SECRET_KEY",
        "PAYMONGO_SECRET_KEY",
      ]),
    );
  });
});