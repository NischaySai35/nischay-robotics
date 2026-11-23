/* ============================================================================
   SITE CONTENT — single source of truth.
   Everything the site says lives here. Components render it; they don't own it.

   ┌────────────────────────────────────────────────────────────────────────┐
   │  PLACEHOLDERS TO SWAP LATER — search for "TODO:" in this file.         │
   │   1. links.docs        — Tetrobot docs, once written                   │
   │   2. videos[1..]       — YouTube IDs for the other prototype clips     │
   │   3. contact.email     — swap to a company address if you register one │
   │  The logo mark lives in src/components/ui/Logo.tsx (one file, one SVG).│
   └────────────────────────────────────────────────────────────────────────┘
   ========================================================================= */

export const company = {
  name: 'Nischay Robotics',
  short: 'NR',
  founded: 2026,
  location: 'Bengaluru, Karnataka, India',
  descriptor: 'Modular shape-changing robotics',
  tagline: 'Robots that change their own shape.',
} as const

export const links = {
  github: 'https://github.com/NischaySai35',
  githubTetrobot: 'https://github.com/NischaySai35/Tetrobot_robotic_arm',
  linkedin: 'https://www.linkedin.com/in/nischaysai35',
  youtube: 'https://www.youtube.com/channel/UCAeIffBz9DDeHo-DKEr1x7g',
  instagram: 'https://www.instagram.com/nischay_sai_35',
  x: 'https://x.com/sai_nischay',
  // wa.me needs the full international number with no "+", spaces or leading 0.
  whatsapp: 'https://wa.me/918147447343',
  // TODO: point at real docs once they exist. `null` renders the button as
  // "Docs — coming soon" and disables it, rather than shipping a dead link.
  docs: null as string | null,
  // Permanent invite (never expires) into #welcome. Set to `null` and every
  // "Join the Discord" button renders as "opening soon" instead.
  discord: 'https://discord.gg/XuX7EaHkw2' as string | null,
} as const

export const contact = {
  email: 'nischaysai35@gmail.com',
  phone: '+91 8147447343',
} as const

/* -- Hero ------------------------------------------------------------------ */

export const hero = {
  eyebrow: 'Modular shape-changing robotics · Bengaluru',
  titleLines: ['Robots that', 'change their', 'own shape.'],
  body: 'We build modular robots that rebuild themselves — a walker becomes an arm becomes a rolling vehicle, from the same parts. Modules and developer kits are releasing soon, running on Tetrobot, our graph-native runtime.',
  stats: [
    { value: '₹29,999', label: 'per module · kits from ₹1,10,000' },
    { value: '21', label: 'configurations from one hardware set' },
    { value: 'Patent', label: 'pending — shape-changing system' },
  ],
} as const

/* -- Pillars --------------------------------------------------------------- */

export const pillars = [
  {
    id: 'swarm',
    index: '01',
    title: 'Shape-changing swarms',
    body: 'Interconnected microbot units that latch, release and re-latch to become a different machine. Collective movement, adaptive structures, one hardware set with many bodies.',
    accent: 'gold',
  },
  {
    id: 'modular',
    index: '02',
    title: 'Modular manipulators',
    body: 'Robotic arms built from repeating segments with flexible extension and self-locking joints. Add modules for reach, remove them for a tighter envelope — same controller either way.',
    accent: 'aqua',
  },
  {
    id: 'software',
    index: '03',
    title: 'Graph-native software',
    body: 'Tetrobot treats a robot as a live graph of modules and latches, not a fixed kinematic tree. Reconfiguration becomes a graph edit instead of a restart.',
    accent: 'iris',
  },
] as const

/* -- Tetrobot: the differentiator ------------------------------------------ */

