// REUSE-CHECKED: layout|sidebar|toc|scrollspy|PageShell -> Section/SectionHeading in ui/primitives cover a single band only; nothing provided a page frame with a side menu.

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowIcon, Reveal } from '@/components/ui/primitives'
import { Link } from '@/components/ui/Link'
import { pages } from '@/content/site'
import type { PageInfo } from '@/content/site'
import { usePageMeta } from '@/lib/head'
import { useLocation } from '@/lib/router'
import { scrollToId } from '@/lib/scroll'

export type PageSection = { id: string; label: string }

/* Space left above a section when jumping to it: the fixed nav, plus the
   sticky chip bar on narrow screens. Matches `scroll-mt-*` on <Block>. */
const OFFSET_DESKTOP = 112
const OFFSET_MOBILE = 150
const offset = () => (window.innerWidth >= 1024 ? OFFSET_DESKTOP : OFFSET_MOBILE)

/**
 * The active section is the last one whose top has passed 30% of the way down
 * the screen — or the last section outright once the page bottoms out.
 *
 * Computed from scroll position on every frame that scrolls, rather than with
 * an IntersectionObserver: an observer only reports crossings, so a long jump
 * (a deep link, or a click from the side menu) can skip every crossing and
 * leave the wrong item lit.
 */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '')
  const key = ids.join('|')

  useEffect(() => {
    const list = key.split('|')
    let frame = 0

    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.3
      let current = list[0]
      for (const id of list) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      setActive(atBottom ? list[list.length - 1] : current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [key])

  return [active, setActive] as const
}

/** One titled part of a page. The id is what the side menu jumps to. */
export function Block({
  id,
  title,
  children,
  className = '',
}: {
  id: string
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`scroll-mt-[150px] lg:scroll-mt-28 ${className}`}>
      {title && (
        <Reveal>
          <h2 className="mb-6 flex items-center gap-3 text-xl sm:text-2xl">
            <span className="bg-gold h-5 w-1 rounded-full" />
            {title}
          </h2>
        </Reveal>
      )}
      {children}
    </section>
  )
}

/**
 * The frame every inner page shares:
 *
 *   breadcrumb · kicker · title · lead
 *   ┌ side menu ┐ ┌ content blocks ─────────────────┐
 *   │ sections  │ │                                 │
 *   │ CTA box   │ │                                 │
 *   └ (sticky)  ┘ └─────────────────────────────────┘
 *   previous / next page
 *
 * On narrow screens the side menu becomes a sticky row of chips under the
 * nav, and the CTA box moves below the content.
 */
