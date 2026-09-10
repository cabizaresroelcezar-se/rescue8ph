"use client";

import * as React from "react";

// ============================================================================
// Form validation hook — lightweight client-side validation with toast
// ============================================================================
// Usage:
//   const { errors, validate, clearError } = useFormValidation({
//     email: { required: true, pattern: "email" },
//     phone: { required: true, pattern: "phone" },
//   });
//   // In submit handler:
//   if (!validate({ email, phone })) return;
// ============================================================================

type ValidationRule = {
  required?: boolean;
  pattern?: "email" | "phone" | "url" | "number" | "slug";
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  label?: string;
};

type ValidationSchema = Record<string, ValidationRule>;

const PATTERNS: Record<string, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+?63|0)?[\d\s-]{10,}$/,
  url: /^https?:\/\/.+/,
  number: /^-?\d+(\.\d+)?$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

export function useFormValidation(schema: ValidationSchema) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function validate(values: Record<string, string | number | null | undefined>): boolean {
    const newErrors: Record<string, string> = {};

    for (const [field, rule] of Object.entries(schema)) {
      const value = values[field];
      const strValue = value == null ? "" : String(value).trim();
      const label = rule.label || field;

      if (rule.required && !strValue) {
        newErrors[field] = `${label} is required`;
        continue;
      }

      if (!strValue) continue; // Skip further checks if empty and not required

      if (rule.pattern) {
        const pattern = PATTERNS[rule.pattern];
        if (pattern && !pattern.test(strValue)) {
          newErrors[field] = `Invalid ${rule.pattern} format`;
          continue;
        }
      }

      if (rule.minLength && strValue.length < rule.minLength) {
        newErrors[field] = `${label} must be at least ${rule.minLength} characters`;
        continue;
      }

      if (rule.maxLength && strValue.length > rule.maxLength) {
        newErrors[field] = `${label} must be at most ${rule.maxLength} characters`;
        continue;
      }

      if (rule.min != null) {
        const num = Number(strValue);
        if (!isNaN(num) && num < rule.min) {
          newErrors[field] = `${label} must be at least ${rule.min}`;
          continue;
        }
      }

      if (rule.max != null) {
        const num = Number(strValue);
        if (!isNaN(num) && num > rule.max) {
          newErrors[field] = `${label} must be at most ${rule.max}`;
          continue;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function clearError(field: string) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function clearAll() {
    setErrors({});
  }

  return { errors, validate, clearError, clearAll };
}

// ============================================================================
// Shared Zod schemas for server-side validation
// ============================================================================

export const validationSchemas = {
  email: (label = "Email") => ({
    required: true,
    pattern: "email" as const,
    label,
  }),
  phone: (label = "Phone") => ({
    required: true,
    pattern: "phone" as const,
    label,
  }),
  optionalPhone: (label = "Phone") => ({
    required: false,
    pattern: "phone" as const,
    label,
  }),
  required: (label: string) => ({
    required: true,
    label,
  }),
  optional: (label: string) => ({
    required: false,
    label,
  }),
  number: (label: string, minVal = 0) => ({
    required: true,
    pattern: "number" as const,
    min: minVal,
    label,
  }),
  slug: (label = "Slug") => ({
    required: false,
    pattern: "slug" as const,
    label,
  }),
};