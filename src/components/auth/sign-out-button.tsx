"use client";

import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost" size="sm" className="gap-2">
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </form>
  );
}