export const tetrobot = {
  name: 'Tetrobot',
  kicker: 'The software',
  nameNote: 'working name — subject to change',
  headline: 'A tree cannot describe a robot that rebuilds itself.',
  intro:
    'Conventional robotics stacks describe a machine as a kinematic tree: one root, and every link with exactly one parent, fixed the moment the description is loaded. That is a fine model for an arm bolted to a floor. It is the wrong model for a robot whose body is not decided yet.',
  problem: {
    title: 'What a tree assumes',
    points: [
      'One permanent root, chosen before the robot ever moves.',
      'Every link has exactly one parent — so no closed loops.',
      'The structure is fixed at load time and never changes.',
    ],
  },
  solution: {
    title: 'What a shape-changer actually does',
    points: [
      'Modules join and leave while the robot is running.',
      'Modules latch to each other, closing kinematic loops.',
      'Any module can become the base — the root moves.',
    ],
  },
  capabilities: [
    {
      title: 'Dynamic topology',
      body: 'Modules hot-join and drop out at runtime. The graph is rewritten in place; nothing respawns, nothing reloads.',
    },
    {
      title: 'Cycles are first-class',
      body: 'When modules latch into a ring, the closed loop is a legal state — not a validation error to be worked around.',
    },
    {
      title: 'Floating root',
      body: 'No baked base frame. Whichever module is anchored right now is the root, and transforms resolve relative to it per query.',
    },
    {
      title: 'Morphology as data',
      body: 'A target shape is a graph state. Getting there is a solved sequence of node and edge transitions — planning over structure, not just over joint angles.',
    },
  ],
  status:
    'Early and in active development. Earlier working versions — including the wireless control interface for the modular arm — are already public on GitHub.',
} as const

/* -- Prototype videos ------------------------------------------------------
   `id` is the YouTube video ID. Thumbnails are pulled from YouTube's CDN, and
   the player iframe only loads on click — so the page carries no YouTube
   JavaScript until someone actually asks to watch something.
   Add more entries as you upload; the grid reflows on its own.             */

export type Video = {
  /** YouTube video ID — the part after `youtu.be/`. `null` renders a "coming soon" tile. */
  id: string | null
  title: string
  caption: string
  /** Renders full-width at the top of the grid. Exactly one should be featured. */
  featured?: boolean
}

export const videos: readonly Video[] = [
  {
    id: '5Z3qYwFF2VI',
    title: 'Shape-changing modular robots',
    caption: 'Transformable robotic units reconfiguring into new bodies — the main demo',
    featured: true,
  },
  {
    id: '7i2y1PvKCtw',
    title: 'Solo-built modular robotic arm',
    caption: '2nd place at L&T Techgium — designed, printed and wired alone',
  },
  {
    id: 'v6UweSmTuP4',
    title: 'Early shape-morphing prototype',
    caption: 'Where the latching mechanism started',
  },
  // TODO: send more IDs as you upload and they slot straight into the grid.
] as const

/** The one video to lead with — hero CTA, and the featured tile. */
export const featuredVideo = videos.find((v) => v.featured) ?? videos[0]

/* -- Configurations --------------------------------------------------------
   Every photo below is the SAME two module chains, rebuilt into a different
   body. Nothing was added between shots — that's the entire point, and it is
   the strongest evidence on the site. Images live in public/visuals/, resized
   from the 4000x3000 originals (see README).                                */

export type Family = 'loop' | 'walker' | 'reach' | 'arch' | 'serpentine' | 'tower'

export const families: Record<Family, { label: string; blurb: string }> = {
  loop: {
    label: 'Closed loops',
    blurb: 'Head latched to tail. A kinematic tree cannot represent these at all.',
  },
  walker: { label: 'Walkers', blurb: 'Multiple ground contacts from a single pair of chains.' },
  reach: { label: 'Reach', blurb: 'One chain anchored, the other working above it.' },
  arch: { label: 'Arches', blurb: 'Both ends anchored, load path closing through the floor.' },
  serpentine: { label: 'Serpentine', blurb: 'Low, continuous curves for crawling and squeezing.' },
  tower: { label: 'Towers', blurb: 'Stacked vertically, standing on the smallest possible base.' },
}

