import "./fonts.css";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "IslandBounce — Compare boats. Find your island. Go properly.",
    template: "%s | IslandBounce",
  },
  description:
    "Compare fast boats and ferries from Bali to the Gili Islands, Nusa Penida, Nusa Lembongan and Lombok. Departure times, fares, sea conditions and a trip planner in one place.",
  openGraph: {
    siteName: "IslandBounce",
    type: "website",
    locale: "en_AU",
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: "Yellow bridge between Nusa Lembongan and Nusa Ceningan over turquoise water" }],
  },
  twitter: { card: "summary_large_image", images: ["/images/og-default.jpg"] },
  // Search Console "HTML tag" verification: set GOOGLE_SITE_VERIFICATION in
  // Vercel to the content value Google gives you. Skipped when not set.
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

// Explicit rather than relying on Next.js's default — without this, mobile
// browsers can render the whole site zoomed out to a desktop-width layout,
// making everything tiny regardless of how good the responsive CSS is.
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// Tells Google directly what our official name and logo are, so it has
// what it needs to show the logo in search results or a Knowledge Panel —
// showing it is always Google's own call, this just makes it possible.
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "IslandBounce",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.png`,
};

// Names the site itself for Google's results and lets it show a clean site name.
const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "IslandBounce",
  url: SITE_URL,
  inLanguage: "en",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Fonts are self-hosted (app/fonts.css, public/fonts): no wait on fonts.googleapis.com before text can show.
            The two used above the fold are preloaded. */}
        <link rel="preload" href="/fonts/big-shoulders-display-variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationLd, websiteLd]).replace(/</g, "\\u003c") }} />
        <div style={{ minHeight: "100%" }}>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
