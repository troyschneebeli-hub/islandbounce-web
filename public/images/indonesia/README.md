# Indonesia hub photo strip

Drop real photos here and the Indonesia hub page's photo strip
(`components/PhotoStrip.js`) will use them automatically — no code changes
needed. Until a file exists at the expected path, each tile falls back to a
simple illustrated placeholder, so nothing looks broken or generic while
photos are missing.

## Expected filenames

- `bali.jpg` — Bali (temple/hills placeholder currently)
- `gilis.jpg` — The Gili Islands (beach placeholder currently)
- `harbor.jpg` — Getting there / a port or boat (boat placeholder currently)

## Where to get real photos you can actually use

Same rule as `public/images/regions/README.md` — don't pull images from a
Google/web search and drop them in. That's someone else's copyrighted
photography, and reusing it on a commercial site without a license is a
real legal problem, not a formality.

1. **Your own photos**, once you or a contractor have real, on-the-ground
   shots — best option, matches the project's "verified vs. researched"
   trust rule.
2. **Licensed royalty-free stock** (Unsplash, Pexels) — check each photo's
   specific license terms, download it, place it here directly.
3. **Paid stock** (Adobe Stock, Getty, Shutterstock) for something specific.

## Suggested crop

Tiles render at roughly a 4:3 ratio (`object-fit: cover`, crops to fill) —
a photo with the subject reasonably centered works best. At least 1000px
wide recommended.
