// REUSE-CHECKED: catalog|shop|sku|review|rating|merchant -> only `products` in site.ts (3 module price cards); this wraps them and adds everything else the shop sells.

/* ============================================================================
   SHOP CATALOG — every product the site sells, and the store's policies.

   ┌────────────────────────────────────────────────────────────────────────┐
   │  TO ADD A PRODUCT: copy the EXAMPLE block at the bottom of `catalog`,  │
   │  fill it in, put its photos in public/products/<slug>/, push. The shop │
   │  grid, the product page, Google's product data, the sitemap and the    │
   │  Merchant Center feed all update on the next deploy — nothing else to  │
   │  touch.                                                                │
   └────────────────────────────────────────────────────────────────────────┘

   Products live in the repo, not in Firestore, on purpose: the build bakes
   each one into its own HTML page with its price and stock in it, which is
   what Google indexes most reliably. Reviews are the only shop data in
   Firestore, because customers write them (see lib/reviews.ts).

   This file is imported by the build (scripts/prerender.ts) as well as the
   app, so it must only use relative imports — no '@/'.
   ========================================================================= */

import { products as moduleProducts } from './site.ts'

/* -- Store policies ---------------------------------------------------------
   Shown on every product page and on the policy pages, AND sent to Google as
   shipping / return data. Google checks these against what the pages say, so
   change them here and nowhere else.

   Every order takes 2–4 days to prepare; shipping is India-wide only.     */

export const store = {
  currency: 'INR',
  /** Legal Metrology rules: the shown price must be the full price. */
  priceNote: 'Inclusive of all taxes',
  shipsFrom: 'Bengaluru, Karnataka, India',
  shipping: {
    /** Flat fee below the free-shipping threshold, in rupees. */
    fee: 79,
    freeAbove: 999,
    /** Business days to prepare (build, calibrate, test, pack) and hand to the courier. */
    handlingDays: [2, 4] as [number, number],
    /** Business days in transit inside India. */
    transitDays: [2, 7] as [number, number],
    /** India only, all states and union territories. */
    country: 'IN',
  },
  returns: {
    /** Days after delivery to ask for a return. */
    days: 7,
    /** Who pays return shipping when the item isn't faulty. */
    customerPaysReturnShipping: true,
  },
} as const

const rupees = (n: number) => '₹' + n.toLocaleString('en-IN')

export const SHOP_DESCRIPTION =
  'Buy assembled SO-101 robot arms for LeRobot, shape-changing Tetrobot modules and kits, and robot tool tips from Nischay Robotics, Bengaluru. Prices include all taxes; delivered across India.'

export const freeShippingLine = `Free shipping on orders over ${rupees(store.shipping.freeAbove)}`
export const deliveryLine = `Dispatched from Bengaluru in ${store.shipping.handlingDays.join('–')} days · delivered anywhere in India in ${store.shipping.transitDays.join('–')} business days`

/* -- Types ----------------------------------------------------------------- */

export type CategoryId = 'arms' | 'modules' | 'kits' | 'components' | 'tools' | 'accessories'

export const categories: Record<CategoryId, { label: string; blurb: string }> = {
  arms: { label: 'Robotic arms', blurb: 'Assembled, calibrated arms ready for teleoperation and AI.' },
  modules: { label: 'Shape-changing modules', blurb: 'The modules every shape on this site is built from.' },
  kits: { label: 'Kits', blurb: 'Everything needed to build, in one box.' },
  components: { label: 'Components', blurb: 'Motors, boards and parts we use and trust.' },
  tools: { label: 'Tools', blurb: 'For building and repairing robots.' },
  accessories: { label: 'Tool tips & accessories', blurb: 'Grippers, wheels and custom end effectors.' },
}

/**
 * - in_stock       → can be bought now
 * - out_of_stock   → listed, but not buyable right now
 * - preorder       → coming soon; visitors join the waitlist
 * - made_to_order  → built to the customer's spec; price on request
 */
export type Availability = 'in_stock' | 'out_of_stock' | 'preorder' | 'made_to_order'

