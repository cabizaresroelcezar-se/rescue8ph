"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  FileText,
  FolderOpen,
  ImageIcon,
  Settings,
  ShieldAlert,
  BarChart3,
  UserCog,
  ArrowLeft,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  superOnly?: boolean;
};

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin",            label: "Dashboard",   icon: LayoutDashboard },
      { href: "/admin/analytics",  label: "Analytics",   icon: BarChart3 },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/products",  label: "Products",  icon: Package },
      { href: "/admin/inventory", label: "Inventory", icon: Boxes },
      { href: "/admin/media",     label: "Media",     icon: ImageIcon },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/orders",    label: "Orders",    icon: ShoppingCart },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/content", label: "Site Content", icon: FileText },
      { href: "/admin/pages",   label: "Pages",        icon: FolderOpen },
      { href: "/admin/blog",    label: "Blog",         icon: FileText },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldAlert },
      { href: "/admin/users",      label: "Users",      icon: UserCog, superOnly: true },
      { href: "/admin/settings",   label: "Settings",   icon: Settings, superOnly: true },
    ],
  },
];

export function AdminSidebar({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Rescue 8 Admin"
            width={120}
            height={62}
            className="h-9 w-auto"
          />
        </Link>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        {groups.map((group) => {
          const visible = group.items.filter((i) => !i.superOnly || isSuperAdmin);
          if (visible.length === 0) return null;
          return (
            <div key={group.title}>
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {visible.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 font-semibold text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.superOnly && (
                          <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                            Super
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/account"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Account
        </Link>
      </div>
    </aside>
  );
}
