import { Reveal, Section, SectionHeading } from '@/components/ui/primitives'
import { currency, productSection, products } from '@/content/site'
import type { Product } from '@/content/site'
import { useWaitlist } from '@/lib/waitlistContext'

const ACCENT: Record<Product['accent'], string> = {
  gold: 'rgba(255,201,60,0.42)',
  aqua: 'rgba(69,227,255,0.34)',
  iris: 'rgba(169,123,255,0.34)',
}

/** Indian digit grouping — 1,10,000 rather than 110,000. */
const inr = (n: number) => n.toLocaleString('en-IN')

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="mt-1 shrink-0">
      <path d="M2.5 7.4l3 3L11.5 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PriceCard({ product }: { product: Product }) {
  const join = useWaitlist()
  const featured = product.featured

  return (
    <article
      className={`${featured ? 'glass-strong' : 'glass'} group relative flex h-full flex-col overflow-hidden p-7 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 sm:p-8`}
    >
      <div
        className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full blur-[70px] transition-opacity duration-700"
        style={{ background: ACCENT[product.accent], opacity: featured ? 1 : 0 }}
      />

      <div className="relative z-10 flex h-full flex-col">
        {featured && (
          <span className="bg-gold text-void mb-5 w-fit rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.16em] uppercase">
            Most capable
          </span>
        )}

        <h3 className="font-display text-2xl leading-none font-bold tracking-tight">
          {product.name}
        </h3>
        <p className="text-chalk/55 mt-2.5 text-sm">{product.tagline}</p>

        {/* Price */}
        <div className="mt-6">
          {product.inr === null ? (
            <p className="text-chalk/45 font-display text-2xl font-bold">Price at launch</p>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-gold-grad font-display text-4xl font-bold">
                  ₹{inr(product.inr)}
                </span>
                {product.usd !== null && (
                  <span className="text-chalk/40 text-sm">≈ ${inr(product.usd)}</span>
                )}
              </div>
              {product.compareInr && (
                <p className="text-chalk/40 mt-2 text-xs">
                  <span className="line-through">₹{inr(product.compareInr)}</span>{' '}
                  <span className="text-gold/80">
                    save ₹{inr(product.compareInr - product.inr)} vs four singles
                  </span>
                </p>
              )}
            </>
          )}
        </div>

        <span
          className={`mt-5 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] uppercase ${
            product.status === 'waitlist'
              ? 'bg-gold/12 text-gold'
              : 'glass-soft text-chalk/50'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${product.status === 'waitlist' ? 'bg-gold animate-pulse' : 'bg-chalk/40'}`} />
          {product.statusLabel}
        </span>

        <p className="text-chalk/60 mt-6 text-sm leading-relaxed">{product.summary}</p>

        {/* Includes */}
        <div className="mt-6">
          <p className="text-chalk/35 text-[10px] font-semibold tracking-[0.2em] uppercase">
            What you get
          </p>
          <ul className="mt-3 space-y-2.5">
            {product.includes.map((i) => (
              <li key={i} className="text-chalk/65 flex gap-2.5 text-[13px] leading-relaxed">
                <span className="text-gold">
                  <CheckIcon />
                </span>
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Best for */}
        <div className="mt-5">
          <p className="text-chalk/35 text-[10px] font-semibold tracking-[0.2em] uppercase">
            Built for
          </p>
          <ul className="mt-3 space-y-2">
            {product.bestFor.map((b) => (
              <li key={b} className="text-chalk/50 flex gap-2.5 text-[13px] leading-relaxed">
                <span className="bg-chalk/25 mt-1.5 h-1 w-1 shrink-0 rounded-full" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => join(product.slug)}
          className={`mt-8 w-full rounded-full py-3.5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            featured
              ? 'from-sun via-gold to-ember text-void bg-gradient-to-br shadow-[0_10px_36px_-10px_rgba(255,201,60,0.75)] hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-10px_rgba(255,201,60,0.95)]'
              : 'glass-soft text-chalk hover:bg-white/[0.09] hover:-translate-y-0.5'
          }`}
        >
          Join the waitlist
        </button>
      </div>
    </article>
  )
}

export function Products() {
  return (
    <Section id="products">
      <SectionHeading
        kicker={productSection.kicker}
        title={
          <>
            Buy the parts. <span className="text-gold-grad">Build any body.</span>
          </>
        }
        lead={productSection.lead}
      />

      <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
        {products.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.08} className="h-full">
            <PriceCard product={p} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <p className="text-chalk/40 mx-auto mt-8 max-w-2xl text-center text-[13px] leading-relaxed">
          {productSection.shippingNote}{' '}
          <span className="text-chalk/25">{currency.note}</span>
        </p>
      </Reveal>
    </Section>
  )
}
