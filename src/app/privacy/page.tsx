import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Rafters handles your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main>
      <section data-theme-bg="#f4f1ea" className="relative bg-background">
        <div className="mx-auto max-w-[860px] px-5 pb-24 pt-28 md:px-8 md:pt-36">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            Legal
          </p>
          <h1 className="mt-4 font-serif text-[clamp(2.6rem,8vw,7rem)] italic leading-[0.92] tracking-tight">
            privacy.
          </h1>
          <div className="prose mt-12 max-w-none space-y-6 text-base leading-relaxed text-ink/90">
            <p>
              Rafters is a four-person digital agency. This page explains how we
              handle information you share with us — names, email addresses and
              project details submitted through our contact form.
            </p>
            <p>
              We use what you send only to reply to your enquiry and scope
              potential work. We do not sell or share your data with third
              parties for marketing. Inquiry data is retained only as long as
              needed for ongoing projects, then deleted on request.
            </p>
          </div>
          <p className="mt-16 font-mono text-xs text-muted">
            Last updated: {new Date().getFullYear()}
          </p>
        </div>
      </section>
    </main>
  );
}