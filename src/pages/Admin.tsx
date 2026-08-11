import { useCallback, useEffect, useMemo, useState } from 'react'
import { Wordmark } from '@/components/ui/Logo'
import { ADMIN_EMAIL, isFirebaseConfigured } from '@/lib/firebase.config'

/* ============================================================================
   Waitlist admin — the thing that replaces the notebook.

   Reached at /#/admin, linked from nowhere. There is nothing secret about the
   URL, because the security is in firestore.rules: only the admin account can
   read the collection. An unauthorised visitor who loads this page sees a
   sign-in prompt, and if they push past it the server refuses. The client is
   never the gatekeeper.

   This is the ONLY notification channel — there is no signup email — so it
   subscribes live rather than reading once. Leave the tab open and new
   signups arrive on their own, with a count in the tab title.
   ========================================================================= */

type Entry = {
  id: string
  name?: string
  email?: string
  product?: string
  productName?: string
  quantity?: string
  organisation?: string
  country?: string
  message?: string
  createdAt?: { seconds: number } | null
}

const SEEN_KEY = 'nr-waitlist-last-seen'

const millis = (e: Entry) => (e.createdAt?.seconds ?? 0) * 1000

const fmt = (e: Entry) =>
  e.createdAt?.seconds
    ? new Date(millis(e)).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : 'just now'

