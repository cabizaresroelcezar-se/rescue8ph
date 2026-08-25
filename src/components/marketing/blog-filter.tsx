"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function BlogFilter({
  categories,
  active,
}: {
  categories: { name: string; slug: string }[];
  active: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = React.useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (active) params.set("category", active);
    if (q.trim()) params.set("q", q.trim());
    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(url as never);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/blog"
        className={cn(
          "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
          !active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-foreground hover:border-primary/40 hover:text-primary"
        )}
      >
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={{ pathname: "/blog", query: { category: c.slug } }}
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            active === c.slug
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:border-primary/40 hover:text-primary"
          )}
        >
          {c.name}
        </Link>
      ))}
      <form onSubmit={onSearch} className="ml-auto flex items-center gap-2">
        <input
          type="search"
          placeholder="Search posts…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="block w-44 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-56"
        />
      </form>
    </div>
  );
}