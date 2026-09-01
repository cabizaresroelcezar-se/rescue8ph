import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock supabase server BEFORE importing the actions module
type MockCouponRow = {
  data: Record<string, unknown> | null;
  error: { message: string } | null;
};
const mockCouponRow: MockCouponRow = { data: null, error: null };

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: mockCouponRow.data, error: mockCouponRow.error }),
        }),
      }),
    }),
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: () => {},
}));

// Now import (after mocks are registered)
import { validateCoupon } from "@/features/coupons/actions";

// =============================================================================
// Helpers
// =============================================================================

function setCoupon(overrides: Record<string, unknown>) {
  mockCouponRow.data = {
    id: "coupon-uuid-1",
    code: "TEST20",
    discount_type: "PERCENTAGE",
    discount_value: 20,
    minimum_order_amount: null,
    maximum_discount_amount: null,
    usage_limit: null,
    usage_count: 0,
    starts_at: null,
    expires_at: null,
    is_active: true,
    ...overrides,
  };
  mockCouponRow.error = null;
}

function clearCoupon() {
  mockCouponRow.data = null;
  mockCouponRow.error = { message: "No rows" };
}

// =============================================================================
// Tests
// =============================================================================

describe("validateCoupon — input handling", () => {
  beforeEach(() => clearCoupon());

  it("rejects empty/whitespace code", async () => {
    const r1 = await validateCoupon("", 1000);
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.error).toMatch(/enter/i);

    const r2 = await validateCoupon("   ", 1000);
    expect(r2.ok).toBe(false);
  });

  it("uppercases + strips spaces from code (passed to DB as-is)", async () => {
    setCoupon({ code: "SUMMER20" });
    const result = await validateCoupon("  summer 20 ", 1000);
    expect(result.ok).toBe(true);
  });
});

describe("validateCoupon — coupon lookup failures", () => {
  beforeEach(() => clearCoupon());

  it("returns 'not found' when DB has no row", async () => {
    const result = await validateCoupon("NOPE", 1000);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/not found/i);
  });

  it("returns 'no longer active' when is_active=false", async () => {
    setCoupon({ is_active: false });
    const result = await validateCoupon("TEST20", 1000);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/no longer active/i);
  });
});

describe("validateCoupon — validity window", () => {
  beforeEach(() => clearCoupon());

  it("rejects coupon not yet active (starts_at in the future)", async () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
    setCoupon({ starts_at: future });
    const result = await validateCoupon("TEST20", 1000);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/isn't active yet/i);
  });

  it("rejects expired coupon", async () => {
    const past = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
    setCoupon({ expires_at: past });
    const result = await validateCoupon("TEST20", 1000);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/expired/i);
  });

  it("accepts coupon within active window", async () => {
    const past = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    setCoupon({ starts_at: past, expires_at: future });
    const result = await validateCoupon("TEST20", 1000);
    expect(result.ok).toBe(true);
  });
});

describe("validateCoupon — usage limit", () => {
  beforeEach(() => clearCoupon());

  it("rejects coupon that has reached its usage limit", async () => {
    setCoupon({ usage_limit: 10, usage_count: 10 });
    const result = await validateCoupon("TEST20", 1000);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/usage limit/i);
  });

  it("accepts coupon with usage_count < usage_limit", async () => {
    setCoupon({ usage_limit: 10, usage_count: 5 });
    const result = await validateCoupon("TEST20", 1000);
    expect(result.ok).toBe(true);
  });
});

describe("validateCoupon — minimum order amount", () => {
  beforeEach(() => clearCoupon());

  it("rejects when subtotal is below minimum", async () => {
    setCoupon({ minimum_order_amount: 2000 });
    const result = await validateCoupon("TEST20", 1500);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/minimum order/i);
  });

  it("accepts when subtotal meets minimum exactly", async () => {
    setCoupon({ minimum_order_amount: 2000 });
    const result = await validateCoupon("TEST20", 2000);
    expect(result.ok).toBe(true);
  });
});

describe("validateCoupon — discount math", () => {
  beforeEach(() => clearCoupon());

  it("computes PERCENTAGE discount on subtotal", async () => {
    setCoupon({ discount_type: "PERCENTAGE", discount_value: 20 });
    const result = await validateCoupon("TEST20", 1000);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.coupon.discount_amount).toBe(200);
  });

  it("computes FIXED_AMOUNT discount", async () => {
    setCoupon({ discount_type: "FIXED_AMOUNT", discount_value: 100 });
    const result = await validateCoupon("FLAT100", 5000);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.coupon.discount_amount).toBe(100);
  });

  it("caps PERCENTAGE discount by maximum_discount_amount", async () => {
    setCoupon({
      discount_type: "PERCENTAGE",
      discount_value: 50,
      maximum_discount_amount: 200,
    });
    const result = await validateCoupon("HALF", 1000); // 50% = 500, cap at 200
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.coupon.discount_amount).toBe(200);
  });

  it("caps discount at subtotal (discount never exceeds subtotal)", async () => {
    setCoupon({ discount_type: "FIXED_AMOUNT", discount_value: 1000 });
    const result = await validateCoupon("BIG", 500);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.coupon.discount_amount).toBe(500);
  });

  it("rounds discount to 2 decimal places", async () => {
    setCoupon({ discount_type: "PERCENTAGE", discount_value: 33 });
    const result = await validateCoupon("THIRTY3", 100); // 33% of 100 = 33 exactly
    expect(result.ok).toBe(true);
    if (result.ok) {
      // discount_amount should be a number with at most 2 decimals
      expect(Number.isInteger(result.coupon.discount_amount * 100)).toBe(true);
    }
  });

  it("rounds correctly when computed amount has 3+ decimals", async () => {
    setCoupon({ discount_type: "PERCENTAGE", discount_value: 7 });
    // 7% of 123.45 = 8.6415, should round to 8.64
    const result = await validateCoupon("PROMO", 123.45);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.coupon.discount_amount).toBe(8.64);
  });
});

describe("validateCoupon — return shape", () => {
  beforeEach(() => clearCoupon());

  it("returns all required fields on success", async () => {
    setCoupon({
      discount_type: "PERCENTAGE",
      discount_value: 10,
    });
    const result = await validateCoupon("TEST10", 1000); // 10% of 1000 = 100
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.coupon).toEqual({
        id: "coupon-uuid-1",
        code: "TEST20",
        discount_type: "PERCENTAGE",
        discount_value: 10,
        maximum_discount_amount: null,
        discount_amount: 100,
      });
    }
  });
});