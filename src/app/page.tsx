import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Truck,
  Award,
  Headphones,
  Phone,
  MapPin,
  Clock,
  GraduationCap,
  Flame,
  HeartPulse,
  Building2,
  Users,
  ShieldCheck,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { FadeIn, Stagger } from "@/lib/motion";
import { ProductCard } from "@/components/shop/product-card";
import { getMediaUrl } from "@/lib/media";
import { HeroCarousel, type HeroSlide } from "@/components/marketing/hero-carousel";
import { site } from "@/lib/site";
import { organizationSchema } from "@/lib/seo";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: products }, { data: services }, { data: testimonials }, { data: faqs }, { data: categories }] =
      await Promise.all([
        supabase.from("products").select("id, title, slug, short_description, price, compare_at_price, featured").eq("status", "ACTIVE").eq("featured", true).limit(8),
        supabase.from("services").select("title, slug, short_description").eq("status", "PUBLISHED").order("sort_order").limit(4),
        supabase.from("testimonials").select("name, role_or_company, quote").eq("is_enabled", true).order("sort_order").limit(3),
        supabase.from("faqs").select("question, answer").eq("is_enabled", true).order("sort_order").limit(6),
        supabase.from("categories").select("name, slug").eq("status", "PUBLISHED").order("name"),
      ]);

    // Fetch primary images for the featured products on the homepage
    const featuredIds = (products ?? []).map((p) => p.id);
    const { data: featuredImages } = featuredIds.length
      ? await supabase
          .from("product_images")
          .select("product_id, storage_path, alt_text, is_primary, sort_order")
          .in("product_id", featuredIds)
          .order("sort_order", { ascending: true })
      : { data: [] };
    const imageByProduct: Record<string, { src: string; alt: string }> = {};
      for (const img of featuredImages ?? []) {
        const url = getMediaUrl(img.storage_path);
        if (!url) continue;
        const existing = imageByProduct[img.product_id];
        if (!existing || img.is_primary) {
          imageByProduct[img.product_id] = { src: url, alt: img.alt_text || "" };
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { data: wishlistRows } = user
        ? await supabase.from("wishlist").select("product_id").eq("user_id", user.id)
        : { data: [] };
      const savedSet = new Set((wishlistRows ?? []).map((w) => w.product_id));

  const slides: HeroSlide[] = [
    {
      id: "ems",
      eyebrow: `Emergency Disaster Preparedness · ${site.brand.founded}`,
      title: (
        <>
          EMS and Rescue
          <br />
          <span className="text-accent">Equipment</span>
        </>
      ),
      body:
        "Premium EMS, rescue, safety, and first-aid equipment for first responders, government agencies, and organizations nationwide.",
      primary: { href: "/products", label: "Browse Products" },
      secondary: { href: "/contact", label: "Request a Quote" },
      badge: "DTI Registered",
    },
    {
      id: "training",
      eyebrow: "Training & Certification",
      title: (
        <>
          Train your team.
          <br />
          <span className="text-accent">Save lives.</span>
        </>
      ),
      body:
        "CPR & First Aid, BLS, Stop the Bleed, Fire Extinguisher, Active Shooter, and Shelter-in-Place — taught by an ASHI Level 9 instructor.",
      primary: { href: "/contact", label: "Inquire about Training" },
      secondary: { href: "/services", label: "See Programs" },
      badge: "ASHI Level 9",
    },
    {
      id: "institutional",
      eyebrow: "Trusted by First Responders",
      title: (
        <>
          Equipping the people
          <br />
          <span className="text-accent">who protect us.</span>
        </>
      ),
      body:
              "Bulk and institutional supply for LGUs, hospitals, schools, and private companies. Custom quotes and nationwide delivery.",
      primary: { href: "/contact", label: "Talk to Sales" },
      secondary: { href: "/about", label: "About Us" },
      badge: "Public · Private · Training",
    },
  ];

  return (
    <div>
      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            ...organizationSchema(),
          }),
        }}
      />

      {/* HERO CAROUSEL */}
      <HeroCarousel slides={slides} />

      {/* TRUST BAR — modern marquee with live ticker */}
            <section className="border-b border-border bg-gradient-to-b from-surface to-background">
              <div className="container-page py-8 sm:py-10">
                <Stagger className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
                  {[
                    { icon: Shield,     label: "Quality Assured",     desc: "Field-tested equipment" },
                    { icon: Truck,      label: "Nationwide Delivery", desc: "All across the Philippines" },
                    { icon: Award,      label: "DTI Registered",      desc: `Since ${new Date(site.brand.founded).toLocaleDateString("en-US", { year: "numeric", month: "long" })}` },
                    { icon: Headphones, label: "Expert Support",      desc: "EMS professionals on call" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <FadeIn key={item.label} className="group flex items-center gap-3">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-elev-1 transition-transform duration-[var(--duration-base)] ease-[var(--ease-spring)] group-hover:scale-110 group-hover:shadow-elev-2">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </FadeIn>
                    );
                  })}
                </Stagger>
              </div>
            </section>

            {/* TRUST MARQUEE — customer segments strip */}
            <section className="border-b border-border bg-background py-6">
              <div className="container-page mb-3 flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <span className="pulse-dot" aria-hidden />
                <span>Trusted by 500+ organizations nationwide</span>
              </div>
              <div className="marquee-mask overflow-hidden">
                <div className="flex w-max gap-12 animate-marquee py-2">
                  {[...site.customerSegments, ...site.customerSegments].map((s, i) => (
                    <div
                      key={`${s.abbr}-${i}`}
                      className="flex items-center gap-3 text-foreground/70"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold">
                        {s.abbr}
                      </span>
                      <span className="text-sm font-medium whitespace-nowrap">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

      {/* ABOUT STRIP — pulled from FB */}
      <section className="bg-surface">
        <div className="container-page py-14 sm:py-16">
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {site.stats.map((s) => (
              <FadeIn
                key={s.label}
                className="rounded-xl border border-border bg-card p-6 shadow-elev-1 hover-lift"
              >
                <p className="text-display-lg text-primary">{s.value}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{s.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
              </FadeIn>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories && categories.length > 0 && (
        <section className="bg-background">
          <div className="container-page py-16 sm:py-20">
            <FadeIn className="mb-10 max-w-2xl">
              <p className="text-eyebrow">Catalog</p>
              <h2 className="mt-2 text-display-lg text-foreground">Shop by Category</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse our equipment by category
              </p>
            </FadeIn>
            <Stagger className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {categories.map((cat) => (
                <FadeIn key={cat.slug}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="group block rounded-xl border border-border bg-card p-6 transition-all duration-[var(--duration-base)] ease-[var(--ease-out-quart)] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elev-3"
                  >
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
                      {cat.name}
                    </h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                      Browse {cat.name.toLowerCase()}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-[var(--duration-base)] group-hover:translate-x-0.5" />
                    </p>
                  </Link>
                </FadeIn>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {products && products.length > 0 && (
        <section className="bg-surface">
          <div className="container-page py-16 sm:py-20">
            <FadeIn className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="text-eyebrow">Featured</p>
                <h2 className="mt-2 text-display-lg text-foreground">Top Picks for Emergency Preparedness</h2>
              </div>
              <Link
                href="/products"
                className="hidden text-sm font-medium text-primary underline-offset-4 hover:underline sm:inline-flex sm:items-center sm:gap-1"
              >
                View all products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </FadeIn>
            <Stagger className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
                                      {products.map((product) => (
                                        <FadeIn key={product.id}>
                                          <ProductCard
                                            id={product.id}
                                            slug={product.slug}
                                            title={product.title}
                                            short_description={product.short_description}
                                            price={product.price}
                                            compare_at_price={product.compare_at_price}
                                            featured={product.featured}
                                            image={imageByProduct[product.id] ?? null}
                                            initialSaved={savedSet.has(product.id)}
                                          />
                                        </FadeIn>
                                      ))}
                                    </Stagger>
          </div>
        </section>
      )}

      {/* TRAINING PROGRAMS — FB-sourced */}
      <section className="bg-background">
        <div className="container-page py-16 sm:py-20">
          <FadeIn className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-eyebrow">Training & Certification</p>
              <h2 className="mt-2 text-display-lg text-foreground">Programs taught by an ASHI Level 9 instructor</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {site.founder.name}, our founder, brings {new Date().getFullYear() - 2002}+ years of field experience
                as an EMT from UP-PGH. On-site or in our training facility in Quezon City.
              </p>
            </div>
            <ButtonLink href="/contact" variant="outline">
              Request a training schedule
              <ArrowRight />
            </ButtonLink>
          </FadeIn>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {site.trainingPrograms.map((p, i) => {
              const Icon = [HeartPulse, ShieldCheck, Flame, GraduationCap, Users, HeartPulse][i] ?? GraduationCap;
              return (
                <FadeIn
                  key={p.title}
                  className="group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elev-2"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.blurb}</p>
                </FadeIn>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* CUSTOMER SEGMENTS — FB-sourced */}
      <section className="bg-surface">
        <div className="container-page py-16 sm:py-20">
          <FadeIn className="mb-10 max-w-2xl">
            <p className="text-eyebrow">Trusted by</p>
            <h2 className="mt-2 text-display-lg text-foreground">We equip first responders across the Philippines</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              From the country&apos;s largest agencies to barangay rescue teams — our catalog fits every tier of emergency response.
            </p>
          </FadeIn>
          <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {site.customerSegments.map((s) => (
              <FadeIn
                key={s.abbr}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                  {s.abbr}
                </div>
                <p className="text-sm font-medium text-foreground">{s.name}</p>
              </FadeIn>
            ))}
          </Stagger>
        </div>
      </section>

      {/* SERVICES */}
      {services && services.length > 0 && (
        <section className="bg-background">
          <div className="container-page py-16 sm:py-20">
            <FadeIn className="mb-10 max-w-2xl">
              <p className="text-eyebrow">What we do</p>
              <h2 className="mt-2 text-display-lg text-foreground">Our Services</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Comprehensive EMS, rescue, and safety solutions
              </p>
            </FadeIn>
            <Stagger className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {services.map((service) => (
                <FadeIn key={service.slug}>
                  <Link
                    href="/services"
                    className="group block h-full rounded-xl border border-border bg-card p-6 transition-all duration-[var(--duration-base)] ease-[var(--ease-out-quart)] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elev-3"
                  >
                    <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{service.short_description}</p>
                  </Link>
                </FadeIn>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonials && testimonials.length > 0 && (
        <section className="bg-surface">
          <div className="container-page py-16 sm:py-20">
            <FadeIn className="mb-10 max-w-2xl">
              <p className="text-eyebrow">What Our Clients Say</p>
              <h2 className="mt-2 text-display-lg text-foreground">Trusted across the country</h2>
            </FadeIn>
            <Stagger className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <FadeIn key={i}>
                  <figure className="h-full rounded-xl border border-border bg-card p-6 shadow-elev-1">
                    <svg
                      aria-hidden
                      className="mb-4 h-6 w-6 text-primary/40"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9.13 4.5C5.86 6.05 4 8.86 4 12.05v7.45h7.5V12.5H7.13c.13-2.13 1.5-3.86 3.5-4.7L9.13 4.5zm10 0c-3.27 1.55-5.13 4.36-5.13 7.55v7.45H21.5V12.5h-4.37c.13-2.13 1.5-3.86 3.5-4.7l-1.5-3.3z" />
                    </svg>
                    <blockquote className="text-sm leading-relaxed text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-4">
                      <p className="font-semibold text-foreground">{t.name}</p>
                      {t.role_or_company && (
                        <p className="text-sm text-muted-foreground">{t.role_or_company}</p>
                      )}
                    </figcaption>
                  </figure>
                </FadeIn>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs && faqs.length > 0 && (
        <section className="bg-background">
          <div className="container-prose py-16 sm:py-20">
            <FadeIn className="mb-10 text-center">
              <p className="text-eyebrow">FAQ</p>
              <h2 className="mt-2 text-display-lg text-foreground">Frequently Asked Questions</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Common questions about our products and services
              </p>
            </FadeIn>
            <Stagger className="space-y-3">
              {faqs.map((faq, i) => (
                <FadeIn key={i}>
                  <details className="group rounded-xl border border-border bg-card p-5 transition-shadow duration-[var(--duration-base)] hover:shadow-elev-2 open:shadow-elev-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                      <span>{faq.question}</span>
                      <span
                        aria-hidden
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform duration-[var(--duration-base)] group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </details>
                </FadeIn>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* CTA + CONTACT CARD */}
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <div
          aria-hidden
          className="absolute inset-0 bg-grid-faint opacity-[0.07] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="container-page relative grid gap-10 py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <FadeIn>
            <p className="text-eyebrow !text-white/70">Visit our showroom</p>
            <h2 className="mt-2 text-display-xl !text-white">Ready to equip your team?</h2>
            <p className="mt-3 max-w-xl text-white/80">
              Browse our catalog or contact us for custom orders, bulk pricing, and on-site training in Quezon City.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/products" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Shop Now
              </ButtonLink>
              <ButtonLink
                href="/contact"
                size="lg"
                className="border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                Contact Us
              </ButtonLink>
            </div>
          </FadeIn>

          <FadeIn delay={120} className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-eyebrow !text-white/70">Rescue 8 Trading Philippines, Inc.</p>
            <ul className="mt-4 space-y-3 text-sm text-white/90">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  {site.contact.address.line1}
                  <br />
                  {site.contact.address.line2}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <a href={`tel:${site.contact.phone.tel}`} className="hover:underline">
                  {site.contact.phone.label}
                </a>
                <span className="text-white/50">·</span>
                <a href={`tel:${site.contact.phone.mobile}`} className="text-white/80 hover:underline">
                  {site.contact.phone.mobile}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  {site.contact.hours.weekday}
                  <br />
                  {site.contact.hours.saturday}
                  <br />
                  {site.contact.hours.sunday}
                </span>
              </li>
            </ul>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