export type Configuration = {
  slug: string
  family: Family
  title: string
  note: string
  /** Portrait source; the grid reserves a taller cell for these. */
  portrait?: boolean
  /** Called out elsewhere on the page as hardware proof of the graph model. */
  keystone?: boolean
}

export const configurations: readonly Configuration[] = [
  { slug: 'cfg-01', family: 'reach', title: 'Manipulator over a chassis', note: 'One chain anchored flat as a base, the other working above it.' },
  { slug: 'cfg-02', family: 'reach', title: 'Overhead reach', note: 'Vertical extension from a low, stable anchor.' },
  { slug: 'cfg-03', family: 'arch', title: 'Braced arch', note: 'Raised span with the body flat behind it for counterweight.' },
  { slug: 'cfg-04', family: 'reach', title: 'High vertical reach', note: 'Near-full extension straight up from the base chain.' },
  { slug: 'cfg-05', family: 'reach', title: 'Crane stance', note: 'Base chain wide, working chain lifted and cantilevered.' },
  { slug: 'cfg-06', family: 'serpentine', title: 'Low crawler', note: 'Flat profile — the shape for getting underneath things.' },
  { slug: 'cfg-07', family: 'loop', title: 'Rectangular frame', note: 'Two chains latched at both ends. A closed loop, not a tree.' },
  { slug: 'cfg-08', family: 'loop', title: 'Chassis frame, head-on', note: 'The same closed frame seen down its axis.' },
  { slug: 'cfg-09', family: 'walker', title: 'Quadruped stance', note: 'Four ground contacts built from two chains.' },
  { slug: 'cfg-10', family: 'walker', title: 'Wide quadruped', note: 'Stance widened for stability over speed.' },
  { slug: 'cfg-11', family: 'walker', title: 'Arched walker', note: 'Body lifted clear of the ground between contact points.' },
  { slug: 'cfg-12', family: 'tower', title: 'Standing column', note: 'Balanced vertically on a base the width of one module.', portrait: true },
  { slug: 'cfg-13', family: 'arch', title: 'Raised head, braced body', note: 'Sensor-forward posture with the mass kept low and back.' },
  { slug: 'cfg-14', family: 'tower', title: 'Full-height tower', note: 'Every module stacked — the tallest the pair will stand.', portrait: true },
  { slug: 'cfg-15', family: 'reach', title: 'Maximum extension', note: 'Every joint straight. The longest span these modules allow.' },
  { slug: 'cfg-16', family: 'reach', title: 'Extended diagonal', note: 'Full length, angled across the floor.' },
  { slug: 'cfg-17', family: 'serpentine', title: 'S-curve', note: 'Opposing bends — the basis of serpentine locomotion.' },
  {
    slug: 'cfg-18',
    family: 'loop',
    title: 'Closed ring',
    note: 'Head latched to tail. This is the cycle a kinematic tree cannot express — and the reason Tetrobot models a graph instead.',
    keystone: true,
  },
  { slug: 'cfg-19', family: 'arch', title: 'Bridge span', note: 'Both ends anchored, spanning a gap under load.' },
  { slug: 'cfg-20', family: 'serpentine', title: 'Coil', note: 'Wound in on itself into the smallest footprint.' },
  { slug: 'cfg-21', family: 'serpentine', title: 'Serpentine crawl', note: 'Travelling wave posture, mid-stride.' },
] as const

export const keystoneConfig = configurations.find((c) => c.keystone) ?? configurations[0]

export const shapeShiftClip = {
  webm: '/visuals/shape-shift.webm',
  poster: '/visuals/shape-shift-poster.jpg',
  title: 'Rolling: four wheels, three, two',
  caption:
    'The same two chains reconfiguring on the floor into a four-wheeled vehicle, then three, then two — without a human touching them between shapes.',
  duration: '0:29',
}

export const configSection = {
  kicker: 'Evidence',
  headline: 'Two modules. Every one of these.',
  lead: 'Nothing was added between these photographs. The same two chains were rebuilt, by hand and by command, into every body below — walkers, arches, towers, closed rings, a rolling vehicle. This is the whole hardware set, and it is already out of shapes before I am out of ideas.',
  ask: 'If two modules do this, the interesting question is what twenty do. That is the part I cannot fund alone.',
}

