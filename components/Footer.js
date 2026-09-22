import { COLORS } from "@/lib/theme";

export default function Footer() {
  return (
    <footer style={{ background: COLORS.seaDeep, color: COLORS.foam, fontSize: 12, padding: "22px 20px", textAlign: "center" }}>
      <div style={{ opacity: 0.8, marginBottom: 4 }}>
        IslandBounce may earn a commission when you book through links on this site, at no extra cost to you.
      </div>
      <div style={{ opacity: 0.5 }}>
        &copy; {new Date().getFullYear()} IslandBounce, a ClankINC brand. ·{" "}
        <a href="mailto:troy@islandbouncetravel.com" style={{ color: "inherit" }}>
          Get in touch
        </a>
      </div>
    </footer>
  );
}
