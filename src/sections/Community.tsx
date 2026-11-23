// REUSE-CHECKED: discord|community|contact|channels -> no community/contact section existed; icons live in components/ui/SocialIcons.tsx.

import { ArrowIcon, Button, Reveal, Section, SectionHeading } from '@/components/ui/primitives'
import { ChannelIconView, DiscordIcon } from '@/components/ui/SocialIcons'
import { channels, community, links } from '@/content/site'

/** Discord's own blurple — used only on the Discord tile, so it reads as Discord. */
const BLURPLE = '#5865F2'

/**
 * Community & contact. Discord is the primary card on purpose: it is the
 * channel that scales past one person answering email. Every other way in is
 * listed beside it. Renders an "opening soon" button if `links.discord` is
 * null — never a dead link.
 */
export function Community() {
  const live = Boolean(links.discord)
  const words = community.headline.split(' ')

  return (
    <Section id="community">
      <SectionHeading
        kicker={community.kicker}
        title={
          <>
            {words.slice(0, -1).join(' ')}{' '}
            <span className="text-gold-grad">{words.at(-1)}</span>
          </>
        }
        lead={community.lead}
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        {/* -- Discord: the main card --------------------------------------- */}
        <Reveal className="h-full">
          <div className="glass-strong h-full p-7 sm:p-9">
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center gap-4">
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_10px_30px_-10px_rgba(88,101,242,0.8)]"
                  style={{ background: BLURPLE }}
                >
                  <DiscordIcon size={28} />
                </span>
                <div>
                  <p className="font-display text-xl font-bold">Discord</p>
                  <p className="text-chalk/50 mt-0.5 flex items-center gap-2 text-[13px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3BA55C]" />
                    Nischay Robotics server · open to everyone
                  </p>
                </div>
              </div>

              <p className="text-chalk/65 mt-6 text-sm leading-relaxed sm:text-[15px]">{community.body}</p>

              <ul className="mt-6 space-y-2.5">
                {community.points.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="bg-gold mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" />
                    <span className="text-chalk/70 text-[13px] leading-relaxed sm:text-sm">{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <Button
                  href={links.discord ?? undefined}
                  external
                  disabled={!live}
                  title={live ? undefined : community.pending}
                  className="w-full !py-3.5 sm:w-auto"
                >
                  <DiscordIcon size={17} />
                  {live ? community.cta : community.pending}
                  {live && <ArrowIcon />}
                </Button>
                {live && (
                  <p className="text-chalk/35 mt-3 text-[12px]">Free · opens in the Discord app or your browser</p>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        {/* -- Every other channel ------------------------------------------ */}
        <Reveal delay={0.08} className="h-full">
          <div className="glass h-full p-3 sm:p-4">
            <div className="relative z-10">
              <h3 className="text-chalk/40 px-3 pt-3 pb-2 text-[10px] font-semibold tracking-[0.2em] uppercase sm:px-4">
                {community.othersTitle}
              </h3>
              <ul>
                {channels.map((c) => {
                  const isMail = c.href.startsWith('mailto:')
                  return (
                    <li key={c.label}>
                      <a
                        href={c.href}
                        {...(isMail ? {} : { target: '_blank', rel: 'noreferrer noopener' })}
                        className="group flex items-center gap-3.5 rounded-2xl px-3 py-3 transition-colors hover:bg-chalk/[0.05] sm:px-4"
                      >
                        <span className="glass-soft text-accent flex h-10 w-10 shrink-0 items-center justify-center !rounded-xl">
                          <span className="relative z-10">
                            <ChannelIconView name={c.icon} size={18} />
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-chalk block text-sm font-semibold">{c.label}</span>
                          <span className="text-chalk/50 block truncate text-[13px]">{c.handle}</span>
                        </span>
                        <span className="text-chalk/35 hidden shrink-0 text-[12px] sm:block">{c.note}</span>
                        <ArrowIcon className="text-chalk/35 group-hover:text-accent shrink-0" />
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
