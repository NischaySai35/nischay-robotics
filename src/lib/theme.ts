import { useCallback, useEffect, useState } from 'react'

/**
 * Theme state.
 *
 * Light is the default and always wins on a cold visit — the system's
 * `prefers-color-scheme` is deliberately NOT consulted. Someone arriving on a
 * machine set to dark still sees the light site first, and dark is a choice
 * they make here.
 *
 * The attribute is applied by an inline script in index.html before first
 * paint, so there is no flash of the wrong theme. This hook only mirrors and
 * mutates what that script established.
 */

export type Theme = 'light' | 'dark'

const KEY = 'nr-theme'

export function readStoredTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'light'
  return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'
}

function apply(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') root.setAttribute('data-theme', 'dark')
  else root.removeAttribute('data-theme')

  // Keep the browser chrome (mobile address bar) in step with the page.
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#06050A' : '#FAF9F6')
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark'
      ? 'dark'
      : 'light',
  )

  useEffect(() => {
    apply(theme)
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      // Private mode or blocked storage — the theme still applies for this
      // session, it just won't be remembered.
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return { theme, toggle, isDark: theme === 'dark' }
}
