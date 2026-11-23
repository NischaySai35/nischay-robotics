// REUSE-CHECKED: pushState|popstate|navigate|router|Link -> only useHashRoute() in App.tsx (hash-only, admin view); this replaces it with real paths.

import { useSyncExternalStore } from 'react'

/**
 * Path routing, hand-rolled — the site has seven pages and one admin view, and
 * a router library would be most of a page's worth of JavaScript for that.
 *
 * Real paths (/modules, /tetrobot …) rather than hashes, so every page has a
 * shareable URL and its own title. Both hosts rewrite unknown paths to
 * index.html (firebase.json `rewrites`, netlify.toml `[[redirects]]`), and
 * `vite preview` does the same, so a deep link or a refresh always works.
 *
 * The admin view stays at /#/admin so existing links and the address in the
 * notification emails keep working; /admin works too.
 */

const EVENT = 'nr:navigate'

/**
 * Short, shareable aliases. Resolved before anything renders — on first load
 * here at module time, and inside navigate() for in-app links — so the target
 * page mounts exactly once and its deep-link scroll lands correctly.
 */
const REDIRECTS: Record<string, string> = {
  '/download': '/tetrobot#download',
  '/downloads': '/tetrobot#download',
}

const resolveAlias = (to: string) => REDIRECTS[to.split('#')[0].replace(/\/+$/, '') || '/'] ?? to

if (typeof window !== 'undefined') {
  const target = resolveAlias(window.location.pathname)
  if (target !== window.location.pathname) window.history.replaceState({}, '', target)
}

function subscribe(cb: () => void) {
  window.addEventListener('popstate', cb)
  window.addEventListener('hashchange', cb)
  window.addEventListener(EVENT, cb)
  return () => {
    window.removeEventListener('popstate', cb)
    window.removeEventListener('hashchange', cb)
    window.removeEventListener(EVENT, cb)
  }
}

const snapshot = () => window.location.pathname + window.location.hash

/** Current path plus hash, re-rendering on every navigation. */
export function useLocation(): { path: string; hash: string } {
  const loc = useSyncExternalStore(subscribe, snapshot, () => '/')
  const i = loc.indexOf('#')
  const rawPath = i === -1 ? loc : loc.slice(0, i)
  // Normalise "/modules/" to "/modules" so a trailing slash never 404s.
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : '/'
  return { path, hash: i === -1 ? '' : loc.slice(i) }
}

/** Client-side navigation. External or same-tab-modified clicks are left alone by <Link>. */
export function navigate(target: string, { replace = false }: { replace?: boolean } = {}) {
  const to = resolveAlias(target)
  const current = window.location.pathname + window.location.hash
  if (replace) window.history.replaceState({}, '', to)
  else if (to !== current) window.history.pushState({}, '', to)
  window.dispatchEvent(new Event(EVENT))
}
