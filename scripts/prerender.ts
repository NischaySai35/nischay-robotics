// REUSE-CHECKED: prerender|sitemap|feed|build plugin -> vite.config.ts had only react + tailwind plugins and public/sitemap.xml was hand-written; nothing generated per-page HTML.

/* ============================================================================
   Build step: one real HTML file per page, plus sitemap.xml and the Google
   Merchant Center feed.

   The site is a single-page app, so without this every URL would serve the
   same index.html with the home page's title. After `vite build` this writes
   dist/shop.html, dist/shop/<slug>.html, dist/policies/<id>.html … each with
   its own <title>, description, canonical URL, social image and Google
   product data (price, stock, shipping, returns, star rating). The app still
   boots the same way; only the <head> differs.

   Netlify and Firebase both serve /shop/x from shop/x.html before falling
   back to the SPA rewrite (Firebase needs "cleanUrls": true — set).

   Approved reviews are read from Firestore's public REST API at build time,
   so ratings are baked in. If that fails (no network, no config) the build
   carries on without ratings — it never fails because of reviews.
   ========================================================================= */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import { SHOP_DESCRIPTION, categories, isShoppable, listed, store } from '../src/content/catalog.ts'
import type { CatalogItem } from '../src/content/catalog.ts'
import { policies } from '../src/content/policies.ts'
import { pages, seo } from '../src/content/site.ts'
import { breadcrumbJsonLd, productJsonLd, shippingFeeFor } from '../src/content/structuredData.ts'
import type { ReviewSummary } from '../src/content/structuredData.ts'

type Route = {
  path: string
  title: string
  description: string
  image?: string
  jsonLd?: Record<string, object>
  priority: number
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/* -- Reviews from Firestore (public, approved only) ------------------------ */

type FsValue = { stringValue?: string; integerValue?: string; timestampValue?: string; booleanValue?: boolean }

async function fetchSummaries(projectId?: string, apiKey?: string): Promise<Map<string, ReviewSummary>> {
  const out = new Map<string, ReviewSummary>()
  if (!projectId || !apiKey) return out
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'reviews' }],
            where: { fieldFilter: { field: { fieldPath: 'approved' }, op: 'EQUAL', value: { booleanValue: true } } },
          },
        }),
        signal: AbortSignal.timeout(8000),
      },
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const rows = (await res.json()) as { document?: { fields: Record<string, FsValue> } }[]
    const groups = new Map<string, ReviewSummary['reviews'][number][]>()
    for (const row of rows) {
      const f = row.document?.fields
      if (!f) continue
      const slug = f.product?.stringValue ?? ''
      const review = {
        name: f.name?.stringValue ?? '',
        rating: Number(f.rating?.integerValue ?? 0),
        text: f.text?.stringValue ?? '',
        date: (f.createdAt?.timestampValue ?? '').slice(0, 10),
      }
      groups.set(slug, [...(groups.get(slug) ?? []), review])
    }
    for (const [slug, list] of groups) {
      list.sort((a, b) => b.date.localeCompare(a.date))
      out.set(slug, {
        count: list.length,
        average: list.reduce((s, r) => s + r.rating, 0) / list.length,
        reviews: list,
      })
    }
    console.log(`[prerender] ${rows.filter((r) => r.document).length} approved reviews baked in`)
  } catch (err) {
    console.warn(`[prerender] reviews skipped (${err instanceof Error ? err.message : err})`)
  }
  return out
}

/* -- Routes ---------------------------------------------------------------- */

function routes(summaries: Map<string, ReviewSummary>): Route[] {
  const list: Route[] = []

  for (const p of pages) {
    if (p.path === '/shop') continue
    list.push({ path: p.path, title: `${p.label} — Nischay Robotics`, description: p.blurb, priority: 0.7 })
  }

  list.push({ path: '/shop', title: 'Shop — Nischay Robotics', description: SHOP_DESCRIPTION, priority: 0.9 })

  for (const p of listed) {
    const price = p.price ? ` — ₹${p.price.toLocaleString('en-IN')}` : ''
    list.push({
      path: `/shop/${p.slug}`,
      title: `${p.name}${price} | Nischay Robotics`,
      description: `${p.short} ${p.price ? `₹${p.price.toLocaleString('en-IN')}, ${store.priceNote.toLowerCase()}.` : ''} Ships from Bengaluru across India.`,
      image: p.images[0],
      priority: 0.8,
      jsonLd: {
        'ld-product': productJsonLd(p, seo.url, summaries.get(p.slug)),
        'ld-breadcrumb': breadcrumbJsonLd(seo.url, [
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: p.name, path: `/shop/${p.slug}` },
        ]),
      },
    })
  }

  for (const p of policies) {
    list.push({
      path: `/policies/${p.id}`,
      title: `${p.title} — Nischay Robotics`,
      description: p.summary,
      priority: 0.3,
    })
  }

  return list
}

/* -- HTML ------------------------------------------------------------------ */

