import { useEffect, useRef, useState } from 'react'
import { SearchIcon, SiteSearch } from '@/components/SiteSearch'
import { Wordmark } from '@/components/ui/Logo'
import { Button } from '@/components/ui/primitives'
import { Link } from '@/components/ui/Link'
import { ChannelIconView, DiscordIcon } from '@/components/ui/SocialIcons'
import { announcement, channels, contact, links, pageAt, products } from '@/content/site'
import { useLocation } from '@/lib/router'
import { scrollToTop } from '@/lib/scroll'
import { useWaitlist } from '@/lib/waitlistContext'
import { useTheme } from '@/lib/theme'

/** Sun/moon toggle. Shows the theme you'd switch TO, which is the convention
 *  people expect from these controls. */
function ThemeToggle() {
  const { isDark, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className="glass-soft text-chalk/70 hover:text-accent relative flex h-9 w-9 items-center justify-center !rounded-full transition-colors"
    >
      <span className="relative z-10 block">
        {isDark ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M12 2.6v2.1M12 19.3v2.1M21.4 12h-2.1M4.7 12H2.6M18.6 5.4l-1.5 1.5M6.9 17.1l-1.5 1.5M18.6 18.6l-1.5-1.5M6.9 6.9L5.4 5.4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  )
}

/* -- Announcement strip ----------------------------------------------------- */

const CLOSED_KEY = 'nr-announce-closed'

function readClosed() {
  try {
    return localStorage.getItem(CLOSED_KEY) === announcement.id
  } catch {
    return false
  }
}

const SOCIALS = channels.filter((c) => ['linkedin', 'instagram', 'x', 'youtube', 'github'].includes(c.icon))
const WHATSAPP = channels.find((c) => c.icon === 'whatsapp')

/**
 * The thin bar above the nav, after robu.in's: contact on the left, the one
 * message that matters in the middle, socials on the right. It folds away on
 * the first scroll so it never eats reading space, and stays closed once
 * dismissed (until `announcement.id` changes).
 */
function TopBar({ hidden }: { hidden: boolean }) {
  const join = useWaitlist()
  const [closed, setClosed] = useState(readClosed)
  if (!announcement.text || closed) return null

  const close = () => {
    setClosed(true)
    try {
      localStorage.setItem(CLOSED_KEY, announcement.id)
    } catch {
      /* storage blocked — closed for this visit only */
    }
  }
  const tab = hidden ? -1 : undefined

  return (
    <div
      className={`bg-chalk text-void w-full overflow-hidden transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'
      }`}
      aria-hidden={hidden || undefined}
    >
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 text-[12px] sm:px-6">
        {/* Contact */}
        <div className="hidden min-w-0 items-center gap-4 lg:flex">
          {WHATSAPP && (
            <a
              href={WHATSAPP.href}
              target="_blank"
              rel="noreferrer noopener"
              tabIndex={tab}
              className="text-void/75 hover:text-void inline-flex items-center gap-1.5"
            >
              <ChannelIconView name="whatsapp" size={13} /> {contact.phone}
            </a>
          )}
          <a
            href={`mailto:${contact.email}`}
            tabIndex={tab}
            className="text-void/75 hover:text-void inline-flex items-center gap-1.5"
          >
            <ChannelIconView name="mail" size={13} /> {contact.email}
          </a>
        </div>

        {/* Message */}
        <p className="flex min-w-0 flex-1 items-center justify-center gap-3 lg:flex-none">
          <span className="truncate">{announcement.text}</span>
          <button
            type="button"
            onClick={() => join()}
            tabIndex={tab}
            className="bg-gold text-onbrand shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold hover:brightness-105"
          >
            {announcement.cta}
          </button>
        </p>

        {/* Socials + close */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 lg:flex">
            {links.discord && (
              <a
                href={links.discord}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Discord"
                tabIndex={tab}
                className="text-void/70 hover:text-void"
              >
                <DiscordIcon size={14} />
              </a>
            )}
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={s.label}
                tabIndex={tab}
                className="text-void/70 hover:text-void"
              >
                <ChannelIconView name={s.icon} size={14} />
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={close}
            tabIndex={tab}
            aria-label="Dismiss announcement"
            className="text-void/60 hover:text-void -mr-1 p-1"
          >
            <svg width="11" height="11" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path d="M3 3l9 9M12 3l-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/* -- Products dropdown ------------------------------------------------------ */

const inr = (n: number) => '₹' + n.toLocaleString('en-IN')
const PRODUCT_PATHS = ['/modules', '/tetrobot']

/** Everything you can get, in one panel: hardware with prices, then software. */
function ProductsMenu({ onPick }: { onPick: () => void }) {
  const join = useWaitlist()
  return (
    <div className="glass-strong bg-void w-[min(640px,calc(100vw-2rem))] p-3">
      <div className="relative z-10 grid gap-3 md:grid-cols-[1.35fr_1fr]">
        <div>
          <p className="text-chalk/35 px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.2em] uppercase">Hardware</p>
          <ul>
            {products.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/modules#pricing"
                  onClick={onPick}
                  className="hover:bg-chalk/[0.05] flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-[14px] font-semibold">
                      {p.name}
                      {p.featured && (
                        <span className="bg-gold text-onbrand rounded-full px-1.5 py-px text-[9px] font-bold tracking-[0.12em] uppercase">
                          Best value
                        </span>
                      )}
                    </span>
                    <span className="text-chalk/50 mt-0.5 block truncate text-[12px]">{p.tagline}</span>
                  </span>
                  <span className={`shrink-0 text-[13px] ${p.inr ? 'text-accent font-bold' : 'text-chalk/40 font-medium'}`}>
                    {p.inr ? inr(p.inr) : 'Soon'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:border-chalk/10 md:border-l md:pl-3">
          <p className="text-chalk/35 px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.2em] uppercase">Software</p>
          <ul>
            <li>
              <Link to="/tetrobot" onClick={onPick} className="hover:bg-chalk/[0.05] block rounded-xl px-3 py-2.5">
                <span className="block text-[14px] font-semibold">Tetrobot runtime</span>
                <span className="text-chalk/50 mt-0.5 block text-[12px]">The graph-native software</span>
              </Link>
            </li>
            <li>
              <Link to="/download" onClick={onPick} className="hover:bg-chalk/[0.05] block rounded-xl px-3 py-2.5">
                <span className="text-accent block text-[14px] font-semibold">Download — free</span>
                <span className="text-chalk/50 mt-0.5 block text-[12px]">Windows · macOS · Linux</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-chalk/10 relative z-10 mt-2 flex flex-wrap items-center justify-between gap-2 border-t px-3 pt-3 pb-1 text-[12px]">
        <Link to="/modules" onClick={onPick} className="text-chalk/65 hover:text-accent font-semibold">
          Compare all &amp; what&apos;s in the box →
        </Link>
        <button
          type="button"
          onClick={() => {
            onPick()
            join()
          }}
          className="text-accent font-semibold hover:underline"
        >
          Join the waitlist
        </button>
      </div>
    </div>
  )
}

/**
 * Hover opens it (with a short grace period so crossing the gap doesn't close
 * it), click toggles it for touch and keyboard, Escape or a click elsewhere
 * closes it.
 */
function ProductsDropdown({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false)
  const timer = useRef(0)
  const wrap = useRef<HTMLLIElement>(null)
  const { path } = useLocation()

  useEffect(() => setOpen(false), [path])
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const enter = () => {
    window.clearTimeout(timer.current)
    setOpen(true)
  }
  const leave = () => {
    timer.current = window.setTimeout(() => setOpen(false), 160)
  }

  return (
    <li ref={wrap} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-medium transition-colors duration-300 xl:px-3.5 ${
          active ? 'text-onbrand' : 'text-chalk/65 hover:text-chalk'
        }`}
      >
        {active && <span className="from-sun to-gold absolute inset-0 -z-10 rounded-full bg-gradient-to-br" />}
        Products
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden="true"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
          <ProductsMenu onPick={() => setOpen(false)} />
        </div>
      )}
    </li>
  )
}

/* -- Nav --------------------------------------------------------------------- */

/** Top-level links after "Products". Modules and Tetrobot live in the dropdown. */
const AFTER_PRODUCTS = (['/shapes', '/prototypes', '/company', '/community'] as const).map((p) => ({
  path: p,
  label: pageAt(p).label,
}))

/** Phone menu, grouped the way the desktop bar is. */
const MOBILE_GROUPS = [
  {
    title: 'Products',
    items: [
      { path: '/modules', label: 'Modules & pricing' },
      { path: '/tetrobot', label: 'Tetrobot software' },
      { path: '/download', label: 'Download — free' },
    ],
  },
  {
    title: 'Explore',
    items: [
      { path: '/', label: 'Home' },
      { path: '/shapes', label: 'Shapes' },
      { path: '/prototypes', label: 'Prototypes' },
    ],
  },
  {
    title: 'About & contact',
    items: [
      { path: '/company', label: 'Company' },
      { path: '/community', label: 'Community & contact' },
    ],
  },
]

function NavLink({ path, label, on }: { path: string; label: string; on: boolean }) {
  return (
    <li>
      <Link
        to={path}
        aria-current={on ? 'page' : undefined}
        className={`relative block rounded-full px-3 py-2 text-[13px] font-medium transition-colors duration-300 xl:px-3.5 ${
          on ? 'text-onbrand' : 'text-chalk/65 hover:text-chalk'
        }`}
      >
        {on && <span className="from-sun to-gold absolute inset-0 -z-10 rounded-full bg-gradient-to-br" />}
        {label}
      </Link>
    </li>
  )
}

/**
 * Floating glass nav, with the announcement strip above it.
 *
 *  - It condenses after the first scroll (tighter padding, stronger glass, the
 *    strip folds away), so it stops competing with the page.
 *  - "Products" opens one panel with every product and its price, so the bar
 *    itself stays short: Home · Products · four pages.
 *  - Search (button, Ctrl/⌘+K or "/") finds any page, section, product,
 *    shape, video or contact channel.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { path } = useLocation()
  const join = useWaitlist()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Ctrl/⌘+K anywhere, or "/" when not already typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable="true"]')
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close the phone menu whenever the page changes.
  useEffect(() => setMenuOpen(false), [path])

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex flex-col items-center">
      <TopBar hidden={scrolled} />

      <div className="relative flex w-full justify-center px-4 pt-3 sm:pt-4">
        <nav
          className={`glass-strong flex w-full max-w-6xl items-center justify-between gap-2 !rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            scrolled ? 'nav-scrolled px-3 py-2 sm:px-4' : 'refract-soft px-4 py-2.5 sm:px-5 sm:py-3'
          }`}
        >
          <Link
            to="/"
            onClick={() => path === '/' && scrollToTop()}
            aria-label="Nischay Robotics — home"
            className="relative z-10 shrink-0"
          >
            <Wordmark />
          </Link>

          {/* Desktop links */}
          <ul className="relative z-10 hidden items-center gap-0.5 lg:flex xl:gap-1">
            <NavLink path="/" label="Home" on={path === '/'} />
            <ProductsDropdown active={PRODUCT_PATHS.includes(path)} />
            {AFTER_PRODUCTS.map((item) => (
              <NavLink key={item.path} {...item} on={path === item.path} />
            ))}
          </ul>

          <div className="relative z-10 flex items-center gap-2">
            {/* Search: a box on wide screens, an icon below, and inside the
                menu sheet on phones (no room for one more button at 390px) */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search the site"
              className="glass-soft text-chalk/55 hover:text-chalk hidden h-9 min-w-9 items-center sm:flex justify-center !rounded-full px-2.5 transition-colors xl:w-44 xl:justify-start xl:px-3.5"
            >
              <span className="relative z-10 flex w-full items-center gap-2">
                <SearchIcon size={15} />
                <span className="hidden flex-1 text-left text-[13px] xl:block">Search…</span>
                <kbd className="border-chalk/15 hidden rounded border px-1 text-[10px] xl:block">
                  {isMac ? '⌘K' : 'Ctrl K'}
                </kbd>
              </span>
            </button>

            <ThemeToggle />

            <Button onClick={() => join()} variant="primary" className="!px-4 !py-2 !text-[13px] whitespace-nowrap">
              {/* The full label wraps to two lines once the theme toggle and
                  hamburger are also in the bar on a 390px screen. */}
              <span className="sm:hidden">Waitlist</span>
              <span className="hidden sm:inline">Join waitlist</span>
            </Button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="glass-soft text-chalk flex h-9 w-9 items-center justify-center !rounded-full lg:hidden"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path
                  d={menuOpen ? 'M3 3l9 9M12 3l-9 9' : 'M2 4.5h11M2 10.5h11'}
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile sheet */}
        {menuOpen && (
          <div
            data-lenis-prevent
            className="glass-strong absolute inset-x-4 top-[calc(100%+0.5rem)] max-h-[75vh] overflow-y-auto p-2 lg:hidden"
          >
            <div className="relative z-10">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setSearchOpen(true)
                }}
                className="border-chalk/10 text-chalk/50 m-2 flex w-[calc(100%-1rem)] items-center gap-2.5 rounded-2xl border px-4 py-3 text-left text-sm sm:hidden"
              >
                <SearchIcon size={15} /> Search modules, prices, shapes…
              </button>
              {MOBILE_GROUPS.map((g) => (
                <div key={g.title} className="py-1">
                  <p className="text-chalk/35 px-4 pt-2 pb-1 text-[10px] font-semibold tracking-[0.2em] uppercase">
                    {g.title}
                  </p>
                  <ul className="flex flex-col">
                    {g.items.map((item) => {
                      const on = path === item.path
                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            onClick={() => setMenuOpen(false)}
                            aria-current={on ? 'page' : undefined}
                            className={`flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-white/5 ${
                              on ? 'text-accent' : 'text-chalk/80 hover:text-accent'
                            }`}
                          >
                            {item.label}
                            {on && <span className="bg-gold h-1.5 w-1.5 rounded-full" />}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
