"use client";

import * as React from "react";
import { Moon, Sun, Loader2 } from "lucide-react";

/**
 * Server-side: reads dark mode state via a MutationObserver on the html element's
 * class list. Re-uses the same observer pattern as the storefront ThemeToggle
 * so the toggle is responsive without forcing a full React re-render of the
 * tree whenever the class changes.
 */
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

export function AdminThemeToggle() {
  const isDark = React.useSyncExternalStore(
    subscribeDarkMode,
    getDarkModeSnapshot,
    getDarkModeServerSnapshot,
  );

  // Avoid hydration mismatch by waiting for first client render before showing
  // the correct icon. Until then, render a neutral placeholder.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    // Mount detection — legit one-time setState in effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const toggle = React.useCallback(() => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring/30"
    >
      {!mounted ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}