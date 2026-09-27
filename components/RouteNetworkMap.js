import { BALI_PORTS, ISLAND_PORTS } from "@/data/ports";
import { BOAT_ROUTES } from "@/data/planner";
import { COLORS } from "@/lib/theme";

// A compact, static diagram of every real port + every real connection
// between them — no live map tiles, no API calls, just the actual
// BALI_PORTS / ISLAND_PORTS / BOAT_ROUTES data projected into simple x/y
// positions, dressed up enough to actually read as a diagram rather than
// disconnected dots: soft island-shaped context, curved (not straight)
// connection lines to avoid a tangled mess, and staggered labels so the
// tightly-clustered south-Bali ports don't overlap each other.
const ALL_PORTS = [...BALI_PORTS, ...ISLAND_PORTS];
const LATS = ALL_PORTS.map((p) => p.lat);
const LNGS = ALL_PORTS.map((p) => p.lng);
const LAT_MIN = Math.min(...LATS) - 0.08;
const LAT_MAX = Math.max(...LATS) + 0.08;
const LNG_MIN = Math.min(...LNGS) - 0.08;
const LNG_MAX = Math.max(...LNGS) + 0.08;

const PAD_L = 90;
const PAD_R = 40;
const PAD_TB = 40;
const W = 680;
const H = 300;

function project(lat, lng) {
  const x = PAD_L + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (W - PAD_L - PAD_R);
  const y = PAD_TB + (1 - (lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * (H - PAD_TB * 2);
  return { x, y };
}

function curvedPath(x1, y1, x2, y2, bend) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;
  const cx = mx + nx * bend;
  const cy = my + ny * bend;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

const CONNECTIONS = [];
BALI_PORTS.forEach((port) => {
  const routes = BOAT_ROUTES[port.name];
  if (!routes) return;
  Object.keys(routes).forEach((destName) => {
    const dest = ISLAND_PORTS.find((p) => p.name === destName);
    if (dest) CONNECTIONS.push({ from: port, to: dest });
  });
});

const SPACED_DEST_NAMES = ["Nusa Penida", "Nusa Lembongan", "Bangsal (Lombok)", "Senggigi (Lombok)", "Lembar (Lombok)", "Gili Gede (SW Lombok)"];

const BALI_LABEL_OFFSET = {
  Sanur: { dx: 8, dy: -10, anchor: "start" },
  "Padang Bai": { dx: 0, dy: -13, anchor: "middle" },
  Serangan: { dx: -10, dy: 3, anchor: "end" },
  Kusamba: { dx: 0, dy: -13, anchor: "middle" },
  "Benoa / Nusa Dua": { dx: -10, dy: 17, anchor: "end" },
};

export default function RouteNetworkMap() {
  const baliCenter = project(-8.6, 115.3);
  const lombokCenter = project(-8.55, 116.05);
  const giliLabelPos = project(-8.35, 116.06);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} role="img" aria-label="Diagram of every port and route IslandBounce covers in Indonesia">
        <ellipse cx={baliCenter.x} cy={baliCenter.y + 10} rx="95" ry="58" fill={COLORS.sea} fillOpacity="0.05" />
        <ellipse cx={lombokCenter.x} cy={lombokCenter.y + 15} rx="78" ry="62" fill={COLORS.sea} fillOpacity="0.05" />

        {CONNECTIONS.map((c, i) => {
          const from = project(c.from.lat, c.from.lng);
          const to = project(c.to.lat, c.to.lng);
          const bend = 18 + (i % 5) * 6;
          return (
            <path key={i} d={curvedPath(from.x, from.y, to.x, to.y, bend)} stroke={COLORS.foamLine} strokeWidth="1.3" fill="none" strokeOpacity="0.9" />
          );
        })}

        {ISLAND_PORTS.map((p) => {
          const { x, y } = project(p.lat, p.lng);
          const showLabel = SPACED_DEST_NAMES.includes(p.name);
          return (
            <g key={p.name}>
              <circle cx={x} cy={y} r="4" fill={COLORS.sea} stroke="white" strokeWidth="1.3" />
              {showLabel && (
                <text x={x + 7} y={y + 3} fontSize="9" fill={COLORS.sea} opacity="0.8">
                  {p.name.replace(" (Lombok)", "").replace(" (SW Lombok)", "")}
                </text>
              )}
            </g>
          );
        })}
        <text x={giliLabelPos.x} y={giliLabelPos.y - 16} textAnchor="middle" fontSize="10" fontWeight="700" fill={COLORS.sea}>
          The Gilis
        </text>

        {BALI_PORTS.map((p) => {
          const { x, y } = project(p.lat, p.lng);
          const offset = BALI_LABEL_OFFSET[p.name] || { dx: 0, dy: -13, anchor: "middle" };
          return (
            <g key={p.name}>
              <circle cx={x} cy={y} r="6" fill={COLORS.coral} stroke="white" strokeWidth="2" />
              <text x={x + offset.dx} y={y + offset.dy} textAnchor={offset.anchor} fontSize="10.5" fontWeight="700" fill={COLORS.sea}>
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-5" style={{ marginTop: 10, fontSize: 11, color: COLORS.sea, opacity: 0.75 }}>
        <span className="flex items-center gap-1.5">
          <span style={{ width: 8, height: 8, borderRadius: 999, background: COLORS.coral, display: "inline-block" }} /> Bali departure ports
        </span>
        <span className="flex items-center gap-1.5">
          <span style={{ width: 6, height: 6, borderRadius: 999, background: COLORS.sea, display: "inline-block" }} /> Destinations
        </span>
      </div>
    </div>
  );
}
