// REUSE-CHECKED: search|palette|command|filter -> ConfigGallery filters by family only; no site-wide search existed. Modal open/close mirrors WaitlistModal (pauseScroll/resumeScroll).

import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import {
  channels,
  configurations,
  families,
  links,
  pageSections,
  pages,
  products,
  videos,
} from '@/content/site'
import { navigate } from '@/lib/router'
import { pauseScroll, resumeScroll } from '@/lib/scroll'
import { useWaitlist } from '@/lib/waitlistContext'

type Entry = {
  title: string
  /** Where it lives — shown as a chip on the right. */
  group: string
  /** Extra words that should match but aren't shown. */
  keywords?: string
  to?: string
  href?: string
  waitlist?: string
}

const inr = (n: number) => '₹' + n.toLocaleString('en-IN')

/**
 * Everything worth finding, built from site content — so a new product,
 * shape, video or page section is searchable the moment it's added there.
 */
function buildIndex(): Entry[] {
  const out: Entry[] = [{ title: 'Home', group: 'Page', to: '/' }]

  for (const p of pages) {
    out.push({ title: p.label, group: 'Page', keywords: `${p.kicker} ${p.blurb}`, to: p.path })
    for (const s of pageSections[p.path]) {
      out.push({ title: s.label, group: p.label, to: `${p.path}#${s.id}` })
    }
  }

  for (const p of products) {
    const price = p.inr ? inr(p.inr) : p.statusLabel
    out.push({
      title: `${p.name} — ${price}`,
      group: 'Product',
      keywords: `buy price cost order ${p.tagline} ${p.summary}`,
      to: '/modules#pricing',
    })
    out.push({
      title: `${p.inr ? 'Join waitlist' : 'Get notified'}: ${p.name}`,
      group: 'Action',
      keywords: 'buy order preorder notify',
      waitlist: p.slug,
    })
  }

  out.push(
    {
      title: 'Download Tetrobot — free',
      group: 'Software',
      keywords: 'windows mac macos linux install app desktop demo exe dmg appimage',
      to: '/download',
    },
    { title: 'Join the waitlist', group: 'Action', keywords: 'buy order preorder notify email', waitlist: '' },
  )
  if (links.discord) {
    out.push({ title: 'Join the Discord', group: 'Community', keywords: 'chat server help support', href: links.discord })
  }
  for (const c of channels) {
    out.push({ title: `${c.label} · ${c.handle}`, group: 'Contact', keywords: `${c.note} contact reach`, href: c.href })
  }

  for (const v of videos) {
    out.push({
      title: v.title,
      group: 'Video',
      keywords: `${v.caption} watch youtube`,
      to: v.featured ? '/prototypes#main-demo' : '/prototypes#builds',
    })
  }

  for (const c of configurations) {
    out.push({
      title: c.title,
      group: `Shape · ${families[c.family].label}`,
      keywords: c.note,
      to: '/shapes#gallery',
    })
  }

  return out
}

/** Shown before anything is typed — the things most people come for. */
const QUICK = [
  'Modules',
  'Download Tetrobot — free',
  'Join the waitlist',
  'Pricing',
  'All configurations',
  'Join the Discord',
]

function search(index: Entry[], query: string): Entry[] {
  const q = query.trim().toLowerCase()
  if (!q) return QUICK.map((t) => index.find((e) => e.title === t)).filter((e): e is Entry => !!e)

  const words = q.split(/\s+/)
  const scored: { e: Entry; score: number }[] = []
  for (const e of index) {
    const title = e.title.toLowerCase()
    const hay = `${title} ${e.group.toLowerCase()} ${(e.keywords ?? '').toLowerCase()}`
    if (!words.every((w) => hay.includes(w))) continue
    const score = title.startsWith(q) ? 3 : title.includes(q) ? 2 : words.some((w) => title.includes(w)) ? 1 : 0
    scored.push({ e, score })
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.e)
}

export function SiteSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const index = useMemo(buildIndex, [])
  const join = useWaitlist()
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const results = useMemo(() => search(index, query), [index, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setCursor(0)
    pauseScroll()
    // After paint, or the focus is lost to the button that opened it.
    const t = window.setTimeout(() => input.current?.focus(), 0)
    return () => {
      window.clearTimeout(t)
      resumeScroll()
    }
  }, [open])

  useEffect(() => setCursor(0), [query])

  if (!open) return null

  const choose = (e: Entry) => {
    onClose()
    if (e.waitlist !== undefined) join(e.waitlist || undefined)
    else if (e.to) navigate(e.to)
    else if (e.href?.startsWith('mailto:')) window.location.href = e.href
    else if (e.href) window.open(e.href, '_blank', 'noopener,noreferrer')
  }

  const onKey = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') onClose()
    else if (ev.key === 'ArrowDown') {
      ev.preventDefault()
      setCursor((c) => Math.min(c + 1, results.length - 1))
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (ev.key === 'Enter' && results[cursor]) {
      ev.preventDefault()
      choose(results[cursor])
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Search the site"
    >
      <div className="glass-strong bg-void w-full max-w-xl overflow-hidden" onKeyDown={onKey}>
        <div className="relative z-10">
          <div className="border-chalk/10 flex items-center gap-3 border-b px-5 py-4">
            <SearchIcon />
            <input
              ref={input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search modules, prices, shapes, downloads…"
              className="text-chalk placeholder:text-chalk/40 min-w-0 flex-1 bg-transparent text-[15px] outline-none"
              aria-label="Search"
              aria-controls="site-search-results"
              aria-activedescendant={results[cursor] ? `sr-${cursor}` : undefined}
            />
            <kbd className="text-chalk/40 border-chalk/15 hidden rounded-md border px-1.5 py-0.5 text-[10px] sm:block">
              Esc
            </kbd>
          </div>

          <p className="text-chalk/35 px-5 pt-3 text-[10px] font-semibold tracking-[0.2em] uppercase">
            {query.trim() ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'Popular'}
          </p>
          <ul id="site-search-results" role="listbox" data-lenis-prevent className="max-h-[50vh] overflow-y-auto p-2">
            {results.map((e, i) => (
              <li key={`${e.group}-${e.title}`} id={`sr-${i}`} role="option" aria-selected={i === cursor}>
                <button
                  type="button"
                  onMouseMove={() => setCursor(i)}
                  onClick={() => choose(e)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors ${
                    i === cursor ? 'bg-chalk/[0.07] text-chalk' : 'text-chalk/75'
                  }`}
                >
                  <span className="min-w-0 truncate">{e.title}</span>
                  <span className="text-chalk/40 shrink-0 text-[11px]">
                    {e.group}
                    {e.href && !e.href.startsWith('mailto:') ? ' ↗' : ''}
                  </span>
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="text-chalk/50 px-3 py-6 text-center text-sm">
                Nothing matches “{query}”. Try “price”, “download” or “arm”.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-chalk/50 shrink-0">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
