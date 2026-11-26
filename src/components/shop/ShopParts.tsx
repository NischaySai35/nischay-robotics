// REUSE-CHECKED: card|price|stars|rating -> PriceCard in sections/Products.tsx is the Modules page's large plan card (features list, waitlist CTA); shop needs a compact image-led card and rating stars, which didn't exist.

import { useState } from 'react'
import { Link } from '@/components/ui/Link'
import { availabilityLabel, categories, discountPct, inr, productPath } from '@/content/catalog'
import type { CatalogItem } from '@/content/catalog'
import type { ReviewSummary } from '@/content/structuredData'

/* -- Stars ----------------------------------------------------------------- */

function Star({ fill, size }: { fill: number; size: number }) {
  // fill: 0..1 — partial stars for averages like 4.3
  const id = `s${Math.round(fill * 100)}`
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="var(--color-gold)" />
          <stop offset={`${fill * 100}%`} stopColor="currentColor" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"
        fill={`url(#${id})`}
        stroke="var(--color-ember)"
        strokeOpacity={fill > 0 ? 0.6 : 0.25}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="text-chalk inline-flex items-center gap-0.5" role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} fill={Math.max(0, Math.min(1, value - i))} />
      ))}
    </span>
  )
}

export function RatingLine({ summary, size = 14 }: { summary?: ReviewSummary; size?: number }) {
  if (!summary || summary.count === 0) {
    return <span className="text-chalk/40 text-[12px]">No reviews yet</span>
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px]">
      <Stars value={summary.average} size={size} />
      <span className="text-chalk/70 font-semibold">{summary.average.toFixed(1)}</span>
      <span className="text-chalk/40">({summary.count})</span>
    </span>
  )
}

/** Clickable 1–5 picker for the review form. */
export function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="text-chalk p-0.5 transition-transform hover:scale-110"
        >
          <Star size={26} fill={shown >= n ? 1 : 0} />
        </button>
      ))}
    </div>
  )
}

/* -- Price & stock --------------------------------------------------------- */

export function Price({ item, large = false }: { item: CatalogItem; large?: boolean }) {
  if (item.price === null) {
    return (
      <span className={`text-chalk/50 ${large ? 'text-xl' : 'text-sm'}`}>
        {item.availability === 'made_to_order' ? 'Price on request' : 'Price at launch'}
      </span>
    )
  }
  const off = discountPct(item)
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className={`text-gold-grad font-display font-bold ${large ? 'text-4xl' : 'text-xl'}`}>{inr(item.price)}</span>
      {off > 0 && item.mrp && (
        <>
          <span className={`text-chalk/40 line-through ${large ? 'text-base' : 'text-[12px]'}`}>{inr(item.mrp)}</span>
          <span className={`text-zest font-bold ${large ? 'text-base' : 'text-[12px]'}`}>{off}% off</span>
        </>
      )}
    </span>
  )
}

export function StockBadge({ item }: { item: CatalogItem }) {
  const tone =
    item.availability === 'in_stock'
      ? 'bg-zest/15 text-zest'
      : item.availability === 'preorder' || item.availability === 'made_to_order'
        ? 'bg-gold/15 text-accent'
        : 'bg-chalk/10 text-chalk/55'
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase ${tone}`}>
      {availabilityLabel[item.availability]}
    </span>
  )
}

/* -- Card ------------------------------------------------------------------ */

export function ProductCard({ item, summary }: { item: CatalogItem; summary?: ReviewSummary }) {
  const off = discountPct(item)
  return (
    <Link
      to={productPath(item)}
      className="glass group flex h-full flex-col overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1"
    >
      <span className="bg-ink relative block aspect-[4/3] overflow-hidden">
        {item.images[0] && (
          <img
            src={item.images[0]}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {off > 0 && (
          <span className="bg-zest absolute top-3 left-3 rounded-full px-2 py-0.5 text-[11px] font-bold text-white">
            {off}% off
          </span>
        )}
      </span>
      <span className="relative z-10 flex flex-1 flex-col gap-2 p-5">
        <span className="text-chalk/40 text-[10px] font-semibold tracking-[0.18em] uppercase">
          {categories[item.category].label}
        </span>
        <span className="group-hover:text-accent text-[15px] leading-snug font-semibold transition-colors">{item.name}</span>
        <RatingLine summary={summary} size={12} />
        <span className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <Price item={item} />
          <StockBadge item={item} />
        </span>
      </span>
    </Link>
  )
}
