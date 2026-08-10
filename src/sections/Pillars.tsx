import { Reveal, Section, SectionHeading } from '@/components/ui/primitives'
import { pillars } from '@/content/site'

const ACCENT: Record<string, { glow: string; text: string }> = {
  gold: { glow: 'rgba(255,201,60,0.55)', text: 'text-gold' },
  aqua: { glow: 'rgba(69,227,255,0.5)', text: 'text-aqua' },
  iris: { glow: 'rgba(169,123,255,0.5)', text: 'text-iris' },
}

export function Pillars() {
  return (
    <Section id="work">
      <SectionHeading
        kicker="What we build"
        title={
          <>
            Three problems, <span className="text-gold-grad">one idea</span> — a machine
            shouldn't be stuck with the body it was born with.
          </>
        }
        lead="Hardware that reconfigures, and software honest enough to describe it."
      />

      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {pillars.map((p, i) => {
          const accent = ACCENT[p.accent] ?? ACCENT.gold
          return (
            <Reveal key={p.id} delay={i * 0.09}>
              <article className="glass group relative h-full overflow-hidden p-7 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5">
                {/* accent bloom, revealed on hover */}
                <div
                  className="pointer-events-none absolute -top-24 -right-16 h-48 w-48 rounded-full opacity-0 blur-[60px] transition-opacity duration-700 group-hover:opacity-100"
                  style={{ background: accent.glow }}
                />

                <div className="relative z-10">
                  <span
                    className={`font-display text-[13px] font-bold tracking-[0.2em] ${accent.text}`}
                  >
                    {p.index}
                  </span>

                  <h3 className="mt-5 text-2xl leading-tight">{p.title}</h3>

                  <p className="text-chalk/62 mt-4 text-sm leading-relaxed">{p.body}</p>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
