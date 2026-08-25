import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Markdown } from "@/components/marketing/markdown";
import { getMediaUrl } from "@/lib/media";

export interface PageSection {
  id: string;
  section_type: string;
  sort_order: number;
  is_enabled: boolean;
  content: Record<string, unknown>;
}

/**
 * Renders a single page section based on its section_type.
 * Unknown section_types render nothing (forward-compatible).
 */
export function PageSectionRenderer({ section }: { section: PageSection }) {
  if (!section.is_enabled) return null;
  const c = section.content ?? {};

  switch (section.section_type) {
    case "HERO":
      return <HeroBlock c={c} />;
    case "RICH_TEXT":
      return <RichTextBlock c={c} />;
    case "FEATURE_GRID":
      return <FeatureGridBlock c={c} />;
    case "IMAGE_TEXT":
      return <ImageTextBlock c={c} />;
    case "CTA":
      return <CTABlock c={c} />;
    case "BANNER":
      return <BannerBlock c={c} />;
    case "TESTIMONIALS":
      return <TestimonialsBlock c={c} />;
    case "FAQ":
      return <FAQBlock c={c} />;
    case "PRODUCT_GRID":
    case "BLOG_GRID":
    case "SERVICE_GRID":
      return (
        <div className="container-page py-12 text-center text-sm text-muted-foreground">
          <em>
            The {section.section_type.replace("_", " ").toLowerCase()} section
            needs storefront-side data wiring (coming next).
          </em>
        </div>
      );
    default:
      return null;
  }
}

function HeroBlock({ c }: { c: Record<string, unknown> }) {
  const title = (c.title as string) ?? "";
  const subtitle = (c.subtitle as string) ?? "";
  const eyebrow = (c.eyebrow as string) ?? "";
  const ctaLabel = (c.cta_label as string) ?? "";
  const ctaHref = (c.cta_href as string) ?? "";
  const align = (c.align as "left" | "center") ?? "left";
  if (!title) return null;
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 sm:py-24">
      <div
        className={`container-page ${align === "center" ? "text-center" : ""}`}
      >
        {eyebrow && (
          <p className="text-eyebrow text-primary">{eyebrow}</p>
        )}
        <h2 className="mt-3 text-display-xl text-foreground">{title}</h2>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {subtitle}
          </p>
        )}
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="mt-6 inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </section>
  );
}

function RichTextBlock({ c }: { c: Record<string, unknown> }) {
  const body = (c.body as string) ?? "";
  if (!body.trim()) return null;
  return (
    <section className="bg-background">
      <div className="container-prose py-12">
        <Markdown source={body} />
      </div>
    </section>
  );
}

function FeatureGridBlock({ c }: { c: Record<string, unknown> }) {
  const eyebrow = (c.eyebrow as string) ?? "";
  const title = (c.title as string) ?? "";
  const features = Array.isArray(c.features) ? (c.features as Array<{
    title?: string;
    description?: string;
    icon?: string;
  }>) : [];
  if (features.length === 0 && !title) return null;
  return (
    <section className="bg-surface">
      <div className="container-page py-16">
        {eyebrow && <p className="text-eyebrow">{eyebrow}</p>}
        {title && (
          <h2 className="mt-2 text-display-lg text-foreground">{title}</h2>
        )}
        {features.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-5 shadow-elev-1"
              >
                <h3 className="text-base font-semibold text-foreground">
                  {f.title}
                </h3>
                {f.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ImageTextBlock({ c }: { c: Record<string, unknown> }) {
  const title = (c.title as string) ?? "";
  const body = (c.body as string) ?? "";
  const imageUrl = getMediaUrl((c.image_url as string) ?? "");
  const imageAlt = (c.image_alt as string) ?? title;
  const ctaLabel = (c.cta_label as string) ?? "";
  const ctaHref = (c.cta_href as string) ?? "";
  const flip = Boolean(c.flip);
  if (!title && !body) return null;
  return (
    <section className="bg-background">
      <div className="container-page py-16">
        <div
          className={`grid items-center gap-10 lg:grid-cols-2 ${flip ? "lg:[&>:first-child]:order-2" : ""}`}
        >
          {imageUrl && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={imageAlt}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            {title && (
              <h2 className="text-display-lg text-foreground">{title}</h2>
            )}
            {body && (
              <div className="mt-4 text-base leading-relaxed text-muted-foreground">
                <Markdown source={body} />
              </div>
            )}
            {ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                className="mt-6 inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-secondary"
              >
                {ctaLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTABlock({ c }: { c: Record<string, unknown> }) {
  const title = (c.title as string) ?? "";
  const body = (c.body as string) ?? "";
  const ctaLabel = (c.cta_label as string) ?? "";
  const ctaHref = (c.cta_href as string) ?? "";
  if (!title) return null;
  return (
    <section className="bg-foreground text-background">
      <div className="container-page py-16 text-center">
        <h2 className="text-display-lg">{title}</h2>
        {body && (
          <p className="mx-auto mt-3 max-w-xl text-sm text-background/80">
            {body}
          </p>
        )}
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="mt-6 inline-flex h-10 items-center gap-1.5 rounded-lg bg-background px-5 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </section>
  );
}

function BannerBlock({ c }: { c: Record<string, unknown> }) {
  const text = (c.text as string) ?? "";
  const linkLabel = (c.link_label as string) ?? "";
  const linkHref = (c.link_href as string) ?? "";
  if (!text) return null;
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container-page flex flex-wrap items-center justify-center gap-3 py-3 text-sm">
        <span className="font-medium">{text}</span>
        {linkLabel && linkHref && (
          <Link
            href={linkHref}
            className="inline-flex items-center gap-1 rounded-full border border-primary-foreground/30 px-3 py-1 text-xs font-semibold transition-colors hover:bg-primary-foreground/10"
          >
            {linkLabel} <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </section>
  );
}

function TestimonialsBlock({ c }: { c: Record<string, unknown> }) {
  const title = (c.title as string) ?? "";
  const items = Array.isArray(c.items)
    ? (c.items as Array<{ quote?: string; author?: string; role?: string }>)
    : [];
  if (items.length === 0) return null;
  return (
    <section className="bg-surface">
      <div className="container-page py-16">
        {title && (
          <h2 className="mb-8 text-display-lg text-foreground">{title}</h2>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((t, i) => (
            <figure
              key={i}
              className="rounded-xl border border-border bg-card p-6 shadow-elev-1"
            >
              <blockquote className="text-sm leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4">
                <p className="font-semibold text-foreground">{t.author}</p>
                {t.role && (
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQBlock({ c }: { c: Record<string, unknown> }) {
  const title = (c.title as string) ?? "Frequently asked questions";
  const limit = typeof c.limit === "number" ? c.limit : 6;
  // Actual FAQ data is rendered server-side in the page route that
  // pulls FAQs from the DB; this block just provides a section header.
  return (
    <section className="bg-background">
      <div className="container-prose py-12">
        <h2 className="text-display-lg text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Showing up to {limit} most relevant questions.
        </p>
      </div>
    </section>
  );
}