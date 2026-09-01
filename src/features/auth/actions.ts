"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { logAudit, AuditAction } from "@/lib/audit";

// ============================================================================
// Sign Up
// ============================================================================
//
// Phase 16a: email verification is required.
//
// Supabase's "Confirm email" setting (Auth → Providers → Email) must be ON for
// this to actually take effect. We always assume it's on and treat any
// auto-confirmed session as a misconfiguration (defensive — Supabase sends a
// confirmation email and returns null session if Confirm email is enabled).
//
// The "auto-confirm and redirect to /account" branch was removed because it
// would let a user with an unconfirmed email place orders. Now we always land
// on /auth/verify-email which shows the "check your inbox" UI with a resend
// button.
// ============================================================================

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || null,
          last_name: lastName || null,
        },
        emailRedirectTo: `${(await headers()).get("origin")}/auth/callback`,
      },
    });

    if (error) {
      return redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
    }

    // Audit: signup accepted. We always log this regardless of whether
    // email confirmation is required — it's useful to track signup attempts
    // even if some bounce or get spam-filtered.
    if (data.user) {
      await logAudit({
        action: AuditAction.CREATE,
        resourceType: "auth.users",
        resourceId: data.user.id,
        metadata: {
          email,
          method: "password",
          email_verified: Boolean(data.user.email_confirmed_at),
        },
      });
    }

    // If Supabase somehow returned a session without email confirmation,
    // something is misconfigured — sign out immediately so the user is
    // forced through the verification flow.
    if (data.session && !data.user?.email_confirmed_at) {
      await supabase.auth.signOut();
    }

    // Always land on the verify-email page; if email confirmation is
    // disabled in Supabase, the user will be auto-confirmed and the
    // verify-email page will detect that on first load and forward to /account.
    return redirect(
      `/auth/verify-email?email=${encodeURIComponent(email)}`,
    );
  } catch (err) {
    const message = humanizeAuthError(err);
    return redirect(`/auth/login?error=${encodeURIComponent(message)}`);
  }
}

// ============================================================================
// Resend Verification Email
// ============================================================================
//
// Supabase v2 doesn't expose a public "resend confirmation email" method on
// the auth client. The official workaround is to call signInWithOtp with
// { shouldCreateUser: false } to send a magic link, OR call resend on the
// newer SDK API.
//
// For this codebase we use the recommended pattern: re-trigger signUp with
// the same email. Supabase treats it as a "no-op" (user already exists) and
// re-sends the confirmation email.
//
// Note: this reveals whether the email exists (account-enumeration leak).
// We mitigate by always returning the same success message regardless of
// whether the email is on file — see the redirect below.
// ============================================================================

export async function resendVerificationEmail(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const origin = (await headers()).get("origin");

  if (!email) {
    return redirect("/auth/verify-email?message=" + encodeURIComponent("Missing email"));
  }

  try {
    // Re-trigger signUp — Supabase will send a fresh confirmation email if
    // the user exists but isn't confirmed. We don't care about the result;
    // we always show the same "check your inbox" UI.
    await supabase.auth.signUp({
      email,
      password: "__no_password_used_for_resend__", // Supabase ignores this for existing users
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    await logAudit({
      action: AuditAction.EMAIL_VERIFICATION_RESENT,
      resourceType: "auth.users",
      metadata: { email, origin: origin ?? null },
    });
  } catch (err) {
    // Don't surface the error to the user — could leak whether email exists
    console.error("resendVerificationEmail error:", err);
  }

  return redirect(
    `/auth/verify-email?email=${encodeURIComponent(email)}&message=` +
      encodeURIComponent("If an account exists for that email, a new confirmation link has been sent."),
  );
}

// ============================================================================
// Sign In
// ============================================================================

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/account";

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect(
        `/auth/login?error=${encodeURIComponent(error.message)}&email=${encodeURIComponent(email)}`,
      );
    }

    // Audit: successful login. logAudit resolves user_id from session internally,
    // so we can fire this right after signIn returns success.
    if (data.user) {
      await logAudit({
        action: AuditAction.LOGIN,
        resourceType: "auth.sessions",
        resourceId: data.user.id,
        metadata: { email, method: "password" },
      });
    }

    return redirect(redirectTo);
  } catch (err) {
    const message = humanizeAuthError(err);
    return redirect(
      `/auth/login?error=${encodeURIComponent(message)}&email=${encodeURIComponent(email)}`,
    );
  }
}

// ============================================================================
// Sign Out
// ============================================================================

export async function signOut() {
  const supabase = await createClient();

  // Capture the user_id BEFORE signing out — after signOut the session is gone
  // and logAudit's internal getUser() would return null.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    await supabase.auth.signOut();

    if (user) {
      await logAudit({
        action: AuditAction.LOGOUT,
        resourceType: "auth.sessions",
        resourceId: user.id,
        metadata: { email: user.email ?? null },
      });
    }
  } catch (err) {
    // Swallow — still send the user to home even if Supabase is unreachable.
    console.error("signOut error:", err);
  }
  return redirect("/");
}

// ============================================================================
// Request Password Reset
// ============================================================================

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    return redirect(
      `/auth/forgot-password?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Audit: password reset requested. This fires whether or not the email
  // actually exists — Supabase's resetPasswordForEmail always succeeds to avoid
  // account-enumeration leaks. We log "requested" not "delivered".
  await logAudit({
    action: "PASSWORD_RESET_REQUESTED",
    resourceType: "auth.users",
    metadata: { email, origin: origin ?? null },
  });

  return redirect(
    "/auth/forgot-password?message=" +
      encodeURIComponent("Check your email for a password reset link."),
  );
}

// ============================================================================
// Update Password (after reset)
// ============================================================================

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.updateUser({ password });

  if (error) {
    return redirect(
      `/auth/reset-password?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Audit: password changed. logAudit reads the user_id from the current session,
  // which is the user who just changed their password.
  if (data.user) {
    await logAudit({
      action: "PASSWORD_CHANGED",
      resourceType: "auth.users",
      resourceId: data.user.id,
    });
  }

  return redirect("/account?message=" + encodeURIComponent("Password updated successfully."));
}

// ============================================================================
// Update Profile
// ============================================================================

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName || null,
      last_name: lastName || null,
      phone: phone || null,
    })
    .eq("id", user.id);

  if (error) {
    return redirect(
      "/account/profile?error=" + encodeURIComponent(error.message),
    );
  }

  return redirect(
    "/account/profile?message=" +
      encodeURIComponent("Profile updated successfully."),
  );
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Convert a thrown error (often a Node "fetch failed" / TypeError when the
 * Supabase URL is unconfigured or unreachable) into something a human can act
 * on, instead of a raw `TypeError: fetch failed` stack trace.
 */
function humanizeAuthError(err: unknown): string {
  if (err instanceof Error) {
    const name = err.name || "";
    const msg  = err.message || "";
    if (msg.toLowerCase().includes("fetch failed")) {
      return "We couldn't reach the authentication service. Please try again in a moment — if the problem persists, contact us at info@rescue8ph.com.";
    }
    if (name === "AuthRetryableFetchError" || msg.includes("RetryableFetch")) {
      return "The authentication service is temporarily unreachable. Please try again shortly.";
    }
    return msg;
  }
  return "Unexpected error. Please try again.";
}