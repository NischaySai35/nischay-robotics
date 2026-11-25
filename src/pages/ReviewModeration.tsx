// REUSE-CHECKED: moderation|approve|admin reviews -> Admin.tsx only lists waitlist signups (read-only); approving and deleting reviews is new. Same live onSnapshot pattern.

import { useEffect, useState } from 'react'
import { findProduct } from '@/content/catalog'

type Row = {
  id: string
  product: string
  name: string
  rating: number
  text: string
  approved: boolean
  createdAt?: { seconds: number } | null
}

/**
 * Pending reviews first, then published ones. Approve publishes a review on
 * its product page; Delete removes it for good. Only the admin account can do
 * either (firestore.rules) — this panel is a convenience, not the lock.
 */
export function ReviewModeration() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPublished, setShowPublished] = useState(false)

  useEffect(() => {
    let unsub: (() => void) | undefined
    let cancelled = false
    ;(async () => {
      const [{ getDb }, { collection, onSnapshot, orderBy, query }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/firestore'),
      ])
      const db = getDb()
      if (!db || cancelled) return
      unsub = onSnapshot(
        query(collection(db, 'reviews'), orderBy('createdAt', 'desc')),
        (snap) => !cancelled && setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Row, 'id'>) }))),
        (e) =>
          !cancelled &&
          setError(
            e.code === 'permission-denied'
              ? 'Firestore refused — deploy the latest rules: firebase deploy --only firestore:rules'
              : e.message,
          ),
      )
    })()
    return () => {
      cancelled = true
      unsub?.()
    }
  }, [])

  const act = async (id: string, action: 'approve' | 'hide' | 'delete') => {
    if (action === 'delete' && !window.confirm('Delete this review permanently?')) return
    const [{ getDb }, { deleteDoc, doc, updateDoc }] = await Promise.all([
      import('@/lib/firebase'),
      import('firebase/firestore'),
    ])
    const db = getDb()
    if (!db) return
    try {
      const ref = doc(db, 'reviews', id)
      if (action === 'delete') await deleteDoc(ref)
      else await updateDoc(ref, { approved: action === 'approve' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That did not work')
    }
  }

  const pending = (rows ?? []).filter((r) => !r.approved)
  const published = (rows ?? []).filter((r) => r.approved)
  const list = showPublished ? published : pending

  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl">Reviews</h2>
          <p className="text-chalk/50 mt-1 text-[13px]">
            {pending.length} waiting · {published.length} published. Published reviews reach Google's data on the next
            deploy.
          </p>
        </div>
        <div className="glass-soft flex !rounded-full p-1 text-[12px] font-semibold">
          {[
            { on: !showPublished, label: `Pending (${pending.length})`, set: false },
            { on: showPublished, label: `Published (${published.length})`, set: true },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setShowPublished(t.set)}
              className={`relative z-10 rounded-full px-3.5 py-1.5 ${t.on ? 'bg-gold text-onbrand' : 'text-chalk/60'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-[#FF8A93]">{error}</p>}
      {rows === null && !error && <p className="text-chalk/40 mt-6 text-sm">Loading…</p>}
      {rows !== null && list.length === 0 && (
        <p className="text-chalk/40 mt-6 text-sm">{showPublished ? 'Nothing published yet.' : 'No reviews waiting.'}</p>
      )}

      <ul className="mt-5 space-y-3">
        {list.map((r) => (
          <li key={r.id} className="glass p-5">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {'★'.repeat(r.rating)}
                  <span className="text-chalk/20">{'★'.repeat(5 - r.rating)}</span>
                  <span className="ml-3">{r.name}</span>
                </p>
                <span className="text-chalk/40 text-[12px]">
                  {findProduct(r.product)?.name ?? r.product}
                  {r.createdAt ? ` · ${new Date(r.createdAt.seconds * 1000).toLocaleDateString('en-IN')}` : ''}
                </span>
              </div>
              <p className="text-chalk/70 mt-3 text-sm leading-relaxed whitespace-pre-line">{r.text}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-bold">
                {r.approved ? (
                  <button type="button" onClick={() => act(r.id, 'hide')} className="glass-soft !rounded-full px-4 py-2">
                    <span className="relative z-10">Unpublish</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => act(r.id, 'approve')}
                    className="from-sun via-gold to-ember text-onbrand rounded-full bg-gradient-to-br px-4 py-2"
                  >
                    Approve & publish
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => act(r.id, 'delete')}
                  className="rounded-full px-4 py-2 text-[#FF8A93] hover:bg-[#FF8A93]/10"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