/* -- Founder --------------------------------------------------------------- */

export const founder = {
  name: 'Nischay Sai D R',
  role: 'Founder · Nischay Robotics',
  current: {
    title: 'Robotics Engineer',
    period: 'Present',
  },
  education: {
    degree: 'B.E. Information Science & Engineering',
    org: 'RNS Institute of Technology',
    period: '2023 — present',
    note: 'CGPA 9.2',
  },
  bio: [
    'I build shape-changing robots at home. Not in a lab, not with a grant — on a desk in Bengaluru, with printed parts, salvaged motors and a lot of failed latches.',
    'The hardware taught me the software problem. Every existing stack wanted me to declare my robot\'s body up front and never change it, which is precisely the one thing my robots do. So I started writing my own runtime around a graph instead of a tree.',
    'Nischay Robotics is the name for that work as it grows past what one student can carry alone.',
  ],
  skills: [
    'ROS 2',
    'Isaac Sim / Isaac ROS',
    'ESP32 / Arduino',
    'BLDC & servo drives',
    'Python',
    'Fusion 360',
    'Blender',
    'AI + robotics integration',
    'Data structures & algorithms',
    'Electromagnetics',
  ],
} as const

/* -- Collaborate ----------------------------------------------------------- */

/* -- Partnerships ----------------------------------------------------------
   Deliberately NOT a headline band any more. Nischay Robotics reads as a
   company with a product; the incubation ask lives inside the company section,
   behind a disclosure, for the people who go looking for it.               */

export const collaborate = {
  kicker: 'Partnerships',
  headline: 'Working with us',
  body: "Nischay Robotics is early and independent. Everything on this page was designed, printed, wired and written in-house, self-funded — and every shape came out of exactly two modules, because two is what the budget allowed. The engineering is not the bottleneck. If you can help it scale, these are the ways in.",
  seeking: [
    {
      title: 'Incubation',
      body: 'A programme, an accelerator or a university lab willing to take on early hardware and give it a bench, mentorship and a runway.',
    },
    {
      title: 'Lab & fabrication access',
      body: 'Machining, better printers, motor test rigs, measurement equipment. Access beats ownership at this stage.',
    },
    {
      title: 'Funding',
      body: 'Grants, pre-seed or sponsored research to fund components, iteration and the patent process for MICROBOTS.',
    },
    {
      title: 'Collaborators',
      body: 'Engineers who find self-reconfiguring machines worth their evenings — controls, mechanical design, or the Tetrobot runtime itself.',
    },
    {
      title: 'Research partnership',
      body: 'Labs working in modular robotics, swarm systems or reconfigurable topology. I will happily be the smallest person in the room.',
    },
    {
      title: 'Hardware sponsorship',
      body: 'Actuators, controllers, materials, compute. Parts move this forward faster than almost anything else.',
    },
  ],
} as const

/* -- Products --------------------------------------------------------------
   Real prices. Deliberately no invented hardware specs — torque figures,
   battery life and materials are NOT listed because they are not finalised,
   and publishing numbers that later change is how a hardware company loses
   its first customers. Capability claims below are limited to behaviour that
   is demonstrated in the photographs and videos on this same page.

   USD figures are indicative, converted at ~₹95.2/$ (Aug 2026). INR is the
   price of record — update `usd` here if the rate moves materially.        */

export const currency = {
  inrPerUsd: 95.24,
  note: 'Indicative USD conversion. INR is the price of record.',
}

export type Product = {
  slug: string
  name: string
  tagline: string
  inr: number | null
  usd: number | null
  /** Shown struck through, for the kit's per-module saving. */
  compareInr?: number
  status: 'waitlist' | 'development'
  statusLabel: string
  summary: string
  includes: readonly string[]
  bestFor: readonly string[]
  accent: 'gold' | 'aqua' | 'iris'
  featured?: boolean
}

