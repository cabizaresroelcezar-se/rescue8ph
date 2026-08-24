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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Info } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; email?: string; redirectTo?: string }>;
}) {
  const params = await searchParams;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const isPlaceholder =
    !supabaseUrl ||
    supabaseUrl.includes("placeholder.supabase.co") ||
    supabaseUrl.includes("your-project");

  return (
    <div className="space-y-4">
      {isPlaceholder && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
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

      <Card>
        <CardHeader className="text-center">
          <Image
            src="/logo.svg"
            alt="Rescue 8 Philippines"
            width={140}
            height={72}
            className="mx-auto h-12 w-auto"
          />
          <CardTitle className="mt-4 text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Rescue 8 account</CardDescription>
        </CardHeader>
        <CardContent>
          {params.error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{params.error}</span>
            </div>
          )}
          {params.message && (
            <div className="mb-4 rounded-md bg-primary/10 p-3 text-sm text-primary">
              {params.message}
            </div>
          )}
          <form action={signIn} className="space-y-4">
            <input type="hidden" name="redirectTo" value={params.redirectTo || "/account"} />
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                defaultValue={params.email || ""}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
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
            <Button type="submit" className="w-full" disabled={isPlaceholder}>
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}