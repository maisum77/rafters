import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ProcessRows, ProcessCta } from "@/components/process";
import { ProcessScene } from "@/components/three/scenes-client";

export const metadata: Metadata = {
  title: "Process",
  description:
    "How we work — discover, build, scale. We audit your brand, ship in weekly visible sprints, then double down on what works.",
  alternates: { canonical: "/process" },
  openGraph: {
    title: "Process — Rafters",
    description:
      "How we work — discover, build, scale. We audit your brand, ship in weekly visible sprints, then double down on what works.",
    url: "/process",
    type: "website",
  },
};

export default function ProcessPage() {
  return (
    <main>
      <div className="scene-3d relative">
        <ProcessScene />
        <PageShell
          eyebrow="How we work"
          title="Discover, build,"
          titleAccent="then scale."
          intro="A simple, visible rhythm. We argue until the strategy is sharp, ship in weekly sprints, then measure everything — double down on what works, cut what doesn't."
          themeBg="#ece6f0"
        >
          <ProcessRows />
          <ProcessCta />
        </PageShell>
      </div>
    </main>
  );
}
