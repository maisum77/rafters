"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import Link from "next/link";
import { Split } from "@/components/split";

const SERVICES = [
  {
    id: "web",
    index: "01",
    name: "Web Development",
    blurb: "Sites built like products — fast, sharp, and built to convert.",
    items: [
      "Next.js & modern stacks",
      "Headless CMS",
      "E-commerce",
      "Performance-first",
    ],
  },
  {
    id: "seo",
    index: "02",
    name: "SEO",
    blurb: "Rankings earned with research and craft, not guesswork.",
    items: [
      "Technical SEO",
      "Content strategy",
      "Link building",
      "Analytics & reporting",
    ],
  },
  {
    id: "ads",
    index: "03",
    name: "Paid Ads",
    blurb: "Budgets tuned until every click earns its place.",
    items: [
      "Meta & Google Ads",
      "Retargeting funnels",
      "Creative testing",
      "Weekly reporting",
    ],
  },
  {
    id: "content",
    index: "04",
    name: "Content Creation",
    blurb: "Words and visuals that make people stop scrolling.",
    items: [
      "Copywriting",
      "Art direction",
      "Short-form video",
      "Brand voice",
    ],
  },
  {
    id: "social",
    index: "05",
    name: "Social Media",
    blurb: "Your channels run like a media brand, not a billboard.",
    items: [
      "Community management",
      "Content calendars",
      "Growth strategy",
      "Creator collabs",
    ],
  },
];

const STACK_BG = ["#f4f1ea", "#ece6f0", "#f4f1ea", "#e2d8ee", "#f4f1ea"];

export function ServicesDeck() {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const run = () => {
      const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).__lenis;
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -8, duration: 1.2 });
      else el.scrollIntoView();
    };
    const t = setTimeout(run, 250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (reduce || !ref.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".svc-card");

      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { yPercent: i === 0 ? 0 : 60 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "top top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );

        if (i < cards.length - 1) {
          gsap.fromTo(
            card,
            { scale: 1, filter: "brightness(1)" },
            {
              scale: 0.94,
              filter: "brightness(0.96)",
              ease: "none",
              scrollTrigger: {
                trigger: cards[i + 1],
                start: "top bottom",
                end: "top top",
                scrub: 1,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      });

      gsap.fromTo(
        progress.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className="relative">
      <div>
        {SERVICES.map((service, i) => (
          <article
            key={service.index}
            id={service.id}
            data-cursor={service.name}
            data-theme-bg={STACK_BG[i]}
            className={`svc-card sticky top-0 flex min-h-[100dvh] flex-col justify-center px-5 py-20 transition-colors duration-[600ms] md:px-8 ${
              i % 2 === 0 ? "bg-background" : "bg-surface"
            } ${i === SERVICES.length - 1 ? "pb-32" : ""}`}
          >
            <span className="pointer-events-none absolute right-5 top-5 font-mono text-xs text-muted/60 md:right-8 md:top-8">
              {String(i + 1).padStart(2, "0")} / 05
            </span>

            <div className="mx-auto w-full max-w-[1400px]">
              <div className="flex items-start gap-6 md:gap-10">
                <span className="font-sans text-[clamp(4rem,14vw,11rem)] font-semibold leading-none tracking-tighter text-ember-deep/25">
                  {service.index}
                </span>
                <div className="mt-3 flex-1 md:mt-6">
                  <h3 className="font-serif text-[clamp(2.6rem,7vw,6rem)] italic leading-[0.9] tracking-tight text-ink">
                    {service.name}
                  </h3>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
                    {service.blurb}
                  </p>

                  <ul className="mt-10 max-w-md">
                    {service.items.map((item) => (
                      <li
                        key={item}
                        className="simple-button group element-rounded flex items-center justify-between border-t border-line py-3.5 text-sm text-ink transition-colors duration-300 hover:bg-surface-2/50"
                      >
                        <span className="flex items-center gap-4">
                          <span className="h-1 w-1 rounded-full bg-ember-deep transition-transform duration-300 group-hover:scale-150" />
                          {item}
                        </span>
                        <span className="text-ember-deep opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          →
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 border-t border-line bg-background/80 px-5 py-4 backdrop-blur-sm md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="h-px w-full overflow-hidden bg-line">
            <div
              ref={progress}
              className="h-full w-full origin-left scale-x-0 bg-ember-deep"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServicesCta() {
  return (
    <div className="border-t border-line bg-background">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-6 px-5 py-20 md:flex-row md:items-center md:justify-between md:px-8 md:py-28">
        <p className="max-w-md font-serif text-[clamp(1.6rem,4vw,3rem)] italic leading-tight tracking-tight">
          Want all five under one roof?
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