import type { Metadata } from "next";
import { ContactForm, Finale } from "@/components/contact";
import { FinaleScene } from "@/components/three/scenes-client";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us where your brand is stuck. We reply within one working day — with opinions, not a sales script.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Rafters",
    description:
      "Tell us where your brand is stuck. We reply within one working day — with opinions, not a sales script.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main>
      <section data-theme-bg="#ece6f0" className="relative bg-surface pb-20">
        <div className="mx-auto max-w-[1400px] px-5 pt-28 md:px-8 md:pt-36">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            Start
          </p>
          <h1 className="mt-4 font-serif text-[clamp(2.6rem,8vw,7rem)] italic leading-[0.92] tracking-tight">
            let&apos;s{" "}
            <span className="text-fill-gradient">talk.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            Tell us where your brand is stuck. We&apos;ll reply within one
            working day — with opinions, not a sales script.
          </p>
        </div>
        <div className="mt-16 md:mt-24">
          <ContactForm />
        </div>
      </section>
      <div className="scene-3d relative">
        <FinaleScene />
        <Finale />
      </div>
    </main>
  );
}
