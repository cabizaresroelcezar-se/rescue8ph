/**
 * Validates that all required environment variables are set.
 * Returns a list of missing or invalid variables. Empty array = all good.
 *
 * Call from health check endpoints or at startup.
 */
export function validateEnv(): { missing: string[]; warnings: string[] } {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  const optional = [
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SITE_URL",
    "XENDIT_SECRET_KEY",
    "PAYMONGO_SECRET_KEY",
  ];

  const missing = required.filter(
    (key) => !process.env[key] || process.env[key] === "",
  );

  const warnings = optional.filter(
    (key) => !process.env[key] || process.env[key] === "",
  );

  return { missing, warnings };
}