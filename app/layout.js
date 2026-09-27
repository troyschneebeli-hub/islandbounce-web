import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  metadataBase: new URL("https://islandbouncetravel.com"),
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: "100%" }}>
          <Nav />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
