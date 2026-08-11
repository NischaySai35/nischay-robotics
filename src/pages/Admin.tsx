import { useCallback, useEffect, useState } from 'react'
import { Wordmark } from '@/components/ui/Logo'
import { ADMIN_EMAIL, isFirebaseConfigured } from '@/lib/firebase.config'

/* ============================================================================
   Waitlist admin — the thing that replaces the notebook.

   Reached at /#/admin. Not linked from anywhere on the site; there is nothing
   secret about the URL, because the security is in firestore.rules — only the
   admin account can read the collection, so an unauthorised visitor loading
   this page sees a sign-in prompt and, if they push past it, a permission
   error from the server. The client is never the gatekeeper.
   ========================================================================= */

type Entry = {
  id: string
  name?: string
  email?: string
  productName?: string
  quantity?: string
  organisation?: string
  country?: string
  message?: string
  createdAt?: { seconds: number } | null
}

const fmt = (ts: Entry['createdAt']) =>
  ts?.seconds
    ? new Date(ts.seconds * 1000).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—'

function toCsv(rows: Entry[]): string {
  const cols = ['createdAt', 'name', 'email', 'productName', 'quantity', 'organisation', 'country', 'message']
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const header = cols.join(',')
  const body = rows.map((r) =>
    cols
      .map((c) => esc(c === 'createdAt' ? fmt(r.createdAt) : String((r as Record<string, unknown>)[c] ?? '')))
      .join(','),
  )
  return [header, ...body].join('\n')
}

export default function Admin() {
  const [email, setEmail] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Watch auth state.
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setChecking(false)
      return
    }
    let cancelled = false
    ;(async () => {
      const [{ getFirebaseAuth }, { onAuthStateChanged }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth'),
      ])
      const auth = getFirebaseAuth()
      if (!auth) return setChecking(false)
      onAuthStateChanged(auth, (user) => {
        if (cancelled) return
        setEmail(user?.email ?? null)
        setChecking(false)
      })
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async () => {
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

  // Load the list once the right person is signed in.
  useEffect(() => {
    if (email !== ADMIN_EMAIL) return
    let cancelled = false
    ;(async () => {
      try {
        const [{ getDb }, { collection, getDocs, orderBy, query }] = await Promise.all([
          import('@/lib/firebase'),
          import('firebase/firestore'),
        ])
        const db = getDb()
        if (!db) return
        const snap = await getDocs(query(collection(db, 'waitlist'), orderBy('createdAt', 'desc')))
        if (cancelled) return
        setEntries(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Entry, 'id'>) })))
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load the list')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [email])

  const download = () => {
    if (!entries) return
    const blob = new Blob([toCsv(entries)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nischay-robotics-waitlist-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative z-10 min-h-screen px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <a href="#/" className="shrink-0">
            <Wordmark />
          </a>
          <div className="flex items-center gap-3">
            {email && (
              <span className="text-chalk/45 text-[13px]">{email}</span>
            )}
            {email && (
              <button
                type="button"
                onClick={signOutNow}
                className="glass-soft text-chalk/70 hover:text-gold !rounded-full px-4 py-2 text-[13px] font-semibold transition-colors"
              >
                Sign out
              </button>
            )}
          </div>
        </header>

        <h1 className="mt-10 text-[clamp(1.8rem,4vw,2.6rem)]">Waitlist</h1>

        {!isFirebaseConfigured ? (
          <div className="glass mt-8 p-7">
            <div className="relative z-10">
              <h2 className="text-lg">Firebase isn't connected yet</h2>
              <p className="text-chalk/60 mt-3 text-sm leading-relaxed">
                Until it is, waitlist signups arrive as email instead — the form falls back
                automatically, so nothing is being lost. See{' '}
                <span className="text-gold">README → Waitlist backend</span> for the five-minute
                setup.
              </p>
            </div>
          </div>
        ) : checking ? (
          <p className="text-chalk/40 mt-8 text-sm">Checking sign-in…</p>
        ) : !email ? (
          <div className="glass mt-8 p-7">
            <div className="relative z-10">
              <h2 className="text-lg">Sign in to continue</h2>
              <p className="text-chalk/60 mt-3 max-w-md text-sm leading-relaxed">
                Only <span className="text-chalk/80">{ADMIN_EMAIL}</span> can read the list. This
                is enforced by Firestore rules on the server, not here.
              </p>
              <button
                type="button"
                onClick={signIn}
                className="from-sun via-gold to-ember text-void mt-6 rounded-full bg-gradient-to-br px-6 py-3 text-sm font-bold"
              >
                Sign in with Google
              </button>
            </div>
          </div>
        ) : email !== ADMIN_EMAIL ? (
          <div className="glass mt-8 p-7">
            <div className="relative z-10">
              <h2 className="text-lg">Not this account</h2>
              <p className="text-chalk/60 mt-3 text-sm leading-relaxed">
                You're signed in as {email}, which can't read the waitlist. Sign out and use{' '}
                {ADMIN_EMAIL}.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <p className="text-chalk/50 text-sm">
                {entries === null ? 'Loading…' : `${entries.length} signup${entries.length === 1 ? '' : 's'}`}
              </p>
              {entries && entries.length > 0 && (
                <button
                  type="button"
                  onClick={download}
                  className="glass-soft text-chalk hover:text-gold !rounded-full px-5 py-2.5 text-[13px] font-semibold transition-colors"
                >
                  Download CSV
                </button>
              )}
            </div>

            {error && <p className="mt-4 text-sm text-[#FF8A93]">{error}</p>}

            {entries && entries.length === 0 && (
              <p className="text-chalk/40 mt-6 text-sm">No signups yet.</p>
            )}

            {entries && entries.length > 0 && (
              <div className="glass mt-5 overflow-x-auto">
                <table className="relative z-10 w-full min-w-[46rem] text-left text-[13px]">
                  <thead>
                    <tr className="text-chalk/35 border-b border-white/8 text-[10px] tracking-[0.16em] uppercase">
                      {['When', 'Name', 'Email', 'Product', 'Qty', 'Org / Country', 'Note'].map((h) => (
                        <th key={h} className="px-4 py-3 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id} className="border-b border-white/5 last:border-0">
                        <td className="text-chalk/40 px-4 py-3 whitespace-nowrap">{fmt(e.createdAt)}</td>
                        <td className="text-chalk px-4 py-3 font-medium">{e.name || '—'}</td>
                        <td className="px-4 py-3">
                          <a href={`mailto:${e.email}`} className="text-gold hover:text-sun">
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
