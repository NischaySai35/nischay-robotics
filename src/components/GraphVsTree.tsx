import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'

/* ============================================================================
   Graph vs. tree — the argument, drawn.

   Both panels are handed the *same* target morphology. The left panel renders
   what a kinematic tree can legally express; the right renders what a graph
   can. Which edges the tree has to reject isn't hand-authored — it's computed
   with union-find at render time, exactly the way a real validator would find
   them. If you change the morphologies below, the rejections update themselves.
   ========================================================================= */

type Vec = { x: number; y: number }
type Edge = readonly [number, number]

const NODE_COUNT = 7

/** Every edge that appears in any morphology. Each shape switches them on/off. */
const ALL_EDGES: readonly Edge[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 0],
  [0, 3],
  [1, 4],
  [2, 5],
  [4, 6],
]

const ring = (i: number): Vec => {
  const a = (i / NODE_COUNT) * Math.PI * 2 - Math.PI / 2
  return { x: 150 + Math.cos(a) * 68, y: 112 + Math.sin(a) * 68 }
}

type Morphology = {
  id: string
  label: string
  caption: string
  nodes: readonly Vec[]
  /** Indices into ALL_EDGES that are latched in this shape. */
  active: readonly number[]
  /** Which module is currently anchored to the world. */
  root: number
}

const MORPHOLOGIES: readonly Morphology[] = [
  {
    id: 'arm',
    label: 'Arm',
    caption: 'Serial chain — every module has one parent. A tree handles this fine.',
    nodes: [
      { x: 52, y: 192 },
      { x: 52, y: 152 },
      { x: 56, y: 112 },
      { x: 82, y: 82 },
      { x: 118, y: 63 },
      { x: 157, y: 58 },
      { x: 196, y: 68 },
    ],
    active: [0, 1, 2, 3, 4, 5],
    root: 0,
  },
  {
    id: 'ring',
    label: 'Ring',
    caption: 'The end module latches back onto the base. One closed loop.',
    nodes: Array.from({ length: NODE_COUNT }, (_, i) => ring(i)),
    active: [0, 1, 2, 3, 4, 5, 6],
    root: 2,
  },
  {
    id: 'lattice',
    label: 'Lattice',
    caption: 'Modules latch to their neighbours on both axes. Loops everywhere.',
    nodes: [
      { x: 100, y: 58 },
      { x: 150, y: 58 },
      { x: 200, y: 58 },
      { x: 100, y: 112 },
      { x: 150, y: 112 },
      { x: 200, y: 112 },
      { x: 150, y: 168 },
    ],
    active: [0, 1, 3, 4, 7, 8, 9, 10],
    root: 6,
  },
]

/**
 * Union-find pass over the latched edges. An edge whose endpoints are already
 * connected would close a loop — precisely what a tree model forbids.
 */
function findCycleEdges(activeIdx: readonly number[]): Set<number> {
  const parent = Array.from({ length: NODE_COUNT }, (_, i) => i)
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }

  const cycles = new Set<number>()
  for (const idx of activeIdx) {
    const [a, b] = ALL_EDGES[idx]
    const ra = find(a)
    const rb = find(b)
    if (ra === rb) cycles.add(idx)
    else parent[ra] = rb
  }
  return cycles
}

const SPRING = { type: 'spring', stiffness: 120, damping: 18, mass: 0.9 } as const

