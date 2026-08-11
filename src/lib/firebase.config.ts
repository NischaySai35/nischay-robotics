/**
 * Firebase configuration values, split from the SDK initialisation on purpose.
 *
 * Importing this module pulls in NO Firebase code — so the page can ask "is
 * Firebase set up?" without dragging ~200KB of SDK into the initial bundle.
 * `lib/firebase.ts` does the actual initialising and is only ever imported
 * dynamically.
 *
 * These VITE_ values are PUBLIC — Vite compiles them into the bundle. That is
 * normal and expected for Firebase web apps: they are identifiers, not
 * secrets. Access is controlled by firestore.rules, never by hiding config.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** True only when every required key is present. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId &&
    firebaseConfig.authDomain,
)

/**
 * The single account allowed to read the waitlist. Mirrored in
 * firestore.rules — changing it here alone changes nothing, because the rules
 * are what actually enforce it.
 */
export const ADMIN_EMAIL = 'nischaysai35@gmail.com'
