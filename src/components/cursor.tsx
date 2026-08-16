"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (!dot.current || !ring.current) return;

    const xToDot = gsap.quickTo(dot.current, "x", {
      duration: 0.12,
      ease: "power3.out",
    });
    const yToDot = gsap.quickTo(dot.current, "y", {
      duration: 0.12,
      ease: "power3.out",
    });
    const xToRing = gsap.quickTo(ring.current, "x", {
      duration: 0.4,
      ease: "power3.out",
    });
    const yToRing = gsap.quickTo(ring.current, "y", {
      duration: 0.4,
      ease: "power3.out",
    });

    const onMove = (e: MouseEvent) => {
      xToDot(e.clientX);
      yToDot(e.clientY);
      xToRing(e.clientX);
      yToRing(e.clientY);
    };

    const enter = () => ring.current?.classList.add("is-active");
    const leave = () => {
      ring.current?.classList.remove("is-active");
      if (label.current) label.current.textContent = "";
    };

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      if (!el) return;
      const text = el.getAttribute("data-cursor") || "";
      if (label.current) label.current.textContent = text;
      enter();
    };
    const onOut = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      if (!el) return;
      const next = (e.relatedTarget as HTMLElement)?.closest?.(
        "[data-cursor]"
      );
      if (next) return;
      leave();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <span ref={label} className="cursor-ring__label" />
      </div>
    </>
  );
}