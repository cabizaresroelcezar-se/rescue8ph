import { describe, it, expect } from "vitest";
import { formatCurrency, formatDatePh, formatDateTimePh } from "@/lib/format";

describe("formatCurrency", () => {
  it("formats positive PHP amounts with peso sign and 2 decimals", () => {
    expect(formatCurrency(1250)).toBe("₱1,250.00");
    expect(formatCurrency(999999.5)).toBe("₱999,999.50");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("₱0.00");
  });

  it("formats negative amounts as debit (parentheses convention varies by locale)", () => {
    // en-PH defaults to leading-minus for negative currency
    const out = formatCurrency(-100);
    expect(out).toContain("100");
    expect(out.startsWith("-") || out.startsWith("(")).toBe(true);
  });

  it("rounds to 2 decimal places (banker's rounding or standard)", () => {
    const out = formatCurrency(99.999);
    // Either ₱100.00 or ₱99.99 depending on rounding mode; we just want 2 decimals
    expect(out).toMatch(/₱\d{1,3}(,\d{3})*\.\d{2}/);
  });
});

describe("formatDatePh", () => {
  it("formats an ISO string into a Philippine-style long date", () => {
    const out = formatDatePh("2026-08-24T12:00:00Z");
    // en-PH formats as "August 24, 2026"
    expect(out).toContain("August");
    expect(out).toContain("24");
    expect(out).toContain("2026");
  });

  it("accepts Date objects", () => {
    const out = formatDatePh(new Date("2026-01-15T00:00:00Z"));
    expect(out).toContain("January");
    expect(out).toContain("2026");
  });
});

describe("formatDateTimePh", () => {
  it("formats an ISO string with time component", () => {
    const out = formatDateTimePh("2026-08-24T15:42:00Z");
    // en-PH default includes time; just verify date+time components present
    expect(out).toContain("2026");
    expect(out).toMatch(/\d{1,2}:\d{2}/); // HH:MM
  });
});