function Panel({
  variant,
  morph,
  cycles,
}: {
  variant: 'tree' | 'graph'
  morph: Morphology
  cycles: Set<number>
}) {
  const isTree = variant === 'tree'
  // A tree can't move its root, so it stays pinned to module 0 no matter what
  // shape the hardware is actually in.
  const rootNode = isTree ? 0 : morph.root
  // Reads from the theme tokens so the diagram survives the light/dark switch:
  // #FFC93C on white is invisible, and the muted grey needs to darken too.
  const stroke = isTree ? 'var(--color-chalk)' : 'var(--color-accent)'
  const strokeOpacity = isTree ? 0.42 : 1

  return (
    <svg viewBox="0 0 300 224" className="w-full" role="img" aria-label={`${variant} view`}>
      <defs>
        <linearGradient id={`nr-node-${variant}`} x1="0" y1="0" x2="0" y2="1">
          {isTree ? (
            <>
              <stop offset="0%" stopColor="var(--node-tree-1)" />
              <stop offset="100%" stopColor="var(--node-tree-2)" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="var(--node-graph-1)" />
              <stop offset="100%" stopColor="var(--node-graph-2)" />
            </>
          )}
        </linearGradient>
        <filter id={`nr-node-glow-${variant}`} x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {ALL_EDGES.map((edge, i) => {
        const isActive = morph.active.includes(i)
        const isRejected = isTree && cycles.has(i)
        const a = morph.nodes[edge[0]]
        const b = morph.nodes[edge[1]]

        return (
          <motion.line
            key={i}
            initial={false}
            animate={{
              x1: a.x,
              y1: a.y,
              x2: b.x,
              y2: b.y,
              opacity: isActive ? (isRejected ? 0.85 : 1) : 0,
            }}
            transition={SPRING}
            stroke={isRejected ? '#E0294A' : stroke}
            strokeOpacity={isRejected ? 1 : strokeOpacity}
            strokeWidth={isRejected ? 1.6 : 2.2}
            strokeLinecap="round"
            strokeDasharray={isRejected ? '4 4' : undefined}
          />
        )
      })}

      {/* Nodes */}
      {morph.nodes.map((n, i) => (
        <motion.g key={i} initial={false} animate={{ x: n.x, y: n.y }} transition={SPRING}>
          <circle
            r="12"
            fill={`url(#nr-node-${variant})`}
            filter={isTree ? undefined : `url(#nr-node-glow-${variant})`}
          />
          <circle r="4.5" fill={isTree ? '#15131C' : '#231A05'} opacity="0.8" />
          {i === rootNode && (
            <>
              <circle
                r="19"
                fill="none"
                stroke={isTree ? 'var(--color-chalk)' : 'var(--color-aqua)'}
                strokeOpacity={isTree ? 0.45 : 1}
                strokeWidth="1.4"
                strokeDasharray="3 3"
              />
              <text
                y="-25"
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                letterSpacing="1"
                fill={isTree ? 'var(--color-chalk)' : 'var(--color-aqua)'}
                fillOpacity={isTree ? 0.5 : 1}
              >
                ROOT
              </text>
            </>
          )}
        </motion.g>
      ))}
    </svg>
  )
}

export function GraphVsTree() {
  const [index, setIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % MORPHOLOGIES.length), 5200)
    return () => window.clearInterval(id)
  }, [autoplay])

  const morph = MORPHOLOGIES[index]
  const cycles = useMemo(() => findCycleEdges(morph.active), [morph])
  const rejected = cycles.size

  return (
    <div className="glass-strong overflow-hidden p-5 sm:p-7">
      <div className="relative z-10">
        {/* Shape switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="glass-soft flex gap-1 !rounded-full p-1">
            {MORPHOLOGIES.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setIndex(i)
                  setAutoplay(false)
                }}
                className={`relative rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-300 ${
                  i === index ? 'text-onbrand' : 'text-chalk/60 hover:text-chalk'
                }`}
              >
                {i === index && (
                  <motion.span
                    layoutId="nr-morph-pill"
                    className="from-sun to-gold absolute inset-0 -z-10 rounded-full bg-gradient-to-br"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {m.label}
              </button>
            ))}
          </div>

          <p className="text-chalk/45 text-[11px] tracking-wide">
            {autoplay ? 'Cycling shapes — pick one to stop' : 'Same shape, two models'}
          </p>
        </div>

        {/* The two panels */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {/* Tree */}
          <div className="rounded-[1.4rem] border border-chalk/10 bg-chalk/[0.04] p-4">
            <header className="mb-2 flex items-baseline justify-between gap-2">
              <h4 className="text-chalk/80 text-sm font-semibold">Kinematic tree</h4>
              <span className="text-chalk/35 text-[10px] tracking-[0.18em] uppercase">
                URDF · ROS · Isaac
              </span>
            </header>
            <Panel variant="tree" morph={morph} cycles={cycles} />
            <footer className="mt-2 flex items-center gap-2 text-[11px]">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  rejected ? 'bg-[#FF5F6D]' : 'bg-[#7BD88F]'
                }`}
              />
              <span className={rejected ? 'text-[#FF8A93]' : 'text-chalk/50'}>
                {rejected === 0
                  ? 'Valid — this shape happens to be a tree'
                  : `${rejected} latch${rejected > 1 ? 'es' : ''} rejected: would close a loop`}
              </span>
            </footer>
          </div>

          {/* Graph */}
          <div className="border-gold/18 rounded-[1.4rem] border bg-chalk/[0.04] p-4">
            <header className="mb-2 flex items-baseline justify-between gap-2">
              <h4 className="text-chalk/90 text-sm font-semibold">
                Morphology graph
              </h4>
              <span className="text-accent/60 text-[10px] tracking-[0.18em] uppercase">
                Tetrobot
              </span>
            </header>
            <Panel variant="graph" morph={morph} cycles={cycles} />
            <footer className="mt-2 flex items-center gap-2 text-[11px]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#7BD88F]" />
              <span className="text-chalk/60">
                Valid — {morph.active.length} latches, root on module {morph.root}
              </span>
            </footer>
          </div>
        </div>

        <p className="text-chalk/50 mt-5 text-sm leading-relaxed">
          <span className="text-accent font-semibold">{morph.label}.</span> {morph.caption}
        </p>
      </div>
    </div>
  )
}
