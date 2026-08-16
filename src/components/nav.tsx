"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Split } from "@/components/split";

const LINKS = [
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/craft", label: "The Craft" },
  { href: "/process", label: "Process" },
  { href: "/#book", label: "Book" },
];

export function Nav() {
  const ref = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: -80, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.4,
        }
      );

      ScrollTrigger.create({
        start: 80,
        end: "max",
        toggleClass: { className: "nav-scrolled", targets: el },
      });

      gsap.fromTo(
        ".nav-progress",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            start: 0,
            end: () => ScrollTrigger.maxScroll(window),
            scrub: 0.3,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!menuRef.current) return;

    if (tl.current) tl.current.kill();

    const items = menuRef.current.querySelectorAll(".mobile-link");
    const footer = menuRef.current.querySelector(".mobile-footer");

    if (open) {
      document.body.style.overflow = "hidden";
      tl.current = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.current.fromTo(
        items,
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08 },
        0.1
      );
      if (footer) {
        tl.current.fromTo(
          footer,
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5 },
          "-=0.2"
        );
      }
    } else {
      gsap.set(items, { clearProps: "all" });
      if (footer) gsap.set(footer, { clearProps: "all" });
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <>
      <header
        ref={ref}
        className="fixed inset-x-0 top-0 z-[80] border-b border-transparent transition-colors duration-500"
        style={{ visibility: "hidden" }}
      >
        <div className="nav-progress absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-ember-deep" />
        <div className="flex h-16 items-center justify-between px-5 md:px-8">
          <Link
            href="/"
            className="font-serif text-lg italic tracking-tight text-ink"
          >
            rafters<span className="text-ember-deep">®</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`simple-button group element-rounded px-4 py-1.5 text-sm transition-colors duration-300 ${
                  pathname === link.href
                    ? "text-ink"
                    : "text-muted hover:text-ink"
                }`}
              >
                <Split text={link.label} />
                <span className="line" />
              </Link>
            ))}
            <Link
              href="/#book"
              className="simple-button group full-rounded border border-ember-deep/40 px-4 py-1.5 text-sm text-ember-deep transition-colors duration-300 hover:bg-ember-deep hover:text-background"
            >
              <Split text="Start a project" />
              <span className="line" />
            </Link>
          </nav>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative z-[82] flex h-10 w-10 items-center justify-center text-ink transition-colors duration-300 md:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <div
        ref={menuRef}
        className={`mobile-overlay md:hidden ${open ? "is-open" : ""}`}
        aria-hidden={!open}
        inert={!open}
      >
        <nav className="flex flex-col items-center gap-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="mobile-link group"
              style={{ visibility: "hidden" }}
            >
              <span className="font-serif text-[clamp(2rem,8vw,3.6rem)] italic tracking-tight text-ink transition-colors duration-300 hover:text-ember-deep">
                <Split text={link.label} />
              </span>
            </Link>
          ))}
          <Link
            href="/#book"
            onClick={close}
            className="mobile-link mt-6"
            style={{ visibility: "hidden" }}
          >
            <span className="simple-button group full-rounded bg-ember-deep px-8 py-3 text-sm font-semibold text-background transition-colors duration-300 hover:bg-ink">
              <Split text="Start a project" />
            </span>
          </Link>
        </nav>

        <div
          className="mobile-footer absolute bottom-8 left-0 right-0 flex justify-center"
          style={{ visibility: "hidden" }}
        >
          <span className="font-serif text-sm italic tracking-tight text-muted">
            rafters<span className="text-ember-deep">®</span>
          </span>
        </div>
      </div>
    </>
  );
}