function toCsv(rows: Entry[]): string {
  const cols = ['createdAt', 'name', 'email', 'productName', 'quantity', 'organisation', 'country', 'message'] as const
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const body = rows.map((r) =>
    cols
      .map((c) => esc(c === 'createdAt' ? fmt(r) : String((r as Record<string, unknown>)[c] ?? '')))
      .join(','),
  )
  return [cols.join(','), ...body].join('\n')
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass p-7">
      <div className="relative z-10">
        <h2 className="text-lg">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function Stat({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div className="glass px-4 py-4">
      <p
        className={`font-display relative z-10 text-2xl font-bold ${
          accent ? 'text-gold-grad' : 'text-chalk/85'
        }`}
      >
        {value}
      </p>
      <p className="text-chalk/45 relative z-10 mt-1 text-[11px] leading-snug">{label}</p>
    </div>
  )
}

export default function Admin() {
  const [email, setEmail] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [product, setProduct] = useState('all')
  const [lastSeen, setLastSeen] = useState<number>(() => {
    if (typeof localStorage === 'undefined') return 0
    return Number(localStorage.getItem(SEEN_KEY) ?? 0)
  })

  /* -- Auth ---------------------------------------------------------------- */

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setChecking(false)
      return
    }
    let unsub: (() => void) | undefined
    let cancelled = false
    ;(async () => {
      const [{ getFirebaseAuth }, { onAuthStateChanged }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth'),
      ])
      const auth = getFirebaseAuth()
      if (!auth) return setChecking(false)
      unsub = onAuthStateChanged(auth, (user) => {
        if (cancelled) return
        setEmail(user?.email ?? null)
        setChecking(false)
      })
    })()
    return () => {
      cancelled = true
      unsub?.()
    }
  }, [])

  const signIn = useCallback(async () => {
    setError(null)
    const [{ getFirebaseAuth }, { GoogleAuthProvider, signInWithPopup }] = await Promise.all([
      import('@/lib/firebase'),
      import('firebase/auth'),
    ])
    const auth = getFirebaseAuth()
    if (!auth) return
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed')
    }
  }, [])

  const signOutNow = useCallback(async () => {
    const [{ getFirebaseAuth }, { signOut }] = await Promise.all([
      import('@/lib/firebase'),
      import('firebase/auth'),
    ])
    const auth = getFirebaseAuth()
    if (auth) await signOut(auth)
    setEntries(null)
  }, [])

  /* -- Live subscription ---------------------------------------------------
     onSnapshot rather than getDocs: with no signup email, an admin page that
     needs a manual refresh means missing signups for days.                 */

  useEffect(() => {
    if (email !== ADMIN_EMAIL) return
    let unsub: (() => void) | undefined
    let cancelled = false
    ;(async () => {
      try {
        const [{ getDb }, { collection, onSnapshot, orderBy, query }] = await Promise.all([
          import('@/lib/firebase'),
          import('firebase/firestore'),
        ])
        const db = getDb()
        if (!db) return
        unsub = onSnapshot(
          query(collection(db, 'waitlist'), orderBy('createdAt', 'desc')),
          (snap) => {
            if (cancelled) return
            setEntries(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Entry, 'id'>) })))
          },
          (e) => !cancelled && setError(e.message),
        )
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load the list')
      }
    })()
    return () => {
      cancelled = true
      unsub?.()
    }
  }, [email])

  /* -- Derived ------------------------------------------------------------- */

  const unseen = useMemo(
    () => (entries ?? []).filter((e) => millis(e) > lastSeen).length,
    [entries, lastSeen],
  )

  const productNames = useMemo(() => {
    const set = new Set((entries ?? []).map((e) => e.productName).filter(Boolean) as string[])
    return [...set].sort()
  }, [entries])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (entries ?? []).filter((e) => {
      if (product !== 'all' && e.productName !== product) return false
      if (!q) return true
      return [e.name, e.email, e.organisation, e.country, e.message, e.productName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [entries, search, product])

  const lastWeek = useMemo(() => {
    const cut = Date.now() - 7 * 24 * 60 * 60 * 1000
    return (entries ?? []).filter((e) => millis(e) > cut).length
  }, [entries])

  const topProduct = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of entries ?? []) {
      if (e.productName) counts.set(e.productName, (counts.get(e.productName) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
  }, [entries])

  // Unread count in the tab title, so a pinned tab is itself the notification.
  useEffect(() => {
    document.title = unseen > 0 ? `(${unseen}) Waitlist — Nischay Robotics` : 'Waitlist — Nischay Robotics'
    return () => {
      document.title = 'Nischay Robotics — Robots that change their own shape'
    }
  }, [unseen])

  const markSeen = () => {
    const now = Date.now()
    localStorage.setItem(SEEN_KEY, String(now))
    setLastSeen(now)
  }

  const download = () => {
    if (!visible.length) return
    const blob = new Blob([toCsv(visible)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nischay-robotics-waitlist-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // No width here on purpose: `w-full` baked into a shared class fights any
  // `w-auto` added at the call site, and which one wins depends on Tailwind's
  // internal ordering rather than the order you wrote them.
  // Colours come from the `.field` component class so they follow the theme.
  const inputCls = 'field rounded-full px-4 py-2.5 text-[13px] outline-none transition-colors'

  /* -- Render -------------------------------------------------------------- */

  return (
    <div className="relative z-10 min-h-screen px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <a href="#/" className="shrink-0">
            <Wordmark />
          </a>
          {email && (
            <div className="flex items-center gap-3">
              <span className="text-chalk/45 hidden text-[13px] sm:inline">{email}</span>
              <button
                type="button"
                onClick={signOutNow}
                className="glass-soft text-chalk/70 hover:text-accent !rounded-full px-4 py-2 text-[13px] font-semibold transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </header>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <h1 className="text-[clamp(1.8rem,4vw,2.6rem)]">Waitlist</h1>
          {entries !== null && (
            <span className="glass-soft text-chalk/60 inline-flex items-center gap-2 !rounded-full px-3 py-1.5 text-[11px] font-semibold">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7BD88F]" />
              Live
            </span>
          )}
        </div>

        {!isFirebaseConfigured ? (
          <div className="mt-8">
            <Panel title="Firebase isn't connected yet">
              <p className="text-chalk/60 mt-3 max-w-lg text-sm leading-relaxed">
                Until it is, waitlist signups arrive as email instead — the form falls back
                automatically, so nothing is being lost. See{' '}
                <span className="text-accent">README → Waitlist backend</span> for the five-minute
                setup.
              </p>
            </Panel>
          </div>
        ) : checking ? (
          <p className="text-chalk/40 mt-8 text-sm">Checking sign-in…</p>
        ) : !email ? (
          <div className="mt-8">
            <Panel title="Sign in to continue">
              <p className="text-chalk/60 mt-3 max-w-md text-sm leading-relaxed">
                Only <span className="text-chalk/80">{ADMIN_EMAIL}</span> can read the list. That
                is enforced by Firestore rules on the server, not here.
              </p>
              <button
                type="button"
                onClick={signIn}
                className="from-sun via-gold to-ember text-onbrand mt-6 rounded-full bg-gradient-to-br px-6 py-3 text-sm font-bold"
              >
                Sign in with Google
              </button>
              {error && <p className="mt-4 text-sm text-[#FF8A93]">{error}</p>}
            </Panel>
          </div>
        ) : email !== ADMIN_EMAIL ? (
          <div className="mt-8">
            <Panel title="Not this account">
              <p className="text-chalk/60 mt-3 text-sm leading-relaxed">
                You're signed in as {email}, which can't read the waitlist. Sign out and use{' '}
                {ADMIN_EMAIL}.
              </p>
            </Panel>
          </div>
        ) : entries === null ? (
          <p className="text-chalk/40 mt-8 text-sm">Loading…</p>
        ) : (
          <>
            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <Stat value={entries.length} label="total signups" accent />
              <Stat value={unseen} label="new since you last looked" accent={unseen > 0} />
              <Stat value={lastWeek} label="in the last 7 days" />
              <Stat value={topProduct} label="most requested" />
            </div>

            {/* Toolbar */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, org, note…"
                className={`${inputCls} w-full min-w-48 max-w-xs flex-1`}
              />
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className={`${inputCls} shrink-0 appearance-none pr-8`}
              >
                <option value="all" className="bg-ink">
                  All products
                </option>
                {productNames.map((p) => (
                  <option key={p} value={p} className="bg-ink">
                    {p}
                  </option>
                ))}
              </select>

              <div className="flex-1" />

              {unseen > 0 && (
                <button
                  type="button"
                  onClick={markSeen}
                  className="glass-soft text-chalk hover:text-accent !rounded-full px-5 py-2.5 text-[13px] font-semibold transition-colors"
                >
                  Mark {unseen} as seen
                </button>
              )}
              {visible.length > 0 && (
                <button
                  type="button"
                  onClick={download}
                  className="from-sun via-gold to-ember text-onbrand rounded-full bg-gradient-to-br px-5 py-2.5 text-[13px] font-bold"
                >
                  Download CSV
                </button>
              )}
            </div>

            {error && <p className="mt-4 text-sm text-[#FF8A93]">{error}</p>}

            {entries.length === 0 ? (
              <div className="mt-6">
                <Panel title="No signups yet">
                  <p className="text-chalk/55 mt-3 text-sm leading-relaxed">
                    This page is live — leave the tab open and new signups appear here on their
                    own, with a count in the tab title.
                  </p>
                </Panel>
              </div>
            ) : visible.length === 0 ? (
              <p className="text-chalk/40 mt-6 text-sm">Nothing matches that filter.</p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="glass mt-5 hidden overflow-x-auto lg:block">
                  <table className="relative z-10 w-full text-left text-[13px]">
                    <thead>
                      <tr className="text-chalk/35 border-b border-chalk/10 text-[10px] tracking-[0.16em] uppercase">
                        {['When', 'Name', 'Email', 'Product', 'Qty', 'Org / Country', 'Note'].map((h) => (
                          <th key={h} className="px-4 py-3 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((e) => {
                        const isNew = millis(e) > lastSeen
                        return (
                          <tr
                            key={e.id}
                            className={`border-b border-chalk/[0.07] last:border-0 ${isNew ? 'bg-gold/[0.06]' : ''}`}
                          >
                            <td className="text-chalk/40 px-4 py-3 whitespace-nowrap">
                              {isNew && <span className="bg-gold mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle" />}
                              {fmt(e)}
                            </td>
                            <td className="text-chalk px-4 py-3 font-medium">{e.name || '—'}</td>
                            <td className="px-4 py-3">
                              <a href={`mailto:${e.email}`} className="text-accent hover:text-sun">
                                {e.email}
                              </a>
                            </td>
                            <td className="text-chalk/70 px-4 py-3">{e.productName || '—'}</td>
                            <td className="text-chalk/50 px-4 py-3">{e.quantity || '—'}</td>
                            <td className="text-chalk/50 px-4 py-3">
                              {[e.organisation, e.country].filter(Boolean).join(' · ') || '—'}
                            </td>
                            <td className="text-chalk/50 max-w-xs px-4 py-3">{e.message || '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards — a 7-column table is unusable on a phone, and
                    this page is most likely to be checked from one. */}
                <ul className="mt-5 space-y-3 lg:hidden">
                  {visible.map((e) => {
                    const isNew = millis(e) > lastSeen
                    return (
                      <li key={e.id} className={`glass p-5 ${isNew ? 'ring-gold/40 ring-1' : ''}`}>
                        <div className="relative z-10">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-chalk font-semibold">
                                {isNew && <span className="bg-gold mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle" />}
                                {e.name || '—'}
                              </p>
                              <a href={`mailto:${e.email}`} className="text-accent text-[13px] hover:text-sun">
                                {e.email}
                              </a>
                            </div>
                            <span className="text-chalk/30 shrink-0 text-[11px]">{fmt(e)}</span>
                          </div>

                          <p className="text-chalk/70 mt-3 text-[13px]">
                            {e.productName}
                            {e.quantity ? ` × ${e.quantity}` : ''}
                          </p>
                          {(e.organisation || e.country) && (
                            <p className="text-chalk/45 mt-1 text-[13px]">
                              {[e.organisation, e.country].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          {e.message && (
                            <p className="text-chalk/55 mt-3 border-t border-chalk/10 pt-3 text-[13px] leading-relaxed">
                              {e.message}
                            </p>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
