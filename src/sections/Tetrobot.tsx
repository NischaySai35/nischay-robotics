import { DownloadPanel } from '@/components/DownloadPanel'
import { GraphVsTree } from '@/components/GraphVsTree'
import { scrollToId } from '@/lib/scroll'
import { AsideCard, Block, PageShell } from '@/components/PageShell'
import { Link } from '@/components/ui/Link'
import { ArrowIcon, Button, Reveal } from '@/components/ui/primitives'
import { configurations, keystoneConfig, links, pageAt, tetrobot } from '@/content/site'

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

const SECTIONS = [
  { id: 'download', label: 'Download' },
  { id: 'graph-vs-tree', label: 'Graph vs tree' },
  { id: 'proof', label: 'Hardware proof' },
  { id: 'assumptions', label: 'Assumption vs reality' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'status', label: 'Status & source' },
] as const

export function TetrobotPage() {
  return (
    <PageShell
      page={pageAt('/tetrobot')}
      title={
        <>
          A tree cannot describe a robot that <span className="text-iridescent">rebuilds itself</span>.
        </>
      }
      lead={tetrobot.intro}
      sections={SECTIONS}
      aside={
        <AsideCard title={tetrobot.name} body={`The ${tetrobot.nameNote}. Free desktop demo for Windows, macOS and Linux.`}>
          <Link
            to="/tetrobot#download"
            onClick={() => scrollToId('download', window.innerWidth >= 1024 ? 112 : 150)}
            className="from-sun via-gold to-ember text-onbrand flex w-full items-center justify-center rounded-full bg-gradient-to-br py-2.5 text-[13px] font-semibold"
          >
            Download
          </Link>
          <Button variant="glass" href={links.githubTetrobot} external className="w-full !py-2.5 !text-[13px]">
            Source on GitHub
          </Button>
          <Button
            variant="glass"
            href={links.discord ?? undefined}
            external
            disabled={!links.discord}
            className="w-full !py-2.5 !text-[13px]"
          >
            Discuss on Discord
          </Button>
        </AsideCard>
      }
    >
      {/* Always the latest GitHub release — see lib/releases.ts */}
      <Block id="download" title="Download the desktop demo">
        <Reveal>
          <DownloadPanel />
        </Reveal>
      </Block>

      {/* The diagram */}
      <Block id="graph-vs-tree" title="Graph vs tree">
        <Reveal>
          <GraphVsTree />
        </Reveal>
      </Block>

      {/* Hardware proof. The Ring morphology above isn't a thought experiment —
          it is a photograph of the modules with head latched to tail. */}
      <Block id="proof" title="Hardware proof">
        <Reveal>
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
              <p className="text-accent text-[11px] font-semibold tracking-[0.24em] uppercase">
                Not a thought experiment
              </p>
              {/* Worded to stay true whichever morphology the diagram above
                  happens to be cycling through. */}
              <h3 className="mt-4 text-xl leading-tight sm:text-2xl">
                That ring is a shape the tree model has to reject.
              </h3>
              <p className="text-chalk/60 mt-4 text-sm leading-relaxed">
                Head latched to tail, closing the loop. It exists, it holds, it drives — and no URDF will describe
                it without being lied to first. Every closed configuration in the hardware is a case the graph
                handles natively and the tree cannot.
              </p>
              <Link
                to="/shapes#gallery"
                className="text-chalk/70 hover:text-accent group mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              >
                See all {configurations.length} configurations <ArrowIcon />
              </Link>
            </div>
          </div>
        </Reveal>
      </Block>

      {/* Assumption vs reality */}
      <Block id="assumptions" title="Assumption vs reality">
        <div className="grid gap-5 md:grid-cols-2">
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
      </Block>

      {/* Capabilities */}
      <Block id="capabilities" title="Capabilities">
        <div className="grid gap-5 sm:grid-cols-2">
          {tetrobot.capabilities.map((c, i) => (
            <Reveal key={c.title} delay={(i % 2) * 0.07}>
              <div className="glass group h-full p-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5">
                <div className="relative z-10">
                  <div className="bg-gold/12 text-accent flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-bold">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="mt-5 text-base leading-snug font-semibold">{c.title}</h3>
                  <p className="text-chalk/58 mt-3 text-sm leading-relaxed">{c.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Block>

      {/* Status + links */}
      <Block id="status" title="Status & source">
        <Reveal>
          <div className="glass-strong p-7">
            <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-xl">
                <div className="mb-3 flex items-center gap-2">
                  <span className="bg-gold h-1.5 w-1.5 animate-pulse rounded-full" />
                  <span className="text-accent text-[11px] font-semibold tracking-[0.2em] uppercase">Status</span>
                </div>
                <p className="text-chalk/65 text-sm leading-relaxed">{tetrobot.status}</p>
                <a
                  href={links.githubArmInterface}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-chalk/50 hover:text-accent mt-3 inline-block text-[13px] font-medium transition-colors"
                >
                  Earlier: modular arm control interface ↗
                </a>
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
      </Block>
    </PageShell>
  )
}
