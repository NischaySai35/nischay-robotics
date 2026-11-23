// REUSE-CHECKED: discord|community|join us -> only the copy just added to site.ts and the waitlist success link; no community section or Discord icon existed.

import { ArrowIcon, Button, Reveal, Section } from '@/components/ui/primitives'
import { community, links } from '@/content/site'

/** Discord's mark (Simple Icons, CC0). Inherits colour from `currentColor`. */
export function DiscordIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.1.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

/**
 * "Join the community" band, between the company section and the footer.
 * Renders a disabled "opening soon" button until `links.discord` is set in
 * site.ts — never a dead link.
 */
export function Community() {
  const live = Boolean(links.discord)

  return (
    <Section id="community" className="!pt-0">
      <Reveal>
        <div className="glass-strong overflow-hidden p-7 sm:p-10">
          <div className="relative z-10 grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-accent flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.28em] uppercase">
                <span className="bg-gold/60 h-px w-8" />
                {community.kicker}
              </p>
              <h2 className="mt-4 text-[clamp(1.8rem,3.6vw,2.6rem)] text-balance">
                {community.headline.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="text-gold-grad">{community.headline.split(' ').slice(-1)}</span>
              </h2>
              <p className="text-chalk/60 mt-4 max-w-xl text-sm leading-relaxed sm:text-[15px]">
                {community.body}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button
                  href={links.discord ?? undefined}
                  external
                  disabled={!live}
                  title={live ? undefined : community.pending}
                >
                  <DiscordIcon size={17} />
                  {live ? community.cta : community.pending}
                  {live && <ArrowIcon />}
                </Button>
              </div>
            </div>

            <ul className="space-y-3">
              {community.points.map((p) => (
                <li key={p} className="glass-soft flex items-start gap-3 px-4 py-3.5">
                  <span className="bg-gold relative z-10 mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" />
                  <span className="text-chalk/70 relative z-10 text-[13px] leading-relaxed sm:text-sm">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
