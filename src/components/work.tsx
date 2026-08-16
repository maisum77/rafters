"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { WorkEntry } from "@/data/work";
import { Split } from "@/components/split";

export function WorkTiles({
  items,
  showAll = false,
}: {
  items: WorkEntry[];
  showAll?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".work-frame",
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 1.3,
          ease: "power4.inOut",
          stagger: 0.15,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 72%",
          },
        }
      );

      gsap.utils.toArray<HTMLElement>(".work-card").forEach((card) => {
        const img = card.querySelector<HTMLElement>(".work-cover");
        const frame = card.querySelector<HTMLElement>(".work-tilt");
        if (!img) return;

        gsap.fromTo(
          img,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );

        // Magnetic tilt on hover (desktop only)
        if (frame && window.matchMedia("(hover: hover)").matches) {
          const rotX = gsap.quickTo(frame, "rotateX", {
            duration: 0.5,
            ease: "power3.out",
          });
          const rotY = gsap.quickTo(frame, "rotateY", {
            duration: 0.5,
            ease: "power3.out",
          });

          const onMove = (e: MouseEvent) => {
            const r = frame.getBoundingClientRect();
            const cx = (e.clientX - r.left) / r.width - 0.5;
            const cy = (e.clientY - r.top) / r.height - 0.5;
            rotX(-cy * 3);
            rotY(cx * 3);
          };
          const onLeave = () => {
            rotX(0);
            rotY(0);
          };

          frame.addEventListener("pointermove", onMove);
          frame.addEventListener("pointerleave", onLeave);
        }
      });
    }, ref);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className="mx-auto max-w-[1400px] px-5 md:px-8">
      <div className="flex flex-col gap-16 md:gap-24">
        {(showAll ? items : items.slice(0, 2)).map((entry) => (
          <Link
            key={entry.slug}
            href={`/work/${entry.slug}`}
            data-cursor={entry.client}
            className="work-card group block"
          >
            <div className="work-frame work-tile-3d work-tilt relative aspect-[16/9] overflow-hidden bg-surface depth-shadow md:aspect-[16/8]">
              <Image
                src={entry.cover}
                alt={entry.client}
                fill
                sizes="(min-width: 768px) 100vw, 100vw"
                className="work-cover object-cover brightness-[0.95] transition-all duration-700 ease-out will-change-transform group-hover:scale-[1.03] group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-ink/10 to-transparent" />

              <div className="absolute left-5 top-5 flex items-center gap-3 md:left-8 md:top-8">
                <span className="font-mono text-xs text-background/80">
                  {entry.sector}
                </span>
                <span className="h-1 w-1 rounded-full bg-background/60" />
                <span className="font-mono text-xs text-background/80">
                  {entry.year}
                </span>
              </div>

              <div className="absolute bottom-5 left-5 right-5 md:bottom-8 md:left-8 md:right-8">
                <h3 className="font-serif text-[clamp(2rem,5vw,4rem)] italic leading-[0.95] tracking-tight text-background">
                  {entry.client}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-background/80 md:text-base">
                  {entry.excerpt}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {entry.services.map((svc) => (
                    <span
                      key={svc}
                      className="rounded-full border border-background/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-background/80"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="max-w-xl text-sm leading-relaxed text-muted">
                {entry.outcome}
              </p>
              <span className="simple-button group/case element-rounded shrink-0 pl-4 font-mono text-xs uppercase tracking-[0.18em] text-ember-deep transition-colors hover:text-ink">
                <Split text="View case study" />
                <span className="line" />
                <span className="ml-2 transition-transform duration-500 group-hover:translate-x-1.5">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {!showAll && items.length > 2 ? (
        <div className="mt-16 flex justify-center">
          <Link
            href="/work"
            data-cursor="All work"
            className="simple-button group full-rounded border border-line px-6 py-3 text-sm text-ink transition-colors duration-300 hover:border-ink"
          >
            <Split text="View all work" />
            <span className="line" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}