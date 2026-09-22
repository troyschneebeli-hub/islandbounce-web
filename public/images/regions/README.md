# Region cover photos

Drop a real photo here for each active/upcoming region and the cover page's
region cards will use it automatically — no code changes needed. Until a
file exists at the expected path, the card falls back to that country's
real national flag (drawn as SVG in `components/Flags.js`), so nothing
breaks and nothing looks generic while a photo is missing.

## Expected filenames

- `indonesia.jpg`
- `philippines.jpg`
- `laos.jpg`

(Matches the `photo` path in `data/regions.js` — change both together if you
rename.)

## Where to get real photos you can actually use

Don't pull images from a Google/web search and drop them in — that's someone
else's copyrighted photography, and reusing it on a commercial site without
a license is a real legal problem, not just a formality.

Options that are actually fine:

1. **Your own photos**, once you or a contractor have real, on-the-ground
   shots. This is the best long-term option and matches the project's own
   "verified vs. researched" trust rule — real photos of real places you
   know, not stock imagery.
2. **Licensed royalty-free stock**, e.g. Unsplash or Pexels. Both offer free
   commercial-use licenses for most photos — check the specific photo's
   license terms (a few require attribution), download it, and place it
   here directly rather than hotlinking to their site.
3. **Paid stock** (Adobe Stock, Getty, Shutterstock) if you want something
   specific and are willing to pay for full commercial rights.

## Suggested crop

Cards render at roughly a 3:1.4 landscape ratio (`object-fit: cover`, so the
image will crop to fill — a wide landscape shot with the subject centered
works best). Recommended source resolution: at least 1200px wide.
