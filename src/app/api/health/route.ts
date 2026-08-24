import { NextResponse } from "next/server";
import { validateEnv } from "@/lib/env";

/**
 * Health check endpoint — GET /api/health
 * Returns 200 if the app is healthy, 503 if critical env vars are missing.
 */
export async function GET() {
  const { missing, warnings } = validateEnv();

  const status = missing.length === 0 ? "ok" : "degraded";

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      missing: missing.length > 0 ? missing : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    },
    { status: missing.length === 0 ? 200 : 503 },
  );
}