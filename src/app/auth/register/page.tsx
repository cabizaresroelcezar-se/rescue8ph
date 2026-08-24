import Link from "next/link";
import Image from "next/image";
import { signUp } from "@/features/auth/actions";
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

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
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
              Add real Supabase keys to <code className="font-mono">.env.local</code>{" "}
              to enable registration.
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
          <CardTitle className="mt-4 text-2xl">Create your account</CardTitle>
          <CardDescription>Join Rescue 8 Philippines today</CardDescription>
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
          <form action={signUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Dela Cruz"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPlaceholder}>
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}