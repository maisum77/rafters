"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { BookingEmbed, BOOKING_URL } from "@/components/booking-embed";
import { Split } from "@/components/split";

export function Booking() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".booking-item",
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 70%",
          },
        }
      );

      gsap.fromTo(
        ".booking-card",
        { autoAlpha: 0, y: 60, rotate: 1.5 },
        {
          autoAlpha: 1,
          y: 0,
          rotate: 0,
          duration: 1.1,
          ease: "power3.out",
          delay: 0.15,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 70%",
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <section
      ref={ref}
      id="book"
      data-theme-bg="#ece6f0"
      className="relative border-t border-line bg-surface"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="booking-item font-mono text-xs uppercase tracking-[0.22em] text-muted">
            Booking
          </p>
          <h2 className="booking-item mt-4 font-serif text-[clamp(2.6rem,6vw,5.5rem)] italic leading-[0.92] tracking-tight">
            book a <span className="text-fill-gradient">call.</span>
          </h2>
          <p className="booking-item mt-6 max-w-md text-base leading-relaxed text-muted md:text-lg">
            Thirty minutes, real availability, no sales script. Pick a slot
            that suits you — we&apos;ll tell you exactly how we&apos;d fix
            what&apos;s stuck.
          </p>
          <div className="booking-item mt-8 flex flex-wrap items-center gap-6">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Book"
              className="simple-button btn-glow group full-rounded bg-ember-deep px-8 py-4 text-sm font-semibold text-background transition-colors duration-300 hover:bg-ink"
            >
              <Split text="Book a meeting" />
              <span className="line" />
            </a>
            <a
              href="mailto:therafters.official@gmail.com"
              data-cursor="email"
              className="simple-button group element-rounded text-sm text-muted transition-colors hover:text-ink"
            >
              or email therafters.official@gmail.com
              <span className="line" />
            </a>
          </div>
          <p className="booking-item mt-8 font-mono text-xs text-muted/70">
            Can&apos;t see a slot?{" "}
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              Open the full calendar in Google →
            </a>
          </p>
        </div>

        <div className="booking-card flex justify-center lg:justify-end">
          <BookingEmbed />
        </div>
      </div>
    </section>
  );
}