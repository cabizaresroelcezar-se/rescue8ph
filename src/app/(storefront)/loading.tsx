import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="animate-fade-in">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-surface to-background">
        <div className="container-page py-16 sm:py-24">
          <div className="max-w-3xl">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-14 w-full" />
            <Skeleton className="mt-2 h-14 w-3/4" />
            <Skeleton className="mt-6 h-5 w-2/3" />
            <div className="mt-8 flex gap-3">
              <Skeleton className="h-12 w-36" />
              <Skeleton className="h-12 w-36" />
            </div>
          </div>
        </div>
      </div>

      {/* Trust bar skeleton */}
      <section className="border-y border-border bg-background py-8">
        <div className="container-page grid grid-cols-2 gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product grid skeleton */}
      <section className="container-page py-16">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-2 h-9 w-64" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}