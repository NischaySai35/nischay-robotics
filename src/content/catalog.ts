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

   ⚠ These are sensible starting values — confirm each one is what you will
   actually honour before you start selling.                                */

export const store = {
  currency: 'INR',
  /** Legal Metrology rules: the shown price must be the full price. */
  priceNote: 'Inclusive of all taxes',
  shipsFrom: 'Bengaluru, Karnataka, India',
  shipping: {
    /** Flat fee below the free-shipping threshold, in rupees. */
    fee: 79,
    freeAbove: 999,
    /** Business days to pack and hand to the courier. */
    handlingDays: [1, 3] as [number, number],
    /** Business days in transit inside India. */
    transitDays: [2, 7] as [number, number],
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
  'Buy shape-changing robot modules, the Tetrobot Developer Kit, and robotics components from Nischay Robotics, Bengaluru. Prices include all taxes; ships across India.'

export const freeShippingLine = `Free shipping on orders over ${rupees(store.shipping.freeAbove)}`
export const deliveryLine = `Ships from Bengaluru in ${store.shipping.handlingDays.join('–')} days · delivered in ${store.shipping.transitDays.join('–')} business days`

/* -- Types ----------------------------------------------------------------- */

export type CategoryId = 'modules' | 'kits' | 'components' | 'tools' | 'accessories'

export const categories: Record<CategoryId, { label: string; blurb: string }> = {
  modules: { label: 'Shape-changing modules', blurb: 'The modules every shape on this site is built from.' },
  kits: { label: 'Kits', blurb: 'Everything needed to build, in one box.' },
  components: { label: 'Components', blurb: 'Motors, boards and parts we use and trust.' },
  tools: { label: 'Tools', blurb: 'For building and repairing robots.' },
  accessories: { label: 'Accessories', blurb: 'Tool tips, mounts, cables and spares.' },
}

/**
 * - in_stock      → can be bought now
 * - out_of_stock  → listed, but not buyable right now
 * - preorder      → coming soon; visitors join the waitlist
 */
export type Availability = 'in_stock' | 'out_of_stock' | 'preorder'

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
  /** Rupees, including all taxes. `null` = price not announced yet. */
  price: number | null
  /** Optional higher "was" price, shown struck through. Must be a real past price. */
  mrp?: number
  availability: Availability
  checkout: Checkout
  /** First image is the main one. Square, at least 800×800, plain background. */
  images: readonly string[]
  /** One sentence. Shown on cards and in Google results. */
  short: string
  description: readonly string[]
  highlights: readonly string[]
  specs: readonly (readonly [string, string])[]
  inBox: readonly string[]
  /** Required by Indian e-commerce rules. */
  countryOfOrigin: string
  /** Barcode on the retail box (for products you resell). Leave out for your own. */
  gtin?: string
  /** Manufacturer part number (for products you resell). */
  mpn?: string
  /** Hide from the shop without deleting it. */
  draft?: boolean
}

/* -- The catalog ----------------------------------------------------------- */

/** Per module product: its shop slug, display name, category and photos. */
const MODULE_LISTING: Record<string, { slug: string; name: string; category: CategoryId; images: string[] }> = {
  module: {
    slug: 'tetrobot-module',
    name: 'Tetrobot Module',
    category: 'modules',
    images: ['/visuals/cfg-15.jpg', '/visuals/cfg-17.jpg', '/visuals/cfg-06.jpg'],
  },
  kit: {
    slug: 'tetrobot-developer-kit',
    name: 'Tetrobot Developer Kit',
    category: 'kits',
    images: ['/visuals/cfg-09.jpg', '/visuals/cfg-18.jpg', '/visuals/cfg-14.jpg', '/visuals/cfg-05.jpg'],
  },
  'tool-tips': {
    slug: 'tetrobot-tool-tips',
    name: 'Tetrobot Tool Tips',
    category: 'accessories',
    images: ['/visuals/cfg-01.jpg', '/visuals/cfg-02.jpg'],
  },
}

/** The shape-changing range, built from the products on the Modules page so
 *  prices and wording are only ever written once (src/content/site.ts). */
const fromModules: CatalogItem[] = moduleProducts.map((p) => {
  const l = MODULE_LISTING[p.slug]
  return {
    slug: l.slug,
    name: l.name,
    brand: 'Nischay Robotics',
    category: l.category,
    sku: `NR-${p.slug.toUpperCase()}`,
    price: p.inr,
    availability: 'preorder',
    checkout: { type: 'waitlist', product: p.slug },
    images: l.images,
    short: p.tagline,
    description: [p.summary],
    highlights: p.bestFor,
    specs: [
      ['Status', p.statusLabel],
      ['Control', 'Wireless, from the Tetrobot runtime'],
      ['Interface', 'Latching face on both ends'],
    ],
    inBox: p.includes,
    countryOfOrigin: 'India',
  }
})

export const catalog: readonly CatalogItem[] = [
  ...fromModules,

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
}

/** Can Google Shopping send shoppers here? Only if it can be bought now, on a real checkout. */
export const isShoppable = (p: CatalogItem) =>
  p.price !== null && p.availability === 'in_stock' && p.checkout.type === 'link'
