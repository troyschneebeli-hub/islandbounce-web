import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { CONTACT_EMAIL } from "@/lib/site";

export default function Footer() {
  return (
    <footer style={{ background: COLORS.seaDeep, color: COLORS.foam, fontSize: 12, padding: "22px 20px", textAlign: "center" }}>
      <div style={{ opacity: 0.8, marginBottom: 4 }}>
        IslandBounce is a comparison site — we don't operate any of the boats or ferries listed here. We may earn a
        commission when you book through links on this site, at no extra cost to you.
      </div>
      <div style={{ opacity: 0.5 }}>
        &copy; {new Date().getFullYear()} IslandBounce, a ClankINC brand. ·{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "inherit" }}>
          Get in touch
        </a>{" "}
        ·{" "}
        <Link href="/privacy" style={{ color: "inherit" }}>
          Privacy
        </Link>
      </div>
    </footer>
  );
}
