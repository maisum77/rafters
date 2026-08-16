import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WORK, getWork, getAdjacentWork } from "@/data/work";

export const dynamicParams = false;

export async function generateStaticParams() {
  return WORK.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getWork(slug);
  if (!entry) return { title: "Not found" };
  return {
    title: `${entry.client} Case Study`,
    description: entry.excerpt,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      title: `${entry.client} — Rafters Case Study`,
      description: entry.excerpt,
      url: `/work/${slug}`,
      type: "article",
    },
  };
}

const BLOCKS: { key: "brief" | "challenge" | "approach" | "outcome"; label: string }[] = [
  { key: "brief", label: "01 — Brief" },
  { key: "challenge", label: "02 — Challenge" },
  { key: "approach", label: "03 — Approach" },
  { key: "outcome", label: "04 — Outcome" },
];

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getWork(slug);
  if (!entry) notFound();
  const { prev, next } = getAdjacentWork(slug);

  return (
    <main>
      <section
        data-theme-bg="#f4f1ea"
        className="relative bg-background pb-16 pt-28 md:pt-36"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-8">
          <Link
            href="/work"
            data-cursor="Back"
            className="simple-button group element-rounded font-mono text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink"
          >
            ← All work
            <span className="line" />
          </Link>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              {entry.sector}
            </span>
            <span className="h-1 w-1 rounded-full bg-muted/50" />
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              {entry.year}
            </span>
            {entry.services.map((svc) => (
              <span
                key={svc}
                className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted"
              >
                {svc}
              </span>
            ))}
          </div>

          <h1 className="mt-6 max-w-[16ch] font-serif text-[clamp(2.6rem,7vw,6.5rem)] italic leading-[0.94] tracking-tight">
            {entry.title}
          </h1>
        </div>

        <div className="relative mt-16 aspect-[16/9] overflow-hidden bg-surface md:aspect-[16/7]">
          <Image
            src={entry.cover}
            alt={entry.client}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section
        data-theme-bg="#ece6f0"
        className="relative bg-surface pb-24 pt-20 md:pt-28"
      >
        <div className="mx-auto max-w-[1400px] px-5 md:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-8">
              <p className="font-serif text-[clamp(1.5rem,3vw,2.4rem)] italic leading-[1.28] tracking-tight text-ink">
                {entry.excerpt}
              </p>

              <div className="mt-16 space-y-16">
                {BLOCKS.map(({ key, label }) => (
                  <div key={key} className="grid grid-cols-12 gap-4">
                    <p className="col-span-12 font-mono text-xs uppercase tracking-[0.18em] text-ember-deep md:col-span-3">
                      {label}
                    </p>
                    <p className="col-span-12 max-w-xl text-base leading-relaxed text-ink/90 md:col-span-9 md:text-lg">
                      {entry[key]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="sticky top-24 grid grid-cols-3 gap-4 lg:grid-cols-1">
                {entry.metrics.map((m) => (
                  <div key={m.label} className="border-t border-line pt-4">
                    <p className="font-serif text-[clamp(2rem,5vw,3.4rem)] italic leading-none tracking-tight text-ember-deep">
                      {m.value}
                    </p>
                    <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
                      {m.label}
                    </p>
                  </div>
                ))}
                <a
                  href={entry.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="visit"
                  className="simple-button btn-glow group full-rounded mt-6 inline-flex items-center justify-center bg-ink px-6 py-3 text-sm font-semibold text-background transition-colors duration-300 hover:bg-ember-deep lg:col-span-1"
                >
                  Visit live site →
                </a>
              </div>
            </aside>
          </div>

          <div className="mt-24 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {entry.gallery.map((src, i) => (
              <div
                key={i}
                className="relative aspect-[4/5] overflow-hidden bg-surface-2"
              >
                <Image
                  src={src}
                  alt={`${entry.client} — ${i + 1}`}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <nav
        data-theme-bg="#f4f1ea"
        className="border-t border-line bg-background"
      >
        <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            More work
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
            <Link
              href={`/work/${prev.slug}`}
              data-cursor={prev.client}
              className="simple-button group element-rounded flex items-baseline justify-between border border-line p-6 transition-colors duration-300 hover:border-ember-deep/40"
            >
              <span>
                <span className="block font-mono text-xs uppercase tracking-[0.14em] text-muted">
                  ← Previous
                </span>
                <span className="mt-2 block font-serif text-2xl italic tracking-tight md:text-3xl">
                  {prev.client}
                </span>
              </span>
            </Link>
            <Link
              href={`/work/${next.slug}`}
              data-cursor={next.client}
              className="simple-button group element-rounded flex items-baseline justify-between border border-line p-6 transition-colors duration-300 hover:border-ember-deep/40"
            >
              <span className="text-right">
                <span className="block font-mono text-xs uppercase tracking-[0.14em] text-muted">
                  Next →
                </span>
                <span className="mt-2 block font-serif text-2xl italic tracking-tight md:text-3xl">
                  {next.client}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </nav>
    </main>
  );
}