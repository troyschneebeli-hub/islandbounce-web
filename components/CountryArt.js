// Soft, rounded illustrations, one per country — bold saturated palette.
// No straight edges or sharp points: hills are rounded blobs, sails are
// curved petal shapes, the stupa is stacked rounded domes. Same 320x180
// (16:9) viewBox as the card's CSS aspect-ratio, so nothing crops.

function FlagBadge({ children, id }) {
  return (
    <g>
      <clipPath id={`clip-${id}`}>
        <circle cx="32" cy="32" r="18" />
      </clipPath>
      <g clipPath={`url(#clip-${id})`}>{children}</g>
      <circle cx="32" cy="32" r="18" fill="none" stroke="white" strokeWidth="3.5" />
    </g>
  );
}

// Indonesia — a rounded Phinisi schooner drifting past bold hill blobs.
export function IndonesiaArt() {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <linearGradient id="idn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF9D6C" />
          <stop offset="100%" stopColor="#4FBFA0" />
        </linearGradient>
        <radialGradient id="idn-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFCE7A" />
          <stop offset="100%" stopColor="#F4511E" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="url(#idn-sky)" />
      <circle cx="196" cy="76" r="34" fill="url(#idn-sun)" opacity="0.55" />
      <circle cx="196" cy="76" r="24" fill="url(#idn-sun)" />
      <path d="M0,128 C30,90 55,84 80,100 C100,68 125,64 148,92 C160,104 165,118 160,132 Z" fill="#1F8F63" opacity="0.75" />
      <path d="M0,180 L0,144 C40,120 80,158 120,138 C160,118 190,150 230,136 C260,126 290,144 320,132 L320,180 Z" fill="#17ADA0" />
      <path d="M0,180 L0,158 C40,146 80,168 120,156 C160,144 190,164 230,154 C260,146 290,158 320,150 L320,180 Z" fill="#0C8377" />
      <path d="M138,150 C138,164 222,164 222,150 C222,140 205,136 180,136 C155,136 138,140 138,150 Z" fill="#A0672E" />
      <path d="M164,136 C160,116 160,96 168,80 C176,96 178,116 176,136 Z" fill="#FFFFFF" stroke="#C97B2E" strokeWidth="1.5" />
      <path d="M196,136 C192,110 194,88 204,72 C212,90 214,114 210,136 Z" fill="#FFF3E0" stroke="#C97B2E" strokeWidth="1.5" />
      <line x1="168" y1="136" x2="168" y2="80" stroke="#7A4A1E" strokeWidth="3" strokeLinecap="round" />
      <line x1="204" y1="136" x2="204" y2="72" stroke="#7A4A1E" strokeWidth="3" strokeLinecap="round" />
      <FlagBadge id="idn">
        <rect x="12" y="12" width="40" height="20" fill="#CE1126" />
        <rect x="12" y="32" width="40" height="20" fill="#FFFFFF" />
      </FlagBadge>
    </svg>
  );
}

// Philippines — a rounded bangka under a bold petal-ray sun.
export function PhilippinesArt() {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <linearGradient id="phl-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E9FE0" />
          <stop offset="100%" stopColor="#F4C43E" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#phl-sky)" />
      <g fill="#FCC419">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <ellipse key={deg} cx="196" cy="46" rx="7" ry="14" transform={`rotate(${deg} 196 76)`} />
        ))}
      </g>
      <circle cx="196" cy="76" r="26" fill="#FFD93D" />
      <path d="M0,124 C40,96 70,92 96,112 C110,122 108,132 96,136 L0,136 Z" fill="#1F8F63" opacity="0.8" />
      <path d="M0,180 L0,148 C40,128 80,162 120,144 C160,126 190,154 230,142 C260,132 290,148 320,138 L320,180 Z" fill="#17A2B8" />
      <path d="M0,180 L0,162 C40,152 80,172 120,162 C160,152 190,170 230,162 C260,154 290,164 320,158 L320,180 Z" fill="#0E7C8F" />
      <path d="M118,152 C118,166 274,166 274,152 C274,144 250,140 196,140 C142,140 118,144 118,152 Z" fill="#E8664A" />
      <path d="M196,140 C192,118 194,98 202,86 C210,100 212,120 208,140 Z" fill="#3568C4" stroke="#264D96" strokeWidth="1.5" />
      <line x1="202" y1="140" x2="202" y2="86" stroke="#7A4A1E" strokeWidth="3" strokeLinecap="round" />
      <path d="M118,156 C104,162 96,168 96,172 L296,172 C296,168 288,162 274,156 Z" fill="#C9502E" />
      <FlagBadge id="phl">
        <rect x="12" y="12" width="40" height="20" fill="#0038A8" />
        <rect x="12" y="32" width="40" height="20" fill="#CE1126" />
        <polygon points="12,12 12,52 29,32" fill="#FFFFFF" />
      </FlagBadge>
    </svg>
  );
}

// Laos — bold stacked rounded domes for the stupa, above a bright river.
export function LaosArt() {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <linearGradient id="lao-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F2A93B" />
          <stop offset="100%" stopColor="#F7D774" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#lao-sky)" />
      <circle cx="196" cy="70" r="30" fill="#FFDE8A" opacity="0.9" />
      <path d="M0,120 C40,86 70,84 100,104 C130,84 165,88 196,110 C225,90 260,90 320,110 L320,140 L0,140 Z" fill="#4C9A6B" opacity="0.7" />
      <path d="M0,132 C40,110 80,128 120,118 C160,108 190,124 230,116 C260,110 290,120 320,116 L320,150 L0,150 Z" fill="#357452" opacity="0.9" />
      <ellipse cx="196" cy="130" rx="46" ry="16" fill="#E8B94A" />
      <ellipse cx="196" cy="110" rx="32" ry="13" fill="#EFC55E" />
      <ellipse cx="196" cy="92" rx="19" ry="10" fill="#F5D374" />
      <path d="M186,92 C186,68 196,44 196,32 C196,44 206,68 206,92 Z" fill="#E8B94A" />
      <circle cx="196" cy="30" r="6" fill="#D8483B" />
      <path d="M0,180 L0,152 C40,140 80,160 120,150 C160,140 190,156 230,148 C260,142 290,150 320,146 L320,180 Z" fill="#2E86AB" />
      <path d="M0,180 L0,164 C40,156 80,172 120,164 C160,156 190,170 230,164 C260,158 290,166 320,162 L320,180 Z" fill="#1D5F80" />
      <path d="M100,154 C102,164 168,164 172,154 C172,148 156,144 136,144 C116,144 100,148 100,154 Z" fill="#8B5A2B" />
      <path d="M172,156 C186,160 198,166 204,172" fill="none" stroke="#5C3A1E" strokeWidth="3" strokeLinecap="round" />
      <FlagBadge id="lao">
        <rect x="12" y="12" width="40" height="40" fill="#CE1126" />
        <rect x="12" y="22" width="40" height="20" fill="#002868" />
        <circle cx="32" cy="32" r="8" fill="#FFFFFF" />
      </FlagBadge>
    </svg>
  );
}

export const COUNTRY_ART = {
  Indonesia: IndonesiaArt,
  Philippines: PhilippinesArt,
  Laos: LaosArt,
};

export const COUNTRY_BG = {
  Indonesia: "#FF9D6C",
  Philippines: "#2E9FE0",
  Laos: "#F2A93B",
};
