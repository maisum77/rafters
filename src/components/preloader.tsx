"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import Loader from "@/components/ui/3d-box-loader-animation";

const MIN_VISIBLE_MS = 600;
const MAX_WAIT_MS = 15000;
const SEEN_KEY = "rafters:preloader-seen";

export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const finish = () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("preloader:done"));
      setGone(true);
    };

    if (reduce) {
      finish();
      return;
    }

    // Skip the intro on repeat visits within the same session.
    if (typeof window !== "undefined" && sessionStorage.getItem(SEEN_KEY)) {
      finish();
      return;
    }

    document.body.style.overflow = "hidden";

    let fontsReady = false;
    let minElapsed = false;
    let maxTimedOut = false;
    let exited = false;

    const tryExit = () => {
      if (exited) return;
      if ((fontsReady && minElapsed) || maxTimedOut) {
        exited = true;
        sessionStorage.setItem(SEEN_KEY, "1");
        gsap.to(ref.current, {
          "--iris": "0vmax",
          duration: 0.9,
          ease: "power2.inOut",
          onComplete: finish,
        });
      }
    };

    const minTimer = window.setTimeout(() => {
      minElapsed = true;
      tryExit();
    }, MIN_VISIBLE_MS);

    const maxTimer = window.setTimeout(() => {
      maxTimedOut = true;
      tryExit();
    }, MAX_WAIT_MS);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        fontsReady = true;
        tryExit();
      });
    } else {
      fontsReady = true;
    }

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      document.body.style.overflow = "";
    };
  }, [reduce]);

  if (gone || reduce) return null;

  return (
    <div
      ref={ref}
      className="iris fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden bg-[#f4f1ea]"
      style={
        {
          "--iris": "190vmax",
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <Loader />
      <span className="mt-10 font-serif text-lg italic tracking-tight text-ink">
        RAFTERS
      </span>
    </div>
  );
}
