import { useEffect, useRef } from 'react'
import { configurations } from '@/content/site'
import { useReducedMotion } from '@/hooks/useEnvironment'

/* ============================================================================
   Photo mosaic — a dense grid of the configuration photographs, constantly
   swapping, deliberately too dim and too small to read.

   It is the hardware itself used as wallpaper: hundreds of cells, each one a
   different shape the modules have been in, churning behind the content.

   Two decisions carry the whole thing:

   1. Canvas 2D, not DOM. Hundreds of <img> elements crossfading would mean
      hundreds of composited layers; here the grid is drawn once and then only
      the ~20 cells mid-transition are redrawn per frame. Cost is flat no
      matter how many cells exist.

   2. Dedicated 192px tiles (public/visuals/*-tile.jpg, 152KB for all 21)
      rather than the 700px gallery thumbnails. At a 56px cell the thumbnails
      would be 7x oversized and cost 1MB for a background nobody looks at.
   ========================================================================= */

const TILE_SRCS = configurations.map((c) => `/visuals/${c.slug}-tile.jpg`)

/** Target cell size in CSS pixels. Small enough that no photo is legible. */
const CELL = 56
/** Cell swaps started per second. */
const SWAPS_PER_SEC = 55
/** Crossfade length per cell. */
const FADE_MS = 340

type Cell = { tile: number }
type Transition = { index: number; from: number; to: number; start: number }

export function PhotoMosaic() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let images: HTMLImageElement[] = []
    let cells: Cell[] = []
    let cols = 0
    let rows = 0
    let cellPx = CELL
    let raf = 0
    let alive = true
    let hidden = document.hidden

    const transitions: Transition[] = []
    let swapCarry = 0
    let last = performance.now()

    const pickOther = (current: number) => {
      if (images.length < 2) return current
      let n = (Math.random() * images.length) | 0
      if (n === current) n = (n + 1) % images.length
      return n
    }

    const drawCell = (index: number, fadeTo?: number, t = 1) => {
      const col = index % cols
      const row = (index / cols) | 0
      const x = col * cellPx
      const y = row * cellPx

      ctx.clearRect(x, y, cellPx, cellPx)
      const from = images[cells[index].tile]
      if (from) ctx.drawImage(from, x, y, cellPx, cellPx)

      if (fadeTo !== undefined) {
        const to = images[fadeTo]
        if (to) {
          ctx.globalAlpha = t
          ctx.drawImage(to, x, y, cellPx, cellPx)
          ctx.globalAlpha = 1
        }
      }
    }

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = window.innerWidth
      const h = window.innerHeight

      cols = Math.max(3, Math.ceil(w / CELL))
      rows = Math.max(3, Math.ceil(h / CELL))
      cellPx = Math.ceil(w / cols)
      rows = Math.ceil(h / cellPx)

      canvas.width = Math.ceil(cols * cellPx * dpr)
      canvas.height = Math.ceil(rows * cellPx * dpr)
      canvas.style.width = `${cols * cellPx}px`
      canvas.style.height = `${rows * cellPx}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = true

      cells = Array.from({ length: cols * rows }, () => ({
        tile: (Math.random() * Math.max(images.length, 1)) | 0,
      }))
      transitions.length = 0

      ctx.clearRect(0, 0, cols * cellPx, rows * cellPx)
      for (let i = 0; i < cells.length; i++) drawCell(i)
    }

    const frame = (now: number) => {
      if (!alive) return
      raf = requestAnimationFrame(frame)

      const dt = Math.min(now - last, 100)
      last = now
      if (hidden || reduced) return

      // Start new swaps at a steady rate, independent of frame rate.
      swapCarry += (dt / 1000) * SWAPS_PER_SEC
      while (swapCarry >= 1) {
        swapCarry -= 1
        const index = (Math.random() * cells.length) | 0
        if (transitions.some((tr) => tr.index === index)) continue
        transitions.push({
          index,
          from: cells[index].tile,
          to: pickOther(cells[index].tile),
          start: now,
        })
      }

      // Redraw only the cells mid-crossfade.
      for (let i = transitions.length - 1; i >= 0; i--) {
        const tr = transitions[i]
        const t = (now - tr.start) / FADE_MS
        if (t >= 1) {
          cells[tr.index].tile = tr.to
          drawCell(tr.index)
          transitions.splice(i, 1)
        } else {
          drawCell(tr.index, tr.to, t)
        }
      }
    }

    const onResize = () => build()
    const onVisibility = () => {
      hidden = document.hidden
      last = performance.now()
    }

    // Load every tile before drawing — a partially loaded grid flashes gaps.
    let cancelled = false
    Promise.all(
      TILE_SRCS.map(
        (src) =>
          new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image()
            img.decoding = 'async'
            img.onload = () => resolve(img)
            img.onerror = () => resolve(null)
            img.src = src
          }),
      ),
    ).then((loaded) => {
      if (cancelled) return
      images = loaded.filter((i): i is HTMLImageElement => i !== null)
      if (!images.length) return
      build()
      last = performance.now()
      raf = requestAnimationFrame(frame)
    })

    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
      style={{
        opacity: 'var(--mosaic-opacity)',
        mixBlendMode: 'var(--mosaic-blend)' as React.CSSProperties['mixBlendMode'],
        filter: 'var(--mosaic-filter)',
        maskImage:
          'radial-gradient(ellipse 110% 80% at 50% 40%, black 30%, transparent 78%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 110% 80% at 50% 40%, black 30%, transparent 78%)',
      }}
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  )
}
