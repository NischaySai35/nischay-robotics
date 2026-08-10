import { Reveal, Section, SectionHeading, Tag } from '@/components/ui/primitives'
import { founder, links } from '@/content/site'

export function Founder() {
  return (
    <Section id="founder">
      <SectionHeading
        kicker="Founder"
        title={
          <>
            One person, a desk, and a{' '}
            <span className="text-gold-grad">stubborn idea</span>.
          </>
        }
      />

      <div className="mt-14 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Bio */}
        <Reveal>
          <div className="glass-strong h-full p-7 sm:p-9">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <h3 className="text-2xl sm:text-3xl">{founder.name}</h3>
                <span className="text-gold text-xs font-semibold tracking-[0.18em] uppercase">
                  {founder.role}
                </span>
              </div>

              <div className="mt-6 space-y-4">
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
                  className="text-chalk/70 hover:text-gold font-medium transition-colors"
                >
                  LinkedIn ↗
                </a>
                <a
                  href={links.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-chalk/70 hover:text-gold font-medium transition-colors"
                >
                  GitHub ↗
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Timeline */}
        <div className="flex flex-col gap-5">
          <Reveal delay={0.08}>
            <div className="glass p-7">
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold">{founder.dayJob.title}</h4>
                    <p className="text-gold mt-1 text-sm font-medium">{founder.dayJob.org}</p>
                  </div>
                  <span className="text-chalk/30 shrink-0 font-mono text-[10px] tracking-wide">
                    {founder.dayJob.period}
                  </span>
                </div>

                <ul className="mt-5 space-y-3">
                  {founder.dayJob.points.map((p) => (
                    <li key={p.slice(0, 20)} className="text-chalk/55 flex gap-3 text-[13px] leading-relaxed">
                      <span className="bg-gold/50 mt-1.5 h-1 w-1 shrink-0 rounded-full" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="glass p-7">
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
                <p className="text-gold-grad font-display mt-4 text-xl font-bold">
                  {founder.education.note}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
