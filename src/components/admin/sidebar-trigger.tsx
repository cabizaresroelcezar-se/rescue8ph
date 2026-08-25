"use client";

import * as React from "react";
import { Menu } from "lucide-react";

/**
 * Dispatch a custom event that the AdminSidebar listens to.
 * Keeps the trigger decoupled so it can be rendered anywhere.
 */
export function AdminSidebarTrigger() {
  const onClick = () => {
    window.dispatchEvent(new CustomEvent("admin-sidebar:toggle"));
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open admin menu"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-secondary md:hidden"
    >
      <Menu className="h-4 w-4" />
    </button>
  );
}