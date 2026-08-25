"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  body: React.ReactNode;
  primary: { href: string; label: string; icon?: React.ReactNode };
  secondary?: { href: string; label: string };
  image?: { src: string; alt: string };
  badge?: string;
};

export function HeroCarousel({ slides, autoplayMs = 6500 }: { slides: HeroSlide[]; autoplayMs?: number }) {
  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const [hovered, setHovered] = React.useState(false);
  const total = slides.length;
  const trackRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<number | null>(null);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const next = React.useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = React.useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

  // Autoplay
  React.useEffect(() => {
    if (!playing || hovered || reducedMotion) return;
    timerRef.current = window.setTimeout(next, autoplayMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, playing, hovered, reducedMotion, autoplayMs, next]);

  // Keyboard
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    const el = trackRef.current;
    el?.addEventListener("keydown", onKey);
    return () => el?.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Touch swipe
  const touch = React.useRef<{ x: number; t: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, t: Date.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dt = Date.now() - touch.current.t;
    if (dt < 500 && Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    touch.current = null;
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      className="relative isolate overflow-hidden bg-hero-brand text-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-grid-faint opacity-[0.06] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]"
      />

      <div
        ref={trackRef}
        tabIndex={0}
        aria-live="polite"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="container-page relative outline-none"
      >
        <div className="relative min-h-[560px] py-20 sm:min-h-[600px] sm:py-28 lg:min-h-[640px] lg:py-32">
          {slides.map((slide, i) => (
            <Slide
              key={slide.id}
              slide={slide}
              active={i === index}
              isFirst={i === 0}
            />
          ))}
        </div>

        {/* Slide navigation arrows — prev on the left edge, next on the right edge.
                      Spread apart, never stacked on top of each other. */}
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous slide"
                  className="pointer-events-auto absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white shadow-elev-1 backdrop-blur transition-all hover:bg-white/20 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:left-4 md:left-6"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next slide"
                  className="pointer-events-auto absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white shadow-elev-1 backdrop-blur transition-all hover:bg-white/20 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:right-4 md:right-6"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

        {/* Footer controls */}
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-between gap-3 px-4 sm:bottom-6">
          <div className="flex items-center gap-2" role="tablist" aria-label="Slide indicators">
            {slides.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}: ${typeof s.title === "string" ? s.title : s.eyebrow}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-[var(--duration-base)] ease-[var(--ease-out-quart)]",
                  i === index ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <span className="font-mono text-xs tracking-widest">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause autoplay" : "Resume autoplay"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slide({
  slide,
  active,
  isFirst,
}: {
  slide: HeroSlide;
  active: boolean;
  isFirst: boolean;
}) {
  return (
    <article
      role="tabpanel"
      aria-roledescription="slide"
      aria-label={typeof slide.title === "string" ? slide.title : slide.eyebrow}
      aria-hidden={!active}
      className={cn(
        "absolute inset-0 grid items-center transition-[opacity,transform] duration-[var(--duration-slower)] ease-[var(--ease-in-out-quart)]",
        active ? "opacity-100 translate-x-0" : "pointer-events-none -translate-x-2 opacity-0"
      )}
    >
      <div className="grid gap-10 px-12 sm:px-16 md:px-20 lg:grid-cols-[1fr_auto] lg:items-center lg:px-24">
              <div className="max-w-2xl">
          <div
            className={cn(
              "space-y-4 transition-[opacity,transform] delay-[60ms] duration-[var(--duration-slower)] ease-[var(--ease-out-quart)]",
              active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )}
          >
            {slide.badge && (
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/90 backdrop-blur">
                {slide.badge}
              </span>
            )}
            <p className="text-eyebrow !text-white/70">{slide.eyebrow}</p>
            <h1 className="text-display-2xl !text-white">{slide.title}</h1>
            <p className="text-lg text-white/80 sm:text-xl">{slide.body}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href={slide.primary.href}
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {slide.primary.label}
                {slide.primary.icon ?? <ArrowRight className="h-4 w-4" />}
              </ButtonLink>
              {slide.secondary && (
                <ButtonLink
                  href={slide.secondary.href}
                  size="lg"
                  className="border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                >
                  {slide.secondary.label}
                </ButtonLink>
              )}
            </div>
          </div>
        </div>

        {slide.image && (
          <div
            className={cn(
              "hidden justify-self-end transition-[opacity,transform] delay-[120ms] duration-[var(--duration-slower)] ease-[var(--ease-out-quart)] lg:block",
              active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="relative h-64 w-64 xl:h-72 xl:w-72">
              <div className="absolute inset-0 rounded-2xl bg-white/10 blur-2xl" aria-hidden />
              <Image
                src={slide.image.src}
                alt={slide.image.alt}
                width={288}
                height={288}
                className="relative h-full w-auto rounded-2xl"
                priority={isFirst}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
