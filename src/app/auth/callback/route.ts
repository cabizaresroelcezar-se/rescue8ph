import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Phase 16a: Email Verification Callback
 *
 * Supabase sends users here after they click the link in their confirmation
 * email (and also after password-reset links).
 *
 * Behavior:
 *   1. Exchange the `code` query param for a session
 *   2. If success → forward to /auth/verify-email?verified=true&next=...
 *      (the verify-email page checks the session, logs EMAIL_VERIFIED, and
 *      shows the success message)
 *   3. If error → redirect to /auth/login with the error message
 *
 * If no `code` param is present, this is likely a direct hit (e.g. user
 * typed the URL) — forward to /auth/verify-email which will detect the
 * signed-in-but-not-verified state and show the appropriate UI.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message)}`,
      );
    }

    // Successful exchange. The verify-email page will detect the now-confirmed
    // session and show the success state.
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/verify-email?verified=true&next=${encodeURIComponent(next)}`,
    );
  }

  // No code — direct hit. Forward to verify-email which will handle it.
  return NextResponse.redirect(
    `${requestUrl.origin}/auth/verify-email?next=${encodeURIComponent(next)}`,
  );
}