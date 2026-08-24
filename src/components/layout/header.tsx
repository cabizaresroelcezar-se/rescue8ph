import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ButtonLink } from "@/components/ui/button-link";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { role?: { name?: string }[] | { name?: string } } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role:roles(name)")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const roleName = Array.isArray(profile?.role)
    ? profile.role[0]?.name
    : profile?.role?.name;
  const isAdmin = roleName === "admin" || roleName === "super_admin";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Rescue 8 Philippines"
              width={120}
              height={62}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/products" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Products
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              About
            </Link>
            <Link href="/services" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Services
            </Link>
            <Link href="/blog" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Blog
            </Link>
            <Link href="/faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              FAQ
            </Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <ButtonLink href="/admin" variant="ghost" size="sm">
                  Admin
                </ButtonLink>
              )}
              <ButtonLink href="/account" variant="ghost" size="sm">
                My Account
              </ButtonLink>
              <SignOutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ButtonLink href="/auth/login" variant="ghost" size="sm">
                Sign In
              </ButtonLink>
              <ButtonLink href="/auth/register" size="sm">
                Sign Up
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}