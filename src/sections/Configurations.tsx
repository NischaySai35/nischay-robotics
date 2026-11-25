import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { ConfigGallery } from '@/components/ConfigGallery'
import { PlayBadge } from '@/components/VideoPlayer'
import { AsideCard, Block, PageShell } from '@/components/PageShell'
import { Link } from '@/components/ui/Link'
import { Reveal } from '@/components/ui/primitives'
import { configSection, configurations, pageAt, shapeShiftClip, pageSections } from '@/content/site'
import { isMeteredConnection, useReducedMotion } from '@/hooks/useEnvironment'

/**
 * Locally hosted clip of the modules rolling as a four-, three- and two-wheeled
 * vehicle. VP9 WebM, re-encoded down from a 24MB phone capture.
 *
 * It autoplays, muted and looping, once scrolled into view — but the file is
 * 7.7MB, so nothing is fetched until that moment: no `src` is attached at all
 * while the section is off screen, and the 99KB poster stands in. Playback
 * pauses again when it scrolls away, so a backgrounded clip isn't burning
 * battery decoding frames nobody is watching.
 *
 * Autoplay is skipped entirely for reduced-motion and metered connections;
 * those visitors get the poster and a play button, which is the same clip on
 * their terms.
 */
function ShapeShiftClip() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inView = useInView(wrapRef, { margin: '-8% 0px -8% 0px' })
  const reduced = useReducedMotion()

  const [metered] = useState(isMeteredConnection)
  const autoAllowed = !reduced && !metered

  // Once armed, the <video> gains a src and starts downloading. One-way: we
  // don't tear the source down on scroll-away, only pause.
  const [armed, setArmed] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (inView && autoAllowed) setArmed(true)
  }, [inView, autoAllowed])

  useEffect(() => {
    const v = videoRef.current
    if (!v || !armed) return

    if (inView && autoAllowed) {
      // Autoplay can still be refused (battery saver, browser policy). If it
      // is, fall back to showing the play button rather than a frozen frame.
      v.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      )
    } else {
      v.pause()
      setPlaying(false)
    }
  }, [armed, inView, autoAllowed])

  const manualPlay = () => {
    setArmed(true)
    requestAnimationFrame(() => {
      videoRef.current?.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      )
    })
  }

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play().then(() => setPlaying(true), () => setPlaying(false))
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  return (
    <div
      ref={wrapRef}
      className="glass-strong group relative aspect-video max-h-[62vh] overflow-hidden"
    >
      <video
        ref={videoRef}
        // No src until armed — this is what keeps 7.7MB off the wire for
        // anyone who never reaches this section.
        src={armed ? shapeShiftClip.webm : undefined}
        poster={shapeShiftClip.poster}
        preload="none"
        playsInline
        loop
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Caption. Fades back while playing so it doesn't sit on the action. */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
          playing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/35" />

        {/* Fixed white on the video's own scrim — video frames have no theme. */}
        <span className="absolute top-5 left-5 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-white/90 uppercase backdrop-blur-md">
          Locomotion · {shapeShiftClip.duration}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <p className="font-display text-xl leading-tight font-bold text-white sm:text-3xl">
            {shapeShiftClip.title}
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm">
            {shapeShiftClip.caption}
          </p>
        </div>
      </div>

      {/* Big play button, only while nothing is playing. */}
      {!playing && (
        <button
          type="button"
          onClick={manualPlay}
          aria-label={`Play: ${shapeShiftClip.title}`}
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <PlayBadge size={78} />
        </button>
      )}

      {/* Small pause control once it's running. */}
      {playing && (
        <button
          type="button"
          onClick={toggle}
          aria-label="Pause"
          className="absolute right-4 bottom-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <rect x="1.5" y="1" width="3" height="10" rx="1" />
            <rect x="7.5" y="1" width="3" height="10" rx="1" />
          </svg>
        </button>
      )}
    </div>
  )
}

const SECTIONS = pageSections['/shapes']

export function ShapesPage() {
  const loops = configurations.filter((c) => c.family === 'loop').length

  return (
    <PageShell
      page={pageAt('/shapes')}
      title={
        <>
          Two modules. <span className="text-gold-grad">Every one of these.</span>
        </>
      }
      lead={configSection.lead}
      sections={SECTIONS}
      aside={
        <AsideCard title="Want a set of your own?" body="These are the same modules going on sale.">
          <Link
            to="/modules"
            className="from-sun via-gold to-ember text-onbrand flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br px-4 py-2.5 text-center text-[13px] font-semibold"
          >
            See modules & pricing
          </Link>
          <Link
            to="/tetrobot"
            className="glass-soft text-chalk flex w-full items-center justify-center !rounded-full px-4 py-2.5 text-center text-[13px] font-semibold"
          >
            <span className="relative z-10">Explore the software</span>
          </Link>
        </AsideCard>
      }
    >
      {/* The counting argument, stated plainly */}
      <Block id="numbers" title="By the numbers">
        <Reveal>
          <dl className="grid max-w-3xl grid-cols-3 gap-3 sm:gap-5">
            {[
              { v: '2', l: 'module chains — the entire hardware set' },
              { v: String(configurations.length), l: 'documented configurations' },
              { v: String(loops), l: 'closed loops a tree model rejects' },
            ].map((s) => (
              <div key={s.l} className="glass px-4 py-4 sm:px-5 sm:py-5">
                <dt className="text-gold-grad font-display relative z-10 text-2xl font-bold sm:text-3xl">{s.v}</dt>
                <dd className="text-chalk/55 relative z-10 mt-1.5 text-[11px] leading-snug sm:text-xs">{s.l}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Block>

      <Block id="rolling" title="Watch them roll">
        <Reveal>
          <ShapeShiftClip />
        </Reveal>
      </Block>

      <Block id="gallery" title={`All ${configurations.length} configurations`}>
        <Reveal>
          <ConfigGallery />
        </Reveal>
      </Block>

      {/* The ask, in the founder's voice */}
      <Block id="why" title="Why it matters">
        <Reveal>
          <div className="glass-strong p-7 sm:p-9">
            <p className="text-chalk/75 relative z-10 text-lg leading-relaxed text-balance sm:text-xl">{configSection.ask}</p>
          </div>
        </Reveal>
      </Block>
    </PageShell>
  )
}
