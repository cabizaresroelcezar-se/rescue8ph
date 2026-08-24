import type { Metadata } from "next";
import {
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  Users,
  Award,
  Globe,
  Calendar,
  Sparkles,
} from "lucide-react";
import { site } from "@/lib/site";
import { FadeIn, Stagger } from "@/lib/motion";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "About",
  description:
    `Rescue 8 Trading Philippines, Inc. — founded in ${site.brand.founded} by Allan Cabizares, ASHI Level 9 instructor. Equipping first responders nationwide.`,
};

const values = [
  {
    icon: HeartPulse,
    title: "Prepared, not panicked",
    body: "Calm, well-equipped responders save more lives than heroic scrambles. Our job is to put the right tools in the right hands.",
  },
  {
    icon: ShieldCheck,
    title: "Quality over flash",
    body: "We carry equipment that holds up under field use — not whatever is on trend. Every line we stock is selected by an EMT, not a marketer.",
  },
  {
    icon: Users,
    title: "Train the team, not just the gear",
    body: "Kits on a shelf don&apos;t save anyone. We pair every rollout with training so the people using the gear know exactly how.",
  },
  {
    icon: Globe,
    title: "Nationwide coverage",
    body: "From Quezon City to Zamboanga, we ship. Our partners at Lalamove, J&amp;T, and LBC keep the supply chain moving.",
  },
];

const milestones = [
  { year: "2002", label: "Allan Cabizares begins career as an EMT at UP-PGH Department of Emergency Medical Services." },
  { year: "2012", label: `Rescue 8 Trading Philippines, Inc. is registered with the DTI in ${site.brand.founded}.` },
  { year: "—",     label: "Becomes an American Safety & Health Institute (ASHI) Training Center." },
  { year: "—",     label: "Achieves ASHI Level 9 instructor rating — the highest in the program." },
  { year: "Today", label: "Equips LGUs, hospitals, schools, and private companies nationwide." },
];

export default function AboutPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-hero-brand text-white">
        <div
          aria-hidden
          className="absolute inset-0 bg-grid-faint opacity-[0.06] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]"
        />
        <div className="container-page relative py-20 sm:py-28 lg:py-32">
          <FadeIn className="max-w-3xl">
            <p className="text-eyebrow !text-white/70">About</p>
            <h1 className="mt-2 text-display-2xl !text-white">
              We equip the people
              <br />
              <span className="text-accent">who protect us.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80 sm:text-xl">
              Rescue 8 Trading Philippines, Inc. is a Quezon City-based supplier
              of EMS, rescue, safety, and first-aid equipment — founded in {site.brand.founded} by Allan Cabizares, an
              EMT who saw a gap between what first responders needed and what
              the local market was offering.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href="/contact"
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Talk to us
                <ArrowRight />
              </ButtonLink>
              <ButtonLink
                href="/services"
                size="lg"
                className="border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                What we do
              </ButtonLink>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-border bg-background">
        <div className="container-page">
          <Stagger className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:grid-cols-4">
            {site.stats.map((s) => (
              <FadeIn key={s.label}>
                <p className="text-display-md text-primary">{s.value}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </FadeIn>
            ))}
          </Stagger>
        </div>
      </section>

      {/* FOUNDER STORY */}
      <section className="bg-surface">
        <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <FadeIn className="lg:sticky lg:top-24">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-background to-accent/15 p-8 shadow-elev-2">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/20 blur-3xl" aria-hidden />
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-elev-2">
                  AC
                </div>
                <p className="mt-4 text-eyebrow">Founder</p>
                <h2 className="mt-1 text-display-md text-foreground">
                  {site.founder.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-primary">
                  {site.founder.title}
                </p>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  {site.founder.credentials.map((c) => (
                    <li key={c} className="flex items-start gap-2">
                      <Award className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={80}>
            <p className="text-eyebrow">Our story</p>
            <h2 className="mt-2 text-display-lg text-foreground">
              From one EMT to a nationwide supplier.
            </h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                In 2002, Allan Cabizares started his career as an Emergency
                Medical Technician at the UP-PGH Department of Emergency Medical
                Services. For more than a decade afterward he trained teams,
                responded to calls, and consulted for safety firms — eventually
                earning the American Safety &amp; Health Institute&apos;s
                highest instructor rating (Level 9) and qualifying as an
                International Trauma Life Support (ITLS) Advanced Provider
                Course Instructor.
              </p>
              <p>
                In {site.brand.founded} he registered Rescue 8 Trading Philippines, Inc. with the DTI to fill a gap he&apos;d
                seen over and over: first responders being given equipment that
                didn&apos;t match the realities of Philippine emergencies.
                Thirteen years later, the company still ships nationwide and
                still teaches the same curriculum.
              </p>
              <p>
                Today Rescue 8 supplies the Bureau of Fire Protection,
                Philippine National Police, Armed Forces of the Philippines,
                Philippine Red Cross, local government units, hospitals, and
                schools — pairing every equipment rollout with training so the
                gear actually gets used when it matters.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="bg-background">
        <div className="container-page py-16 sm:py-20">
          <FadeIn className="mb-10 max-w-2xl">
            <p className="text-eyebrow">Timeline</p>
            <h2 className="mt-2 text-display-lg text-foreground">How we got here</h2>
          </FadeIn>
          <Stagger className="relative space-y-6 pl-8 before:absolute before:left-3 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
            {milestones.map((m) => (
              <FadeIn
                key={m.year + m.label}
                className="relative rounded-xl border border-border bg-card p-5 shadow-elev-1"
              >
                <span
                  aria-hidden
                  className="absolute -left-[26px] top-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground"
                >
                  ·
                </span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" aria-hidden />
                  <p className="text-sm font-semibold text-primary">{m.year}</p>
                </div>
                <p className="mt-2 text-sm text-foreground">{m.label}</p>
              </FadeIn>
            ))}
          </Stagger>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-surface">
        <div className="container-page py-16 sm:py-20">
          <FadeIn className="mb-10 max-w-2xl">
            <p className="text-eyebrow">What we stand for</p>
            <h2 className="mt-2 text-display-lg text-foreground">Four principles</h2>
          </FadeIn>
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <FadeIn
                  key={v.title}
                  className="rounded-xl border border-border bg-card p-6 shadow-elev-1 transition-all hover:-translate-y-0.5 hover:shadow-elev-2"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
                </FadeIn>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* SEGMENTS */}
      <section className="bg-background">
        <div className="container-page py-16 sm:py-20">
          <FadeIn className="mb-10 max-w-2xl">
            <p className="text-eyebrow">Who we serve</p>
            <h2 className="mt-2 text-display-lg text-foreground">Customer segments</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every tier of emergency response — from national agencies to
              barangay rescue teams.
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

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <div
          aria-hidden
          className="absolute inset-0 bg-grid-faint opacity-[0.07] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]"
        />
        <div className="container-page relative py-16 text-center sm:py-20">
          <FadeIn>
            <Sparkles className="mx-auto h-6 w-6 text-accent" aria-hidden />
            <h2 className="mt-3 text-display-xl !text-white">
              Ready to work together?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              Tell us about your team — we&apos;ll come back with a plan
              tailored to your operations.
            </p>
          </FadeIn>
          <FadeIn className="mt-8 flex flex-wrap justify-center gap-3" delay={120}>
            <ButtonLink
              href="/contact"
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Talk to us
              <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href="/products"
              size="lg"
              className="border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            >
              Browse products
            </ButtonLink>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
