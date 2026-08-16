import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { TeamGrid, CraftCta } from "@/components/team";
import { CraftScene } from "@/components/three/scenes-client";

export const metadata: Metadata = {
  title: "The Craft",
  description:
    "Four people who actually do the work. No account managers, no middlemen. The person you brief is the person who builds it.",
  alternates: { canonical: "/craft" },
  openGraph: {
    title: "The Craft — Rafters",
    description:
      "Four people who actually do the work. No account managers, no middlemen. The person you brief is the person who builds it.",
    url: "/craft",
    type: "website",
  },
};

export default function CraftPage() {
  return (
    <main>
      <div className="scene-3d relative">
        <CraftScene />
        <PageShell
          eyebrow="The people"
          title="Four people who"
          titleAccent="do the work."
          intro="No account managers, no middlemen. The person you brief is the person who builds it — across web, SEO, paid ads, content and social."
          themeBg="#f4f1ea"
        >
          <TeamGrid />
          <CraftCta />
        </PageShell>
      </div>
    </main>
  );
}
