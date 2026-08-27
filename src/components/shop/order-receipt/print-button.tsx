"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-elev-1 transition-colors hover:bg-primary/90"
    >
      <Printer className="h-3.5 w-3.5" />
      Print / Save as PDF
    </button>
  );
}