export function PageShell({
  page,
  title,
  lead,
  sections,
  aside,
  children,
}: {
  page: PageInfo
  title: ReactNode
  lead?: string
  sections: readonly PageSection[]
  aside?: ReactNode
  children: ReactNode
}) {
  const [active, setActive] = useActiveSection(sections.map((s) => s.id))

  usePageMeta({ title: `${page.label} — Nischay Robotics`, description: page.blurb, path: page.path })

  // Deep link (/tetrobot#capabilities) — on arrival, and again whenever a
  // link elsewhere (top menu, search) changes the hash while this page is
  // already open. `handled` holds the hash this page set itself, so the side
  // menu's own URL updates never trigger a second scroll.
  const { hash } = useLocation()
  const handled = useRef<string | null>(null)
  // A string, not the array: a page that builds `sections` inline would
  // otherwise re-run this effect every render and cancel the pending jump.
  const ids = sections.map((s) => s.id).join('|')
  useEffect(() => {
    if (hash === handled.current) return
    const first = handled.current === null
    handled.current = hash
    const id = hash.slice(1)
    if (!id || !ids.split('|').includes(id)) return
    const t = window.setTimeout(() => {
      scrollToId(id, offset(), first)
      setActive(id)
    }, first ? 120 : 0)
    return () => window.clearTimeout(t)
  }, [hash, ids, setActive])

  const go = (id: string) => {
    setActive(id)
    scrollToId(id, offset())
    // Keep the URL shareable without triggering a route change.
    handled.current = `#${id}`
    window.history.replaceState({}, '', `${page.path}#${id}`)
  }

  const index = pages.findIndex((p) => p.path === page.path)
  const prev = index > 0 ? pages[index - 1] : null
  const next = index < pages.length - 1 ? pages[index + 1] : null

  return (
    <main className="grain relative z-10 px-5 pt-28 pb-10 sm:px-8 sm:pt-36">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <Reveal>
          <nav aria-label="Breadcrumb" className="text-chalk/40 flex items-center gap-2 text-[12px]">
            <Link to="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-chalk/70" aria-current="page">
              {page.label}
            </span>
          </nav>
        </Reveal>
        <Reveal delay={0.04}>
          <p className="text-accent mt-6 flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.28em] uppercase">
            <span className="bg-gold/60 h-px w-8" />
            {page.kicker}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-4 max-w-4xl text-[clamp(2.2rem,5.2vw,4rem)] leading-[1.02] text-balance">{title}</h1>
        </Reveal>
        {lead && (
          <Reveal delay={0.12}>
            <p className="text-chalk/62 mt-6 max-w-3xl text-base leading-relaxed text-pretty sm:text-lg">{lead}</p>
          </Reveal>
        )}

        {/* Wrapper = the sticky chip row's containing block, so the row stops
            with the content instead of riding over the page links below. */}
        <div>
        {/* Narrow screens: sticky chip row */}
        <div className="sticky top-[76px] z-30 -mx-5 mt-10 px-5 sm:-mx-8 sm:px-8 lg:hidden">
          <div className="glass-strong flex gap-1 overflow-x-auto !rounded-full p-1.5 [scrollbar-width:none]">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(s.id)}
                className={`relative z-10 shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors ${
                  active === s.id ? 'from-sun to-gold text-onbrand bg-gradient-to-br' : 'text-chalk/60'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:mt-14 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          {/* Side menu */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              <nav aria-label="On this page" className="glass p-3">
                <p className="text-chalk/35 relative z-10 px-3 pt-2 pb-2 text-[10px] font-semibold tracking-[0.2em] uppercase">
                  On this page
                </p>
                <ul className="relative z-10">
                  {sections.map((s) => {
                    const on = active === s.id
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => go(s.id)}
                          aria-current={on ? 'true' : undefined}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] transition-colors ${
                            on ? 'text-chalk bg-chalk/[0.06] font-semibold' : 'text-chalk/55 hover:text-chalk'
                          }`}
                        >
                          <span
                            className={`h-4 w-[3px] shrink-0 rounded-full transition-colors ${on ? 'bg-gold' : 'bg-chalk/10'}`}
                          />
                          {s.label}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </nav>
              {aside}
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 space-y-20">
            {children}
            {aside && <div className="lg:hidden">{aside}</div>}
          </div>
        </div>

        </div>

        {/* Previous / next */}
        <nav aria-label="More pages" className="mt-24 grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link to={prev.path} className="glass group block p-6">
              <span className="relative z-10 block">
                <span className="text-chalk/40 text-[11px] font-semibold tracking-[0.2em] uppercase">← Previous</span>
                <span className="group-hover:text-accent mt-2 block text-lg font-semibold transition-colors">{prev.label}</span>
              </span>
            </Link>
          ) : (
            <Link to="/" className="glass group block p-6">
              <span className="relative z-10 block">
                <span className="text-chalk/40 text-[11px] font-semibold tracking-[0.2em] uppercase">← Back to</span>
                <span className="group-hover:text-accent mt-2 block text-lg font-semibold transition-colors">Home</span>
              </span>
            </Link>
          )}
          {next && (
            <Link to={next.path} className="glass group block p-6 text-right">
              <span className="relative z-10 block">
                <span className="text-chalk/40 text-[11px] font-semibold tracking-[0.2em] uppercase">Next →</span>
                <span className="group-hover:text-accent mt-2 flex items-center justify-end gap-2 text-lg font-semibold transition-colors">
                  {next.label} <ArrowIcon />
                </span>
              </span>
            </Link>
          )}
        </nav>
      </div>
    </main>
  )
}

/** A small call-to-action card for the side menu. */
export function AsideCard({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <div className="glass-strong p-5">
      <div className="relative z-10">
        <p className="text-[14px] font-semibold">{title}</p>
        <p className="text-chalk/55 mt-1.5 text-[13px] leading-relaxed">{body}</p>
        <div className="mt-4 flex flex-col gap-2">{children}</div>
      </div>
    </div>
  )
}
