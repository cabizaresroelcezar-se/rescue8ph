import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button-link";
import { HeaderClient } from "@/components/layout/header-client";
import { AnnouncementBar } from "@/components/layout/announcement-bar";

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

  const navItems = [
    { href: "/products", label: "Products" },
    { href: "/services", label: "Services" },
    { href: "/about",    label: "About" },
    { href: "/blog",     label: "Blog" },
    { href: "/faq",      label: "FAQ" },
    { href: "/contact",  label: "Contact" },
  ];

  return (
    <>
      <AnnouncementBar
        message="Nationwide delivery on orders over ₱5,000 — Free shipping to Metro Manila, Rizal, Bulacan, Cavite, and Laguna."
        href="/products"
      />

      <HeaderClient navItems={navItems}>
        <Link href="/" className="flex items-center gap-2" aria-label="Rescue 8 Philippines home">
          <Image
            src="/logo.svg"
            alt=""
            width={120}
            height={62}
            className="h-9 w-auto sm:h-10"
            priority
          />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {isAdmin && (
                <ButtonLink href="/admin" variant="ghost" size="sm">
                  Admin
                </ButtonLink>
              )}
              <ButtonLink href="/account" variant="ghost" size="sm">
                My Account
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/auth/login" variant="ghost" size="sm">
                Sign In
              </ButtonLink>
              <ButtonLink href="/auth/register" size="sm">
                Sign Up
              </ButtonLink>
            </>
          )}
        </div>
      </HeaderClient>
    </>
  );
}
