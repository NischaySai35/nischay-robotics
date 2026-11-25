import { AsideCard, Block, PageShell } from '@/components/PageShell'
import { Button, Reveal } from '@/components/ui/primitives'
import { currency, links, pageAt, productSection, products, pageSections } from '@/content/site'
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
          <span className="bg-gold text-onbrand mb-5 w-fit rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.16em] uppercase">
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
                  <span className="text-accent/80">
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
              ? 'bg-gold/12 text-accent'
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
                <span className="text-accent">
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
              ? 'from-sun via-gold to-ember text-onbrand bg-gradient-to-br shadow-[0_10px_36px_-10px_rgba(255,201,60,0.75)] hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-10px_rgba(255,201,60,0.95)]'
              : 'glass-soft text-chalk hover:bg-chalk/[0.06] hover:-translate-y-0.5'
          }`}
        >
          Join the waitlist
        </button>
      </div>
    </article>
  )
}

const SECTIONS = pageSections['/modules']

export function ModulesPage() {
  const join = useWaitlist()

  return (
    <PageShell
      page={pageAt('/modules')}
      title={
        <>
          Buy the parts. <span className="text-gold-grad">Build any body.</span>
        </>
      }
      lead={productSection.lead}
      sections={SECTIONS}
      aside={
        <AsideCard title="Be first in line" body="One email when the modules ship. Nothing else.">
          <Button onClick={() => join()} className="w-full !py-2.5 !text-[13px]">
            Join the waitlist
          </Button>
          <Button variant="glass" href={links.discord ?? undefined} external disabled={!links.discord} className="w-full !py-2.5 !text-[13px]">
            Ask on Discord
          </Button>
        </AsideCard>
      }
    >
      <Block id="pricing" title="Pricing">
        <div className="grid items-stretch gap-5 xl:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08} className="h-full">
              <PriceCard product={p} />
            </Reveal>
          ))}
        </div>
      </Block>

      <Block id="waitlist" title="How the waitlist works">
        <ol className="grid gap-4 md:grid-cols-3">
          {WAITLIST_STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.07} className="h-full">
              <li className="glass h-full list-none p-6">
                <div className="relative z-10">
                  <span className="bg-gold/12 text-accent flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-bold">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                  <p className="text-chalk/58 mt-2 text-sm leading-relaxed">{s.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </Block>

      <Block id="shipping" title="Shipping & currency">
        <Reveal>
          <div className="glass p-6 sm:p-7">
            <div className="relative z-10 space-y-3">
              <p className="text-chalk/70 text-sm leading-relaxed sm:text-[15px]">{productSection.shippingNote}</p>
              <p className="text-chalk/45 text-[13px] leading-relaxed">
                {currency.note} Converted at about ₹{currency.inrPerUsd} per US dollar.
              </p>
            </div>
          </div>
        </Reveal>
      </Block>
    </PageShell>
  )
}

/** Only what is actually true of the waitlist today — no promised dates. */
const WAITLIST_STEPS = [
  {
    title: 'Join — it’s free',
    body: 'Pick a product and leave your email. Joining costs nothing and doesn’t commit you to buying.',
  },
  {
    title: 'Get one email',
    body: 'When modules are ready to ship, you hear first — directly from the person who built them. No newsletter in between.',
  },
  {
    title: 'Shape what ships',
    body: 'Tell us what you’d build. Notes on the form decide which tool tip gets designed first.',
  },
]
