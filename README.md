# Nischay Robotics

Marketing site for Nischay Robotics — an independent robotics lab in Bengaluru
building modular, shape-changing robots and **Tetrobot**, a graph-native
robotics runtime.

Single-page React app. Static build, deploys anywhere.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/
npm run preview    # serve the built site locally
```

Node 20+ required (built on Node 22).

---

## Things to swap in later

Everything the site *says* lives in **`src/content/site.ts`**. You almost never
need to touch a component to change copy. Search that file for `TODO:` — these
are the placeholders waiting on you:

| What | Where | Notes |
|---|---|---|
| ~~Logo~~ | — | ✅ Done — the gold faceted star. See "Icons & social card" below if you ever change it. |
| **Video IDs** | `videos` in `site.ts` | Send me the part after `youtu.be/`. Three slots are currently "coming soon" tiles. |
| **YouTube channel URL** | `links.youtube` | Currently a guess — replace with your real channel URL. |
| **Tetrobot docs** | `links.docs` | `null` renders a disabled "Docs — coming soon" button instead of a dead link. Set a URL and the button activates itself. |
| ~~Social preview image~~ | — | ✅ Done — `public/og-image.jpg`, generated from the logo. |
| **Domain** | `index.html` + `seo.url` | Currently `nischayrobotics.com`. Update the canonical, `og:url` and JSON-LD if it differs. |
| **Company email** | `contact.email` | Personal address for now; swap if you register a company one. |

---

## ⚠️ Back up `visuals/`

The `visuals/` folder holds your **original camera masters** — 21 photos at
4000×3000 and the 24MB phone capture of the rolling demo. It is **gitignored on
purpose**: 81MB of masters would live in the git history forever and get
re-downloaded on every clone, and free hosts would deploy them.

**That means they exist only on this machine.** Keep your own backup
(Drive, an external disk — anywhere but here).

What the site actually ships is the optimised set in `public/visuals/`, which
*is* committed:

| Asset | From | To |
|---|---|---|
| `cfg-01…21.jpg` | 4000×3000, ~2.6MB each | 1600px, ~210KB each |
| `cfg-01…21-thumb.jpg` | — | 700px, ~50KB each |
| `shape-shift.webm` | 24.3MB H.264 mp4 | 7.7MB VP9, same 1280×720 |
| `shape-shift-poster.jpg` | frame at 2s | 99KB |

57MB of photos became 5.5MB. The video is only fetched when someone presses
play (`preload="none"`), so the poster is all most visitors ever load.

**To add more photos:** drop them in `visuals/`, resize to ~1600px with any
image editor, save into `public/visuals/` as the next `cfg-NN.jpg` (plus a
700px `-thumb`), then add an entry to `configurations` in
`src/content/site.ts` — slug, family, title, note. The gallery, the filters and
all the counts update themselves.

**Browser note on the clip:** it ships as VP9 WebM only. That covers Chrome,
Edge, Firefox, Safari 14.1+ on macOS and iOS 17.4+. Anything older shows the
poster frame instead of playing — no broken UI, just a still.

---

## Icons & social card

`public/icon.png` (888×888, transparent) and `public/icon.ico` (7 sizes) are the
source art. **Neither is referenced by the site** — both are ~355KB, far too
heavy to ship as a favicon. They stay in the repo as the masters.

What actually ships is generated from them: `icon-{32,48,96,192,256,512}.png`,
cropped to the star's bounding box and downscaled, plus `og-image.jpg`
(1200×630, 73KB) for social previews.

**If you replace the logo**, drop the new art in as `public/icon.png` and
regenerate the set — any image editor or online resizer will do, as long as you
produce the same filenames. Then check `src/components/ui/Logo.tsx`, which
points at `icon-96.png` with `srcSet` for denser displays.

---

## What's where

```
src/
├─ content/site.ts          ← ALL copy, links, projects, videos. Start here.
├─ index.css                ← design tokens + the glass material
├─ App.tsx                  ← page composition
├─ sections/                ← one file per band of the page
│  ├─ Nav · Hero · Pillars · Configurations · Tetrobot · Projects
│  └─ Prototypes · Recognition · Founder · Collaborate · Footer
├─ components/
│  ├─ GraphVsTree.tsx       ← the interactive graph-vs-tree diagram
│  ├─ ConfigGallery.tsx     ← auto-cycling shape gallery + lightbox
│  ├─ VideoPlayer.tsx       ← the shared lightbox player (useVideoPlayer)
│  ├─ background/           ← WebGL droplet field (shader + R3F canvas)
│  ├─ svg/Filters.tsx       ← refraction + gooey SVG filters
│  └─ ui/                   ← Logo, buttons, glass cards, scroll reveal
├─ hooks/useEnvironment.ts  ← reduced-motion, WebGL probe, render tier
└─ lib/scroll.ts            ← Lenis smooth scroll + jump-to-section
```

---

## The design system

Yellow-led iridescent glass on near-black. Tokens are defined once in
`src/index.css` under `@theme` and generate Tailwind utilities automatically
(`text-gold`, `bg-ink`, `font-display`, …).

| Token | Value | Role |
|---|---|---|
| `--color-void` | `#06050A` | page base |
| `--color-ink` | `#0B0910` | glass substrate |
| `--color-gold` | `#FFC93C` | primary — the brand colour |
| `--color-sun` / `--color-ember` | `#FFE58A` / `#FF9A1F` | gold highlight / shadow |
| `--color-aqua` `--color-iris` `--color-bloom` `--color-zest` | — | iridescent accents |

