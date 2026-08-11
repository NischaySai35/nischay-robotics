import { initializeApp, getApps } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import type { Auth } from 'firebase/auth'
import { firebaseConfig, isFirebaseConfigured } from '@/lib/firebase.config'

/**
 * Firebase SDK initialisation.
 *
 * Import this module DYNAMICALLY only — a static import anywhere pulls the
 * whole SDK into the initial bundle. To ask whether Firebase is configured,
 * import `lib/firebase.config` instead, which carries no SDK code.
 *
 * Every accessor can return `null`. That is deliberate: the site must work
 * before Firebase exists, on a fork with no credentials, and in CI.
 */

let app: FirebaseApp | null = null

function getApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null
  if (!app) app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  return app
}

export function getDb(): Firestore | null {
  const a = getApp()
  return a ? getFirestore(a) : null
}

export function getFirebaseAuth(): Auth | null {
  const a = getApp()
  return a ? getAuth(a) : null
}
