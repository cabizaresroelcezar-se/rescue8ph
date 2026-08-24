"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

type Sort = "new" | "price-asc" | "price-desc" | "popular";

const labels: Record<Sort, string> = {
  new: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  popular: "Most Popular",
};

export function SortSelect({ value }: { value: Sort }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const onChange = (next: Sort) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("sort", next);
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  return (
    <label className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-2.5 text-sm text-foreground shadow-elev-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      <span className="text-muted-foreground">Sort</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Sort)}
        className="h-full bg-transparent pr-1 text-sm font-medium text-foreground focus:outline-none"
      >
        {(Object.keys(labels) as Sort[]).map((s) => (
          <option key={s} value={s}>
            {labels[s]}
          </option>
        ))}
      </select>
    </label>
  );
}
