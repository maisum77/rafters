"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function PageShell({
  eyebrow,
  title,
  titleAccent,
  intro,
  children,
  themeBg = "#f4f1ea",
}: {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  intro?: string;
  children: ReactNode;
  themeBg?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;

    const ctx = gsap.context(() => {
      const ready = () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
          ".shell-eyebrow",
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6 }
        )
          .fromTo(
            ".shell-title",
            { y: 40, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.8 },
            "-=0.3"
          )
          .fromTo(
            ".shell-intro",
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.7 },
            "-=0.4"
          );
      };

      if (document.readyState === "complete") {
        const onDone = () => {
          window.removeEventListener("preloader:done", onDone);
          ready();
        };
        // If preloader already done, fire immediately
        ready();
      } else {
        const onDone = () => {
          window.removeEventListener("preloader:done", onDone);
          ready();
        };
        window.addEventListener("preloader:done", onDone);
      }
    }, ref);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={ref} data-theme-bg={themeBg} className="relative">
      <div className="mx-auto max-w-[1400px] px-5 pt-28 md:px-8 md:pt-36">
        <p
          className="shell-eyebrow font-mono text-xs uppercase tracking-[0.22em] text-muted"
          style={{ visibility: "hidden" }}
        >
          {eyebrow}
        </p>
        <h1
          className="shell-title mt-4 font-serif text-[clamp(2.6rem,8vw,7rem)] italic leading-[0.92] tracking-tight"
          style={{ visibility: "hidden" }}
        >
          {title}{" "}
          {titleAccent ? (
            <span className="text-fill-gradient">{titleAccent}</span>
          ) : null}
        </h1>
        {intro ? (
          <p
            className="shell-intro mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg"
            style={{ visibility: "hidden" }}
          >
            {intro}
          </p>
        ) : null}
      </div>
      <div className="mt-16 md:mt-24">{children}</div>
    </section>
  );
}
