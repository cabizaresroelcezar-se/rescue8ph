import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { resendVerificationEmail } from "@/features/auth/actions";
import { logAudit, AuditAction } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Info, Mail } from "lucide-react";

/**
 * Phase 16a: Email Verification Pending Page
 *
 * User lands here after signUp (always) and after clicking a confirmation
 * link in their email (which redirects through /auth/callback and then here).
 *
 * Three states:
 *   1. URL has `verified=true` — user just clicked the link, email confirmed,
 *      show success + redirect button to /account
 *   2. User is signed in and email IS confirmed — automatically redirect to
 *      /account (handles the "user opened this link a second time" case)
 *   3. Otherwise — show "check your email" with resend button
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string;
    message?: string;
    verified?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // If the user already has a confirmed session, just send them through.
  // This handles the case where someone clicks the verification link,
  // gets sent to /auth/callback (which exchanges the code for a session),
  // and we land back here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email_confirmed_at) {
    // Log the verification event for the audit trail (Phase 16a).
    // Safe to fire-and-forget; logAudit swallows errors internally.
    await logAudit({
      action: AuditAction.EMAIL_VERIFIED,
      resourceType: "auth.users",
      resourceId: user.id,
      metadata: {
        email: user.email ?? null,
        verified_at: user.email_confirmed_at,
      },
    });

    // Auto-redirect to /account after a brief flash — Next.js redirect
    // throws so no UI flashes after this.
    if (params.verified === "true") {
      // Came from the /auth/callback after just verifying. Show success first,
      // then on next render the user-confirmed check above kicks them to /account.
      // We don't redirect here so the success message can be displayed.
    } else {
      // User landed here directly (e.g., stale tab), silently forward them.
      redirect("/account");
    }
  }

  const email = params.email || user?.email || "";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="text-center">
          <Mail className="mx-auto h-10 w-10 text-primary" />
          <CardTitle className="mt-2 text-xl">
            {params.verified === "true" ? "Email verified!" : "Check your email"}
          </CardTitle>
          <CardDescription>
            {params.verified === "true"
              ? "Your email is confirmed. You can now place orders and access all features."
              : "We sent a confirmation link to your email. Click it to activate your account."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.verified === "true" && (
            <div className="flex items-start gap-2 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-900 dark:border-green-700 dark:bg-green-950/50 dark:text-green-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                You&apos;re all set. <Link href="/account" className="font-medium underline">Continue to your account</Link>.
              </span>
            </div>
          )}

          {params.error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{params.error}</span>
            </div>
          )}

          {params.message && (
            <div className="flex items-start gap-2 rounded-md border border-blue-300 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-200">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{params.message}</span>
            </div>
          )}

          {params.verified !== "true" && (
            <>
              {email && (
                <p className="text-center text-sm text-muted-foreground">
                  Confirmation link sent to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              )}

              <form action={resendVerificationEmail} className="space-y-2">
                <input type="hidden" name="email" value={email} />
                <Button type="submit" variant="outline" className="w-full">
                  Resend confirmation email
                </Button>
              </form>

              <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Didn&apos;t get the email?</p>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  <li>Check your spam or promotions folder</li>
                  <li>Make sure {email || "the address"} is spelled correctly</li>
                  <li>Wait a minute — delivery can take up to 5 minutes</li>
                </ul>
              </div>
            </>
          )}

          <div className="border-t pt-4 text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="hover:text-primary hover:underline">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}