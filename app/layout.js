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
    "Ferry, fast-boat, and trip-planning comparisons across Bali, the Gili Islands, Nusa Penida, and Lombok — every departure compared side by side.",
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd).replace(/</g, "\\u003c") }} />
        <div style={{ minHeight: "100%" }}>
          <Nav />
          {children}
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
