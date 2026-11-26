// REUSE-CHECKED: shop|grid|filter|sort -> ConfigGallery filters photos by family (lightbox gallery, not products); PageShell is a long-read layout with scrollspy. A product grid with category/sort/search is new.

import { useMemo, useState } from 'react'
import { ProductCard } from '@/components/shop/ShopParts'
import { useReviewSummaries } from '@/lib/reviews'
import { Link } from '@/components/ui/Link'
import { Reveal } from '@/components/ui/primitives'
import { SHOP_DESCRIPTION, categories, deliveryLine, freeShippingLine, listed, store } from '@/content/catalog'
import type { CategoryId } from '@/content/catalog'
import { usePageMeta } from '@/lib/head'

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'rating'

const SORTS: Record<Sort, string> = {
  featured: 'Featured',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  rating: 'Top rated',
}

/** The promises every product page repeats — the strip under robu.in's header. */
export function TrustStrip() {
  const items = [
    { title: freeShippingLine, body: deliveryLine },
    { title: `${store.returns.days}-day returns`, body: 'Faulty items replaced or refunded free' },
    { title: 'Built & tested in Bengaluru', body: 'Every unit checked before it ships' },
    { title: 'Talk to the maker', body: 'WhatsApp, email or Discord — a person answers' },
  ]
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => (
        <li key={i.title} className="glass-soft p-4">
          <div className="relative z-10">
            <p className="text-[13px] font-semibold">{i.title}</p>
            <p className="text-chalk/50 mt-1 text-[12px] leading-relaxed">{i.body}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ShopPage() {
  usePageMeta({ title: 'Shop — Nischay Robotics', description: SHOP_DESCRIPTION, path: '/shop' })
  const summaries = useReviewSummaries()

  const initial = window.location.hash.slice(1)
  const [category, setCategory] = useState<CategoryId | 'all'>(initial in categories ? (initial as CategoryId) : 'all')
  const [sort, setSort] = useState<Sort>('featured')
  const [query, setQuery] = useState('')

  // Only categories that actually have something in them.
  const present = useMemo(
    () => (Object.keys(categories) as CategoryId[]).filter((c) => listed.some((p) => p.category === c)),
    [],
  )

  const pick = (c: CategoryId | 'all') => {
    setCategory(c)
    window.history.replaceState({}, '', c === 'all' ? '/shop' : `/shop#${c}`)
  }

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = listed.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (!q || `${p.name} ${p.brand} ${p.short} ${categories[p.category].label}`.toLowerCase().includes(q)),
    )
    const price = (n: number | null, empty: number) => n ?? empty
    if (sort === 'price-asc') return [...list].sort((a, b) => price(a.price, Infinity) - price(b.price, Infinity))
    if (sort === 'price-desc') return [...list].sort((a, b) => price(b.price, -1) - price(a.price, -1))
    if (sort === 'rating')
      return [...list].sort((a, b) => (summaries.get(b.slug)?.average ?? 0) - (summaries.get(a.slug)?.average ?? 0))
    return list
  }, [category, sort, query, summaries])

  const chip = (on: boolean) =>
    `shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors ${
      on ? 'from-sun to-gold text-onbrand bg-gradient-to-br' : 'text-chalk/60 hover:text-chalk'
    }`

  return (
    <main className="grain relative z-10 px-5 pt-28 pb-10 sm:px-8 sm:pt-36">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <nav aria-label="Breadcrumb" className="text-chalk/40 flex items-center gap-2 text-[12px]">
            <Link to="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-chalk/70" aria-current="page">
              Shop
            </span>
          </nav>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-5 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02]">
            Shop <span className="text-gold-grad">robotics</span>
          </h1>
          <p className="text-chalk/60 mt-4 max-w-2xl text-base leading-relaxed">
            Robot arms, shape-changing modules and tool tips, built and tested in Bengaluru and delivered anywhere in
            India. Prices are {store.priceNote.toLowerCase()}.
          </p>
        </Reveal>

        <div className="mt-8">
          <TrustStrip />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Categories — side list on desktop */}
          <aside className="hidden lg:block">
            <nav aria-label="Categories" className="glass sticky top-28 p-3">
              <p className="text-chalk/35 relative z-10 px-3 pt-2 pb-2 text-[10px] font-semibold tracking-[0.2em] uppercase">
                Categories
              </p>
              <ul className="relative z-10">
                {(['all', ...present] as const).map((c) => {
                  const on = category === c
                  const count = c === 'all' ? listed.length : listed.filter((p) => p.category === c).length
                  return (
                    <li key={c}>
                      <button
                        type="button"
                        onClick={() => pick(c)}
                        aria-current={on ? 'true' : undefined}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] transition-colors ${
                          on ? 'text-chalk bg-chalk/[0.06] font-semibold' : 'text-chalk/55 hover:text-chalk'
                        }`}
                      >
                        {c === 'all' ? 'All products' : categories[c].label}
                        <span className="text-chalk/35 text-[11px]">{count}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>

          <div className="min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the shop…"
                aria-label="Search the shop"
                className="glass-soft text-chalk placeholder:text-chalk/40 min-w-0 flex-1 !rounded-full px-4 py-2.5 text-sm outline-none"
              />
              <label className="text-chalk/50 flex items-center gap-2 text-[12px]">
                Sort
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="glass-soft text-chalk !rounded-full px-3 py-2.5 text-[13px] outline-none"
                >
                  {(Object.keys(SORTS) as Sort[]).map((s) => (
                    <option key={s} value={s}>
                      {SORTS[s]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Categories — chips on narrow screens */}
            <div className="glass-strong mt-3 flex gap-1 overflow-x-auto !rounded-full p-1.5 [scrollbar-width:none] lg:hidden">
              {(['all', ...present] as const).map((c) => (
                <button key={c} type="button" onClick={() => pick(c)} className={`relative z-10 ${chip(category === c)}`}>
                  {c === 'all' ? 'All' : categories[c].label}
                </button>
              ))}
            </div>

            <p className="text-chalk/40 mt-5 text-[12px]">
              {shown.length} product{shown.length === 1 ? '' : 's'}
              {category !== 'all' && ` in ${categories[category].label}`}
            </p>

            {shown.length === 0 ? (
              <p className="text-chalk/50 mt-10 text-center text-sm">Nothing matches. Try another word or category.</p>
            ) : (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
                {shown.map((p) => (
                  <li key={p.slug}>
                    <ProductCard item={p} summary={summaries.get(p.slug)} />
                  </li>
                ))}
              </ul>
            )}

            <p className="text-chalk/40 mt-12 text-[12px]">
              Before you buy:{' '}
              <Link to="/policies/shipping" className="hover:text-accent underline">
                Shipping
              </Link>{' '}
              ·{' '}
              <Link to="/policies/returns" className="hover:text-accent underline">
                Returns & refunds
              </Link>{' '}
              ·{' '}
              <Link to="/policies/seller" className="hover:text-accent underline">
                Seller details
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
