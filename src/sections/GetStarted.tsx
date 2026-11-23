// REUSE-CHECKED: get started|prices|download band -> Products page has full price cards; this is the compact home-page version of both actions.

import { DownloadCompact } from '@/components/DownloadPanel'
import { Link } from '@/components/ui/Link'
import { ArrowIcon, Reveal, Section } from '@/components/ui/primitives'
import { currency, products, software } from '@/content/site'
import { useWaitlist } from '@/lib/waitlistContext'

const inr = (n: number) => n.toLocaleString('en-IN')

/**
 * The two things a visitor can actually do today, straight under the hero:
 * download the software, or get in line for the hardware. Sits *below* the
 * hero on purpose — the opening screen stays exactly as it was.
 */
export function GetStarted() {
  const join = useWaitlist()

  return (
    <Section id="get-started" className="!pt-10 md:!pt-14">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* -- Software ---------------------------------------------------- */}
        <Reveal className="h-full">
          <div className="glass-strong flex h-full flex-col p-7 sm:p-8">
            <div className="relative z-10 flex h-full flex-col">
              <p className="text-accent text-[11px] font-semibold tracking-[0.24em] uppercase">Try it now · free</p>
              <h2 className="mt-3 text-2xl sm:text-3xl">Download {software.name}</h2>
              <p className="text-chalk/58 mt-2 text-sm leading-relaxed">
                The graph-native runtime on your own machine — Windows, macOS and Linux.
              </p>
              <div className="mt-6">
                <DownloadCompact />
              </div>
              <Link
                to="/tetrobot#download"
                className="text-chalk/60 hover:text-accent group mt-auto inline-flex items-center gap-2 pt-6 text-[13px] font-semibold transition-colors"
              >
                All platforms & install help <ArrowIcon />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* -- Hardware ---------------------------------------------------- */}
        <Reveal delay={0.08} className="h-full">
          <div className="glass flex h-full flex-col p-7 sm:p-8">
            <div className="relative z-10 flex h-full flex-col">
              <p className="text-accent text-[11px] font-semibold tracking-[0.24em] uppercase">Buy the hardware</p>
              <h2 className="mt-3 text-2xl sm:text-3xl">Modules & kits</h2>
              <p className="text-chalk/58 mt-2 text-sm leading-relaxed">
                Releasing soon. Join the waitlist and you'll be first to order.
              </p>

              <ul className="mt-5 divide-y divide-chalk/10">
                {products.map((p) => (
                  <li key={p.slug} className="flex items-center gap-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
                        {p.name}
                        {p.featured && (
                          <span className="bg-gold text-onbrand rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] uppercase">
                            Best value
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[13px]">
                        {p.inr ? (
                          <>
                            <span className="text-gold-grad font-display text-lg font-bold">₹{inr(p.inr)}</span>
                            {p.usd && <span className="text-chalk/40"> ≈ ${inr(p.usd)}</span>}
                            {p.compareInr && (
                              <span className="text-chalk/35 ml-2 line-through">₹{inr(p.compareInr)}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-chalk/50">{p.statusLabel} · price at launch</span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => join(p.slug)}
                      className={`shrink-0 rounded-full px-4 py-2 text-[12px] font-bold transition-all hover:-translate-y-0.5 ${
                        p.featured
                          ? 'from-sun via-gold to-ember text-onbrand bg-gradient-to-br shadow-[0_8px_24px_-10px_rgba(255,201,60,0.8)]'
                          : 'glass-soft text-chalk !rounded-full'
                      }`}
                    >
                      <span className="relative z-10">{p.inr ? 'Join waitlist' : 'Get notified'}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                <Link
                  to="/modules"
                  className="text-chalk/60 hover:text-accent group inline-flex items-center gap-2 text-[13px] font-semibold transition-colors"
                >
                  What's in the box <ArrowIcon />
                </Link>
                <span className="text-chalk/30 text-[11px]">{currency.note}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
