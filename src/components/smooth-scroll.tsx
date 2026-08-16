"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const firstRender = useRef(true);
  const reduce = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (reduce) return;
    if (!wrapper.current) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -64, duration: 1.4 });
    };
    document.addEventListener("click", onClick);

    const onDone = () => {
      lenis.stop();
      ScrollTrigger.refresh();
      lenis.start();
    };
    window.addEventListener("preloader:done", onDone);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("preloader:done", onDone);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduce]);

  // Client-side route changes keep the old scroll position, which leaves
  // sticky/scrubbed layouts half-applied on the next page. Reset to the top
  // (or to the target of a #hash link) whenever the route changes. The first
  // render is skipped so browsers can restore scroll on reload.
  //
  // Sticky elements stay pinned (and report garbage rects) until the scroll
  // is hard-reset and the browser re-lays out, so we: stop lenis, jump to 0
  // natively, force a reflow, refresh ScrollTrigger — and only then resolve
  // the hash anchor as an absolute number target.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const id = window.location.hash.slice(1);
    const target = id ? document.getElementById(id) : null;

    const reset = () => {
      const lenis = lenisRef.current;
      if (lenis) lenis.stop();

      window.scrollTo(0, 0);
      if (lenis) lenis.scrollTo(0, { immediate: true });

      // Force the browser to un-pin any sticky elements before measuring.
      void document.body.offsetHeight;
      ScrollTrigger.refresh();
      if (lenis) lenis.start();

      if (target) {
        // ScrollTrigger.refresh() re-pins sticky/scrubbed layouts and runs its
        // own easing correction toward the preserved scroll position, which
        // fights our glide. Let that play out (it eases out over ~0.8s, so a
        // couple of still frames up front look stable by chance), then wait
        // for scroll + document height to be fully still before gliding, and
        // finally assert the landing after the glide itself settles.
        let lastY = -1;
        let lastH = -1;
        let frames = 0;
        const wait = () => {
          const y = window.scrollY;
          const h = document.documentElement.scrollHeight;
          const stable = y === lastY && h === lastH;
          lastY = y;
          lastH = h;
          if ((stable && frames > 4) || frames > 240) {
            const top = target.getBoundingClientRect().top + window.scrollY;
            if (top > 1) {
              const goal = top - 64;
              if (lenis) {
                lenis.scrollTo(goal, { duration: 0.8 });
                const assert = () => {
                  const y2 = window.scrollY;
                  const top2 = target.getBoundingClientRect().top + y2;
                  if (Math.abs(top2 - 64 - goal) > 2) {
                    const goal2 = top2 - 64;
                    if (goal2 > 1) {
                      if (lenis) lenis.scrollTo(goal2, { immediate: true });
                      else window.scrollTo(0, goal2);
                    }
                  }
                };
                requestAnimationFrame(() =>
                  setTimeout(assert, 1200)
                );
              } else window.scrollTo(0, goal);
            }
            return;
          }
          frames++;
          requestAnimationFrame(wait);
        };
        // Initial hop: let the refresh correction tween build up velocity
        // before judging stability, otherwise 0/0 early frames look settled.
        const hop = () => {
          if (performance.now() - hopStart < 420) {
            requestAnimationFrame(hop);
            return;
          }
          wait();
        };
        const hopStart = performance.now();
        requestAnimationFrame(hop);
      }
    };

    const t = setTimeout(reset, 0);
    return () => clearTimeout(t);
  }, [pathname, reduce]);

  return (
    <div ref={wrapper} className={reduce ? "" : "lenis-wrapper"}>
      {children}
    </div>
  );
}
