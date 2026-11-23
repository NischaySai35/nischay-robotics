import { contact } from '@/content/site'
import { isFirebaseConfigured } from '@/lib/firebase.config'
import { isEmailConfigured, sendWaitlistEmails } from '@/lib/email'

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

/**
 * Field caps — mirrored EXACTLY from firestore.rules. The form uses these as
 * `maxLength`, so a visitor can never type something the server will reject.
 * Change one, change both.
 */
export const LIMITS = {
  name: 120,
  email: 200,
  country: 80,
  organisation: 160,
  quantity: 20,
  message: 2000,
} as const

export type SubmitResult =
  | {
      status: 'stored'
      /** True when the "you're on the list" email went out to the subscriber. */
      confirmationSent: boolean
    }
  | {
      status: 'fallback'
      mailto: string
      /** 'offline' = nothing is connected yet; 'error' = it is, but failed. */
      reason: 'offline' | 'error'
    }

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

/** Trims and clamps every field so the write always matches the rules. */
function clean(entry: WaitlistEntry): WaitlistEntry {
  const cut = (v: string, n: number) => v.trim().slice(0, n)
  return {
    ...entry,
    name: cut(entry.name, LIMITS.name),
    email: cut(entry.email, LIMITS.email).toLowerCase(),
    country: cut(entry.country, LIMITS.country),
    organisation: cut(entry.organisation, LIMITS.organisation),
    quantity: cut(entry.quantity, LIMITS.quantity),
    message: cut(entry.message, LIMITS.message),
  }
}

async function storeInFirestore(entry: WaitlistEntry): Promise<boolean> {
  if (!isFirebaseConfigured) return false
  try {
    const [{ getDb }, { addDoc, collection, serverTimestamp }] = await Promise.all([
      import('@/lib/firebase'),
      import('firebase/firestore'),
    ])
    const db = getDb()
    if (!db) return false

    await addDoc(collection(db, 'waitlist'), {
      ...entry,
      createdAt: serverTimestamp(),
      // Useful for spotting where signups come from once there are a few.
      source: typeof window !== 'undefined' ? window.location.hostname.slice(0, 120) : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 180) : '',
    })
    return true
  } catch (err) {
    console.error('[waitlist] Firestore write failed', err)
    return false
  }
}

/**
 * Records a waitlist signup.
 *
 *   1. Write to Firestore (the record of truth, read at /#/admin).
 *   2. Email you, and email the subscriber a confirmation (EmailJS).
 *   3. Only if BOTH 1 and the admin email failed, fall back to a prefilled
 *      mailto — someone who wants to buy should never hit a dead end.
 *
 * The Firebase SDK is imported dynamically, on submit: ~200KB that no visitor
 * should pay for while reading the page.
 *
 * Clients can only ever CREATE documents in this collection; reading the list
 * back requires the admin account (see firestore.rules).
 */
export async function submitWaitlist(raw: WaitlistEntry): Promise<SubmitResult> {
  const entry = clean(raw)

  if (!isFirebaseConfigured && !isEmailConfigured) {
    return { status: 'fallback', mailto: waitlistMailto(entry), reason: 'offline' }
  }

  const stored = await storeInFirestore(entry)

  // Emails after the write, so a rejected write (bad data, rules) doesn't send
  // a confirmation for a signup that was never recorded — unless Firestore
  // isn't set up at all, in which case the admin email IS the record.
  const shouldEmail = stored || !isFirebaseConfigured
  const { adminSent, confirmationSent } = shouldEmail
    ? await sendWaitlistEmails({
        name: entry.name,
        email: entry.email,
        product: entry.productName,
        quantity: entry.quantity || '—',
        organisation: entry.organisation || '—',
        country: entry.country || '—',
        message: entry.message || '(no message)',
        admin_url:
          typeof window !== 'undefined' ? `${window.location.origin}/#/admin` : '',
      })
    : { adminSent: false, confirmationSent: false }

  if (stored || adminSent) return { status: 'stored', confirmationSent }
  return { status: 'fallback', mailto: waitlistMailto(entry), reason: 'error' }
}