/**
 * How someone buys it:
 * - link      → a real checkout page (a Razorpay Payment Page / Payment Link
 *               works well). Required for Google Shopping listings.
 * - whatsapp  → "Order on WhatsApp" with a prefilled message
 * - waitlist  → the site's waitlist form (pre-release products)
 */
export type Checkout =
  | { type: 'link'; url: string }
  | { type: 'whatsapp' }
  | { type: 'waitlist'; product: string }

export type CatalogItem = {
  /** URL name: /shop/<slug>. Lowercase-and-dashes; never change it once live. */
  slug: string
  name: string
  brand: string
  category: CategoryId
  /** Your own stock code. Must be unique. */
  sku: string
  /** Rupees, including all taxes. `null` = price not announced / on request. */
  price: number | null
  /** Optional higher "was" price, shown struck through. Must be a real past price. */
  mrp?: number
  availability: Availability
  checkout: Checkout
  /** First image is the main one. At least 800px wide, plain background. */
  images: readonly string[]
  /** One sentence. Shown on cards and in Google results. */
  short: string
  description: readonly string[]
  highlights: readonly string[]
  specs: readonly (readonly [string, string])[]
  inBox: readonly string[]
  /** Required by Indian e-commerce rules. */
  countryOfOrigin: string
  /** Printed in the customer's choice of colour: shown on the page and asked in the order message. */
  anyColour?: boolean
  /** Shown in the Shop menu and the footer. Keep it to about four. */
  featured?: boolean
  /** Barcode on the retail box (for products you resell). Leave out for your own. */
  gtin?: string
  /** Manufacturer part number (for products you resell). */
  mpn?: string
  /** Hide from the shop without deleting it. */
  draft?: boolean
}

/* -- The catalog ----------------------------------------------------------- */

const mod = (slug: string) => moduleProducts.find((p) => p.slug === slug)!
const tetrobotSpecs = [
  ['Control', 'Wireless, from the Tetrobot runtime'],
  ['Interface', 'Latching face on both ends'],
] as const

const module_ = mod('module')
const kit = mod('kit')
const tips = mod('tool-tips')

const SO101_CREDIT =
  'SO-101 is an open-source design by TheRobotStudio and Hugging Face (Apache-2.0); product photos are from that project. Built, calibrated and sold by Nischay Robotics.'

const SO101_SPECS = [
  ['Degrees of freedom', '6 per arm — 5 joints plus the gripper'],
  ['Servos', 'Feetech STS3215 serial bus servos, 6 per arm'],
  ['Connection', 'USB to your computer through a bus servo driver board'],
  ['Software', 'Hugging Face LeRobot (Python, open source)'],
  ['Condition', 'Assembled, calibrated and tested before dispatch'],
  ['Colour', 'Any colour — tell us when you order'],
  ['Design', 'Open-source SO-101 by TheRobotStudio & Hugging Face (Apache-2.0)'],
] as const

