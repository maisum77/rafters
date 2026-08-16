"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import Link from "next/link";
import { Split } from "@/components/split";

const PEOPLE = [
  {
    index: "01",
    name: "Maisum Abbas",
    craft: "Web Development",
    line: "Builds fast, pixel-perfect sites that convert.",
    photo: "/images/maisum.png",
    align: "left",
  },
  {
    index: "02",
    name: "Aon Rafay",
    craft: "SEO",
    line: "Turns search engines into your best salesperson.",
    photo: "/images/aon.png",
    align: "right",
  },
  {
    index: "03",
    name: "Umair Nadeem",
    craft: "Content Creation",
    line: "Writes and shoots the words and visuals people remember.",
    photo: "/images/umair.png",
    align: "left",
  },
  {
    index: "04",
    name: "Qasim Shakeel",
    craft: "Social Media",
    line: "Runs your channels like a media brand, not a billboard.",
    photo: "/images/qasim.png",
    align: "right",
  },
];

export function TeamGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".team-frame",
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

      gsap.fromTo(
        ".team-portrait",
        { scale: 1.28 },
        {
          scale: 1.12,
          ease: "power3.out",
          duration: 1.6,
          stagger: 0.15,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 72%",
          },
        }
      );

      gsap.fromTo(
        ".team-meta",
        { y: 32, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.5,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 65%",
          },
        }
      );

      gsap.utils.toArray<HTMLElement>(".team-card").forEach((card) => {
        const img = card.querySelector<HTMLElement>(".team-portrait");
        if (!img) return;
        gsap.fromTo(
          img,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      });
    }, ref);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className="mx-auto max-w-[1400px] px-5 pb-20 md:px-8">
      <div className="flex flex-col gap-24 md:gap-40">
        {PEOPLE.map((person) => (
          <article
            key={person.index}
            data-cursor={person.craft}
            className={`team-card grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-12 ${
              person.align === "right" ? "" : "md:[direction:rtl]"
            }`}
          >
            <div
              className={`team-frame overflow-hidden bg-surface md:[direction:ltr] ${
                person.align === "right"
                  ? "md:col-span-5 md:col-start-8"
                  : "md:col-span-5 md:col-start-1"
              }`}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={person.photo}
                  alt={person.name}
                  fill
                  sizes="(min-width: 768px) 42vw, 100vw"
                  className="team-portrait object-cover brightness-[0.95] transition-all duration-700 ease-out will-change-transform group-hover:brightness-105"
                />
                <span className="absolute right-5 top-5 font-mono text-xs text-background/80 mix-blend-difference">
                  {person.index}
                </span>
              </div>
            </div>

            <div
              className={`md:[direction:ltr] ${
                person.align === "right"
                  ? "md:col-span-6 md:col-start-1 md:row-start-1"
                  : "md:col-span-6 md:col-start-8"
              }`}
            >
              <div className="team-meta flex items-baseline justify-between gap-4">
                <h3 className="font-serif text-[clamp(2.4rem,5vw,4.5rem)] italic leading-none tracking-tight">
                  {person.name}
                </h3>
                <span className="font-mono text-xs text-ember-deep">
                  {person.craft}
                </span>
              </div>
              <p className="team-meta mt-4 max-w-sm text-base leading-relaxed text-muted md:text-lg">
                {person.line}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function CraftCta() {
  return (
    <div className="border-t border-line bg-background">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-6 px-5 py-20 md:flex-row md:items-center md:justify-between md:px-8 md:py-28">
        <p className="max-w-md font-serif text-[clamp(1.6rem,4vw,3rem)] italic leading-tight tracking-tight">
          Want to meet the people who&apos;ll build it?
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