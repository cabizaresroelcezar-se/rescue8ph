import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  HeartPulse,
  ShieldCheck,
  Flame,
  GraduationCap,
  Users,
  Stethoscope,
  Building2,
  Truck,
  Wrench,
  Phone,
} from "lucide-react";
import { site } from "@/lib/site";
import { FadeIn, Stagger } from "@/lib/motion";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Services",
  description:
    "EMS equipment supply, training & certification (CPR, BLS, Stop the Bleed, Fire Extinguisher), and institutional rollout across the Philippines.",
};

const serviceLines = [
  {
    icon: Stethoscope,
    title: "EMS Equipment Supply",
    blurb:
      "First-aid kits, AEDs, oxygen, immobilizers, splints, bandages, and trauma gear for first responders, hospitals, schools, and LGUs.",
    bullets: ["National brands", "FDA-aligned where applicable", "Bulk pricing for institutions"],
  },
  {
    icon: GraduationCap,
    title: "Training & Certification",
    blurb:
      "ASHI-aligned programs taught on-site at your facility or at our Quezon City training center by an ASHI Level 9 instructor.",
    bullets: ["CPR & First Aid", "BLS for Healthcare Workers", "Stop the Bleed"],
  },
  {
    icon: Building2,
    title: "Institutional Rollout",
    blurb:
      "Multi-site deployments for the BFP, PNP, AFP, Philippine Red Cross, LGUs, schools, and large private employers.",
    bullets: ["Site surveys & needs analysis", "Custom quote packs", "Recurring supply contracts"],
  },
  {
    icon: Wrench,
    title: "Equipment Servicing",
    blurb:
      "Inspection, maintenance, and replacement of AEDs, oxygen units, and trauma kits — scheduled or on-call.",
    bullets: ["Inspection reports", "Battery & pad replacement", "Asset tagging"],
  },
  {
    icon: Truck,
    title: "Nationwide Delivery",
    blurb:
      "Ships anywhere in the Philippines with same-day Metro Manila fulfillment for orders placed before 1 PM.",
    bullets: ["Manila, Rizal, Bulacan, Cavite, Laguna", "Lalamove & J&T integration", "B2B & institutional billing"],
  },
  {
    icon: ShieldCheck,
    title: "Compliance & Audit",
    blurb:
      "Help organizations comply with DOLE OSH Standards, BFP requirements, and school disaster-preparedness mandates.",
    bullets: ["Documentation review", "Stock & expiry audit", "Compliance training"],
  },
];

export default function ServicesPage() {
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
            <p className="text-eyebrow !text-white/70">What we do</p>
            <h1 className="mt-2 text-display-2xl !text-white">
              Six services. One mission:
              <br />
              <span className="text-accent">prepared, equipped, trained.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80 sm:text-xl">
              Rescue 8 Philippines supplies equipment, trains teams, and rolls
              out institutional programs across the country — backed by an
              ASHI Level 9 instructor and 13+ years of field experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href="/contact"
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Request a quote
                <ArrowRight />
              </ButtonLink>
              <ButtonLink
                href="/contact"
                size="lg"
                className="border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                Talk to sales
              </ButtonLink>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SERVICE GRID */}
      <section className="bg-background">
        <div className="container-page py-16 sm:py-20">
          <FadeIn className="mb-10 max-w-2xl">
            <p className="text-eyebrow">Service lines</p>
            <h2 className="mt-2 text-display-lg text-foreground">
              Everything an emergency-preparedness program needs
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick one or combine them — we tailor engagements to your team
              size, sites, and budget.
            </p>
          </FadeIn>

          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceLines.map((s) => {
              const Icon = s.icon;
              return (
                <FadeIn
                  key={s.title}
                  className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-elev-1 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elev-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground group-hover:text-primary">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.blurb}</p>
                  <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <span
                          aria-hidden
                          className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-accent"
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                </FadeIn>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* TRAINING PROGRAMS (FB-sourced) */}
      <section className="bg-surface">
        <div className="container-page py-16 sm:py-20">
          <FadeIn className="mb-10 max-w-2xl">
            <p className="text-eyebrow">Training curriculum</p>
            <h2 className="mt-2 text-display-lg text-foreground">
              Programs we teach on-site
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Delivered by {site.founder.name}, our founder — ASHI Level 9
              instructor and ITLS Advanced Provider Course Instructor.
            </p>
          </FadeIn>

          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {site.trainingPrograms.map((p, i) => {
              const Icon = [HeartPulse, ShieldCheck, Flame, GraduationCap, Users, HeartPulse][i] ?? GraduationCap;
              return (
                <FadeIn
                  key={p.title}
                  className="rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elev-2"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.blurb}
                  </p>
                </FadeIn>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <div
          aria-hidden
          className="absolute inset-0 bg-grid-faint opacity-[0.07] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]"
        />
        <div className="container-page relative grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <FadeIn>
            <p className="text-eyebrow !text-white/70">Get a tailored plan</p>
            <h2 className="mt-2 text-display-xl !text-white">
              Tell us about your team.
            </h2>
            <p className="mt-3 max-w-xl text-white/80">
              We&apos;ll come back with a quote pack — equipment list, training
              schedule, and rollout plan — within one business day.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink
                href="/contact"
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Request a quote
              </ButtonLink>
              <ButtonLink
                href="/products"
                size="lg"
                className="border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                Browse catalog
              </ButtonLink>
            </div>
          </FadeIn>

          <FadeIn delay={120} className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
            <ul className="space-y-3 text-sm text-white/90">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                <a href={`tel:${site.contact.phone.tel}`} className="hover:underline">
                  {site.contact.phone.label}
                </a>
              </li>
              <li className="text-white/70">
                Or send a message via our{" "}
                <Link href="/contact" className="underline underline-offset-4 hover:text-white">
                  contact form
                </Link>
                .
              </li>
            </ul>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
