import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessageSquare, ShieldCheck, AlertTriangle } from "lucide-react";
import { FadeIn, Stagger } from "@/lib/motion";
import { formatDatePh } from "@/lib/format";
import { StarRating } from "@/components/ui/star-rating";
import { ReviewModerationActions } from "./moderation-actions";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";

const STATUS_TONE: Record<ReviewStatus, string> = {
  PENDING: "border-yellow-200 bg-yellow-50 text-yellow-700",
  APPROVED: "border-green-200 bg-green-50 text-green-700",
  REJECTED: "border-destructive/30 bg-destructive/5 text-destructive",
  FLAGGED: "border-orange-300 bg-orange-50 text-orange-700",
};

type ReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  is_verified_purchase: boolean;
  status: ReviewStatus;
  created_at: string;
  product: { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[] | null;
  author: { first_name: string | null; last_name: string | null; display_name: string | null } | { first_name: string | null; last_name: string | null; display_name: string | null }[] | null;
};

type Filter = "all" | ReviewStatus;

type SearchParams = { status?: Filter; q?: string };

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirectTo=/admin/reviews");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single();
  const role = (profile as { roles?: { name?: string } } | null)?.roles?.name;
  if (role !== "admin" && role !== "super_admin") {
    redirect("/admin");
  }

  const filter: Filter =
    params.status && ["PENDING", "APPROVED", "REJECTED", "FLAGGED"].includes(params.status)
      ? (params.status as ReviewStatus)
      : params.status === "all"
        ? "all"
        : "PENDING";

  let query = supabase
    .from("product_reviews")
    .select(
      "id, rating, title, body, is_verified_purchase, status, created_at, product:products(id, title, slug), author:profiles!product_reviews_user_id_fkey(first_name, last_name, display_name)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (filter !== "all") query = query.eq("status", filter);

  const { data: reviews } = await query;
  const rows: ReviewRow[] = (reviews ?? []) as unknown as ReviewRow[];

  // Counts per status
  const [{ count: pendingCount }, { count: approvedCount }, { count: rejectedCount }, { count: flaggedCount }, { count: totalCount }] =
    await Promise.all([
      supabase.from("product_reviews").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
      supabase.from("product_reviews").select("id", { count: "exact", head: true }).eq("status", "APPROVED"),
      supabase.from("product_reviews").select("id", { count: "exact", head: true }).eq("status", "REJECTED"),
      supabase.from("product_reviews").select("id", { count: "exact", head: true }).eq("status", "FLAGGED"),
      supabase.from("product_reviews").select("id", { count: "exact", head: true }),
    ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-eyebrow text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            Catalog
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Reviews
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Moderate customer reviews before they appear on product pages.
          </p>
        </div>
      </header>

      {/* Stats */}
      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat
          label="Pending"
          value={pendingCount ?? 0}
          href="/admin/reviews?status=PENDING"
          active={filter === "PENDING"}
          tone="text-yellow-600"
        />
        <Stat
          label="Approved"
          value={approvedCount ?? 0}
          href="/admin/reviews?status=APPROVED"
          active={filter === "APPROVED"}
          tone="text-green-600"
        />
        <Stat
          label="Rejected"
          value={rejectedCount ?? 0}
          href="/admin/reviews?status=REJECTED"
          active={filter === "REJECTED"}
          tone="text-destructive"
        />
        <Stat
          label="Flagged"
          value={flaggedCount ?? 0}
          href="/admin/reviews?status=FLAGGED"
          active={filter === "FLAGGED"}
          tone="text-orange-600"
        />
        <Stat
          label="All"
          value={totalCount ?? 0}
          href="/admin/reviews?status=all"
          active={filter === "all"}
          tone="text-foreground"
        />
      </Stagger>

      {/* Review list */}
      <FadeIn className="space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
            No reviews in this view.
          </div>
        ) : (
          rows.map((r) => {
            const product = Array.isArray(r.product) ? r.product[0] : r.product;
            const author = Array.isArray(r.author) ? r.author[0] : r.author;
            const authorName =
              author?.first_name && author?.last_name
                ? `${author.first_name} ${author.last_name}`
                : author?.display_name || author?.first_name || "Anonymous";

            return (
              <article
                key={r.id}
                className="rounded-xl border border-border bg-card p-5 shadow-elev-1"
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {authorName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        on{" "}
                        {product ? (
                          <Link
                            href={`/products/${product.slug}`}
                            className="font-medium text-primary underline-offset-4 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {product.title}
                          </Link>
                        ) : (
                          "deleted product"
                        )}{" "}
                        · {formatDatePh(new Date(r.created_at))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating value={r.rating} size="sm" />
                    <span
                      className={
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium " +
                        STATUS_TONE[r.status]
                      }
                    >
                      {r.status === "PENDING" || r.status === "FLAGGED" ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <ShieldCheck className="h-3 w-3" />
                      )}
                      {r.status}
                    </span>
                  </div>
                </header>

                {r.title && (
                  <h4 className="mt-3 text-sm font-semibold text-foreground">
                    {r.title}
                  </h4>
                )}
                <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">
                  {r.body}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {r.is_verified_purchase && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        <ShieldCheck className="h-3 w-3" />
                        Verified purchase
                      </span>
                    )}
                    <span>ID: {r.id.slice(0, 8)}</span>
                  </div>
                  <ReviewModerationActions
                    id={r.id}
                    currentStatus={r.status}
                  />
                </div>
              </article>
            );
          })
        )}
      </FadeIn>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  active,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  active: boolean;
  tone: string;
}) {
  return (
    <FadeIn>
      <Link
        href={href}
        className={
          "block rounded-xl border p-4 transition-colors " +
          (active
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:bg-secondary/30")
        }
      >
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={`mt-2 text-3xl font-bold tracking-tight ${tone}`}>
          {value.toLocaleString()}
        </p>
      </Link>
    </FadeIn>
  );
}