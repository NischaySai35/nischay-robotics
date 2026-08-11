import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { configurations, families } from '@/content/site'
import type { Configuration, Family } from '@/content/site'
import { useReducedMotion } from '@/hooks/useEnvironment'
import { pauseScroll, resumeScroll } from '@/lib/scroll'

const full = (slug: string) => `/visuals/${slug}.jpg`
const thumb = (slug: string) => `/visuals/${slug}-thumb.jpg`

/** How long each configuration holds before the stage advances. Fast enough to
 *  read as a machine changing shape, slow enough to take the caption in. */
const ADVANCE_MS = 1400

const FILTERS: Array<{ key: Family | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  ...(Object.keys(families) as Family[]).map((k) => ({ key: k, label: families[k].label })),
]

/* ============================================================================
   Lightbox — full-resolution viewer with keyboard navigation.
   ========================================================================= */

function Lightbox({
  items,
  index,
  onClose,
  onStep,
}: {
  items: readonly Configuration[]
  index: number
  onClose: () => void
  onStep: (delta: number) => void
}) {
  const item = items[index]
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    pauseScroll()
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      resumeScroll()
    }
  }, [onClose, onStep])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/85 backdrop-blur-xl"
      />

      <div className="relative z-10 flex w-full max-w-6xl flex-col">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-chalk text-sm font-semibold sm:text-base">{item.title}</p>
            <p className="text-chalk/50 mt-1 text-xs">
              {families[item.family].label} · {index + 1} of {items.length}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="glass-soft text-chalk/70 hover:text-gold flex h-9 w-9 shrink-0 items-center justify-center !rounded-full transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="glass-strong relative overflow-hidden">
          <img
            key={item.slug}
            src={full(item.slug)}
            alt={item.title}
            className="max-h-[68vh] w-full object-contain"
          />

          {/* Step controls */}
          {(['prev', 'next'] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => onStep(dir === 'next' ? 1 : -1)}
              aria-label={dir === 'next' ? 'Next configuration' : 'Previous configuration'}
              className={`glass-soft text-chalk absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center !rounded-full transition-transform hover:scale-110 ${
                dir === 'next' ? 'right-4' : 'left-4'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d={dir === 'next' ? 'M6 3l5 5-5 5' : 'M10 3L5 8l5 5'}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>

        <p className="text-chalk/60 mt-3 max-w-3xl text-sm leading-relaxed">{item.note}</p>
      </div>
    </motion.div>
  )
}

/* ============================================================================
   Gallery — auto-cycling stage + filterable filmstrip.
   ========================================================================= */

export function ConfigGallery() {
  const [family, setFamily] = useState<Family | 'all'>('all')
  const [index, setIndex] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { margin: '-20% 0px -20% 0px' })

  const items = useMemo(
    () => (family === 'all' ? configurations : configurations.filter((c) => c.family === family)),
    [family],
  )

  // Keep the index valid when the filter narrows the list.
  useEffect(() => setIndex(0), [family])

  const step = useCallback(
    (delta: number) => setIndex((i) => (i + delta + items.length) % items.length),
    [items.length],
  )

  /**
   * The stage flips through configurations on its own, so the section reads as
   * a machine changing shape rather than a static contact sheet. It only runs
   * while the section is on screen — otherwise it would quietly pull all 21
   * full-size images in the background for someone who never scrolled here.
   */
  useEffect(() => {
    if (reduced || !inView || hovering || lightbox || items.length < 2) return
    const id = window.setInterval(() => step(1), ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [reduced, inView, hovering, lightbox, items.length, step])

  const current = items[Math.min(index, items.length - 1)]

  // Warm the next image so the crossfade doesn't land on a blank frame.
  const next = items[(index + 1) % items.length]

  return (
    <div ref={sectionRef}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = family === f.key
          const count =
            f.key === 'all'
              ? configurations.length
              : configurations.filter((c) => c.family === f.key).length
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFamily(f.key)}
              className={`relative rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-300 ${
                active ? 'text-void' : 'glass-soft text-chalk/65 hover:text-chalk'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nr-config-filter"
                  className="from-sun to-gold absolute inset-0 -z-10 rounded-full bg-gradient-to-br"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              {f.label}
              <span className={active ? 'text-void/55 ml-1.5' : 'text-chalk/35 ml-1.5'}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Stage */}
      <div
        className="glass-strong relative mt-5 overflow-hidden"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label={`Open ${current.title} full size`}
          // Capped against viewport height: a full-width 16:9 stage on a wide
          // monitor is taller than the screen, and the caption falls off.
          className="group relative block aspect-[4/3] max-h-[58vh] w-full sm:aspect-[16/9]"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.img
              key={current.slug}
              src={full(current.slug)}
              alt={current.title}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              // Kept well under ADVANCE_MS so each shape gets a settled beat
              // rather than the stage being in permanent crossfade.
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/25" />

          {/* Family badge */}
          <span className="glass-soft text-chalk/80 absolute top-4 left-4 !rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] uppercase">
            {families[current.family].label}
          </span>

          {current.keystone && (
            <span className="bg-gold text-void absolute top-4 right-4 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] uppercase">
              The cycle
            </span>
          )}

          {/* Caption */}
          <div className="absolute inset-x-0 bottom-0 p-5 text-left sm:p-7">
            <p className="font-display text-xl leading-tight font-bold sm:text-3xl">
              {current.title}
            </p>
            <p className="text-chalk/65 mt-2 max-w-2xl text-xs leading-relaxed sm:text-sm">
              {current.note}
            </p>
          </div>

          {/* Progress pips */}
          <div className="absolute inset-x-0 top-0 flex gap-1 p-3">
            {items.map((it, i) => (
              <span
                key={it.slug}
                className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                  i === index ? 'bg-gold' : 'bg-white/18'
                }`}
              />
            ))}
          </div>
        </button>

        {/* Step controls */}
        {(['prev', 'next'] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => step(dir === 'next' ? 1 : -1)}
            aria-label={dir === 'next' ? 'Next configuration' : 'Previous configuration'}
            className={`glass-soft text-chalk absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center !rounded-full transition-transform hover:scale-110 ${
              dir === 'next' ? 'right-3' : 'left-3'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d={dir === 'next' ? 'M6 3l5 5-5 5' : 'M10 3L5 8l5 5'}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>

      {/* Preload the next frame */}
      <link rel="preload" as="image" href={full(next.slug)} />

      {/* Filmstrip */}
      <ul className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-11">
        {items.map((c, i) => (
          <li key={c.slug}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={c.title}
              aria-current={i === index}
              className={`relative block aspect-square w-full overflow-hidden rounded-xl transition-all duration-300 ${
                i === index
                  ? 'ring-gold scale-[1.04] opacity-100 ring-2'
                  : 'opacity-45 hover:opacity-85'
              }`}
            >
              <img
                src={thumb(c.slug)}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {lightbox && (
          <Lightbox
            items={items}
            index={Math.min(index, items.length - 1)}
            onClose={() => setLightbox(false)}
            onStep={step}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
