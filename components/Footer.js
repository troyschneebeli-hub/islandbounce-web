import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { CONTACT_EMAIL } from "@/lib/site";

export default function Footer() {
  return (
    <footer style={{ background: COLORS.seaDeep, color: COLORS.foam, fontSize: 12, padding: "22px 20px", textAlign: "center" }}>
      <nav aria-label="Site sections" className="flex flex-wrap justify-center gap-x-5 gap-y-2" style={{ marginBottom: 12, fontSize: 13, fontWeight: 600 }}>
        {[
          ["/indonesia/routes", "Boat routes"],
          ["/indonesia/ports", "Ports"],
          ["/indonesia/operators", "Operators"],
          ["/indonesia/guides", "Guides"],
          ["/indonesia", "Trip planner"],
        ].map(([href, label]) => (
          <Link key={href} href={href} style={{ color: "inherit", textDecoration: "none" }}>
            {label}
          </Link>
        ))}
      </nav>
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
