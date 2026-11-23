import { AsideCard, Block, PageShell } from '@/components/PageShell'
import { ArrowIcon, Button, Reveal, Tag } from '@/components/ui/primitives'
import { collaborate, contact, founder, links, pageAt } from '@/content/site'

const MAILTO = `mailto:${contact.email}?subject=${encodeURIComponent(
  'Nischay Robotics — partnership',
)}&body=${encodeURIComponent(
  "Hi Nischay,\n\nI'd like to talk about\n\n  [ ] incubation\n  [ ] lab / fabrication access\n  [ ] funding\n  [ ] collaborating on the build\n  [ ] research partnership\n  [ ] hardware sponsorship\n\nA bit about me / us:\n\n",
)}`

const SECTIONS = [
  { id: 'founder', label: 'Founder' },
  { id: 'background', label: 'Background' },
  { id: 'partnerships', label: 'Partnerships' },
] as const

export function CompanyPage() {
  return (
    <PageShell
      page={pageAt('/company')}
      title={
        <>
          Built in Bengaluru, by the person who <span className="text-gold-grad">designed every part</span>.
        </>
      }
      sections={SECTIONS}
      aside={
        <AsideCard title="Work with us" body="Incubation, lab access, funding or collaboration — every conversation is welcome.">
          <Button href={MAILTO} className="w-full !py-2.5 !text-[13px]">
            Get in touch
          </Button>
          <Button variant="glass" href={links.linkedin} external className="w-full !py-2.5 !text-[13px]">
            LinkedIn
          </Button>
        </AsideCard>
      }
    >
      {/* Bio */}
      <Block id="founder" title="Founder">
        <Reveal>
          <div className="glass-strong p-7 sm:p-9">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <h3 className="text-2xl sm:text-3xl">{founder.name}</h3>
                <span className="text-accent text-xs font-semibold tracking-[0.18em] uppercase">{founder.role}</span>
              </div>

              <div className="mt-6 max-w-3xl space-y-4">
                {founder.bio.map((p) => (
                  <p key={p.slice(0, 24)} className="text-chalk/65 text-sm leading-relaxed sm:text-[15px]">
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {founder.skills.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4 text-sm">
                <a
                  href={links.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-chalk/70 hover:text-accent font-medium transition-colors"
                >
                  LinkedIn ↗
                </a>
                <a
                  href={links.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-chalk/70 hover:text-accent font-medium transition-colors"
                >
                  GitHub ↗
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </Block>

      {/* Timeline */}
      <Block id="background" title="Background">
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal>
            <div className="glass h-full p-7">
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <p className="text-chalk/35 text-[10px] font-semibold tracking-[0.2em] uppercase">Currently</p>
                  <h4 className="mt-2 text-base font-semibold">{founder.current.title}</h4>
                </div>
                <span className="text-chalk/30 shrink-0 font-mono text-[10px] tracking-wide">
                  {founder.current.period}
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="glass h-full p-7">
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold">{founder.education.degree}</h4>
                    <p className="text-chalk/60 mt-1 text-sm">{founder.education.org}</p>
                  </div>
                  <span className="text-chalk/30 shrink-0 font-mono text-[10px] tracking-wide">
                    {founder.education.period}
                  </span>
                </div>
                <p className="text-gold-grad font-display mt-4 text-xl font-bold">{founder.education.note}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </Block>

      {/* Partnerships — a disclosure on the old one-page site; on its own page
          it gets to be a real section. */}
      <Block id="partnerships" title={collaborate.headline}>
        <Reveal>
          <p className="text-chalk/60 max-w-3xl text-sm leading-relaxed sm:text-[15px]">{collaborate.body}</p>
        </Reveal>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collaborate.seeking.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 0.06} className="h-full">
              <li className="glass h-full list-none p-6">
                <div className="relative z-10">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-gold h-1.5 w-1.5 rounded-full" />
                    <h3 className="text-[15px] font-semibold">{s.title}</h3>
                  </div>
                  <p className="text-chalk/55 mt-2.5 text-[13px] leading-relaxed">{s.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={MAILTO}>
              Get in touch <ArrowIcon />
            </Button>
            <Button variant="glass" href={links.linkedin} external>
              Message on LinkedIn
            </Button>
          </div>
        </Reveal>
      </Block>
    </PageShell>
  )
}
