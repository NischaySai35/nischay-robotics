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

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return

  if (lenis) {
    lenis.scrollTo(el, { offset: -80, duration: 1.15 })
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })
  }
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