export const products: readonly Product[] = [
  {
    slug: 'module',
    name: 'Tetrobot Module',
    tagline: 'One unit. The smallest thing that changes shape.',
    inr: 29999,
    usd: 315,
    status: 'waitlist',
    statusLabel: 'Releasing soon',
    summary:
      'A single self-contained module: powered joints, a latching face on each end, and wireless control. On its own it bends, drives and latches. Chained with others it becomes whatever the task needs.',
    includes: [
      'One assembled module, tested and calibrated',
      'Latching interface on both ends',
      'Wireless control, driven from the Tetrobot runtime',
      'Getting-started guide and example configurations',
    ],
    bestFor: [
      'Adding reach or a degree of freedom to an existing chain',
      'Bench experiments with latching and reconfiguration',
      'Replacing or extending a kit you already own',
    ],
    accent: 'aqua',
  },
  {
    slug: 'kit',
    name: 'Developer Kit',
    tagline: 'Four modules — the point where it stops being a demo.',
    inr: 110000,
    usd: 1155,
    compareInr: 29999 * 4,
    status: 'waitlist',
    statusLabel: 'Releasing soon',
    summary:
      'Four modules and everything needed to run them together. Two modules already produce walkers, arches, towers, closed rings and a rolling vehicle — every shape documented on this page. Four is where the interesting morphologies begin.',
    includes: [
      'Four assembled modules, tested and calibrated',
      'Controller and power setup for running them as one body',
      'Tetrobot runtime with the documented configuration library',
      'Assembly, latching and reconfiguration documentation',
      'Direct support from the person who built them',
    ],
    bestFor: [
      'University and lab research into modular robotics',
      'Teaching reconfigurable systems with hardware, not slides',
      'Serious prototyping of task-specific morphologies',
    ],
    accent: 'gold',
    featured: true,
  },
  {
    slug: 'tool-tips',
    name: 'Tool Tips',
    tagline: 'End effectors for the chain: grip, sense, carry.',
    inr: null,
    usd: null,
    status: 'development',
    statusLabel: 'In development',
    summary:
      'Interchangeable tips that latch onto the end of a chain and give it a job — gripping, sensing, carrying. Still being designed. Join the list and you will hear first, and you will help decide which tip gets built first.',
    includes: [
      'Same latching interface as the modules',
      'Designed alongside the people who tell us what they need',
    ],
    bestFor: [
      'Anyone whose application needs the arm to actually hold something',
      'Telling us which tool matters most to you',
    ],
    accent: 'iris',
  },
] as const

export const productSection = {
  kicker: 'Modules',
  headline: 'Buy the parts. Build any body.',
  lead: 'Every configuration on this page came from the same modules — latched, released and relatched. They are being readied for release now. Join the list and you will be told the moment they ship, before anyone else.',
  shippingNote:
    'Built and shipped from Bengaluru, India. International shipping at launch — tell us your country when you join and it helps us plan.',
}

export const waitlist = {
  title: 'Join the waitlist',
  blurb:
    'No spam, no newsletter. One email when the modules are ready, and nothing else. Your details go to Nischay directly.',
  success: "You're on the list.",
  successBlurb:
    "You'll hear from me directly when the modules are ready to ship. If you added a note, I'll answer that too.",
  confirmationNote: 'A confirmation is on its way to your inbox — check spam if it hides.',
}

/* -- Community ------------------------------------------------------------- */

export const community = {
  kicker: 'Community & contact',
  headline: 'Build alongside us.',
  lead: 'The Discord is the front door — that is where questions get answered fastest and where everything lands first. Every other way to reach us is right beside it.',
  body: 'The Discord is where builds get shared, configurations get argued about, and early hardware news lands first. Ask the person who designed the modules anything, see work-in-progress before it ships, and help decide what gets built next.',
  points: [
    'Early looks at modules, kits and Tetrobot releases',
    'Share what you build — or what you wish you could',
    'Direct line to the founder, not a support queue',
  ],
  cta: 'Join the Discord',
  pending: 'Discord opening soon',
  othersTitle: 'Other ways to reach us',
}