export const catalog: readonly CatalogItem[] = [
  /* -- SO-101 robot arms --------------------------------------------------- */
  {
    slug: 'so101-leader-follower-kit',
    name: 'SO-101 Robot Arm Kit — Leader + Follower',
    brand: 'Nischay Robotics',
    category: 'arms',
    sku: 'NR-SO101-LF',
    price: 44499,
    availability: 'in_stock',
    checkout: { type: 'whatsapp' },
    images: ['/products/so101/SO101_Follower.webp', '/products/so101/SO101_Leader.webp'],
    short: 'The open-source LeRobot arm pair, assembled and calibrated: move the leader by hand, the follower copies it.',
    description: [
      'SO-101 is the robot arm the LeRobot community learns on. The leader arm has a handle and is moved by hand; the follower arm copies every motion in real time. Use the pair to teleoperate, record demonstrations, and train an imitation-learning policy that then runs the follower by itself.',
      'Both arms arrive assembled, calibrated and tested together in Bengaluru, so you skip the build and the servo setup and go straight to the LeRobot tutorials.',
      SO101_CREDIT,
    ],
    highlights: [
      'Teleoperate by hand — the follower mirrors the leader live',
      'Record datasets and train policies with Hugging Face LeRobot',
      'Assembled and calibrated: no printing, no servo ID setup',
      'Printed in any colour you choose',
    ],
    specs: [['Arms', 'Leader (hand-guided) + follower'], ...SO101_SPECS],
    inBox: [
      'SO-101 leader arm, assembled and calibrated',
      'SO-101 follower arm, assembled and calibrated',
      'Bus servo driver board for each arm',
      'Power supply and USB cable for each arm',
      'Setup guide for LeRobot',
    ],
    countryOfOrigin: 'India',
    anyColour: true,
    featured: true,
  },
  {
    slug: 'so101-follower-arm',
    name: 'SO-101 Follower Arm',
    brand: 'Nischay Robotics',
    category: 'arms',
    sku: 'NR-SO101-F',
    price: 20999,
    availability: 'in_stock',
    checkout: { type: 'whatsapp' },
    images: ['/products/so101/SO101_Follower.webp'],
    short: 'The SO-101 working arm on its own, assembled and calibrated — for code, AI policies, or a leader you already own.',
    description: [
      'The follower is the SO-101 arm that does the work: six servos, a gripper, and a USB connection to your computer. Drive it from Python, from a trained LeRobot policy, or from a leader arm you already have.',
      'It arrives assembled, calibrated and tested in Bengaluru.',
      SO101_CREDIT,
    ],
    highlights: [
      'Runs LeRobot policies and your own Python code',
      'Pairs with any SO-100 / SO-101 leader arm',
      'Assembled and calibrated: ready to plug in',
      'Printed in any colour you choose',
    ],
    specs: [['Arms', 'Follower only'], ...SO101_SPECS],
    inBox: [
      'SO-101 follower arm, assembled and calibrated',
      'Bus servo driver board',
      'Power supply and USB cable',
      'Setup guide for LeRobot',
    ],
    countryOfOrigin: 'India',
    anyColour: true,
    featured: true,
  },

  {
    slug: 'so101-diy-kit-leader-follower',
    name: 'SO-101 DIY Kit — Leader + Follower (Unassembled)',
    brand: 'Nischay Robotics',
    category: 'arms',
    sku: 'NR-SO101-LF-DIY',
    price: 40999,
    availability: 'in_stock',
    checkout: { type: 'whatsapp' },
    images: ['/products/so101/SO101_Follower.webp', '/products/so101/SO101_Leader.webp'],
    short: 'Every part for both SO-101 arms — printed parts, servos, driver boards and screws. You build it; we pre-check the parts.',
    description: [
      'Build the SO-101 leader and follower yourself and learn every joint on the way. The kit has everything the official build guide asks for, so you can follow the LeRobot assembly tutorial step by step.',
      'Printed parts come cleaned and test-fitted, and every servo is checked before it ships. Photos show the arms once assembled.',
      SO101_CREDIT,
    ],
    highlights: [
      'Complete parts set for leader and follower',
      'Printed parts cleaned and test-fitted; servos checked',
      'Follow the open LeRobot assembly guide',
      'Printed in any colour you choose',
    ],
    specs: [['Arms', 'Leader + follower, unassembled'], ['Assembly', 'By you — about an evening per arm'], ...SO101_SPECS.filter(([k]) => k !== 'Condition')],
    inBox: [
      'Printed parts for the leader and follower arms',
      '12 × ST3215 serial bus servos (6 per arm)',
      'Bus servo driver board for each arm',
      'Power supply and USB cable for each arm',
      'All screws and fasteners',
      'Link to the step-by-step assembly guide',
    ],
    countryOfOrigin: 'India',
    anyColour: true,
  },
  {
    slug: 'so101-diy-kit-follower',
    name: 'SO-101 DIY Kit — Follower Arm (Unassembled)',
    brand: 'Nischay Robotics',
    category: 'arms',
    sku: 'NR-SO101-F-DIY',
    price: 18999,
    availability: 'in_stock',
    checkout: { type: 'whatsapp' },
    images: ['/products/so101/SO101_Follower.webp'],
    short: 'Every part for one SO-101 follower arm — printed parts, 6 servos, driver board and screws. You build it.',
    description: [
      'The parts for the SO-101 working arm, ready to assemble with the LeRobot build guide. Pair it with a leader arm, or drive it from your own code and trained policies.',
      'Printed parts come cleaned and test-fitted, and every servo is checked before it ships. Photos show the arm once assembled.',
      SO101_CREDIT,
    ],
    highlights: [
      'Complete parts set for one follower arm',
      'Printed parts cleaned and test-fitted; servos checked',
      'Follow the open LeRobot assembly guide',
      'Printed in any colour you choose',
    ],
    specs: [['Arms', 'Follower only, unassembled'], ['Assembly', 'By you — about an evening'], ...SO101_SPECS.filter(([k]) => k !== 'Condition')],
    inBox: [
      'Printed parts for the follower arm',
      '6 × ST3215 serial bus servos',
      'Bus servo driver board',
      'Power supply and USB cable',
      'All screws and fasteners',
      'Link to the step-by-step assembly guide',
    ],
    countryOfOrigin: 'India',
    anyColour: true,
  },
  {
    slug: 'so101-printed-parts-leader-follower',
    name: 'SO-101 3D-Printed Parts — Leader + Follower Set',
    brand: 'Nischay Robotics',
    category: 'components',
    sku: 'NR-SO101-PRINT-LF',
    price: 5999,
    availability: 'in_stock',
    checkout: { type: 'whatsapp' },
    images: ['/products/so101/SO101_Leader.webp', '/products/so101/SO101_Follower.webp'],
    short: 'All printed parts for both SO-101 arms, in PLA+ or PETG and your colour — cleaned and test-fitted. Bring your own servos.',
    description: [
      'Every 3D-printed part for the SO-101 leader and follower arms, printed in PLA+ or PETG in the colour you choose. Supports removed, holes cleaned and parts test-fitted, so assembly goes smoothly.',
      'Printed parts only: servos, driver boards and screws are not included. Need servos too? Add the ST3215 servos, or take the DIY kit instead. Photos show the arms once assembled.',
      SO101_CREDIT,
    ],
    highlights: [
      'Complete printed set for leader and follower',
      'PLA+ or PETG, any colour',
      'Supports removed, holes cleaned, test-fitted',
    ],
    specs: [
      ['Material', 'PLA+ or PETG'],
      ['Colour', 'Any colour — tell us when you order'],
      ['Includes', 'Printed parts only'],
      ['Design', 'Open-source SO-101 by TheRobotStudio & Hugging Face (Apache-2.0)'],
    ],
    inBox: ['Printed parts for the SO-101 leader arm', 'Printed parts for the SO-101 follower arm'],
    countryOfOrigin: 'India',
    anyColour: true,
  },
  {
    slug: 'so101-printed-parts-single-arm',
    name: 'SO-101 3D-Printed Parts — One Arm',
    brand: 'Nischay Robotics',
    category: 'components',
    sku: 'NR-SO101-PRINT-1',
    price: 3299,
    availability: 'in_stock',
    checkout: { type: 'whatsapp' },
    images: ['/products/so101/SO101_Follower.webp', '/products/so101/SO101_Leader.webp'],
    short: 'Printed parts for one SO-101 arm — leader or follower, your choice — in PLA+ or PETG and your colour.',
    description: [
      'All 3D-printed parts for one SO-101 arm. Tell us leader or follower when you order. Printed in PLA+ or PETG in the colour you choose, with supports removed and parts test-fitted.',
      'Printed parts only: servos, driver boards and screws are not included. Photos show the arms once assembled.',
      SO101_CREDIT,
    ],
    highlights: ['Leader or follower — you choose', 'PLA+ or PETG, any colour', 'Supports removed, holes cleaned, test-fitted'],
    specs: [
      ['Arm', 'Leader or follower — tell us when you order'],
      ['Material', 'PLA+ or PETG'],
      ['Colour', 'Any colour — tell us when you order'],
      ['Includes', 'Printed parts only'],
      ['Design', 'Open-source SO-101 by TheRobotStudio & Hugging Face (Apache-2.0)'],
    ],
    inBox: ['Printed parts for one SO-101 arm (leader or follower)'],
    countryOfOrigin: 'India',
    anyColour: true,
  },
  {
    slug: 'feetech-st3215-servo-12v-30kg',
    name: 'Feetech ST3215 Serial Bus Servo — 12V, 30 kg·cm',
    brand: 'Feetech',
    category: 'components',
    sku: 'NR-ST3215-12V',
    price: 2599,
    availability: 'in_stock',
    checkout: { type: 'whatsapp' },
    images: ['/products/st3215/st3215.svg'],
    short: 'The 12V, 30 kg·cm serial bus servo used in SO-100 and SO-101 arms — with position, speed and load feedback.',
    description: [
      'A smart serial bus servo: daisy-chain many on one cable, give each an ID, and read back position, speed, load, voltage and temperature. It is the servo the SO-100 and SO-101 arms are built on, and works just as well in your own robots.',
      'Every servo is checked before it ships.',
    ],
    highlights: [
      '12V, about 30 kg·cm of torque',
      '360° magnetic encoder with position feedback',
      'Daisy-chain servos on one bus, each with its own ID',
      'Drop-in for SO-100 / SO-101 arms and LeRobot',
    ],
    specs: [
      ['Voltage', '12V'],
      ['Torque', 'About 30 kg·cm'],
      ['Interface', 'Serial bus (TTL), daisy-chainable'],
      ['Feedback', 'Position, speed, load, voltage, temperature'],
      ['Encoder', '360° magnetic'],
      ['Gears', 'Metal'],
    ],
    inBox: ['1 × ST3215 servo', 'Horn, screws and bus cable'],
    countryOfOrigin: 'China',
  },

  /* -- Tetrobot shape-changing range (prices live in site.ts `products`) ---- */
  {
    slug: 'tetrobot-module',
    name: 'Tetrobot Module',
    brand: 'Nischay Robotics',
    category: 'modules',
    sku: 'NR-MODULE',
    price: module_.inr,
    availability: 'preorder',
    checkout: { type: 'waitlist', product: 'module' },
    images: ['/visuals/cfg-15.jpg', '/visuals/cfg-17.jpg', '/visuals/cfg-06.jpg'],
    short: module_.tagline,
    description: [module_.summary],
    highlights: module_.bestFor,
    specs: [['Status', module_.statusLabel], ...tetrobotSpecs],
    inBox: module_.includes,
    countryOfOrigin: 'India',
    featured: true,
  },
  {
    slug: 'tetrobot-kit',
    name: 'Tetrobot Kit — 3 Modules',
    brand: 'Nischay Robotics',
    category: 'kits',
    sku: 'NR-KIT3',
    price: kit.inr,
    availability: 'preorder',
    checkout: { type: 'waitlist', product: 'kit' },
    images: ['/visuals/cfg-09.jpg', '/visuals/cfg-18.jpg', '/visuals/cfg-14.jpg', '/visuals/cfg-05.jpg'],
    short: kit.tagline,
    description: [kit.summary],
    highlights: kit.bestFor,
    specs: [['Modules', '3'], ['Status', kit.statusLabel], ...tetrobotSpecs],
    inBox: kit.includes,
    countryOfOrigin: 'India',
    featured: true,
  },
  {
    slug: 'tetrobot-gripper-tip',
    name: 'Tetrobot Gripper Tip',
    brand: 'Nischay Robotics',
    category: 'accessories',
    sku: 'NR-TIP-GRIP',
    price: tips.inr,
    availability: 'preorder',
    checkout: { type: 'waitlist', product: 'tool-tips' },
    images: ['/visuals/cfg-01.jpg', '/visuals/cfg-02.jpg'],
    short: 'A gripper that latches onto the end of a Tetrobot chain so it can pick things up.',
    description: [
      'The gripper tip latches onto the free end of a chain like any other module and turns it into a manipulator that can grip and carry objects.',
    ],
    highlights: ['Latches on like a module — no tools', 'Turns any chain into a gripping arm'],
    specs: [['Fits', 'Tetrobot modules and kits'], ['Status', 'Releasing soon']],
    inBox: ['1 × gripper tip'],
    countryOfOrigin: 'India',
  },
  {
    slug: 'tetrobot-wheel-tip',
    name: 'Tetrobot Wheel Tip',
    brand: 'Nischay Robotics',
    category: 'accessories',
    sku: 'NR-TIP-WHEEL',
    price: tips.inr,
    availability: 'preorder',
    checkout: { type: 'waitlist', product: 'tool-tips' },
    images: ['/visuals/cfg-06.jpg', '/visuals/cfg-16.jpg'],
    short: 'A driven wheel that latches onto a Tetrobot chain so it can roll.',
    description: [
      'The wheel tip latches onto the end of a chain and lets it drive — the building block of the rolling configurations shown on this site.',
    ],
    highlights: ['Latches on like a module — no tools', 'Combine several for wheeled bodies'],
    specs: [['Fits', 'Tetrobot modules and kits'], ['Status', 'Releasing soon']],
    inBox: ['1 × wheel tip'],
    countryOfOrigin: 'India',
  },
  {
    slug: 'custom-tool-tips',
    name: 'Custom Tool Tips',
    brand: 'Nischay Robotics',
    category: 'accessories',
    sku: 'NR-TIP-CUSTOM',
    price: null,
    availability: 'made_to_order',
    checkout: { type: 'whatsapp' },
    images: ['/visuals/cfg-02.jpg', '/visuals/cfg-13.jpg'],
    short: 'End effectors designed for your task — longer fingers, prismatic fingers, crab-style opening and more.',
    description: [
      'Tell us what the robot has to hold or do, and we design, print and test a tip for it. Send a photo or the size of the object on WhatsApp and you get a quote, usually within a day.',
    ],
    highlights: [
      'Longer fingers — for reach into boxes and bins',
      'Prismatic fingers — parallel jaws that slide straight together',
      'Dual crab-style opening — two pairs of jaws',
      'Candy fingers',
      'Your own idea — send a sketch',
    ],
    specs: [['Made', 'To order, to your spec'], ['Price', 'Quoted per design']],
    inBox: ['Your custom tip, tested before dispatch'],
    countryOfOrigin: 'India',
    anyColour: true,
  },

  /* EXAMPLE — copy this block (without the comment marks) to add a product.
  {
    slug: 'mg996r-servo-motor',
    name: 'MG996R Metal Gear Servo Motor',
    brand: 'TowerPro',
    category: 'components',
    sku: 'NR-MG996R',
    price: 349,
    mrp: 399,
    availability: 'in_stock',
    checkout: { type: 'whatsapp' },
    images: ['/products/mg996r-servo-motor/1.jpg', '/products/mg996r-servo-motor/2.jpg'],
    short: 'High-torque metal-gear servo for arms, legs and grippers.',
    description: ['Paragraph one.', 'Paragraph two.'],
    highlights: ['Metal gears', '11 kg·cm at 6 V', 'Standard 3-pin connector'],
    specs: [['Torque', '11 kg·cm @ 6 V'], ['Weight', '55 g'], ['Voltage', '4.8–7.2 V']],
    inBox: ['1 × servo', 'Horn set', 'Screws'],
    countryOfOrigin: 'China',
    mpn: 'MG996R',
  },
  */
]

/** What visitors see: everything that isn't a draft. */
export const listed = catalog.filter((p) => !p.draft)

export const findProduct = (slug: string) => listed.find((p) => p.slug === slug)

export const productPath = (p: Pick<CatalogItem, 'slug'>) => `/shop/${p.slug}`

export const inr = rupees

export const discountPct = (p: CatalogItem) =>
  p.price && p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0

export const availabilityLabel: Record<Availability, string> = {
  in_stock: 'In stock',
  out_of_stock: 'Out of stock',
  preorder: 'Releasing soon',
  made_to_order: 'Made to order',
}

/** Can Google Shopping send shoppers here? Only if it can be bought now, on a real checkout. */
export const isShoppable = (p: CatalogItem) =>
  p.price !== null && p.availability === 'in_stock' && p.checkout.type === 'link'
