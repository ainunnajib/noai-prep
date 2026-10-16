/*
  Accounts switch on only when the Firebase web config is present at build time (or the dev/e2e mock is on).
  Without it the site behaves exactly as before: no sign-in, no locks, progress in this browser only.
  The Firebase web config values are public identifiers, not secrets.
  (Each value is read as import.meta.env.X in full so Vite can replace it at build time.)
*/

/** Dev and e2e only: a fake, offline account backend (see mock-adapter.ts). */
export const ACCOUNTS_MOCK: boolean = import.meta.env.VITE_ACCOUNTS_MOCK === '1'

export interface FirebaseWebConfig {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
}

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || ''
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || ''
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || ''
const appId = import.meta.env.VITE_FIREBASE_APP_ID || ''

/** null unless all four values are set */
export const firebaseConfig: FirebaseWebConfig | null =
  apiKey && authDomain && projectId && appId ? { apiKey, authDomain, projectId, appId } : null

export const ACCOUNTS_ENABLED: boolean = ACCOUNTS_MOCK || firebaseConfig !== null

/** Modules anyone can read without signing in: the first two in course order. */
export const FREE_MODULES: readonly string[] = ['start-here', 'ai-first-look']

export const PRICE_LABEL = 'S$10'

export const FUNCTIONS_REGION: string = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'asia-southeast1'
