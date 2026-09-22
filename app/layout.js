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
