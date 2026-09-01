import Link from "next/link";
import Image from "next/image";
import { signIn } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Info, Mail } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; email?: string; redirectTo?: string; verify?: string }>;
}) {
  const params = await searchParams;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const isPlaceholder =
    !supabaseUrl ||
    supabaseUrl.includes("placeholder.supabase.co") ||
    supabaseUrl.includes("your-project");

  // Phase 16a: ?verify=true shows a "please verify your email" banner. Set
  // by signIn when it detects the user just signed in but email_confirmed_at
  // is null (Supabase Auth's auto-refresh kept them signed in but the gate
  // still blocked them). Avoid leaking account existence by only showing
  // the banner when explicitly flagged.
  const showVerifyBanner = params.verify === "true";

  return (
    <div className="space-y-3">
      {isPlaceholder && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <p className="font-semibold">Supabase is not configured yet.</p>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300/80">
              Add real <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
              and <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
              to <code className="font-mono">.env.local</code> to enable login.
              The form below will not work until then.
            </p>
          </div>
        </div>
      )}

      {/* Compact card: size="sm" tightens internal spacing; smaller logo
          + smaller title + smaller inputs all combine to make the form
          feel less heavy on small screens. */}
      <Card size="sm" className="shadow-elev-3 ring-foreground/10 backdrop-blur-sm">
        <CardHeader className="items-center gap-1 text-center pb-2">
          <Image
            src="/logo.svg"
            alt="Rescue 8 Philippines"
            width={120}
            height={62}
            className="mx-auto h-10 w-auto"
          />
          <CardTitle className="mt-2 text-lg">Welcome back</CardTitle>
          <CardDescription className="text-xs">
            Sign in to your Rescue 8 account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {params.error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{params.error}</span>
            </div>
          )}
          {params.message && (
            <div className="rounded-md bg-primary/10 p-2.5 text-xs text-primary">
              {params.message}
            </div>
          )}
          {showVerifyBanner && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
              <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>
                <p className="font-semibold">Please verify your email.</p>
                <p className="mt-0.5 text-amber-800 dark:text-amber-300/80">
                  Check your inbox for the confirmation link, or{" "}
                  <Link
                    href={`/auth/verify-email?email=${encodeURIComponent(params.email ?? "")}`}
                    className="font-medium underline"
                  >
                    resend it
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}
          <form action={signIn} className="space-y-3">
            <input type="hidden" name="redirectTo" value={params.redirectTo || "/account"} />
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                defaultValue={params.email || ""}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Your password"
                required
              />
            </div>
            <Button type="submit" className="h-9 w-full text-sm" disabled={isPlaceholder}>
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardContent className="pt-0 text-center">
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
