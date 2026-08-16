import type { Metadata } from "next";
import { WorkTiles } from "@/components/work";
import { WORK } from "@/data/work";
import { WorkScene } from "@/components/three/scenes-client";

export const metadata: Metadata = {
  title: "Selected work",
  description:
    "Real projects, shipped. Case studies from Rafters — a four-person digital agency building web, SEO, ads, content and social.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: "Selected work — Rafters",
    description:
      "Real projects, shipped. Case studies from Rafters — a four-person digital agency building web, SEO, ads, content and social.",
    url: "/work",
    type: "website",
  },
};

export default function WorkPage() {
  return (
    <main>
      <div className="scene-3d relative">
        <WorkScene />
        <section
          data-theme-bg="#f4f1ea"
          className="relative bg-background/90 backdrop-blur-[2px] pb-24 pt-28 md:pt-36"
        >
          <div className="mx-auto max-w-[1400px] px-5 md:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
              Selected work
            </p>
            <h1 className="mt-4 font-serif text-[clamp(2.6rem,8vw,7rem)] italic leading-[0.92] tracking-tight">
              real projects,
              <br />
              <span className="text-fill-gradient">shipped.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              Real clients, real craft — the kind of work we&apos;d build again
              tomorrow. Two live, and counting.
            </p>
          </div>
          <div className="mt-16 md:mt-24">
            <WorkTiles items={WORK} showAll />
          </div>
        </section>
      </div>
    </main>
  );
}
