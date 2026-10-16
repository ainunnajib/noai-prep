/// <reference types="vite/client" />
/// <reference types="mdx" />

declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}

/** Build-time settings (see .env.example). Unset or empty Firebase values switch accounts off. */
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  /** Cloud Functions region; defaults to asia-southeast1 */
  readonly VITE_FIREBASE_FUNCTIONS_REGION?: string
  /** '1': use the Firebase emulators on 127.0.0.1 (Auth 9099, Firestore 8080, Functions 5001) */
  readonly VITE_FIREBASE_EMULATORS?: string
  /** '1': dev/e2e only, a fake offline account backend instead of Firebase */
  readonly VITE_ACCOUNTS_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
