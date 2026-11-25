// REUSE-CHECKED: discord|community|contact|channels -> no community/contact section existed; icons live in components/ui/SocialIcons.tsx.

import { AsideCard, Block, PageShell } from '@/components/PageShell'
import { Link } from '@/components/ui/Link'
import { ArrowIcon, Button, Reveal, Section } from '@/components/ui/primitives'
import { ChannelIconView, DiscordIcon } from '@/components/ui/SocialIcons'
import { channels, community, contact, links, pageAt, pageSections } from '@/content/site'

/** Discord's own blurple — used only on the Discord tile, so it reads as Discord. */
const BLURPLE = '#5865F2'

function DiscordTile({ size = 56 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_10px_30px_-10px_rgba(88,101,242,0.8)]"
      style={{ background: BLURPLE, width: size, height: size }}
    >
      <DiscordIcon size={Math.round(size / 2)} />
    </span>
  )
}

function JoinDiscordButton({ className = '' }: { className?: string }) {
  const live = Boolean(links.discord)
  return (
    <Button
      href={links.discord ?? undefined}
      external
      disabled={!live}
      title={live ? undefined : community.pending}
      className={className}
    >
      <DiscordIcon size={17} />
      {live ? community.cta : community.pending}
      {live && <ArrowIcon />}
    </Button>
  )
}

/** The primary card: what the Discord is, and the button into it. */
function DiscordCard() {
  return (
    <div className="glass-strong p-7 sm:p-9">
      <div className="relative z-10 grid gap-8 xl:grid-cols-[1.3fr_1fr] xl:items-end">
        <div>
          <div className="flex items-center gap-4">
            <DiscordTile />
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
        </div>

        <div className="xl:text-right">
          <JoinDiscordButton className="w-full !py-3.5 sm:w-auto" />
          {links.discord && (
            <p className="text-chalk/35 mt-3 text-[12px]">Free · opens in the Discord app or your browser</p>
          )}
        </div>
      </div>
    </div>
  )
}

/** Every channel besides Discord. */
function ChannelList() {
  return (
    <div className="glass p-3 sm:p-4">
      <ul className="relative z-10 grid md:grid-cols-2">
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
                  <span className="text-chalk flex items-baseline gap-2 text-sm font-semibold">
                    {c.label}
                    <span className="text-chalk/35 hidden truncate text-[11px] font-normal sm:inline">{c.note}</span>
                  </span>
                  <span className="text-chalk/50 block truncate text-[13px]">{c.handle}</span>
                </span>
                <ArrowIcon className="text-chalk/35 group-hover:text-accent shrink-0" />
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const SECTIONS = pageSections['/community']

export function CommunityPage() {
  const words = community.headline.split(' ')

  return (
    <PageShell
      page={pageAt('/community')}
      title={
        <>
          {words.slice(0, -1).join(' ')} <span className="text-gold-grad">{words.at(-1)}</span>
        </>
      }
      lead={community.lead}
      sections={SECTIONS}
      aside={
        <AsideCard title="Prefer email?" body="Orders, partnerships and press — it reaches the founder directly.">
          <Button href={`mailto:${contact.email}`} variant="glass" className="w-full !py-2.5 !text-[13px]">
            Email us
          </Button>
        </AsideCard>
      }
    >
      <Block id="discord" title="Discord — the main place">
        <Reveal>
          <DiscordCard />
        </Reveal>
      </Block>

      <Block id="channels" title={community.othersTitle}>
        <Reveal>
          <ChannelList />
        </Reveal>
      </Block>
    </PageShell>
  )
}

/** Compact Discord strip for the home page. */
export function CommunityBand() {
  return (
    <Section id="community" className="!pt-0">
      <Reveal>
        <div className="glass-strong p-6 sm:p-8">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <DiscordTile size={60} />
              <div>
                <p className="text-accent text-[11px] font-semibold tracking-[0.24em] uppercase">{community.kicker}</p>
                <h2 className="mt-1.5 text-2xl sm:text-3xl">{community.headline}</h2>
                <p className="text-chalk/55 mt-1.5 text-sm">
                  Early looks, build talk and a direct line to the founder.{' '}
                  <Link to="/community#channels" className="text-accent hover:text-sun font-semibold">
                    Other ways to reach us
                  </Link>
                </p>
              </div>
            </div>
            <JoinDiscordButton className="shrink-0 !py-3.5" />
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
