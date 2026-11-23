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
| **Discord invite** | `links.discord` | `null` shows "Discord opening soon". Paste a never-expiring invite and the Community band, footer link and waitlist-success prompt all go live. |

---

## Waitlist backend

**It already works with zero setup.** Until Firebase is connected, the form
collects everything and opens a prefilled email to `nischaysai35@gmail.com`.
Nothing is lost — you can ship today and wire the database up later.

With Firebase connected, signups are written to Firestore instead, and you read
them at **`/#/admin`** rather than in a notebook.

### Setting up Firebase (about five minutes)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Build → Firestore Database → Create database**. Start in *production* mode
   (the rules in this repo replace the defaults).
3. **Build → Authentication → Sign-in method → Google → Enable.** This is only
   so *you* can read the list; buyers never sign in.
4. **Project settings → Your apps → Web app** (`</>`). Copy the config values.
5. `cp .env.example .env` and paste them in.
6. Push the security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add          # pick the project you just made
   firebase deploy --only firestore:rules
   ```
7. `npm run build && npm run preview`, submit a test signup, then open
   `/#/admin` and sign in with `nischaysai35@gmail.com`.

**Step 6 is not optional.** Without it Firestore keeps its default rules, which
either block every write or (in test mode) let anyone on the internet read every
customer's email address.

### How it's secured

The Firebase config in `.env` is **public** — Vite compiles it into the
JavaScript and anyone can read it. That is normal and expected; those values are
identifiers, not secrets. The actual protection is `firestore.rules`:

- **Anyone can create** a waitlist document, but only in an exact validated
  shape — every field type- and length-checked, no extra fields, timestamp
  forced to the server clock.
- **Only `nischaysai35@gmail.com` can read.** Without this, one signup could
  list every other customer's email.
- **Nothing can be updated or deleted** from a browser, not even by you.
  Corrections happen in the Firebase console, deliberately.

To change the admin address, edit it in **both** `firestore.rules` and
`src/lib/firebase.config.ts`, then redeploy the rules. The rules file is the one
that actually enforces it.

### Signup emails (EmailJS — free, no card)

