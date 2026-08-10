import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { ArrowIcon, Reveal, Section, SectionHeading, Tag } from '@/components/ui/primitives'
import { projects } from '@/content/site'
import type { Project } from '@/content/site'

const ACCENT: Record<Project['accent'], string> = {
  gold: 'rgba(255,201,60,0.55)',
  aqua: 'rgba(69,227,255,0.5)',
  iris: 'rgba(169,123,255,0.5)',
  bloom: 'rgba(255,95,166,0.5)',
  zest: 'rgba(201,255,87,0.45)',
}

/**
 * Pointer-tracked 3D tilt. The rotation is driven by springs rather than raw
 * pointer deltas, so the card settles instead of snapping — which is what makes
 * it read as a physical slab of glass rather than a CSS trick.
 */
function TiltCard({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null)

  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  const config = { stiffness: 220, damping: 26, mass: 0.6 }
  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), config)
  const rotateY = useSpring(useTransform(px, [0, 1], [-8, 8]), config)

  // The specular sheen tracks the pointer across the surface.
  const sheenX = useTransform(px, [0, 1], ['0%', '100%'])
  const sheenY = useTransform(py, [0, 1], ['0%', '100%'])

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }

  const reset = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.article
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      className="glass group relative h-full overflow-hidden p-7 will-change-transform sm:p-8"
    >
      {/* accent bloom */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full opacity-0 blur-[70px] transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: ACCENT[project.accent] }}
      />

      {/* pointer sheen */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(340px circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.10), transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl leading-none font-bold tracking-tight sm:text-[1.7rem]">
              {project.name}
            </h3>
            <p className="text-chalk/50 mt-2 text-sm">{project.subtitle}</p>
          </div>
          <span className="text-chalk/30 shrink-0 font-mono text-[11px] tracking-wider">
            {project.year}
          </span>
        </header>

        {project.status && (
          <p className="text-gold mt-4 inline-flex w-fit items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
            <span className="bg-gold/70 h-1 w-1 rounded-full" />
            {project.status}
          </p>
        )}

        <p className="text-chalk/60 mt-5 flex-1 text-sm leading-relaxed">{project.body}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>

        {project.href && (
          <a
            href={project.href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-chalk/70 hover:text-gold mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold transition-colors"
          >
            {project.hrefLabel ?? 'Open'} <ArrowIcon />
          </a>
        )}
      </div>
    </motion.article>
  )
}

export function Projects() {
  return (
    <Section id="projects">
      <SectionHeading
        kicker="Projects"
        title={
          <>
            Things that <span className="text-gold-grad">actually got built</span>.
          </>
        }
        lead="Prototypes, competition entries and one hackathon detour into space. Every one of them shipped as working hardware or working software."
      />

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={(i % 2) * 0.08}>
            <TiltCard project={p} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
