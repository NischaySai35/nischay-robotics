// REUSE-CHECKED: releases|api.github|download -> only Admin's CSV export and a video comment; nothing fetched GitHub releases.

import { useEffect, useState } from 'react'
import { software } from '@/content/site'

/**
 * The Tetrobot desktop app's downloads, resolved from GitHub at view time.
 *
 * Installer filenames carry the version (…-Setup-1.0.4.exe), so a hard-coded
 * link would go stale on every release. Instead we ask GitHub's public API for
 * the *latest* release and pick each platform's file by pattern. Publish a new
 * release on GitHub and the site serves it on the next page view — no deploy.
 *
 * Unauthenticated API calls are limited to 60 an hour per visitor IP, so the
 * answer is cached for the session. If the call fails for any reason, every
 * button falls back to the release page on GitHub, which always works.
 */

export type PlatformId = 'windows' | 'mac-arm' | 'mac-intel' | 'linux-appimage' | 'linux-deb'

export type Platform = {
  id: PlatformId
  os: 'windows' | 'mac' | 'linux'
  label: string
  detail: string
  /** Matches the asset filename, independent of version. */
  match: RegExp
}

/** Order = display order. Blockmaps/zips/yml are updater files, not for people. */
export const PLATFORMS: readonly Platform[] = [
  { id: 'windows', os: 'windows', label: 'Windows', detail: 'Installer · .exe · 64-bit', match: /setup.*\.exe$/i },
  { id: 'mac-arm', os: 'mac', label: 'macOS — Apple Silicon', detail: 'M1 – M4 · .dmg', match: /arm64\.dmg$/i },
  { id: 'mac-intel', os: 'mac', label: 'macOS — Intel', detail: 'Intel Macs · .dmg', match: /x64\.dmg$/i },
  { id: 'linux-appimage', os: 'linux', label: 'Linux — AppImage', detail: 'Any distro · x86-64', match: /\.appimage$/i },
  { id: 'linux-deb', os: 'linux', label: 'Linux — Debian / Ubuntu', detail: '.deb · amd64', match: /amd64\.deb$/i },
]

export type ResolvedAsset = { url: string; sizeMB: number | null; name: string | null }

export type ReleaseState =
  | { status: 'loading' }
  | {
      status: 'ready'
      version: string
      publishedAt: string
      pageUrl: string
      assets: Partial<Record<PlatformId, ResolvedAsset>>
    }
  | { status: 'fallback' }

const CACHE_KEY = `nr-release:${software.repo}`
const CACHE_MS = 10 * 60 * 1000

type GhAsset = { name: string; size: number; browser_download_url: string }
type GhRelease = { tag_name: string; published_at: string; html_url: string; assets: GhAsset[] }

function resolve(r: GhRelease): Extract<ReleaseState, { status: 'ready' }> {
  const assets: Partial<Record<PlatformId, ResolvedAsset>> = {}
  for (const p of PLATFORMS) {
    const a = r.assets.find((x) => p.match.test(x.name))
    if (a) assets[p.id] = { url: a.browser_download_url, sizeMB: Math.round(a.size / 1e6), name: a.name }
  }
  return { status: 'ready', version: r.tag_name, publishedAt: r.published_at, pageUrl: r.html_url, assets }
}

export function useLatestRelease(): ReleaseState {
  const [state, setState] = useState<ReleaseState>(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      if (raw) {
        const { at, release } = JSON.parse(raw) as { at: number; release: GhRelease }
        if (Date.now() - at < CACHE_MS) return resolve(release)
      }
    } catch {
      /* private mode / blocked storage — just fetch */
    }
    return { status: 'loading' }
  })

  useEffect(() => {
    if (state.status !== 'loading') return
    const ctrl = new AbortController()
    fetch(`https://api.github.com/repos/${software.repo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: ctrl.signal,
    })
      .then((res) => (res.ok ? (res.json() as Promise<GhRelease>) : Promise.reject(new Error(String(res.status)))))
      .then((release) => {
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), release }))
        } catch {
          /* ignore */
        }
        setState(resolve(release))
      })
      .catch((err: unknown) => {
        if ((err as Error).name === 'AbortError') return
        console.warn('[releases] GitHub lookup failed, linking to the release page instead', err)
        setState({ status: 'fallback' })
      })
    return () => ctrl.abort()
  }, [state.status])

  return state
}

/** Best guess at the visitor's platform, for the "recommended" button. */
export async function detectPlatform(): Promise<PlatformId | null> {
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string; getHighEntropyValues?: (h: string[]) => Promise<{ architecture?: string }> }
  }
  const ua = navigator.userAgent
  const platform = nav.userAgentData?.platform ?? ''

  if (/android|iphone|ipad|ipod/i.test(ua)) return null // desktop app only
  if (/win/i.test(platform) || /windows/i.test(ua)) return 'windows'
  if (/mac/i.test(platform) || /macintosh|mac os x/i.test(ua)) {
    // Only Chromium exposes CPU architecture. Elsewhere, assume Apple Silicon:
    // every Mac sold since 2021 is.
    try {
      const hi = await nav.userAgentData?.getHighEntropyValues?.(['architecture'])
      if (hi?.architecture === 'x86') return 'mac-intel'
    } catch {
      /* ignore */
    }
    return 'mac-arm'
  }
  if (/linux|x11/i.test(platform) || /linux/i.test(ua)) return 'linux-appimage'
  return null
}
