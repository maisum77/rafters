import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Grain } from "@/components/grain";
import { Preloader } from "@/components/preloader";
import { Nav } from "@/components/nav";
import { Cursor } from "@/components/cursor";
import { SectionTheme } from "@/components/section-theme";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SITE } from "@/lib/site";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK"],
  preload: false,
});

const TITLE = "Rafters — A four-person digital agency";
const DESCRIPTION =
  "Web development, SEO, paid ads, content creation and social media — one roof, real craft. Four people, every discipline your brand needs.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: TITLE,
    template: "%s — Rafters",
  },
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.name,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Rafters — a four-person digital agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
};

const OFFERINGS = [
  { name: "Web development", description: "Next.js and modern stacks, shipped fast and secure." },
  { name: "SEO", description: "Technical and content strategy that gets you found." },
  { name: "Paid ads", description: "Meta and Google, full-funnel and measured." },
  { name: "Content creation", description: "Copy, art direction and video under one roof." },
  { name: "Social media", description: "Community and growth that compounds." },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE.name,
  description: DESCRIPTION,
  url: SITE.url,
  email: SITE.email,
  sameAs: [SITE.instagram],
  priceRange: "$$",
  makesOffer: OFFERINGS.map((o) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: o.name,
      description: o.description,
    },
  })),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${geistMono.variable} ${fraunces.variable} bg-background antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="min-h-full bg-background text-ink">
        <Grain />
        <Preloader />
        <Cursor />
        <SectionTheme />
        <Nav />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
