"use client";

import * as React from "react";

// ============================================================================
// FormField — wraps an input with a label, error display, and required indicator
// ============================================================================
// Usage:
//   <FormField label="Email" error={errors.email} required>
//     <input name="email" type="email" className="..." />
//   </FormField>
// ============================================================================

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, required, hint, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <div className="mt-1">
        {children}
      </div>
      {hint && !error && (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-[11px] font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// Input with error styling
// ============================================================================

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function ValidatedInput({ error, className, ...props }: ValidatedInputProps) {
  return (
    <input
      {...props}
      className={`${
        error
          ? "border-destructive focus:border-destructive focus:ring-destructive/20"
          : "border-input focus:border-primary focus:ring-primary/20"
      } ${className || ""}`}
    />
  );
}