function setMeta(html: string, attr: 'name' | 'property', key: string, value: string) {
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`)
  const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

function render(base: string, r: Route) {
  const url = seo.url + r.path
  let html = base.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(r.title)}</title>`)
  html = setMeta(html, 'name', 'description', r.description)
  html = setMeta(html, 'property', 'og:title', r.title)
  html = setMeta(html, 'property', 'og:description', r.description)
  html = setMeta(html, 'property', 'og:url', url)
  if (r.image) {
    html = setMeta(html, 'property', 'og:image', seo.url + r.image)
    // The site card is 1200×630; product photos aren't, so drop the fixed size.
    html = html.replace(/\s*<meta property="og:image:(width|height)" content="\d+" \/>/g, '')
  }
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
  for (const [id, data] of Object.entries(r.jsonLd ?? {})) {
    // "<" escaped so a product description can never close the script tag.
    const json = JSON.stringify(data).replace(/</g, '\\u003c')
    html = html.replace('</head>', `    <script type="application/ld+json" id="${id}">${json}</script>\n  </head>`)
  }
  return html
}

/* -- Sitemap & Merchant feed ---------------------------------------------- */

function sitemap(list: Route[]) {
  const today = new Date().toISOString().slice(0, 10)
  const urls = [{ path: '/', priority: 1 }, ...list]
    .map(
      (r) =>
        `  <url><loc>${seo.url}${r.path === '/' ? '/' : r.path}</loc><lastmod>${today}</lastmod><priority>${r.priority.toFixed(1)}</priority></url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generated by scripts/prerender.ts on every build. Don't edit by hand. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

/**
 * Google Merchant Center product feed (RSS 2.0 + g: fields). Add
 * https://<domain>/merchant-feed.xml as a scheduled feed in Merchant Center.
 * Only products that can be bought right now on a real checkout page are
 * included — Google rejects listings whose landing page can't take payment.
 */
export function merchantFeed(items: readonly CatalogItem[]) {
  const money = (n: number) => `${n.toFixed(2)} ${store.currency}`
  const x = esc
  const entries = items.filter(isShoppable).map((p) => {
    const price = p.price as number
    const onSale = p.mrp && p.mrp > price
    const lines = [
      `<g:id>${x(p.sku)}</g:id>`,
      `<g:title>${x(p.name)}</g:title>`,
      `<g:description>${x([p.short, ...p.description].join(' '))}</g:description>`,
      `<g:link>${seo.url}/shop/${p.slug}</g:link>`,
      `<g:image_link>${seo.url}${p.images[0]}</g:image_link>`,
      ...p.images.slice(1, 10).map((i) => `<g:additional_image_link>${seo.url}${i}</g:additional_image_link>`),
      `<g:availability>${p.availability}</g:availability>`,
      `<g:price>${money(onSale ? (p.mrp as number) : price)}</g:price>`,
      ...(onSale ? [`<g:sale_price>${money(price)}</g:sale_price>`] : []),
      `<g:brand>${x(p.brand)}</g:brand>`,
      `<g:condition>new</g:condition>`,
      ...(p.gtin ? [`<g:gtin>${x(p.gtin)}</g:gtin>`] : []),
      ...(p.mpn ? [`<g:mpn>${x(p.mpn)}</g:mpn>`] : []),
      ...(!p.gtin && !p.mpn ? ['<g:identifier_exists>no</g:identifier_exists>'] : []),
      `<g:product_type>${x(categories[p.category].label)}</g:product_type>`,
      `<g:shipping><g:country>${store.shipping.country}</g:country><g:price>${money(shippingFeeFor(price))}</g:price></g:shipping>`,
    ]
    return `    <item>\n      ${lines.join('\n      ')}\n    </item>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by scripts/prerender.ts on every build. ${entries.length} shoppable product(s). -->
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Nischay Robotics</title>
    <link>${seo.url}</link>
    <description>${x(SHOP_DESCRIPTION)}</description>
${entries.join('\n')}
  </channel>
</rss>
`
}

/* -- Plugin ---------------------------------------------------------------- */

export function prerender(): Plugin {
  let outDir = 'dist'
  let env: Record<string, string> = {}
  return {
    name: 'nr-prerender',
    apply: 'build',
    configResolved(config) {
      outDir = join(config.root, config.build.outDir)
      env = loadEnv(config.mode, config.root, 'VITE_')
    },
    async closeBundle() {
      const base = await readFile(join(outDir, 'index.html'), 'utf8')
      const summaries = await fetchSummaries(env.VITE_FIREBASE_PROJECT_ID, env.VITE_FIREBASE_API_KEY)
      const list = routes(summaries)

      for (const r of list) {
        const file = join(outDir, `${r.path.slice(1)}.html`)
        await mkdir(dirname(file), { recursive: true })
        await writeFile(file, render(base, r))
      }
      await writeFile(join(outDir, 'sitemap.xml'), sitemap(list))
      await writeFile(join(outDir, 'merchant-feed.xml'), merchantFeed(listed))
      console.log(`[prerender] ${list.length} pages, sitemap.xml and merchant-feed.xml written`)
    },
  }
}
