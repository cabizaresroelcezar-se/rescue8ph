"use client";

import * as React from "react";
import { X, Megaphone } from "lucide-react";

export function AnnouncementBar({
  message,
  href,
  storageKey = "r8-announcement-dismissed-v1",
}: {
  message: string;
  href?: string;
  storageKey?: string;
}) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      const dismissed = localStorage.getItem(storageKey);
      if (!dismissed) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  if (!visible) return null;

  const Content = (
    <div className="flex items-center gap-2 text-xs font-medium sm:text-sm">
      <Megaphone className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
      <span className="truncate">{message}</span>
      {href && (
        <span
          aria-hidden
          className="hidden underline-offset-2 group-hover:underline sm:inline"
        >
          Learn more →
        </span>
      )}
    </div>
  );

  return (
    <div
      role="region"
      aria-label="Site announcement"
      className="group relative isolate overflow-hidden bg-primary text-primary-foreground"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-accent/30 to-transparent"
      />
      <div className="container-page flex h-9 items-center justify-center sm:h-10">
        {href ? (
          <a href={href} className="block max-w-full truncate">
            {Content}
          </a>
        ) : (
          <div className="block max-w-full truncate">{Content}</div>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          try {
            localStorage.setItem(storageKey, "1");
          } catch {}
        }}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-primary-foreground/70 transition-colors hover:bg-white/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
