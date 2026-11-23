import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from '@/hooks/useEnvironment'

/**
 * Lenis owns the scroll position once it's running, so native
 * `scrollIntoView({ behavior: 'smooth' })` fights it — you get a jump, or a
 * scroll that stalls halfway. Everything that jumps to a section goes through
 * here instead, and falls back to native behaviour when Lenis isn't running
 * (reduced motion, or before mount).
 */
let lenis: Lenis | null = null

/** `offset` = space to leave above the target (the fixed nav, plus any sticky bar). */
export function scrollToId(id: string, offset = 80, immediate = false) {
  const el = document.getElementById(id)
  if (!el) return

  // An absolute pixel target, not the element: Lenis adds the element's CSS
  // scroll-margin on top of `offset` when given an element, double-counting
  // the gap on anything that sets `scroll-mt-*`.
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  if (lenis) lenis.scrollTo(top, { duration: 1.15, immediate })
  else window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' })
}

/** Instant jump to the top — for page changes, where a smooth scroll would read as lag. */
export function jumpToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  window.scrollTo(0, 0)
}

/**
 * Freeze scrolling while a modal is open.
 *
 * `overflow: hidden` on its own isn't enough here — Lenis drives scroll with
 * its own rAF loop and happily keeps going behind the overlay. Both have to be
 * stopped, and both restarted together.
 */
export function pauseScroll() {
  lenis?.stop()
  document.body.style.overflow = 'hidden'
}

export function resumeScroll() {
  lenis?.start()
  document.body.style.overflow = ''
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.15 })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function useSmoothScroll() {
  const reduced = useReducedMotion()

  useEffect(() => {
    // Respect the OS setting — inertial scrolling is exactly the kind of motion
    // "reduce motion" is asking us not to do.
    if (reduced) return

    const instance = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices already have native inertia; hijacking it feels wrong.
      syncTouch: false,
    })
    lenis = instance

    let frame = 0
    const raf = (time: number) => {
      instance.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      instance.destroy()
      lenis = null
    }
  }, [reduced])
}
