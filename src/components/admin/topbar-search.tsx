"use client";

import { Search } from "lucide-react";

export function AdminTopbarSearch() {
  return (
    <form
      role="search"
      action="/admin"
      method="get"
      className="ml-auto hidden h-9 w-full max-w-sm items-center gap-2 rounded-md border border-input bg-background px-2.5 text-sm shadow-elev-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background md:flex"
    >
      <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      <input
        type="search"
        name="q"
        placeholder="Search products, orders, customers…"
        className="h-full flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
        ⌘K
      </kbd>
    </form>
  );
}