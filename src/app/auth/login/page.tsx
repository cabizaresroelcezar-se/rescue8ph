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

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; email?: string; redirectTo?: string }>;
}) {
  const params = await searchParams;

  return (
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
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {params.error}
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
          <Button type="submit" className="w-full">
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
  );
}