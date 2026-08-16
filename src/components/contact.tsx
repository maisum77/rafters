"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Loader2, Check } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Split } from "@/components/split";

type FormStatus = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = e.currentTarget;
      const data = new FormData(form);
      const name = (data.get("name") as string)?.trim();
      const email = (data.get("email") as string)?.trim();
      const message = (data.get("message") as string)?.trim();

      const newErrors: typeof errors = {};
      if (!name) newErrors.name = "Please enter your name";
      if (!email) newErrors.email = "Please enter your email";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        newErrors.email = "Please enter a valid email";
      if (!message) newErrors.message = "Tell us what you need";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({});
      setFormError(null);
      setStatus("sending");

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message }),
        });
        const body = (await res.json().catch(() => ({}))) as {
          errors?: Record<string, string>;
        };

        if (!res.ok) {
          setFormError(
            body.errors?.form ??
              "Something went wrong sending your message. Please try again, or email us directly."
          );
          setStatus("error");
          return;
        }

        setStatus("sent");
        if (formRef.current) {
          gsap.to(formRef.current, {
            autoAlpha: 0,
            y: -20,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
              if (successRef.current) {
                gsap.fromTo(
                  successRef.current,
                  { autoAlpha: 0, y: 30, scale: 0.95 },
                  {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.7,
                    ease: "power3.out",
                  }
                );
              }
            },
          });
        }
      } catch {
        setFormError(
          "Something went wrong sending your message. Please try again, or email us directly."
        );
        setStatus("error");
      }
    },
    []
  );

  useEffect(() => {
    if (reduce || !ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-reveal",
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 70%",
          },
        }
      );

      if (window.matchMedia("(hover: hover)").matches && btnRef.current) {
        const xTo = gsap.quickTo(btnRef.current, "x", {
          duration: 0.35,
          ease: "power3.out",
        });
        const yTo = gsap.quickTo(btnRef.current, "y", {
          duration: 0.35,
          ease: "power3.out",
        });

        const onMove = (e: MouseEvent) => {
          const r = btnRef.current!.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          xTo(dx * 0.22);
          yTo(dy * 0.22);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };

        btnRef.current.addEventListener("pointermove", onMove);
        btnRef.current.addEventListener("pointerleave", onLeave);
      }
    }, ref);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className="mx-auto max-w-[1400px] px-5 md:px-8">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <h2 className="contact-reveal group font-serif text-[clamp(3rem,8vw,7rem)] italic leading-[0.9] tracking-tight">
            <Split text="Let's talk." />
          </h2>
          <p className="contact-reveal mt-6 max-w-sm text-base leading-relaxed text-muted">
            Tell us where your brand is stuck. We&apos;ll reply within one
            working day — with opinions, not a sales script.
          </p>

          <div className="contact-reveal mt-12 space-y-6">
            <div>
              <p className="font-mono text-xs text-muted">Email</p>
              <a
                href="mailto:therafters.official@gmail.com"
                data-cursor="email"
                className="simple-button group element-rounded mt-1 inline-block text-xl font-medium transition-colors hover:text-ember-deep"
              >
                therafters.official@gmail.com
                <span className="line" />
              </a>
            </div>
            <div>
              <p className="font-mono text-xs text-muted">Socials</p>
              <div className="mt-1 flex gap-6 text-xl font-medium">
                {[
                  {
                    label: "Instagram",
                    href: "https://www.instagram.com/latani.official",
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="simple-button group element-rounded transition-colors hover:text-ember-deep"
                  >
                    {s.label}
                    <span className="line" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="contact-reveal flex flex-col gap-6"
            noValidate
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block font-mono text-xs text-muted"
                >
                  Your name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  disabled={status === "sending" || status === "sent"}
                  placeholder="Jane Doe"
                  onChange={() =>
                    errors.name && setErrors((e) => ({ ...e, name: undefined }))
                  }
                  className={`w-full border-b bg-transparent py-3 text-base text-ink placeholder:text-muted/50 transition-colors duration-300 focus:outline-none ${
                    errors.name
                      ? "border-red-400 focus:border-red-400"
                      : "border-line focus:border-ember-deep"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1.5 font-mono text-[11px] text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-mono text-xs text-muted"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={status === "sending" || status === "sent"}
                  placeholder="jane@company.com"
                  onChange={() =>
                    errors.email &&
                    setErrors((e) => ({ ...e, email: undefined }))
                  }
                  className={`w-full border-b bg-transparent py-3 text-base text-ink placeholder:text-muted/50 transition-colors duration-300 focus:outline-none ${
                    errors.email
                      ? "border-red-400 focus:border-red-400"
                      : "border-line focus:border-ember-deep"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 font-mono text-[11px] text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="message"
                className="mb-2 block font-mono text-xs text-muted"
              >
                What do you need?
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                disabled={status === "sending" || status === "sent"}
                placeholder="Web, SEO, ads, content, social — or all of it."
                onChange={() =>
                  errors.message &&
                  setErrors((e) => ({ ...e, message: undefined }))
                }
                className={`w-full resize-none border-b bg-transparent py-3 text-base text-ink placeholder:text-muted/50 transition-colors duration-300 focus:outline-none ${
                  errors.message
                    ? "border-red-400 focus:border-red-400"
                    : "border-line focus:border-ember-deep"
                }`}
              />
              {errors.message && (
                <p className="mt-1.5 font-mono text-[11px] text-red-400">
                  {errors.message}
                </p>
              )}
            </div>
            <button
              ref={btnRef}
              type="submit"
              disabled={status === "sending" || status === "sent"}
              data-cursor="Send"
              className="btn-glow mt-2 flex items-center gap-2 self-start rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-background transition-colors duration-300 enabled:hover:bg-ember-deep disabled:opacity-70"
            >
              {status === "sending" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending…</span>
                </>
              ) : (
                <Split text="Send message" />
              )}
            </button>
            {formError && (
              <p
                role="alert"
                className="mt-3 max-w-sm text-sm text-red-400"
              >
                {formError}
              </p>
            )}
          </form>

          <div
            ref={successRef}
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
            style={{ visibility: "hidden" }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ember-deep/15">
              <Check size={28} className="text-ember-deep" />
            </div>
            <h3 className="mt-6 font-serif text-3xl italic tracking-tight">
              Message sent.
            </h3>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">
              We&apos;ll reply within one working day — with opinions, not a
              sales script.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Finale() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".finale-item",
        { autoAlpha: 0, y: 60 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 70%",
          },
        }
      );

      // Parallax on the big rafters text
      gsap.fromTo(
        ".finale-wordmark",
        { yPercent: 15 },
        {
          yPercent: -15,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );

      // Shimmer sweep across the rafters text
      gsap.fromTo(
        ".finale-shimmer-text",
        { backgroundPosition: "200% center" },
        {
          backgroundPosition: "-200% center",
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 1,
          },
        }
      );

      // Pulsing blur shadow
      gsap.to(".finale-blur-pulse", {
        opacity: 0.35,
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, ref);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <div
      ref={ref}
      data-theme-bg="#e2d8ee"
      className="finale relative flex min-h-[100dvh] flex-col justify-between overflow-hidden border-t border-line bg-surface-2 px-5 py-12 md:px-8 md:py-16"
    >
      {/* Floating decorative dots */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span
          className="float-dot absolute left-[15%] top-[25%] h-2 w-2 rounded-full bg-ember-deep/40"
          style={{ "--dur": "7s", "--delay": "0s" } as React.CSSProperties}
        />
        <span
          className="float-dot absolute right-[20%] top-[35%] h-1.5 w-1.5 rounded-full bg-ember/50"
          style={{ "--dur": "5s", "--delay": "1s" } as React.CSSProperties}
        />
        <span
          className="float-dot absolute left-[40%] bottom-[30%] h-2.5 w-2.5 rounded-full bg-ember-deep/30"
          style={{ "--dur": "8s", "--delay": "2s" } as React.CSSProperties}
        />
        <span
          className="float-dot absolute right-[35%] top-[20%] h-1 w-1 rounded-full bg-ember/40"
          style={{ "--dur": "6s", "--delay": "0.5s" } as React.CSSProperties}
        />
      </div>

      <div className="mx-auto w-full max-w-[1400px]">
        <p className="finale-item font-mono text-xs uppercase tracking-[0.22em] text-muted">
          Let&apos;s make your brand move
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center text-center">
        <p className="finale-item font-serif text-[clamp(2.8rem,9vw,8rem)] italic leading-[0.92] tracking-tight">
          let&apos;s tell your
          <br />
          <span className="text-fill-gradient">story.</span>
        </p>

        <div className="finale-item finale-wordmark relative mt-12 mb-2 h-[clamp(5rem,12vw,10rem)] w-full">
          <span className="finale-blur-pulse absolute left-1/2 top-0 -translate-x-1/2 font-serif text-[clamp(5rem,16vw,16rem)] italic leading-none tracking-tight text-ink/20 blur-lg">
            rafters
          </span>
          <span className="finale-shimmer-text absolute left-1/2 top-0 -translate-x-1/2 font-serif text-[clamp(5rem,16vw,16rem)] italic leading-none tracking-tight">
            rafters
          </span>
        </div>

        <a
          href="mailto:therafters.official@gmail.com"
          data-cursor="email"
          className="finale-item simple-button group element-rounded mt-6 font-serif text-[clamp(1.6rem,5vw,4rem)] italic tracking-tight transition-colors hover:text-ember-deep"
        >
          therafters.official@gmail.com
          <span className="line" />
        </a>
      </div>

      <div className="mx-auto w-full max-w-[1400px]">
        <div className="finale-item flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Link
            href="/"
            className="font-serif text-lg italic tracking-tight text-ink"
          >
            rafters<span className="text-ember-deep">®</span>
          </Link>
          <div className="flex gap-8 text-sm text-muted">
            <Link
              href="/privacy"
              className="simple-button element-rounded transition-colors hover:text-ink"
            >
              Privacy
              <span className="line" />
            </Link>
            <Link
              href="/terms"
              className="simple-button element-rounded transition-colors hover:text-ink"
            >
              Terms
              <span className="line" />
            </Link>
          </div>
          <p className="font-mono text-xs text-muted">
            © {new Date().getFullYear()} Rafters. Four people, one roof.
          </p>
        </div>
      </div>
    </div>
  );
}
