import { BALI_PORTS, ISLAND_PORTS } from "@/data/ports";
import { BOAT_ROUTES } from "@/data/planner";
import { COLORS } from "@/lib/theme";

// A transit-map style diagram — two clean columns (departure ports,
// destinations) connected by smooth curves, deliberately NOT trying to be
// geographically accurate. This is the standard, well-established
// convention for exactly this kind of many-to-many connection data (the
// same idea behind a subway line diagram), and it sidesteps the real
// problem an earlier geographic version ran into: hand-guessed coastlines
// only ever look approximate, never genuinely polished.
const W = 620;
const H = 420;
const LEFT_X = 130;
const RIGHT_X = 490;

function bumpCurve(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
}

// Only include destinations that actually have at least one real route —
// keeps the right column limited to what's genuinely in BOAT_ROUTES data.
const CONNECTED_DESTINATIONS = ISLAND_PORTS.filter((dest) =>
  BALI_PORTS.some((port) => BOAT_ROUTES[port.name]?.[dest.name])
);

const portY = Object.fromEntries(
  BALI_PORTS.map((p, i) => [p.name, 40 + i * ((380 - 40) / Math.max(1, BALI_PORTS.length - 1))])
);
const destY = Object.fromEntries(
  CONNECTED_DESTINATIONS.map((d, i) => [d.name, 15 + i * ((405 - 15) / Math.max(1, CONNECTED_DESTINATIONS.length - 1))])
);

export default function RouteNetworkMap() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} role="img" aria-label="Diagram of every port and route IslandBounce covers in Indonesia">
      {BALI_PORTS.map((port) => {
        const routes = BOAT_ROUTES[port.name];
        if (!routes) return null;
        return Object.keys(routes).map((destName) => {
          const y1 = portY[port.name];
          const y2 = destY[destName];
          if (y1 == null || y2 == null) return null;
          return (
            <path key={`${port.name}-${destName}`} d={bumpCurve(LEFT_X, y1, RIGHT_X, y2)} stroke={COLORS.foamLine} strokeWidth="1.4" fill="none" strokeOpacity="0.85" />
          );
        });
      })}

      {BALI_PORTS.map((p) => (
        <g key={p.name}>
          <circle cx={LEFT_X} cy={portY[p.name]} r="6" fill={COLORS.coral} stroke="white" strokeWidth="2" />
          <text x={LEFT_X - 14} y={portY[p.name] + 4} textAnchor="end" fontSize="12" fontWeight="700" fill={COLORS.sea}>
            {p.name}
          </text>
        </g>
      ))}

      {CONNECTED_DESTINATIONS.map((d) => (
        <g key={d.name}>
          <circle cx={RIGHT_X} cy={destY[d.name]} r="5" fill={COLORS.sea} stroke="white" strokeWidth="1.5" />
          <text x={RIGHT_X + 14} y={destY[d.name] + 4} textAnchor="start" fontSize="11.5" fill={COLORS.sea}>
            {d.name}
          </text>
        </g>
      ))}

      <text x={LEFT_X} y="10" textAnchor="middle" fontSize="10" fontWeight="700" fill={COLORS.brass} letterSpacing="1">
        DEPARTURE PORTS
      </text>
      <text x={RIGHT_X} y="10" textAnchor="middle" fontSize="10" fontWeight="700" fill={COLORS.brass} letterSpacing="1">
        DESTINATIONS
      </text>
    </svg>
  );
}
