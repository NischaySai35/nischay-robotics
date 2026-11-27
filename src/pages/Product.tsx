// REUSE-CHECKED: product page|gallery|reviews form -> WaitlistModal is the only form (signups); ConfigGallery is a photo lightbox. A product detail page with reviews is new.

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Price,
  ProductCard,
  RatingLine,
  StarInput,
  Stars,
  StockBadge,
} from '@/components/shop/ShopParts'
import { TrustStrip } from '@/pages/Shop'
import { Link } from '@/components/ui/Link'
import { Button, Reveal } from '@/components/ui/primitives'
import { categories, deliveryLine, freeShippingLine, inr, listed, store } from '@/content/catalog'
import type { CatalogItem } from '@/content/catalog'
import { contact, links, seo } from '@/content/site'
import { breadcrumbJsonLd, productJsonLd } from '@/content/structuredData'
import { useJsonLd, usePageMeta } from '@/lib/head'
import { scrollToId } from '@/lib/scroll'
import { REVIEW_LIMITS, submitReview, summarise, useApprovedReviews } from '@/lib/reviews'
import { useWaitlist } from '@/lib/waitlistContext'

/** Prefilled WhatsApp message with everything needed to quote or dispatch. */
const whatsappOrder = (p: CatalogItem) => {
  const lines =
    p.availability === 'made_to_order'
      ? [`Hi, I'd like a quote for: ${p.name}`, 'What it should hold / do: ', 'Robot it fits: ']
      : [`Hi, I'd like to order: ${p.name} (${p.sku})${p.price ? ` — ${inr(p.price)}` : ''}`, 'Quantity: 1']
  if (p.anyColour) lines.push('Colour: ')
  lines.push('Delivery pin code: ', `${seo.url}/shop/${p.slug}`)
  return `${links.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`
}

/* -- Gallery --------------------------------------------------------------- */