Each signup sends **two emails**: one to you with every field (hit *Reply* and
you're answering the subscriber), and a confirmation to the subscriber. They go
out through [EmailJS](https://www.emailjs.com), sending from your own Gmail.
The free plan is 200 emails a month, which is 100 signups, with no card needed.
Firebase's own email extension needs the Blaze plan.

Order of operations: save to Firestore first, then email. If the Firestore
write is rejected, **no** confirmation goes out for a signup that was never
saved. If Firebase isn't set up at all, the admin email *is* the record.

1. Sign up at emailjs.com → **Email Services → Add New Service → Gmail** →
   connect `nischaysai35@gmail.com`. Copy the **Service ID**.
2. **Email Templates → Create New Template** — the **admin** one:
   - *To Email:* `nischaysai35@gmail.com`  ·  *Reply To:* `{{email}}`
   - *Subject:* `New waitlist signup — {{product}}`
   - *Content:*
     ```
     {{name}} <{{email}}> joined the waitlist.

     Product:      {{product}}
     Quantity:     {{quantity}}
     Organisation: {{organisation}}
     Country:      {{country}}

     {{message}}

     All signups: {{admin_url}}
     ```
   Save, copy its **Template ID**.
3. Create the second template, the **confirmation**:
   - *To Email:* `{{email}}`  ·  *From Name:* `Nischay Robotics`  ·  *Reply To:* `nischaysai35@gmail.com`
   - *Subject:* `You're on the Nischay Robotics waitlist`
   - *Content:*
     ```
     Hi {{name}},

     Thanks for joining the waitlist for the {{product}}. You'll hear from me
     directly the moment it's ready to ship, and nothing before that.

     If you left a note, I'll reply to it personally. You can also just reply
     to this email.

     — Nischay
     Nischay Robotics, Bengaluru
     ```
   Save, copy its **Template ID**.
4. **Account → General** → copy the **Public Key**.
5. Put all four in `.env` (`VITE_EMAILJS_*`, see `.env.example`), and in your
   host's environment variables if it builds for you.
6. **Account → Security**: turn on whatever origin/domain restriction and rate
   limit your plan offers, so the key only works from your site.

Variables available in both templates: `name`, `email`, `product`, `quantity`,
`organisation`, `country`, `message`, `admin_url`.

### The admin page

`/#/admin` is where the full list lives, and it is built to work as a
notification channel as well:

- **Live.** It subscribes with `onSnapshot`, so a signup appears while you're
  looking at it. No refresh.
- **Unread count in the tab title** — `(3) Waitlist — Nischay Robotics`. Pin the
  tab and the tab itself is the notification.
- **"New since you last looked"**, tracked in local storage per browser, with new
  rows highlighted until you press *Mark as seen*.
- Stats, search across every field, filter by product, CSV export.
- Table on desktop, cards on a phone — because that's where you'll actually
  check it.

If you outgrow EmailJS's 200/month, the Firebase **"Trigger Email from
Firestore"** extension is the next step. It needs the **Blaze** plan.

### Where the pieces live

| File | Role |
|---|---|
| `src/lib/firebase.config.ts` | env values + `isFirebaseConfigured`. **No SDK code** — importing it costs nothing. |
| `src/lib/firebase.ts` | SDK init. **Dynamic-import only** — a static import anywhere puts ~200KB of Firebase in the initial bundle. |
| `src/lib/waitlist.ts` | Submit: Firestore → emails → mailto fallback. `LIMITS` mirrors the rules. |
| `src/lib/email.ts` | EmailJS REST client (no SDK). Best-effort; never fails a signup. |
| `src/components/WaitlistModal.tsx` | The form. |
| `src/pages/Admin.tsx` | `/#/admin` — sign in, read, export CSV. |
| `firestore.rules` | The only thing actually protecting the data. |

---

## Hosting: Firebase or Netlify?

**Recommendation — Firebase Hosting**, since you're already using Firebase for
data:

```bash
npm run build
firebase deploy
```

One project, one CLI, one dashboard. Your site's domain is automatically an
authorised domain for Google sign-in, so `/#/admin` just works. `firebase.json`
in this repo is already configured — `dist/` as the web root, SPA rewrites, and
cache headers (immutable for fingerprinted assets, revalidate for `index.html`).

**Netlify works too** — build `npm run build`, publish `dist`. Two things to
remember if you go that way:

1. Add your Netlify domain under **Firebase → Authentication → Settings →
   Authorized domains**, or Google sign-in on `/#/admin` fails.
2. Set the `VITE_FIREBASE_*` values in Netlify's environment variables — they're
   compiled at build time, so a missing one silently falls back to email mode.

Either way the Firestore database and rules live in Firebase. Hosting is the
only thing you're choosing between.

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

## Pages

| URL | What's on it | File |
|---|---|---|
| `/` | Hero, the three pillars, a card per page, Discord strip | `App.tsx` (`Home`) |
| `/modules` | Pricing, how the waitlist works, shipping | `sections/Products.tsx` |
| `/shapes` | Numbers, rolling clip, all configurations | `sections/Configurations.tsx` |
| `/tetrobot` | Graph vs tree, hardware proof, capabilities, status | `sections/Tetrobot.tsx` |
| `/prototypes` | Main demo and build videos | `sections/Prototypes.tsx` |
| `/company` | Founder, background, partnerships | `sections/Founder.tsx` |
| `/community` | Discord, every other channel | `sections/Community.tsx` |
| `/#/admin` | Waitlist admin (also `/admin`) | `pages/Admin.tsx` |

Every inner page uses `components/PageShell.tsx`: breadcrumb and title, a
sticky **side menu** of the page's sections (chips on phones), a call-to-action
card, and previous/next links. To add a section, add a `<Block id="…">` and an
entry in that page's `SECTIONS`. To add a page, add it to `pages` in
`site.ts` (nav, footer, home cards and next/previous all follow) and to
`ROUTES` in `App.tsx`.

Routing is hand-rolled in `lib/router.ts` — real paths, no library. Both hosts
send unknown paths to `index.html` (`firebase.json` rewrites,
`netlify.toml` redirect), so a refresh or a shared link always works. Deep
links to a section work too: `/tetrobot#capabilities`.

## What's where

```
src/
├─ content/site.ts          ← ALL copy, links, pages, products. Start here.
├─ index.css                ← design tokens + the glass material
├─ App.tsx                  ← routes, Home, 404
├─ sections/                ← one file per page (plus Nav · Hero · Pillars ·
│                              Explore · Footer)
├─ components/
│  ├─ PageShell.tsx         ← shared inner-page frame + side menu
│  ├─ GraphVsTree.tsx       ← the interactive graph-vs-tree diagram
│  ├─ ConfigGallery.tsx     ← auto-cycling shape gallery + lightbox
│  ├─ VideoPlayer.tsx       ← the shared lightbox player (useVideoPlayer)
│  ├─ background/           ← WebGL droplet field (shader + R3F canvas)
│  ├─ svg/Filters.tsx       ← refraction + gooey SVG filters
│  └─ ui/                   ← Logo, Link, SocialIcons, buttons, glass, reveal
├─ hooks/useEnvironment.ts  ← reduced-motion, WebGL probe, render tier
└─ lib/                     ← router, scroll (Lenis), waitlist, email, firebase
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
