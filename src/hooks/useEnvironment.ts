import { useEffect, useState } from 'react'

/** Honours the OS "reduce motion" setting, and keeps honouring it if it changes. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * Decides how hard we're allowed to push the GPU.
 *
 *  - `none`   — no WebGL2 at all, or the user asked for reduced motion.
 *               The CSS aurora carries the whole background.
 *  - `low`    — coarse pointer (phones/tablets) or few CPU cores. Fewer
 *               raymarch steps, lower pixel ratio, shorter pointer trail.
 *  - `high`   — desktop with a real pointer.
 */
export type Tier = 'none' | 'low' | 'high'

export function useRenderTier(): Tier {
  const reduced = useReducedMotion()
  const [tier, setTier] = useState<Tier>('none')

  useEffect(() => {
    if (reduced) {
      setTier('none')
      return
    }

    // Probe for WebGL2 on a throwaway canvas rather than trusting UA sniffing.
    let supported = false
    try {
      const canvas = document.createElement('canvas')
      supported = Boolean(canvas.getContext('webgl2'))
    } catch {
      supported = false
    }

    if (!supported) {
      setTier('none')
      return
    }

    const coarse = window.matchMedia('(pointer: coarse)').matches
    const smallScreen = window.matchMedia('(max-width: 820px)').matches
    const fewCores = (navigator.hardwareConcurrency ?? 4) <= 4

    setTier(coarse || smallScreen || fewCores ? 'low' : 'high')
  }, [reduced])

  return tier
}

/**
 * Pointer position in normalised device coordinates (-1..1, y up), smoothed by
 * the consumer. Falls back to a slow autonomous drift when the pointer hasn't
 * moved — so the background is never inert on a touch device.
 */
export function usePointerNDC() {
  const [state] = useState(() => ({ x: 0, y: 0, active: false }))

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      state.x = (e.clientX / window.innerWidth) * 2 - 1
      state.y = -((e.clientY / window.innerHeight) * 2 - 1)
      state.active = true
    }
    const onLeave = () => {
      state.active = false
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [state])

  return state
}