/**
 * Every channel besides Discord, in the order they're listed. `icon` keys map
 * to components/ui/SocialIcons.tsx. Reorder or delete freely.
 */
export const channels = [
  { icon: 'mail', label: 'Email', handle: contact.email, href: `mailto:${contact.email}`, note: 'Orders, partnerships, press' },
  { icon: 'whatsapp', label: 'WhatsApp', handle: contact.phone, href: links.whatsapp, note: 'Quick questions' },
  { icon: 'linkedin', label: 'LinkedIn', handle: 'in/nischaysai35', href: links.linkedin, note: 'Company updates' },
  { icon: 'instagram', label: 'Instagram', handle: '@nischay_sai_35', href: links.instagram, note: 'Behind the build' },
  { icon: 'x', label: 'X', handle: '@sai_nischay', href: links.x, note: 'Short updates' },
  { icon: 'youtube', label: 'YouTube', handle: 'Demos & prototypes', href: links.youtube, note: 'Watch them move' },
  { icon: 'github', label: 'GitHub', handle: 'NischaySai35', href: links.github, note: 'Tetrobot code' },
] as const

export type ChannelIcon = (typeof channels)[number]['icon']

/* -- Navigation ------------------------------------------------------------ */

/**
 * Every page except Home, in nav order. Drives the top bar, the footer, the
 * cards on the home page and the next/previous links at the bottom of each
 * page. `image` is the home-page card cover (null = Discord tile).
 */
export const pages = [
  {
    path: '/modules',
    label: 'Modules',
    kicker: 'Modules & pricing',
    blurb: 'Single modules, the four-module Developer Kit and the tool tips in development: prices, what ships in the box, and how the waitlist works.',
    image: '/visuals/cfg-09-thumb.jpg',
  },
  {
    path: '/shapes',
    label: 'Shapes',
    kicker: 'Evidence',
    blurb: `${configurations.length} bodies rebuilt from the same two module chains, plus the clip of them rolling on four, three and two wheels.`,
    image: '/visuals/cfg-05-thumb.jpg',
  },
  {
    path: '/tetrobot',
    label: 'Tetrobot',
    kicker: 'The software',
    blurb: "Why a kinematic tree can't describe a robot that rebuilds itself, and the graph-native runtime built to do it instead.",
    image: '/visuals/cfg-18-thumb.jpg',
  },
  {
    path: '/prototypes',
    label: 'Prototypes',
    kicker: 'Build videos',
    blurb: 'The main shape-changing demo, the award-winning modular arm and the prototype where the latch began.',
    image: '/visuals/shape-shift-poster.jpg',
  },
  {
    path: '/company',
    label: 'Company',
    kicker: 'Company',
    blurb: 'Who builds this and how it started, plus the partnerships (incubation, lab access, funding) that would help it scale.',
    image: '/visuals/cfg-14-thumb.jpg',
  },
  {
    path: '/community',
    label: 'Community',
    kicker: 'Community & contact',
    blurb: 'Join the Discord, the main place to talk to us, or reach us by email, WhatsApp, LinkedIn and the rest.',
    image: null,
  },
] as const

export type PageInfo = (typeof pages)[number]

/** Look a page up by its path — immune to reordering `pages`. */
export const pageAt = (path: PageInfo['path']): PageInfo => pages.find((p) => p.path === path)!

/** Top bar: Home plus every page. */
export const navItems = [{ path: '/', label: 'Home' }, ...pages.map(({ path, label }) => ({ path, label }))] as const

export const seo = {
  title: 'Nischay Robotics — Robots that change their own shape',
  description:
    'An independent robotics lab in Bengaluru building modular, self-reconfiguring machines and Tetrobot, a graph-native robotics runtime for robots whose body changes at runtime.',
  url: 'https://nischayrobotics.com',
} as const
