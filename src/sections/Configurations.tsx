import { useRef, useState } from 'react'
import { ConfigGallery } from '@/components/ConfigGallery'
import { PlayBadge } from '@/components/VideoPlayer'
import { Reveal, Section, SectionHeading } from '@/components/ui/primitives'
import { configSection, configurations, shapeShiftClip } from '@/content/site'

/**
 * Locally hosted clip of the modules rolling as a four-, three- and two-wheeled
 * vehicle.
 *
 * `preload="none"` with a poster means the 7.7MB file costs nothing until
 * someone deliberately presses play — the poster alone is 99KB. Shipped as VP9
 * WebM, re-encoded down from a 24MB phone capture.
 */
function ShapeShiftClip() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)

  const start = () => {
    setStarted(true)
    // The element only gains a source on play, so this has to wait a tick.
    requestAnimationFrame(() => void videoRef.current?.play())
  }

  return (
    <div className="glass-strong group relative aspect-video max-h-[62vh] overflow-hidden">
      <video
        ref={videoRef}
        poster={shapeShiftClip.poster}
        preload="none"
        controls={started}
        playsInline
        loop
        muted
        className="absolute inset-0 h-full w-full object-cover"
      >
        {started && <source src={shapeShiftClip.webm} type="video/webm" />}
      </video>

      {!started && (
        <button
          type="button"
          onClick={start}
          aria-label={`Play: ${shapeShiftClip.title}`}
          className="absolute inset-0 z-10 block w-full text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/35" />

          <span className="glass-soft text-chalk/80 absolute top-5 left-5 !rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] uppercase">
            Locomotion · {shapeShiftClip.duration}
          </span>

          <div className="absolute inset-0 flex items-center justify-center">
            <PlayBadge size={78} />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <p className="font-display text-xl leading-tight font-bold sm:text-3xl">
              {shapeShiftClip.title}
            </p>
            <p className="text-chalk/65 mt-2 max-w-2xl text-xs leading-relaxed sm:text-sm">
              {shapeShiftClip.caption}
            </p>
          </div>
        </button>
      )}
    </div>
  )
}

export function Configurations() {
  const loops = configurations.filter((c) => c.family === 'loop').length

  return (
    <Section id="configurations">
      <SectionHeading
        kicker={configSection.kicker}
        title={
          <>
            Two modules. <span className="text-gold-grad">Every one of these.</span>
          </>
        }
        lead={configSection.lead}
      />

      {/* The counting argument, stated plainly */}
      <Reveal delay={0.1}>
        <dl className="mt-10 grid max-w-3xl grid-cols-3 gap-3 sm:gap-5">
          {[
            { v: '2', l: 'module chains — the entire hardware set' },
            { v: String(configurations.length), l: 'documented configurations' },
            { v: String(loops), l: 'closed loops a tree model rejects' },
          ].map((s) => (
            <div key={s.l} className="glass px-4 py-4 sm:px-5 sm:py-5">
              <dt className="text-gold-grad font-display relative z-10 text-2xl font-bold sm:text-3xl">
                {s.v}
              </dt>
              <dd className="text-chalk/55 relative z-10 mt-1.5 text-[11px] leading-snug sm:text-xs">
                {s.l}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal delay={0.06} className="mt-12">
        <ShapeShiftClip />
      </Reveal>

      <Reveal delay={0.06} className="mt-5">
        <ConfigGallery />
      </Reveal>

      {/* The ask, in the founder's voice */}
      <Reveal delay={0.1}>
        <p className="text-chalk/70 mx-auto mt-14 max-w-2xl text-center text-lg leading-relaxed text-balance sm:text-xl">
          {configSection.ask}
        </p>
      </Reveal>
    </Section>
  )
}
