// REUSE-CHECKED: download|installer|platform -> nothing existed; data comes from lib/releases.ts.

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { software } from '@/content/site'
import { detectPlatform, PLATFORMS, useLatestRelease } from '@/lib/releases'
import type { Platform, PlatformId, ReleaseState } from '@/lib/releases'

/* -- OS marks -------------------------------------------------------------- */

function OsIcon({ os, size = 18 }: { os: Platform['os']; size?: number }) {
  if (os === 'windows')
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M2 4.5 10 3.4v8H2zM11 3.3 22 1.8v9.6H11zM2 12.5h8v8.1L2 19.5zM11 12.5h11v9.7l-11-1.5z" />
      </svg>
    )
  if (os === 'mac')
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
    )
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="4" width="19" height="16" rx="2.5" />
      <path d="m7 10 3 2.5L7 15M12.5 15H17" />
    </svg>
  )
}

function DownloadGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
    </svg>
  )
}

/* -- Data helpers ---------------------------------------------------------- */

function usePlatform(): PlatformId | null {
  const [p, setP] = useState<PlatformId | null>(null)
  useEffect(() => {
    let live = true
    detectPlatform().then((v) => live && setP(v))
    return () => {
      live = false
    }
  }, [])
  return p
}

/** URL for a platform: the exact installer if known, else the release page. */
function hrefFor(state: ReleaseState, id: PlatformId) {
  if (state.status === 'ready') return state.assets[id]?.url ?? state.pageUrl
  return software.releasesUrl
}

function sizeFor(state: ReleaseState, id: PlatformId) {
  return state.status === 'ready' ? state.assets[id]?.sizeMB ?? null : null
}

function versionLine(state: ReleaseState): ReactNode {
  if (state.status === 'loading') return 'Checking for the latest version…'
  if (state.status === 'fallback') return 'Latest version on GitHub'
  const date = new Date(state.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  return (
    <>
      Latest <span className="text-chalk font-semibold">{state.version}</span> · released {date}
    </>
  )
}

/* -- Primary button -------------------------------------------------------- */

function PrimaryDownload({ state, platform }: { state: ReleaseState; platform: Platform | null }) {
  const base =
    'from-sun via-gold to-ember text-onbrand group inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-br px-6 py-3.5 text-sm font-bold shadow-[0_10px_36px_-10px_rgba(255,201,60,0.75)] transition-all duration-300 hover:-translate-y-0.5'

  if (!platform) {
    // Phone, tablet or unknown OS — no guess; send them to every file.
    return (
      <a href={software.releasesUrl} target="_blank" rel="noreferrer noopener" className={base}>
        <DownloadGlyph /> See all downloads
      </a>
    )
  }
  const size = sizeFor(state, platform.id)
  return (
    <a href={hrefFor(state, platform.id)} className={base} rel="noreferrer noopener">
      <OsIcon os={platform.os} size={17} />
      <span className="whitespace-nowrap">Download for {platform.label.replace('macOS — ', 'Mac ').replace('Linux — ', 'Linux ')}</span>
      {/* Size hidden on phones — it wrapped the button onto three lines. */}
      {size && <span className="hidden font-medium whitespace-nowrap opacity-70 sm:inline">· {size} MB</span>}
    </a>
  )
}

/* -- Full panel: Tetrobot page --------------------------------------------- */

export function DownloadPanel() {
  const state = useLatestRelease()
  const detected = usePlatform()
  const mine = PLATFORMS.find((p) => p.id === detected) ?? null

  return (
    <div className="glass-strong p-6 sm:p-8">
      <div className="relative z-10">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-xl">
            <p className="font-display text-xl font-bold">{software.name}</p>
            <p className="text-chalk/60 mt-2 text-sm leading-relaxed">{software.blurb}</p>
            <p className="text-chalk/45 mt-3 flex items-center gap-2 text-[13px]">
              <span className={`h-1.5 w-1.5 rounded-full ${state.status === 'loading' ? 'bg-chalk/30 animate-pulse' : 'bg-[#3BA55C]'}`} />
              {versionLine(state)}
            </p>
          </div>
          <div className="shrink-0">
            <PrimaryDownload state={state} platform={mine} />
            {mine && <p className="text-chalk/35 mt-2 text-center text-[12px] xl:text-right">Detected your system — other platforms below</p>}
          </div>
        </div>

        <ul className="mt-7 grid gap-2.5 md:grid-cols-2">
          {PLATFORMS.map((p) => {
            const size = sizeFor(state, p.id)
            const isMine = p.id === detected
            return (
              <li key={p.id}>
                <a
                  href={hrefFor(state, p.id)}
                  rel="noreferrer noopener"
                  className={`group flex items-center gap-3.5 rounded-2xl border px-4 py-3 transition-colors ${
                    isMine ? 'border-gold/50 bg-gold/[0.07]' : 'border-chalk/10 hover:bg-chalk/[0.04]'
                  }`}
                >
                  <span className="text-accent shrink-0">
                    <OsIcon os={p.os} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-chalk block text-sm font-semibold">{p.label}</span>
                    <span className="text-chalk/45 block text-[12px]">
                      {p.detail}
                      {size ? ` · ${size} MB` : ''}
                    </span>
                  </span>
                  <span className="text-chalk/40 group-hover:text-accent shrink-0 transition-colors">
                    <DownloadGlyph />
                  </span>
                </a>
              </li>
            )
          })}
        </ul>

        <div className="mt-6 flex flex-col gap-3 border-t border-chalk/10 pt-5 text-[12px] leading-relaxed sm:flex-row sm:items-start sm:justify-between">
          <p className="text-chalk/45 max-w-2xl">{software.firstLaunch}</p>
          <a
            href={state.status === 'ready' ? state.pageUrl : software.releasesUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-accent hover:text-sun shrink-0 font-semibold"
          >
            Release notes & all files ↗
          </a>
        </div>
      </div>
    </div>
  )
}

/* -- Compact: home page ---------------------------------------------------- */

export function DownloadCompact() {
  const state = useLatestRelease()
  const detected = usePlatform()
  const mine = PLATFORMS.find((p) => p.id === detected) ?? null
  // One button per OS family in the row underneath; the primary covers yours.
  const others = PLATFORMS.filter((p) => p.id !== mine?.id && p.id !== 'linux-deb')

  return (
    <div>
      <PrimaryDownload state={state} platform={mine} />
      <p className="text-chalk/45 mt-3 text-[12px]">{versionLine(state)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {others.map((p) => (
          <a
            key={p.id}
            href={hrefFor(state, p.id)}
            rel="noreferrer noopener"
            className="glass-soft text-chalk/75 hover:text-accent inline-flex items-center gap-2 !rounded-full px-3.5 py-2 text-[12px] font-semibold transition-colors"
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              <OsIcon os={p.os} size={14} />
              {p.label.replace('macOS — ', 'Mac ').replace('Linux — ', 'Linux ')}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
