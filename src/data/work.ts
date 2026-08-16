export type WorkEntry = {
  slug: string;
  client: string;
  sector: string;
  title: string;
  year: string;
  services: string[];
  cover: string;
  gallery: string[];
  excerpt: string;
  brief: string;
  challenge: string;
  approach: string;
  outcome: string;
  metrics: { value: string; label: string }[];
  liveUrl: string;
};

export const WORK: WorkEntry[] = [
  {
    slug: "la-tani",
    client: "La-Tani",
    sector: "Fashion e-commerce",
    title: "Jewelry & unstitched fabrics, sold on a fast, secure storefront.",
    year: "2024",
    services: ["Web Development"],
    cover: "/images/work/la-tani-cover.jpg",
    gallery: [
      "/images/work/la-tani-2.jpg",
      "/images/work/la-tani-3.jpg",
    ],
    excerpt:
      "A storefront built to sell — fast, secure, image-first. High-res product photography that loads quick on slow mobile.",
    brief: "Fashion buyers judge by the image. La-Tani needed a storefront that renders high-res product photography quickly, stays secure against abuse, and manages a growing catalog of jewelry and unstitched fabrics without a heavy CMS.",
    challenge:
      "Jewelry and unstitched fabrics live or die by their photography. The store had to load crisp imagery on slow mobile connections, stay hardened against abuse, and feel like a modern fashion brand — not a templated shop.",
    approach:
      "We built a React storefront on AWS Amplify with an S3-backed product-image pipeline, so photography stays sharp and serves fast. Delivery is hardened with a strict Content-Security-Policy, X-Content-Type-Options, and a tight referrer policy. The typographic system pairs Space Grotesk with Inter for a clean, fashion-forward feel, and the catalog is fully responsive and image-led.",
    outcome:
      "A production storefront, live and secure, with a hardened security baseline.",
    metrics: [
      { value: "Live", label: "Production storefront" },
      { value: "A-grade", label: "Security headers" },
      { value: "S3-backed", label: "Image pipeline" },
    ],
    liveUrl: "https://www.la-tani.com/",
  },
  {
    slug: "dr-muhammad-usman-ghani",
    client: "Dr. Muhammad Usman Ghani",
    sector: "Healthcare — dental practice",
    title: "A dentist you can book in minutes — trust-first, urgency-aware.",
    year: "2024",
    services: ["Web Development", "SEO", "Content Creation"],
    cover: "/images/work/ghani-cover.jpg",
    gallery: [
      "/images/work/ghani-2.jpg",
      "/images/work/ghani-3.jpg",
    ],
    excerpt:
      "A trust-first practice site that converts visitors into booked appointments and routes emergencies fast.",
    brief: "Build a trust-first practice site that converts visitors into booked appointments, communicates competence, and routes emergencies fast — while being discoverable on Google.",
    challenge:
      "Dental patients arrive anxious, often urgent. The site needed to communicate competence, surface services plainly, route emergency calls immediately, and make booking frictionless — all while being discoverable on Google.",
    approach:
      "We structured the site around the patient journey: a hero with three clear paths (book, contact, emergency), a catalogue of eight treatments with durations, a four-step 'how treatment works' reassurance flow, an FAQ, downloadable patient forms, and patient testimonials. The markup is semantic and SEO-friendly, and every page keeps the emergency line one tap away.",
    outcome:
      "A live practice site with a one-tap emergency path, a frictionless booking flow, and patient resources that cut front-desk back-and-forth.",
    metrics: [
      { value: "8", label: "Clinical services mapped" },
      { value: "1 tap", label: "To the emergency line" },
      { value: "4-step", label: "Treatment flow surfaced" },
    ],
    liveUrl: "https://dr-muhammad-usman-ghani.vercel.app/",
  },
];

export function getWork(slug: string): WorkEntry | undefined {
  return WORK.find((w) => w.slug === slug);
}

export function getAdjacentWork(slug: string): {
  prev: WorkEntry;
  next: WorkEntry;
} {
  const i = WORK.findIndex((w) => w.slug === slug);
  const prev = WORK[(i - 1 + WORK.length) % WORK.length];
  const next = WORK[(i + 1) % WORK.length];
  return { prev, next };
}