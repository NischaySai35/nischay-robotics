import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { pauseScroll, resumeScroll } from '@/lib/scroll'
import { VideoContext } from '@/lib/videoContext'
import type { OpenVideo } from '@/lib/videoContext'

/* ============================================================================
   A single lightbox player, shared by the whole page.

   Videos are referenced from several places — the hero CTA, project cards, the
   Techgium award, the prototype grid. Mounting a player per call site would
   mean several iframes competing to autoplay and a fresh YouTube connection
   for each. Instead one modal lives at the root and anything can open it:

     const play = useVideoPlayer()
     play('5Z3qYwFF2VI', 'Shape-changing modular robots')

   The iframe only exists while the modal is open, so closing it genuinely
   stops playback rather than hiding a still-running player.
   ========================================================================= */

type Playing = { id: string; title: string }

export function VideoProvider({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState<Playing | null>(null)

  // Where focus was before the modal opened, so it can be handed back.
  const returnFocus = useRef<HTMLElement | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const open = useCallback<OpenVideo>((id, title) => {
    returnFocus.current = document.activeElement as HTMLElement | null
    setPlaying({ id, title })
  }, [])

  const close = useCallback(() => setPlaying(null), [])

  useEffect(() => {
    if (!playing) return

    pauseScroll()
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      resumeScroll()
      returnFocus.current?.focus?.()
    }
  }, [playing, close])

  // `open` is stable, so consumers never re-render just because a video played.
  const value = useMemo(() => open, [open])

  return (
    <VideoContext.Provider value={value}>
      {children}

      <AnimatePresence>
        {playing && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={playing.title}
          >
            {/* Backdrop */}
            <button
              type="button"
              aria-label="Close video"
              onClick={close}
              className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-xl"
            />

            <motion.div
              className="relative z-10 w-full max-w-5xl"
              initial={{ scale: 0.94, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* On the dark backdrop rather than inside a panel, so white in
                  both themes. */}
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-white sm:text-base">{playing.title}</p>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/12 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Close video"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M3 3l8 8M11 3l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="glass-strong relative aspect-video overflow-hidden">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${playing.id}?autoplay=1&rel=0&modestbranding=1`}
                  title={playing.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </VideoContext.Provider>
  )
}

/* -- A reusable play affordance -------------------------------------------- */

export function PlayBadge({ size = 64 }: { size?: number }) {
  return (
    <span
      className="from-sun to-ember flex items-center justify-center rounded-full bg-gradient-to-br shadow-[0_12px_40px_-8px_rgba(255,201,60,0.8)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.31}
        height={size * 0.34}
        viewBox="0 0 20 22"
        fill="#06050A"
        aria-hidden="true"
        style={{ marginLeft: size * 0.04 }}
      >
        <path d="M19 9.27a2 2 0 0 1 0 3.46L3 21.99a2 2 0 0 1-3-1.73V1.74A2 2 0 0 1 3 .01l16 9.26Z" />
      </svg>
    </span>
  )
}
