"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { logAudit, AuditAction } from "@/lib/audit";

// ============================================================================
// Sign Up
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

    // If email confirmation is required, redirect to a notice page
    if (data.user && !data.session) {
      return redirect(
        "/auth/login?message=" +
          encodeURIComponent("Check your email to confirm your account."),
      );
    }

    // If auto-confirmed, session is created
    if (data.session) {
      return redirect("/account");
    }

    return redirect(
      "/auth/login?message=" +
        encodeURIComponent("Check your email to confirm your account."),
    );
  } catch (err) {
    const message = humanizeAuthError(err);
    return redirect(`/auth/login?error=${encodeURIComponent(message)}`);
  }
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