import { updatePassword } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Set a new password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        {params.error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {params.error}
          </div>
        )}
        <form action={updatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full">
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}