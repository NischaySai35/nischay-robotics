import { ArrowIcon, Button, Reveal, Section } from '@/components/ui/primitives'
import { collaborate, company, contact, links } from '@/content/site'

const MAILTO = `mailto:${contact.email}?subject=${encodeURIComponent(
  'Nischay Robotics — collaboration',
)}&body=${encodeURIComponent(
  "Hi Nischay,\n\nI came across Nischay Robotics and I'd like to talk about\n\n  [ ] incubation\n  [ ] lab / fabrication access\n  [ ] funding\n  [ ] collaborating on the build\n  [ ] research partnership\n  [ ] hardware sponsorship\n\nA bit about me / us:\n\n",
)}`

export function Collaborate() {
  return (
    <Section id="collaborate" className="pb-16 md:pb-24">
      {/* The ask */}
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="text-gold mb-4 text-[11px] font-semibold tracking-[0.28em] uppercase">
            {collaborate.kicker}
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="text-[clamp(2rem,5.2vw,3.6rem)] text-balance">
            I've taken this as far as{' '}
            <span className="text-iridescent">a desk allows</span>.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="text-chalk/65 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
            {collaborate.body}
          </p>
        </Reveal>
      </div>

      {/* What's needed */}
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collaborate.seeking.map((s, i) => (
          <Reveal key={s.title} delay={(i % 3) * 0.07}>
            <div className="glass group h-full p-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1">
              <div className="relative z-10">
                <div className="flex items-center gap-2.5">
                  <span className="bg-gold h-1.5 w-1.5 rounded-full transition-transform duration-500 group-hover:scale-150" />
                  <h3 className="text-[15px] font-semibold">{s.title}</h3>
                </div>
                <p className="text-chalk/55 mt-3 text-[13px] leading-relaxed">{s.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Contact */}
      <Reveal delay={0.1}>
        <div className="glass-strong relative mt-8 overflow-hidden p-8 sm:p-12">
          <div
            className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full blur-[90px]"
            style={{ background: 'rgba(255,201,60,0.22)' }}
          />

          <div className="relative z-10 flex flex-col items-center gap-8 text-center">
            <div className="max-w-xl">
              <h3 className="text-[clamp(1.5rem,3vw,2.2rem)] text-balance">
                If any of that is something you can offer — please get in touch.
              </h3>
              <p className="text-chalk/55 mt-4 text-sm leading-relaxed">
                A reply from one interested person is worth more than a thousand page views.
                I read everything.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button href={MAILTO}>
                Email me <ArrowIcon />
              </Button>
              <Button variant="glass" href={links.linkedin} external>
                Message on LinkedIn
              </Button>
            </div>

            <dl className="text-chalk/45 grid w-full max-w-lg grid-cols-1 gap-4 border-t border-white/8 pt-7 text-[13px] sm:grid-cols-3">
              <div>
                <dt className="text-chalk/30 text-[10px] tracking-[0.18em] uppercase">Email</dt>
                <dd className="mt-1.5">
                  <a href={`mailto:${contact.email}`} className="hover:text-gold transition-colors">
                    {contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-chalk/30 text-[10px] tracking-[0.18em] uppercase">Phone</dt>
                <dd className="mt-1.5">
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, '')}`}
                    className="hover:text-gold transition-colors"
                  >
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-chalk/30 text-[10px] tracking-[0.18em] uppercase">Based in</dt>
                <dd className="mt-1.5">{company.location.replace(', India', '')}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
