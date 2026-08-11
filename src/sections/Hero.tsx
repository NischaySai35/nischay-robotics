import { motion } from 'motion/react'
import { Button, ArrowIcon } from '@/components/ui/primitives'
import { company, featuredVideo, hero, links } from '@/content/site'
import { scrollToId } from '@/lib/scroll'
import { useVideoPlayer } from '@/lib/videoContext'

const EASE = [0.16, 1, 0.3, 1] as const

/** Decorative droplet cluster — three circles that the gooey filter fuses into
 *  one blob of liquid as they orbit. Pure ornament, marked aria-hidden. */
function GooCluster() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 60"
      className="goo h-9 w-[72px] overflow-visible"
      fill="none"
    >
      <g fill="#FFC93C">
        <motion.circle
          cx="30"
          cy="30"
          r="11"
          animate={{ cx: [30, 44, 30], cy: [30, 24, 30] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="60"
          cy="30"
          r="14"
          animate={{ cy: [30, 34, 30] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="90"
          cy="30"
          r="9"
          animate={{ cx: [90, 76, 90], cy: [30, 37, 30] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </g>
    </svg>
  )
}

export function Hero() {
  const play = useVideoPlayer()

  return (
    <section
      id="top"
      className="relative z-10 flex min-h-[100svh] flex-col justify-center px-5 pt-32 pb-20 sm:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="glass-soft inline-flex items-center gap-2.5 !rounded-full px-4 py-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="bg-gold absolute inline-flex h-full w-full rounded-full opacity-75 [animation:pulse-ring_2.4s_ease-out_infinite]" />
            <span className="bg-gold relative inline-flex h-2 w-2 rounded-full" />
          </span>
          <span className="text-chalk/75 text-[11px] font-semibold tracking-[0.22em] uppercase">
            {hero.eyebrow}
          </span>
        </motion.div>

        {/* Title */}
        <h1 className="mt-8 text-[clamp(2.9rem,9vw,7.2rem)] leading-[0.94]">
          {hero.titleLines.map((line, i) => (
            <motion.span
              key={line}
              className="block"
              initial={{ opacity: 0, y: 34, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1, delay: 0.12 + i * 0.11, ease: EASE }}
            >
              {i === hero.titleLines.length - 1 ? (
                <span className="text-iridescent">{line}</span>
              ) : (
                line
              )}
            </motion.span>
          ))}
        </h1>

        {/* Body + goo ornament */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
          className="mt-9 flex max-w-2xl items-start gap-4"
        >
          <div className="mt-1 hidden shrink-0 sm:block">
            <GooCluster />
          </div>
          <p className="text-chalk/70 text-base leading-relaxed text-pretty sm:text-lg">
            {hero.body}
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.62, ease: EASE }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Button onClick={() => scrollToId('products')}>
            See the modules <ArrowIcon />
          </Button>
          {featuredVideo.id && (
            <Button variant="glass" onClick={() => play(featuredVideo.id!, featuredVideo.title)}>
              <PlayGlyph /> Watch the demo
            </Button>
          )}
          <Button variant="quiet" href={links.github} external>
            <GithubIcon /> GitHub
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.dl
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.78, ease: EASE }}
          className="mt-16 grid max-w-2xl grid-cols-3 gap-3 sm:gap-5"
        >
          {hero.stats.map((s) => (
            <div key={s.label} className="glass px-4 py-4 sm:px-5 sm:py-5">
              <dt className="text-gold-grad font-display relative z-10 text-2xl font-bold sm:text-3xl">
                {s.value}
              </dt>
              <dd className="text-chalk/55 relative z-10 mt-1.5 text-[11px] leading-snug sm:text-xs">
                {s.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="pointer-events-none absolute inset-x-0 bottom-7 flex flex-col items-center gap-2"
      >
        <span className="text-chalk/35 text-[10px] font-medium tracking-[0.3em] uppercase">
          {company.location.split(',')[0]}
        </span>
        <div className="border-chalk/20 flex h-9 w-5 items-start justify-center rounded-full border pt-1.5">
          <motion.span
            className="bg-gold h-1.5 w-1 rounded-full"
            animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  )
}

function PlayGlyph() {
  return (
    <svg width="11" height="12" viewBox="0 0 20 22" fill="currentColor" aria-hidden="true">
      <path d="M19 9.27a2 2 0 0 1 0 3.46L3 21.99a2 2 0 0 1-3-1.73V1.74A2 2 0 0 1 3 .01l16 9.26Z" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}
