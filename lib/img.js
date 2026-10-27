// Photos through Next's image optimiser (/_next/image): resized WebP/AVIF copies of the JPGs in /public, so a phone
// downloads ~60-120 KB instead of the 250-480 KB original. Used on plain <img> tags (they keep their "hide when the
// file is missing" checks). The widths are in Next's default deviceSizes, which the optimiser requires.
const WIDTHS = [640, 828, 1200, 1920];
const local = (src) => typeof src === "string" && src.startsWith("/") && !src.startsWith("//");

export const optimized = (src, width = 1200, quality = 70) =>
  local(src) ? `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}` : src;

export const srcSetFor = (src, quality = 70) =>
  local(src) ? WIDTHS.map((w) => `${optimized(src, w, quality)} ${w}w`).join(", ") : undefined;