function Gallery({ item }: { item: CatalogItem }) {
  const [i, setI] = useState(0)
  const src = item.images[i] ?? item.images[0]
  return (
    <div>
      <div className="glass bg-ink aspect-[4/3] overflow-hidden">
        {src && <img src={src} alt={item.name} className="relative z-0 h-full w-full object-cover" />}
      </div>
      {item.images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {item.images.map((img, n) => (
            <button
              key={img}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Photo ${n + 1}`}
              aria-current={n === i ? 'true' : undefined}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors sm:h-20 sm:w-20 ${
                n === i ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* -- Buy box --------------------------------------------------------------- */

function BuyActions({ item }: { item: CatalogItem }) {
  const join = useWaitlist()
  const c = item.checkout
  const ask = (
    <Button variant="glass" href={whatsappOrder(item)} external className="w-full sm:w-auto">
      Ask on WhatsApp
    </Button>
  )

  if (item.availability === 'out_of_stock') {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled className="w-full sm:w-auto">
          Out of stock
        </Button>
        <Button variant="glass" href={whatsappOrder(item)} external className="w-full sm:w-auto">
          Ask when it's back
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {c.type === 'waitlist' && (
        <Button onClick={() => join(c.product)} className="w-full sm:w-auto">
          Join the waitlist
        </Button>
      )}
      {c.type === 'link' && (
        <Button href={c.url} external className="w-full sm:w-auto">
          Buy now
        </Button>
      )}
      {c.type === 'whatsapp' && (
        <Button href={whatsappOrder(item)} external className="w-full sm:w-auto">
          {item.availability === 'made_to_order' ? 'Get a quote on WhatsApp' : 'Order on WhatsApp'}
        </Button>
      )}
      {c.type === 'whatsapp' ? (
        <Button
          variant="glass"
          href={`mailto:${contact.support}?subject=${encodeURIComponent(`Order: ${item.name} (${item.sku})`)}`}
          className="w-full sm:w-auto"
        >
          Order by email
        </Button>
      ) : (
        ask
      )}
    </div>
  )
}

/* -- Reviews --------------------------------------------------------------- */

function ReviewForm({ slug }: { slug: string }) {
  const [rating, setRating] = useState(0)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [trap, setTrap] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error' | 'offline'>('idle')
  const [problem, setProblem] = useState('')

  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (trap) return setState('done') // bots fill hidden fields; pretend it worked
    if (!rating) return setProblem('Pick a star rating.')
    if (text.trim().length < REVIEW_LIMITS.minText) return setProblem('Write a few words about it.')
    setProblem('')
    setState('sending')
    setState(await submitReview({ product: slug, name, rating, text }).then((r) => (r === 'stored' ? 'done' : r)))
  }

  if (state === 'done') {
    return (
      <div className="glass-soft p-5 text-sm">
        <p className="relative z-10 font-semibold">Thank you — your review was sent.</p>
        <p className="text-chalk/55 relative z-10 mt-1">It appears here once it's been checked, usually within a day.</p>
      </div>
    )
  }

  const field =
    'glass-soft text-chalk placeholder:text-chalk/40 w-full !rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/50'

  return (
    <form onSubmit={send} className="glass p-5 sm:p-6">
      <div className="relative z-10 space-y-4">
        <p className="font-semibold">Write a review</p>
        <StarInput value={rating} onChange={setRating} />
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={REVIEW_LIMITS.name}
          placeholder="Your name (shown with the review)"
          aria-label="Your name"
          className={field}
        />
        <textarea
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={REVIEW_LIMITS.text}
          minLength={REVIEW_LIMITS.minText}
          rows={4}
          placeholder="What did you build with it? What was good, what wasn't?"
          aria-label="Your review"
          className={field}
        />
        {/* Honeypot: invisible to people, irresistible to spam bots. */}
        <input
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          name="website"
        />
        {problem && <p className="text-bloom text-[13px]">{problem}</p>}
        {state === 'error' && <p className="text-bloom text-[13px]">Couldn't send that — please try again in a moment.</p>}
        {state === 'offline' && (
          <p className="text-chalk/60 text-[13px]">
            Reviews aren't switched on yet. Email it to{' '}
            <a className="text-accent underline" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>{' '}
            instead.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-chalk/40 text-[11px]">Reviews are checked before they're published.</p>
          <button
            type="submit"
            disabled={state === 'sending'}
            className="from-sun via-gold to-ember text-onbrand rounded-full bg-gradient-to-br px-5 py-2.5 text-[13px] font-bold disabled:opacity-50"
          >
            {state === 'sending' ? 'Sending…' : 'Submit review'}
          </button>
        </div>
      </div>
    </form>
  )
}

function Reviews({ item, reviews }: { item: CatalogItem; reviews: ReturnType<typeof summarise> | null }) {
  const bars = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews?.reviews.filter((r) => r.rating === n).length ?? 0,
  }))
  return (
    <section id="reviews" className="scroll-mt-28">
      <h2 className="flex items-center gap-3 text-xl sm:text-2xl">
        <span className="bg-gold h-5 w-1 rounded-full" />
        Customer reviews
      </h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-5">
          <div className="glass p-5">
            <div className="relative z-10">
              {reviews && reviews.count > 0 ? (
                <>
                  <p className="font-display text-4xl font-bold">{reviews.average.toFixed(1)}</p>
                  <Stars value={reviews.average} size={18} />
                  <p className="text-chalk/50 mt-1 text-[12px]">
                    {reviews.count} review{reviews.count === 1 ? '' : 's'}
                  </p>
                  <ul className="mt-4 space-y-1.5">
                    {bars.map((b) => (
                      <li key={b.n} className="flex items-center gap-2 text-[12px]">
                        <span className="text-chalk/50 w-3">{b.n}</span>
                        <span className="bg-chalk/10 h-1.5 flex-1 overflow-hidden rounded-full">
                          <span
                            className="bg-gold block h-full rounded-full"
                            style={{ width: `${(b.count / reviews.count) * 100}%` }}
                          />
                        </span>
                        <span className="text-chalk/40 w-5 text-right">{b.count}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-chalk/55 text-sm">No reviews yet. Own a {item.name}? Be the first to review it.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {reviews?.reviews.map((r) => (
            <article key={`${r.name}-${r.date}-${r.text.slice(0, 12)}`} className="glass-soft p-5">
              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Stars value={r.rating} />
                  <time className="text-chalk/40 text-[11px]" dateTime={r.date}>
                    {r.date}
                  </time>
                </div>
                <p className="text-chalk/75 mt-3 text-sm leading-relaxed whitespace-pre-line">{r.text}</p>
                <p className="text-chalk/45 mt-3 text-[12px] font-semibold">— {r.name}</p>
              </div>
            </article>
          ))}
          <ReviewForm slug={item.slug} />
        </div>
      </div>
    </section>
  )
}

/* -- Page ------------------------------------------------------------------ */

export function ProductPage({ item }: { item: CatalogItem }) {
  const all = useApprovedReviews()
  const summary = useMemo(() => (all ? summarise(all.filter((r) => r.product === item.slug)) : null), [all, item.slug])
  const category = categories[item.category]

  usePageMeta({
    title: `${item.name}${item.price ? ` — ${inr(item.price)}` : ''} | Nischay Robotics`,
    description: `${item.short} ${item.price ? `${inr(item.price)}, ${store.priceNote.toLowerCase()}.` : ''} Ships from Bengaluru across India.`,
    path: `/shop/${item.slug}`,
    image: item.images[0],
  })
  useJsonLd('ld-product', productJsonLd(item, seo.url, summary))
  useJsonLd(
    'ld-breadcrumb',
    breadcrumbJsonLd(seo.url, [
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/shop' },
      { name: item.name, path: `/shop/${item.slug}` },
    ]),
  )

  const related = listed.filter((p) => p.slug !== item.slug && p.category === item.category).slice(0, 4)
  const more = related.length ? related : listed.filter((p) => p.slug !== item.slug).slice(0, 4)

  return (
    <main className="grain relative z-10 px-5 pt-28 pb-10 sm:px-8 sm:pt-36">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="text-chalk/40 flex flex-wrap items-center gap-2 text-[12px]">
          <Link to="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/shop" className="hover:text-accent transition-colors">
            Shop
          </Link>
          <span aria-hidden="true">/</span>
          <Link to={`/shop#${item.category}`} className="hover:text-accent transition-colors">
            {category.label}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-chalk/70" aria-current="page">
            {item.name}
          </span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <Reveal>
            <Gallery item={item} />
          </Reveal>

          <Reveal delay={0.05}>
            <div>
              <p className="text-accent text-[11px] font-semibold tracking-[0.22em] uppercase">{item.brand}</p>
              <h1 className="mt-2 text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.05]">{item.name}</h1>
              <button type="button" onClick={() => scrollToId('reviews', 112)} className="mt-3 block">
                <RatingLine summary={summary ?? undefined} />
              </button>
              <p className="text-chalk/65 mt-4 text-base leading-relaxed">{item.short}</p>

              <div className="border-chalk/10 mt-6 border-y py-5">
                <Price item={item} large />
                {item.price !== null && <p className="text-chalk/45 mt-1 text-[12px]">{store.priceNote}</p>}
                {item.anyColour && (
                  <p className="text-chalk/70 mt-3 text-[13px]">
                    <span className="font-semibold">Any colour</span> — tell us yours when you order.
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <StockBadge item={item} />
                  <span className="text-chalk/40 text-[12px]">SKU {item.sku}</span>
                </div>
              </div>

              <div className="mt-6">
                <BuyActions item={item} />
              </div>

              <ul className="text-chalk/60 mt-6 space-y-2 text-[13px]">
                {[
                  item.price && item.price >= store.shipping.freeAbove ? 'Free shipping' : freeShippingLine,
                  deliveryLine,
                  `Country of origin: ${item.countryOfOrigin}`,
                ].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span className="bg-chalk/25 mt-[7px] h-1 w-1 shrink-0 rounded-full" />
                    {line}
                  </li>
                ))}
                <li className="flex gap-2.5">
                  <span className="bg-chalk/25 mt-[7px] h-1 w-1 shrink-0 rounded-full" />
                  <span>
                    {store.returns.days}-day returns ·{' '}
                    <Link to="/policies/returns" className="hover:text-accent underline">
                      read the policy
                    </Link>
                  </span>
                </li>
              </ul>

              {item.highlights.length > 0 && (
                <ul className="mt-6 space-y-2">
                  {item.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-sm">
                      <span className="bg-gold mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                      <span className="text-chalk/75">{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        </div>

        {/* Details */}
        <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section>
            <h2 className="flex items-center gap-3 text-xl sm:text-2xl">
              <span className="bg-gold h-5 w-1 rounded-full" />
              About this product
            </h2>
            <div className="text-chalk/70 mt-5 space-y-4 text-[15px] leading-relaxed">
              {item.description.map((d) => (
                <p key={d.slice(0, 24)}>{d}</p>
              ))}
            </div>
            {item.inBox.length > 0 && (
              <>
                <h3 className="mt-8 text-base font-semibold">What's in the box</h3>
                <ul className="text-chalk/70 mt-3 list-disc space-y-1.5 pl-5 text-sm">
                  {item.inBox.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-xl sm:text-2xl">
              <span className="bg-gold h-5 w-1 rounded-full" />
              Specifications
            </h2>
            <table className="glass mt-5 w-full overflow-hidden text-left text-[13px]">
              <tbody className="relative z-10">
                {[
                  ['Brand', item.brand],
                  ['Category', category.label],
                  ...item.specs,
                  ...(item.mpn ? [['Part number', item.mpn] as const] : []),
                  ['Country of origin', item.countryOfOrigin],
                ].map(([k, v]) => (
                  <tr key={k} className="border-chalk/[0.07] border-b last:border-0">
                    <th className="text-chalk/45 w-2/5 px-4 py-3 font-medium">{k}</th>
                    <td className="text-chalk/80 px-4 py-3">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="mt-16">
          <Reviews item={item} reviews={summary} />
        </div>

        <div className="mt-16">
          <TrustStrip />
        </div>

        {more.length > 0 && (
          <section className="mt-16">
            <h2 className="flex items-center gap-3 text-xl sm:text-2xl">
              <span className="bg-gold h-5 w-1 rounded-full" />
              {related.length ? `More ${category.label.toLowerCase()}` : 'You may also like'}
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
              {more.map((p) => (
                <li key={p.slug}>
                  <ProductCard item={p} summary={all ? summarise(all.filter((r) => r.product === p.slug)) : undefined} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
