"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

function subscribeDarkMode(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getDarkModeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getDarkModeServerSnapshot() {
  return false;
}

export function ThemeToggle({ className }: { className?: string }) {
  const isDark = React.useSyncExternalStore(
    subscribeDarkMode,
    getDarkModeSnapshot,
    getDarkModeServerSnapshot,
  );

  const toggle = React.useCallback(() => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }, [isDark]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={className}
    >
      <Sun
        className="h-4 w-4 rotate-0 scale-100 transition-transform duration-[var(--duration-base)] dark:-rotate-90 dark:scale-0"
        aria-hidden
      />
      <Moon
        className="absolute h-4 w-4 rotate-90 scale-0 transition-transform duration-[var(--duration-base)] dark:rotate-0 dark:scale-100"
        aria-hidden
      />
    </Button>
  );
}