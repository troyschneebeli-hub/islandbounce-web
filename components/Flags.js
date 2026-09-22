// Real national flag SVGs, not photos — flags aren't copyrighted work the
// way a photograph is, so these can ship safely without any licensing step.
// Each fills its container edge-to-edge (preserveAspectRatio="none"), so
// they work as full-bleed card backgrounds at any card aspect ratio.

export function FlagIndonesia({ style }) {
  return (
    <svg viewBox="0 0 3 2" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block", ...style }}>
      <rect width="3" height="1" fill="#CE1126" />
      <rect y="1" width="3" height="1" fill="#FFFFFF" />
    </svg>
  );
}

export function FlagLaos({ style }) {
  return (
    <svg viewBox="0 0 3 2" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block", ...style }}>
      <rect width="3" height="2" fill="#CE1126" />
      <rect y="0.5" width="3" height="1" fill="#002868" />
      <circle cx="1.5" cy="1" r="0.4" fill="#FFFFFF" />
    </svg>
  );
}

export function FlagPhilippines({ style }) {
  const sunRays =
    "0,-0.11 0.023,-0.0554 0.0778,-0.0778 0.0554,-0.023 0.11,0 0.0554,0.023 0.0778,0.0778 0.023,0.0554 0,0.11 -0.023,0.0554 -0.0778,0.0778 -0.0554,0.023 -0.11,0 -0.0554,-0.023 -0.0778,-0.0778 -0.023,-0.0554";
  const star =
    "0,-0.05 0.0112,-0.0154 0.0476,-0.0155 0.0181,0.0059 0.0294,0.0405 0,0.019 -0.0294,0.0405 -0.0181,0.0059 -0.0476,-0.0155 -0.0112,-0.0154";
  return (
    <svg viewBox="0 0 2 1" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block", ...style }}>
      <rect width="2" height="0.5" fill="#0038A8" />
      <rect y="0.5" width="2" height="0.5" fill="#CE1126" />
      <polygon points="0,0 0,1 0.866,0.5" fill="#FFFFFF" />
      <polygon points={sunRays} fill="#FCD116" transform="translate(0.288, 0.5)" />
      <polygon points={star} fill="#FCD116" transform="translate(0.0399, 0.0694)" />
      <polygon points={star} fill="#FCD116" transform="translate(0.0399, 0.9306)" />
      <polygon points={star} fill="#FCD116" transform="translate(0.786, 0.5)" />
    </svg>
  );
}

export const FLAGS = {
  Indonesia: FlagIndonesia,
  Philippines: FlagPhilippines,
  Laos: FlagLaos,
};
