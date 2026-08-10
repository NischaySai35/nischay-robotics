import { Reveal, Section, SectionHeading } from '@/components/ui/primitives'
import { recognition } from '@/content/site'

function TrophyIcon({ dim = false }: { dim?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={dim ? 'opacity-40' : ''}
    >
      <path
        d="M4.5 2h7v3.2a3.5 3.5 0 0 1-7 0V2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 3H2.8v1.1A2.2 2.2 0 0 0 5 6.3M11.5 3h1.7v1.1a2.2 2.2 0 0 1-2.2 2.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path d="M8 8.8V11m-2.4 3h4.8l-.5-2.2H6.1L5.6 14Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

export function Recognition() {
  return (
    <Section id="recognition">
      <SectionHeading
        kicker="Recognition"
        title={
          <>
            Judged by people who <span className="text-gold-grad">build things</span> too.
          </>
        }
      />

      <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recognition.map((r, i) => {
          const featured = 'highlight' in r && r.highlight
          return (
            <Reveal key={r.award} delay={(i % 3) * 0.07}>
              <li
                className={`${featured ? 'glass-strong' : 'glass'} group relative h-full overflow-hidden p-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1`}
              >
                {featured && (
                  <div
                    className="pointer-events-none absolute -top-16 -right-12 h-40 w-40 rounded-full blur-[55px]"
                    style={{ background: 'rgba(255,201,60,0.30)' }}
                  />
                )}

                <div className="relative z-10">
                  <span className={featured ? 'text-gold' : 'text-chalk/45'}>
                    <TrophyIcon dim={!featured} />
                  </span>

                  <h3
                    className={`mt-4 text-[15px] leading-snug font-semibold ${
                      featured ? 'text-chalk' : 'text-chalk/80'
                    }`}
                  >
                    {r.award}
                  </h3>

                  <p className="text-chalk/50 mt-2 text-[13px] leading-snug">{r.org}</p>

                  {r.note && (
                    <p className="text-gold/70 mt-3 text-[11px] font-medium tracking-wide uppercase">
                      {r.note}
                    </p>
                  )}
                </div>
              </li>
            </Reveal>
          )
        })}
      </ul>
    </Section>
  )
}
