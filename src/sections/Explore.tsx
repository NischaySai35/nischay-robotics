// REUSE-CHECKED: explore|cards|pages grid -> Pillars is a fixed 3-card statement band, not navigation; nothing linked out to pages.

import { Link } from '@/components/ui/Link'
import { ArrowIcon, Reveal, Section, SectionHeading } from '@/components/ui/primitives'
import { DiscordIcon } from '@/components/ui/SocialIcons'
import { pages } from '@/content/site'

/**
 * The home page's table of contents: one card per page. Everything that used
 * to be explained at length on the single long page now lives behind these.
 */
export function Explore() {
  return (
    <Section id="explore">
      <SectionHeading
        kicker="Explore"
        title={
          <>
            Explore our <span className="text-gold-grad">products & services</span>.
          </>
        }
        lead="Modules and pricing, the Tetrobot software, every shape the hardware makes, build videos, the company and the community — all in one place."
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((p, i) => (
          <Reveal key={p.path} delay={(i % 3) * 0.07} className="h-full">
            <Link
              to={p.path}
              className="glass group flex h-full flex-col overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5"
            >
              <span className="relative block aspect-[16/9] overflow-hidden">
                {p.image ? (
                  <img
                    src={p.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[#5865F2] text-white">
                    <DiscordIcon size={56} />
                  </span>
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              </span>

              <span className="relative z-10 flex flex-1 flex-col p-6">
                <span className="text-accent text-[10px] font-semibold tracking-[0.22em] uppercase">{p.kicker}</span>
                <span className="font-display mt-2 text-xl font-bold">{p.label}</span>
                <span className="text-chalk/58 mt-2 text-sm leading-relaxed">{p.blurb}</span>
                <span className="text-chalk/70 group-hover:text-accent mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold transition-colors">
                  Open {p.label} <ArrowIcon />
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
