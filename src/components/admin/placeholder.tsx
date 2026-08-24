import { Construction, ArrowRight } from "lucide-react";
import { FadeIn } from "@/lib/motion";

export function AdminPlaceholder({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Back Office</p>
          <h1 className="mt-2 text-display-md text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </FadeIn>

      <FadeIn
        delay={80}
        className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-elev-2"
      >
        <div className="relative p-8 sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-accent/10 blur-3xl"
          />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-elev-1">
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Construction className="h-4 w-4 text-accent" />
                <p className="text-eyebrow">In progress</p>
              </div>
              <h2 className="mt-2 text-display-md text-foreground">
                {title} module is on the roadmap.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                The {title.toLowerCase()} module is part of the Rescue 8
                Philippines development roadmap. It will include full CRUD
                operations, filtering, search, and integration with the
                Supabase backend.
              </p>
              <ul className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Full CRUD operations
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Search, filter & sort
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Role-aware permissions
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Activity &amp; audit logging
                </li>
              </ul>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
