import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowIcon, Button, Reveal, Section, SectionHeading, Tag } from '@/components/ui/primitives'
import { collaborate, contact, founder, links } from '@/content/site'

const MAILTO = `mailto:${contact.email}?subject=${encodeURIComponent(
  'Nischay Robotics — partnership',
)}&body=${encodeURIComponent(
  "Hi Nischay,\n\nI'd like to talk about\n\n  [ ] incubation\n  [ ] lab / fabrication access\n  [ ] funding\n  [ ] collaborating on the build\n  [ ] research partnership\n  [ ] hardware sponsorship\n\nA bit about me / us:\n\n",
)}`

/**
 * Partnership and incubation, folded into the company section behind a
 * disclosure. The site's job is to sell modules; this is here for the people
 * who deliberately go looking for it, not for every visitor.
 */
function Partnerships() {
  const [open, setOpen] = useState(false)

  return (
    <div className="glass mt-5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="relative z-10 flex w-full items-center justify-between gap-4 p-6 text-left sm:p-7"
      >
        <span>
          <span className="text-gold text-[11px] font-semibold tracking-[0.24em] uppercase">
            {collaborate.kicker}
          </span>
          <span className="mt-2 block text-lg font-semibold">{collaborate.headline}</span>
          <span className="text-chalk/45 mt-1 block text-[13px]">
            Incubation, lab access, funding, research and hardware partnerships
          </span>
        </span>
        <span
          className={`glass-soft text-chalk/70 flex h-9 w-9 shrink-0 items-center justify-center !rounded-full transition-transform duration-400 ${
            open ? 'rotate-45' : ''
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 overflow-hidden"
          >
            <div className="border-t border-white/8 p-6 sm:p-7">
              <p className="text-chalk/60 max-w-2xl text-sm leading-relaxed">
                {collaborate.body}
              </p>

              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {collaborate.seeking.map((s) => (
                  <li key={s.title}>
                    <div className="flex items-center gap-2.5">
                      <span className="bg-gold h-1.5 w-1.5 rounded-full" />
                      <h4 className="text-[14px] font-semibold">{s.title}</h4>
                    </div>
                    <p className="text-chalk/50 mt-2 text-[13px] leading-relaxed">{s.body}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button href={MAILTO}>
                  Get in touch <ArrowIcon />
                </Button>
                <Button variant="glass" href={links.linkedin} external>
                  Message on LinkedIn
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Founder() {
  return (
    <Section id="founder">
      <SectionHeading
        kicker="Company"
        title={
          <>
            Built in Bengaluru, by the person who{' '}
            <span className="text-gold-grad">designed every part</span>.
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

      <Reveal delay={0.06}>
        <Partnerships />
      </Reveal>
    </Section>
  )
}
