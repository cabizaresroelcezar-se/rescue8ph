import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logAudit, AuditAction } from "@/lib/audit";

/**
 * Gate a server action on a verified email address. Call this at the top of any
 * action that creates a row tied to a user identity (placeOrder, createAddress,
 * createReview, etc.) when the action shouldn't be allowed before the user
 * has clicked the email confirmation link.
 *
 * Three possible outcomes:
 *   1. No user signed in → redirects to /auth/login (with redirectTo preserved)
 *   2. User signed in but email not confirmed → redirects to /auth/verify-email
 *      and writes an EMAIL_VERIFICATION_BLOCKED audit row
 *   3. User signed in and email confirmed → returns silently; action continues
 *
 * The "blocked" audit row is what makes cheating easy to detect: an admin can
 * query /admin/audit-logs for action=EMAIL_VERIFICATION_BLOCKED to see who's
 * been trying to place orders without verifying.
 *
 * Why not just throw? Throwing inside a server action that runs from a <form>
 * shows a Next.js error overlay to the user — they lose all form state and
 * don't know what happened. Redirect gives them a clean state with an actionable
 * message.
 */
export async function requireVerifiedEmail(redirectTo: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  // Supabase tracks email confirmation on auth.users.email_confirmed_at.
  // It's null until the user clicks the verification link.
  if (!user.email_confirmed_at) {
    await logAudit({
      action: AuditAction.EMAIL_VERIFICATION_BLOCKED,
      resourceType: "auth.users",
      resourceId: user.id,
      metadata: {
        email: user.email ?? null,
        attempted_path: redirectTo,
      },
    });

    redirect(
      `/auth/verify-email?email=${encodeURIComponent(user.email ?? "")}`,
    );
  }
}

/**
 * Same as requireVerifiedEmail but returns a boolean instead of redirecting.
 * Use this when the caller wants to render a "verify your email" UI inline
 * rather than navigating away.
 *
 * Also returns the email so the caller can prefill a "resend to {email}" UI.
 */
export async function isVerified(): Promise<{
  verified: boolean;
  email: string | null;
  userId: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { verified: false, email: null, userId: null };
  }

  return {
    verified: Boolean(user.email_confirmed_at),
    email: user.email ?? null,
    userId: user.id,
  };
}