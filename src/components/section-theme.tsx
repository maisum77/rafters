"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export const SECTION_BG_VAR = "--section-bg";

export function SectionTheme() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const setup = () => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-theme-bg]");
      const body = document.body;

      const triggers: ScrollTrigger[] = [];

      sections.forEach((section) => {
        const bg = section.getAttribute("data-theme-bg");
        if (!bg) return;

        const st = ScrollTrigger.create({
          trigger: section,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () =>
            gsap.to(body, {
              backgroundColor: bg,
              duration: 0.8,
              ease: "power2.out",
            }),
          onEnterBack: () =>
            gsap.to(body, {
              backgroundColor: bg,
              duration: 0.8,
              ease: "power2.out",
            }),
        });
        triggers.push(st);
      });

      return () => triggers.forEach((t) => t.kill());
    };

    let cleanup: (() => void) | void;
    const onDone = () => {
      window.removeEventListener("preloader:done", onDone);
      cleanup = setup();
    };

    if (document.readyState === "complete") {
      cleanup = setup();
    } else {
      window.addEventListener("preloader:done", onDone);
    }

    return () => {
      if (onDone) window.removeEventListener("preloader:done", onDone);
      if (cleanup) cleanup();
    };
  }, [reduce]);

  return null;
}