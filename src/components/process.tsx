"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import Link from "next/link";
import { Split } from "@/components/split";

const STEPS = [
  {
    index: "01",
    words: ["Discover"],
    desc: "We audit your brand, market and data — then argue about it until the strategy is sharp.",
  },
  {
    index: "02",
    words: ["Build"],
    desc: "Web, content, ads, SEO — shipped by the people you met, in weekly visible sprints.",
  },
  {
    index: "03",
    words: ["Scale"],
    desc: "We measure everything, double down on what works, and cut what doesn't.",
  },
];

export function ProcessRows() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".process-row").forEach((row) => {
        gsap.fromTo(
          row.querySelectorAll(".process-word"),
          { opacity: 0.3 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.06,
            scrollTrigger: {
              trigger: row,
              start: "top 82%",
              end: "top 40%",
              scrub: 0.5,
            },
          }
        );
        gsap.fromTo(
          row.querySelector(".process-desc"),
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top 65%",
            },
          }
        );
      });
    }, ref);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className="mx-auto max-w-[1400px] px-5 pb-20 md:px-8">
      <div>
        {STEPS.map((step) => (
          <div
            key={step.index}
            className="process-row process-row-enhanced simple-button group element-rounded grid grid-cols-12 gap-4 border-t border-line py-10 md:py-14"
          >
            <span className="process-index col-span-2 font-mono text-sm text-muted transition-colors duration-300 md:col-span-1">
              {step.index}
            </span>
            <h3 className="col-span-10 font-serif text-[clamp(1.8rem,4vw,3.2rem)] italic tracking-tight md:col-span-4">
              {step.words.map((word, wi) => (
                <span key={wi} className="inline-block">
                  <span className="process-word inline-block">
                    {word}
                    {wi < step.words.length - 1 ? "\u00A0" : ""}
                  </span>
                </span>
              ))}
            </h3>
            <p className="process-desc process-desc-text col-span-10 col-start-3 text-sm leading-relaxed text-muted md:col-span-6 md:col-start-7 md:text-base">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProcessCta() {
  return (
    <div className="border-t border-line bg-background">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-6 px-5 py-20 md:flex-row md:items-center md:justify-between md:px-8 md:py-28">
        <p className="max-w-md font-serif text-[clamp(1.6rem,4vw,3rem)] italic leading-tight tracking-tight">
          Ready to discover, build, and scale?
        </p>
        <Link
          href="/#book"
          data-cursor="Start"
          className="simple-button btn-glow group full-rounded bg-ember-deep px-8 py-4 text-sm font-semibold text-background transition-colors duration-300 hover:bg-ink"
        >
          <Split text="Start a project" />
          <span className="line" />
        </Link>
      </div>
    </div>
  );
}