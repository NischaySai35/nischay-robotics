import { contact } from '@/content/site'
import { isFirebaseConfigured } from '@/lib/firebase.config'

export type WaitlistEntry = {
  name: string
  email: string
  /** Product slug the visitor asked about. */
  product: string
  productName: string
  country: string
  organisation: string
  quantity: string
  message: string
}

export type SubmitResult =
  | { status: 'stored' }
  | { status: 'fallback'; mailto: string }

/**
 * Builds a prefilled email as the no-backend fallback.
 *
 * Used when Firebase isn't configured yet, and when a write fails (offline,
 * rules misconfigured, quota exhausted). Someone who wants to buy the product
 * should never hit a dead end because the datastore is having a bad day.
 */
export function waitlistMailto(entry: WaitlistEntry): string {
  const body = [
    `Name: ${entry.name}`,
    `Email: ${entry.email}`,
    `Product: ${entry.productName}`,
    entry.quantity && `Quantity: ${entry.quantity}`,
    entry.organisation && `Organisation: ${entry.organisation}`,
    entry.country && `Country: ${entry.country}`,
    '',
    entry.message || '(no message)',
  ]
    .filter(Boolean)
    .join('\n')

  return `mailto:${contact.email}?subject=${encodeURIComponent(
    `Waitlist — ${entry.productName}`,
  )}&body=${encodeURIComponent(body)}`
}

/**
 * Records a waitlist signup.
 *
 * The Firebase SDK is imported dynamically, on submit. It is ~200KB that no
 * visitor should pay for while reading the page — and most never open this
 * form at all.
 *
 * Clients can only ever CREATE documents in this collection; reading the list
 * back requires the admin account (see firestore.rules), so one signup cannot
 * enumerate everyone else's email address.
 */
export async function submitWaitlist(entry: WaitlistEntry): Promise<SubmitResult> {
  if (!isFirebaseConfigured) {
    return { status: 'fallback', mailto: waitlistMailto(entry) }
  }

  try {
    const [{ getDb }, { addDoc, collection, serverTimestamp }] = await Promise.all([
      import('@/lib/firebase'),
      import('firebase/firestore'),
    ])

    const db = getDb()
    if (!db) return { status: 'fallback', mailto: waitlistMailto(entry) }

    await addDoc(collection(db, 'waitlist'), {
      ...entry,
      createdAt: serverTimestamp(),
      // Useful for spotting where signups come from once there are a few.
      source: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 180) : '',
    })
    return { status: 'stored' }
  } catch (err) {
    console.error('[waitlist] write failed, falling back to email', err)
    return { status: 'fallback', mailto: waitlistMailto(entry) }
  }
}
