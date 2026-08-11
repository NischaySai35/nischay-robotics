import { useEffect, useState } from 'react'
import { Wordmark } from '@/components/ui/Logo'
import { Button } from '@/components/ui/primitives'
import { navItems } from '@/content/site'
import { scrollToId, scrollToTop } from '@/lib/scroll'
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

/**
 * Floating glass nav.
 *
 * Two behaviours worth noting:
 *  - It condenses after the first scroll (tighter padding, stronger glass), so
 *    it stops competing with the hero.
 *  - The active section is tracked with IntersectionObserver rather than scroll
 *    maths, and the indicator pill slides between links with a shared layout
 *    transition.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>('')
  const [menuOpen, setMenuOpen] = useState(false)
  const join = useWaitlist()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = navItems
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const go = (id: string) => {
    setMenuOpen(false)
    scrollToId(id)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-5">
      <nav
        className={`glass-strong refract-soft flex w-full max-w-5xl items-center justify-between !rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled ? 'px-3 py-2 sm:px-4' : 'px-4 py-2.5 sm:px-5 sm:py-3'
        }`}
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            scrollToTop()
          }}
          className="relative z-10 shrink-0"
        >
          <Wordmark />
        </a>

        {/* Desktop links */}
        <ul className="relative z-10 hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => go(item.id)}
                className={`relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300 ${
                  active === item.id ? 'text-onbrand' : 'text-chalk/65 hover:text-chalk'
                }`}
              >
                {active === item.id && (
                  <span className="from-sun to-gold absolute inset-0 -z-10 rounded-full bg-gradient-to-br" />
                )}
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="relative z-10 flex items-center gap-2">
          <ThemeToggle />

          <Button
            onClick={() => join()}
            variant="primary"
            className="!px-4 !py-2 !text-[13px] whitespace-nowrap"
          >
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
            className="glass-soft text-chalk flex h-9 w-9 items-center justify-center !rounded-full md:hidden"
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
        <div className="glass-strong absolute inset-x-4 top-[calc(100%+0.5rem)] p-2 md:hidden">
          <ul className="relative z-10 flex flex-col">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  className="text-chalk/80 hover:text-accent w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-white/5"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
