"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Search, X, ChevronDown, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CartButton } from "@/components/shop/cart-button";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

export function HeaderClient({
  navItems,
  children,
}: {
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const [megaOpen, setMegaOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const megaTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawerOpen]);

  const openMega = () => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    setMegaOpen(true);
  };
  const closeMega = () => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    megaTimer.current = window.setTimeout(() => setMegaOpen(false), 120);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-[background,box-shadow,border-color] duration-[var(--duration-base)] ease-[var(--ease-out-quart)]",
        scrolled
          ? "surface-glass shadow-elev-1"
          : "border-b border-transparent bg-background"
      )}
    >
      <div className="container-wide flex h-16 items-center gap-4">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary md:hidden"
          aria-label="Open menu"
          aria-expanded={drawerOpen}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-8">
          {children}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {navItems.map((item) => {
              const isProducts = item.href === "/products";
              if (!isProducts) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                >
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-haspopup="true"
                    aria-expanded={megaOpen}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-[var(--duration-base)]",
                        megaOpen && "rotate-180"
                      )}
                    />
                  </Link>
                  <MegaPanel open={megaOpen} />
                </div>
              );
            })}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <SearchTrigger open={searchOpen} setOpen={setSearchOpen} />
          <ThemeToggle />
          <CartButton />
        </div>
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navItems={navItems}
      />
    </header>
  );
}

function MegaPanel({ open }: { open: boolean }) {
  const groups = [
    {
      title: "Shop by Category",
      links: [
        { label: "First Aid Kits",     href: "/products?category=first-aid" },
        { label: "Rescue Tools",       href: "/products?category=rescue" },
        { label: "EMS Equipment",      href: "/products?category=ems" },
        { label: "PPE & Safety",       href: "/products?category=ppe" },
      ],
    },
    {
      title: "Featured",
      links: [
        { label: "New Arrivals",  href: "/products?sort=new" },
        { label: "Best Sellers",  href: "/products?sort=popular" },
        { label: "Bulk & B2B",    href: "/contact" },
      ],
    },
  ];

  return (
    <div
      className={cn(
        "absolute left-1/2 top-full -translate-x-1/2 pt-3",
        "transition-all duration-[var(--duration-base)] ease-[var(--ease-out-quart)]",
        open
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-1 opacity-0"
      )}
    >
      <div className="w-[min(640px,92vw)] rounded-xl border border-border bg-popover p-6 shadow-elev-4">
        <div className="grid gap-8 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="text-eyebrow">{g.title}</p>
              <ul className="mt-3 space-y-1.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground/90 transition-colors hover:text-primary"
                    >
                      {l.label}
                      <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-[var(--duration-base)] group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between rounded-lg bg-secondary p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Need help choosing?</p>
            <p className="text-xs text-muted-foreground">Talk to an EMS specialist today.</p>
          </div>
          <ButtonLink href="/contact" variant="outline" size="sm">
            Contact us
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function SearchTrigger({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Search"
        aria-expanded={open}
      >
        <Search className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full border-t border-border bg-background/95 backdrop-blur">
          <form
            action="/products"
            method="get"
            className="container-wide flex h-14 items-center gap-2"
            onSubmit={() => setOpen(false)}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              name="q"
              type="search"
              autoFocus
              placeholder="Search products, categories, SKUs…"
              className="h-10 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function MobileDrawer({
  open,
  onClose,
  navItems,
}: {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
}) {
  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity duration-[var(--duration-base)] md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(360px,86vw)] flex-col border-r border-border bg-background shadow-elev-4 md:hidden",
          "transition-transform duration-[var(--duration-slow)] ease-[var(--ease-in-out-quart)]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <span className="text-sm font-semibold tracking-tight">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile primary">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-border p-4">
          <div className="grid gap-2">
            <ButtonLink href="/auth/login" variant="outline" size="sm" className="w-full">
              Sign In
            </ButtonLink>
            <ButtonLink href="/auth/register" size="sm" className="w-full">
              Sign Up
            </ButtonLink>
          </div>
        </div>
      </aside>
    </>
  );
}
