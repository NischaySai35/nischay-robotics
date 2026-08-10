import { GraphVsTree } from '@/components/GraphVsTree'
import { ArrowIcon, Button, Reveal, Section } from '@/components/ui/primitives'
import { configurations, keystoneConfig, links, tetrobot } from '@/content/site'
import { scrollToId } from '@/lib/scroll'

function CrossIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="mt-1 shrink-0">
      <circle cx="7" cy="7" r="6.2" stroke="#FF5F6D" strokeWidth="1.2" opacity="0.55" />
      <path d="M4.8 4.8l4.4 4.4M9.2 4.8l-4.4 4.4" stroke="#FF5F6D" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="mt-1 shrink-0">
      <circle cx="7" cy="7" r="6.2" stroke="#FFC93C" strokeWidth="1.2" opacity="0.55" />
      <path d="M4.4 7.2l1.9 1.9L9.7 5" stroke="#FFC93C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Tetrobot() {
  return (
    <Section id="tetrobot" width="wide">
      {/* Header */}
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-semibold tracking-[0.28em] text-gold uppercase">
              {tetrobot.kicker}
            </span>
            <span className="glass-soft text-chalk/45 !rounded-full px-3 py-1 text-[10px] tracking-wide">
              {tetrobot.name} — {tetrobot.nameNote}
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <h2 className="mt-5 text-[clamp(2rem,5vw,3.6rem)] text-balance">
            A tree cannot describe a robot that{' '}
            <span className="text-iridescent">rebuilds itself</span>.
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="text-chalk/65 mt-6 text-base leading-relaxed text-pretty sm:text-lg">
            {tetrobot.intro}
          </p>
        </Reveal>
      </div>

      {/* The diagram */}
      <Reveal delay={0.1} className="mt-14">
        <GraphVsTree />
      </Reveal>

      {/* Hardware proof. The Ring morphology above isn't a thought experiment —
          it is a photograph of the modules with head latched to tail. */}
      <Reveal delay={0.08} className="mt-5">
        <div className="glass grid gap-0 overflow-hidden md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-56 overflow-hidden">
            <img
              src={`/visuals/${keystoneConfig.slug}.jpg`}
              alt={keystoneConfig.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 md:to-black/60" />
          </div>

          <div className="relative z-10 p-7 sm:p-9">
            <p className="text-gold text-[11px] font-semibold tracking-[0.24em] uppercase">
              Not a thought experiment
            </p>
            {/* Worded to stay true whichever morphology the diagram above
                happens to be cycling through. */}
            <h3 className="mt-4 text-xl leading-tight sm:text-2xl">
              That ring is a shape the tree model has to reject.
            </h3>
            <p className="text-chalk/60 mt-4 text-sm leading-relaxed">
              Head latched to tail, closing the loop. It exists, it holds, it drives — and no
              URDF will describe it without being lied to first. Every closed configuration in
              the hardware is a case the graph handles natively and the tree cannot.
            </p>
            <button
              type="button"
              onClick={() => scrollToId('configurations')}
              className="text-chalk/70 hover:text-gold mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            >
              See all {configurations.length} configurations <ArrowIcon />
            </button>
          </div>
        </div>
      </Reveal>

      {/* Assumption vs reality */}
      <div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-2">
        <Reveal>
          <div className="glass h-full p-6">
            <div className="relative z-10">
              <h3 className="text-chalk/75 text-lg">{tetrobot.problem.title}</h3>
              <ul className="mt-5 space-y-3.5">
                {tetrobot.problem.points.map((p) => (
                  <li key={p} className="text-chalk/55 flex gap-3 text-sm leading-relaxed">
                    <CrossIcon />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="glass h-full p-6">
            <div className="relative z-10">
              <h3 className="text-chalk text-lg">{tetrobot.solution.title}</h3>
              <ul className="mt-5 space-y-3.5">
                {tetrobot.solution.points.map((p) => (
                  <li key={p} className="text-chalk/70 flex gap-3 text-sm leading-relaxed">
                    <CheckIcon />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Capabilities */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tetrobot.capabilities.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.07}>
            <div className="glass group h-full p-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5">
              <div className="relative z-10">
                <div className="bg-gold/12 text-gold flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-bold">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="mt-5 text-base leading-snug font-semibold">{c.title}</h3>
                <p className="text-chalk/58 mt-3 text-sm leading-relaxed">{c.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Status + links */}
      <Reveal delay={0.1}>
        <div className="glass-strong mx-auto mt-10 max-w-4xl p-7">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="bg-gold h-1.5 w-1.5 animate-pulse rounded-full" />
                <span className="text-gold text-[11px] font-semibold tracking-[0.2em] uppercase">
                  Status
                </span>
              </div>
              <p className="text-chalk/65 text-sm leading-relaxed">{tetrobot.status}</p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Button href={links.githubTetrobot} external>
                Source on GitHub <ArrowIcon />
              </Button>
              <Button
                variant="glass"
                href={links.docs ?? undefined}
                disabled={!links.docs}
                external={Boolean(links.docs)}
                title={links.docs ? undefined : 'Documentation is being written'}
              >
                {links.docs ? 'Read the docs' : 'Docs — coming soon'}
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
