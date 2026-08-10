/* ============================================================================
   SITE CONTENT — single source of truth.
   Everything the site says lives here. Components render it; they don't own it.

   ┌────────────────────────────────────────────────────────────────────────┐
   │  PLACEHOLDERS TO SWAP LATER — search for "TODO:" in this file.         │
   │   1. links.docs        — Tetrobot docs, once written                   │
   │   2. links.youtube     — your channel URL                              │
   │   3. videos[1..]       — YouTube IDs for the other prototype clips     │
   │   4. contact.email     — swap to a company address if you register one │
   │  The logo mark lives in src/components/ui/Logo.tsx (one file, one SVG).│
   └────────────────────────────────────────────────────────────────────────┘
   ========================================================================= */

export const company = {
  name: 'Nischay Robotics',
  short: 'NR',
  founded: 2026,
  location: 'Bengaluru, Karnataka, India',
  descriptor: 'Independent robotics lab',
  tagline: 'Robots that change their own shape.',
} as const

export const links = {
  github: 'https://github.com/NischaySai35',
  githubTetrobot: 'https://github.com/NischaySai35/Tetrobot_robotic_arm',
  githubEarthVision: 'https://github.com/NischaySai35/EarthVision',
  linkedin: 'https://www.linkedin.com/in/nischaysai35',
  youtube: 'https://www.youtube.com/@nischaysai35',
  // TODO: point at real docs once they exist. `null` renders the button as
  // "Docs — coming soon" and disables it, rather than shipping a dead link.
  docs: null as string | null,
} as const

export const contact = {
  email: 'nischaysai35@gmail.com',
  phone: '+91 8147447343',
} as const

/* -- Hero ------------------------------------------------------------------ */

export const hero = {
  eyebrow: 'Independent robotics lab · Bengaluru',
  titleLines: ['Robots that', 'change their', 'own shape.'],
  body: 'Nischay Robotics builds modular, self-reconfiguring machines — and Tetrobot, the graph-native runtime that lets them think in topologies instead of trees.',
  stats: [
    { value: 'Patent', label: 'pending — MICROBOTS' },
    { value: '1st', label: 'runner-up, Techgium 9th Ed.' },
    { value: '9.2', label: 'CGPA, ISE @ RNSIT' },
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

/* -- Projects -------------------------------------------------------------- */

export type Project = {
  id: string
  name: string
  subtitle: string
  year: string
  status?: string
  body: string
  tags: readonly string[]
  /** Opens in the lightbox player rather than navigating away. */
  videoId?: string
  videoLabel?: string
  href?: string
  hrefLabel?: string
  accent: 'gold' | 'aqua' | 'iris' | 'bloom' | 'zest'
}

export const projects: readonly Project[] = [
  {
    id: 'microbots',
    name: 'MICROBOTS',
    subtitle: 'Shape-changing swarm robotics',
    year: '2025 →',
    status: 'Patent pending',
    body: 'A modular swarm system where small interconnected units transform collectively into different structures. Built around adaptive geometry, collective movement and reconfigurable connections between units.',
    tags: ['Swarm', 'Modular hardware', 'Patent pending'],
    videoId: '5Z3qYwFF2VI',
    videoLabel: 'Watch the demo',
    accent: 'gold',
  },
  {
    id: 'tetrobot-arm',
    name: 'TETROBOT',
    subtitle: 'Modular flexible robotic arm',
    year: '2025 →',
    status: '1st runner-up · Techgium 9th Edition',
    body: 'A robotic arm assembled from repeating modules, with flexible extension, self-locking mechanisms and a reconfigurable hardware architecture. Wireless control interface built as a web app.',
    tags: ['Manipulator', 'Self-locking', 'Wireless control'],
    videoId: '7i2y1PvKCtw',
    videoLabel: 'Watch it run',
    href: 'https://github.com/NischaySai35/Tetrobot_robotic_arm',
    hrefLabel: 'Source',
    accent: 'aqua',
  },
  {
    id: 'gravity-light',
    name: 'Gravity Light',
    subtitle: 'Gravity-powered lighting prototype',
    year: '2024',
    status: 'Best Project · Physics Open House',
    body: 'A lighting prototype driven by a descending mass instead of a battery — potential energy converted to usable light through a geared generator stage. A study in doing more with less power.',
    tags: ['Energy', 'Mechanical design', 'Prototype'],
    accent: 'zest',
  },
  {
    id: 'earthvision',
    name: 'EarthVision',
    subtitle: 'NASA Space Apps Challenge',
    year: '2024',
    body: "An Earth-observation viewer built on NASA's GIBS satellite imagery service — tiled layers, a time slider across dates, opacity control and split-view comparison for reading change over time.",
    tags: ['NASA GIBS', 'Geospatial', 'Web'],
    href: 'https://github.com/NischaySai35/EarthVision',
    hrefLabel: 'Source on GitHub',
    accent: 'iris',
  },
] as const

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

/* -- Recognition ----------------------------------------------------------- */

export const recognition = [
  {
    award: 'Winner — Maverick',
    org: "RNSIT's Real SharkTank",
    note: 'Patent pending outcome',
    highlight: true,
  },
  {
    award: '1st Runner-up — Techgium 9th Edition',
    org: 'L&T Technology Services · National level',
    note: 'Modular robotic arm',
    highlight: true,
    videoId: '7i2y1PvKCtw',
  },
  { award: '1st Prize — VIGNYANOTSAV', org: 'Innovative physics ideas', note: '' },
  { award: '3rd Prize — Sci-Fi IdeaTank', org: 'Concept engineering', note: '' },
  {
    award: 'Best Project — Physics Open House',
    org: 'RNS Institute of Technology',
    note: 'Gravity Light prototype',
  },
  {
    award: '3rd Prize — National AI Hackathon',
    org: 'PESITM',
    note: '',
  },
] as const

/* -- Founder --------------------------------------------------------------- */

export const founder = {
  name: 'Nischay Sai D R',
  role: 'Founder · Nischay Robotics',
  dayJob: {
    title: 'Robotics Intern',
    org: 'NTT DATA',
    period: 'July 2026 — present',
    points: [
      'Integrating Vision-Language Models with a Fanuc industrial arm for natural-language-driven perception and task understanding.',
      'Built a ROS 2 Humble + Isaac ROS simulation pipeline on Ubuntu, bridging Isaac Sim to real Fanuc control workflows.',
      'Working across the Isaac Sim (x86_64 + RTX) / Isaac ROS (edge) split to prototype sim-to-real behaviour pipelines.',
    ],
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

export const collaborate = {
  kicker: 'The ask',
  headline: "I've taken this as far as a desk allows.",
  body: "Everything here was designed, printed, wired and written by one student, self-funded, at home. The ideas have outgrown the workshop. I'm looking for people and institutions who can help turn working prototypes into real machines.",
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

/* -- Navigation ------------------------------------------------------------ */

export const navItems = [
  { id: 'work', label: 'Work' },
  { id: 'tetrobot', label: 'Tetrobot' },
  { id: 'projects', label: 'Projects' },
  { id: 'prototypes', label: 'Prototypes' },
  { id: 'founder', label: 'Founder' },
] as const

export const seo = {
  title: 'Nischay Robotics — Robots that change their own shape',
  description:
    'An independent robotics lab in Bengaluru building modular, self-reconfiguring machines and Tetrobot, a graph-native robotics runtime for robots whose body changes at runtime.',
  url: 'https://nischayrobotics.com',
} as const
