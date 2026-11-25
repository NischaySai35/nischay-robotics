// REUSE-CHECKED: review|rating|firestore write -> lib/waitlist.ts is the only Firestore writer (signups); same dynamic-import pattern, different collection and a public read side.

import { useEffect, useMemo, useState } from 'react'
import { isFirebaseConfigured } from '@/lib/firebase.config'
import type { ReviewSummary } from '@/content/structuredData'

/* ============================================================================
   Product reviews — the only shop data kept in Firestore.

   Flow:  visitor submits → stored with approved:false (invisible)
          → you approve it on /admin → it appears on the product page
          → the next deploy bakes it into the page's Google data too.

   firestore.rules enforce all of it: the public can only create unapproved
   reviews in the exact shape below, and can only read approved ones.
   ========================================================================= */

export type Review = {
  id: string
  product: string
  name: string
  rating: number
  text: string
  /** ISO date (yyyy-mm-dd). */
  date: string
}

/** Mirrored EXACTLY in firestore.rules. Change one, change both. */
export const REVIEW_LIMITS = { name: 60, text: 1500, minText: 10 } as const

let cache: Promise<Review[]> | null = null

/** Every approved review, fetched once per visit and shared by all pages. */
export function loadApprovedReviews(): Promise<Review[]> {
  if (!isFirebaseConfigured) return Promise.resolve([])
  cache ??= (async () => {
    try {
      const [{ getDb }, { collection, getDocs, query, where }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/firestore'),
      ])
      const db = getDb()
      if (!db) return []
      // The where() is required: the rules only allow reads of approved reviews,
      // and Firestore rejects any query that could return anything else.
      const snap = await getDocs(query(collection(db, 'reviews'), where('approved', '==', true)))
      return snap.docs
        .map((d) => {
          const v = d.data()
          return {
            id: d.id,
            product: String(v.product ?? ''),
            name: String(v.name ?? ''),
            rating: Number(v.rating ?? 0),
            text: String(v.text ?? ''),
            date: v.createdAt?.toDate ? v.createdAt.toDate().toISOString().slice(0, 10) : '',
          }
        })
        .sort((a, b) => b.date.localeCompare(a.date))
    } catch (err) {
      console.error('[reviews] load failed', err)
      cache = null
      return []
    }
  })()
  return cache
}

export function summarise(reviews: readonly Review[]): ReviewSummary {
  const count = reviews.length
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0
  return { count, average, reviews }
}

/** Approved reviews grouped by product slug. */
export function summariesBySlug(reviews: readonly Review[]): Map<string, ReviewSummary> {
  const groups = new Map<string, Review[]>()
  for (const r of reviews) groups.set(r.product, [...(groups.get(r.product) ?? []), r])
  return new Map([...groups].map(([slug, list]) => [slug, summarise(list)]))
}

export async function submitReview(input: {
  product: string
  name: string
  rating: number
  text: string
}): Promise<'stored' | 'offline' | 'error'> {
  if (!isFirebaseConfigured) return 'offline'
  try {
    const [{ getDb }, { addDoc, collection, serverTimestamp }] = await Promise.all([
      import('@/lib/firebase'),
      import('firebase/firestore'),
    ])
    const db = getDb()
    if (!db) return 'offline'
    await addDoc(collection(db, 'reviews'), {
      product: input.product.slice(0, 80),
      name: input.name.trim().slice(0, REVIEW_LIMITS.name),
      rating: Math.min(5, Math.max(1, Math.round(input.rating))),
      text: input.text.trim().slice(0, REVIEW_LIMITS.text),
      approved: false,
      createdAt: serverTimestamp(),
    })
    return 'stored'
  } catch (err) {
    console.error('[reviews] submit failed', err)
    return 'error'
  }
}

/** Approved reviews, loaded once per visit. `null` until they arrive. */
export function useApprovedReviews(): Review[] | null {
  const [reviews, setReviews] = useState<Review[] | null>(null)
  useEffect(() => {
    let live = true
    loadApprovedReviews().then((r) => live && setReviews(r))
    return () => {
      live = false
    }
  }, [])
  return reviews
}

export function useReviewSummaries(): Map<string, ReviewSummary> {
  const reviews = useApprovedReviews()
  return useMemo(() => (reviews ? summariesBySlug(reviews) : new Map()), [reviews])
}
