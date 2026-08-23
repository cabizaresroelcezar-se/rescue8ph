"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  FileText,
  FolderOpen,
  Image,
  Settings,
  ShieldAlert,
  BarChart3,
  UserCog,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, superOnly: false },
  { href: "/admin/products", label: "Products", icon: Package, superOnly: false },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, superOnly: false },
  { href: "/admin/customers", label: "Customers", icon: Users, superOnly: false },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes, superOnly: false },
  { href: "/admin/content", label: "Content", icon: FileText, superOnly: false },
  { href: "/admin/pages", label: "Pages", icon: FolderOpen, superOnly: false },
  { href: "/admin/blog", label: "Blog", icon: FileText, superOnly: false },
  { href: "/admin/media", label: "Media", icon: Image, superOnly: false },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, superOnly: false },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldAlert, superOnly: false },
  { href: "/admin/users", label: "Users", icon: UserCog, superOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, superOnly: true },
];

export function AdminSidebar({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white md:block">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-lg font-bold">Rescue 8</span>
          <span className="rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
            Admin
          </span>
        </Link>
      </div>
      <nav className="space-y-1 p-3">
        {navItems
          .filter((item) => !item.superOnly || isSuperAdmin)
          .map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "w-full justify-start gap-3 font-normal",
                  isActive && "bg-primary/10 text-primary font-medium",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
      </nav>
      <div className="absolute bottom-0 w-64 border-t p-3">
        <Link
          href="/account"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-full justify-start gap-3 font-normal",
          )}
        >
          <UserCog className="h-4 w-4" />
          Back to Account
        </Link>
      </div>
    </aside>
  );
}