Three glass tiers — `.glass`, `.glass-strong`, `.glass-soft` — each a light
gradient over a **dark substrate**. The substrate matters: droplets drift
behind these panels, and without a tint of their own the text would go
unreadable every time a bright droplet passed underneath.

### The background

Four stacked layers:

1. **Droplet field** — raymarched signed-distance-function metaballs in a
   fragment shader. Spheres blended with a smooth minimum, so they *merge*
   like liquid rather than intersecting like solids. A trail of shrinking
   spheres chases the pointer.
   ([technique](https://tympanus.net/codrops/2025/06/09/how-to-create-interactive-droplet-like-metaballs-with-three-js-and-glsl/))
2. **Aurora** — CSS blurred gradient fields, slowly drifting. Pure CSS, always
   present, so the page looks deliberate even with no WebGL at all.
3. **Liquid glass** — `backdrop-filter` blur + a gradient rim drawn with the
   mask-composite trick, plus optional SVG refraction (see caveat below).
4. **Gooey** — `feGaussianBlur` → `feColorMatrix` alpha `18 / -7`, which snaps
   blurred alpha back to a hard edge so separate circles fuse into one blob.
   ([technique](https://css-tricks.com/gooey-effect/))

**Browser caveat:** SVG filters as a `backdrop-filter` input work in **Chromium
only** — Safari and Firefox restrict `backdrop-filter` to built-in CSS filter
functions. The refraction is therefore gated behind `@supports` and degrades to
blur + specular highlights, which looks excellent everywhere. Nothing breaks.

### Performance

`useRenderTier()` picks one of three levels at runtime:

- **`none`** — no WebGL2, or the OS asks for reduced motion. The Three.js
  bundle is never even downloaded; the CSS aurora carries the background.
- **`low`** — coarse pointer, small screen or ≤4 CPU cores. Fewer raymarch
  steps, lower pixel ratio, shorter pointer trail.
- **`high`** — desktop with a real pointer.

Three.js is lazy-loaded, so it never blocks first paint. Rendering stops
entirely when the tab is hidden. `prefers-reduced-motion` also disables the
inertial scroll.

---

## Deploying

The build output is plain static files in `dist/` — any host works.

**Vercel / Netlify** (recommended): push to GitHub, import the repo. Both
auto-detect Vite. Build command `npm run build`, output directory `dist`.

**GitHub Pages**: if serving from `https://<user>.github.io/<repo>/` rather than
a root domain, set `base: '/<repo>/'` in `vite.config.ts` first, then publish
`dist/`.

---

## Accessibility notes

- Every decorative layer is `aria-hidden`; the page reads correctly without it.
- `prefers-reduced-motion` stops animation, drops the WebGL layer and disables
  smooth scrolling.
- Video tiles are real `<button>`s, keyboard-operable, and load no YouTube
  JavaScript (or cookies) until clicked.
- Focus rings are gold and visible on every interactive element.
