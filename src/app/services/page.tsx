import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ServicesDeck, ServicesCta } from "@/components/services";
import { ServicesScene } from "@/components/three/scenes-client";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Five crafts under one roof — web development, SEO, paid ads, content creation, and social media. No silos, no hand-offs to strangers.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services — Rafters",
    description:
      "Five crafts under one roof — web development, SEO, paid ads, content creation, and social media. No silos, no hand-offs to strangers.",
    url: "/services",
    type: "website",
  },
};

export default function ServicesPage() {
  return (
    <main>
      <div className="scene-3d relative">
        <ServicesScene />
        <PageShell
          eyebrow="What we do"
          title="Five crafts,"
          titleAccent="one room."
          intro="No silos, no hand-offs to strangers — every service lives under one roof with the people who built it. Scroll to stack through the deck."
          themeBg="#ece6f0"
        >
          <ServicesDeck />
          <ServicesCta />
        </PageShell>
      </div>
    </main>
  );
}
