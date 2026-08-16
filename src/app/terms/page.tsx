import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms under which Rafters provides its services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main>
      <section data-theme-bg="#f4f1ea" className="relative bg-background">
        <div className="mx-auto max-w-[860px] px-5 pb-24 pt-28 md:px-8 md:pt-36">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            Legal
          </p>
          <h1 className="mt-4 font-serif text-[clamp(2.6rem,8vw,7rem)] italic leading-[0.92] tracking-tight">
            terms.
          </h1>
          <div className="prose mt-12 max-w-none space-y-6 text-base leading-relaxed text-ink/90">
            <p>
              Rafters provides web development, SEO, paid advertising, content
              creation and social media services to clients on a per-project or
              retainer basis. Engagement terms — scope, timeline, fees and
              deliverables — are agreed in writing before any work begins.
            </p>
            <p>
              All intellectual property created for a client is transferred on
              full payment, unless otherwise stated in the engagement letter.
              Third-party assets remain subject to their respective licenses.
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