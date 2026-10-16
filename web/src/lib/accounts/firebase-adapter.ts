import { initializeApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  OAuthProvider,
  connectAuthEmulator,
  deleteUser as deleteAuthUser,
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
  type AuthProvider,
  type User,
} from 'firebase/auth'
import { connectFirestoreEmulator, deleteDoc, doc, getDoc, getFirestore, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import { accessFrom, type AccountsAdapter, type CheckoutStart } from './adapter'
import type { FirebaseWebConfig } from './config'
import { errorCode } from './errors'
import type { AccountUser, SignInProvider } from './types'

/*
  The real account backend: Firebase Auth (Google and Apple, popup only: redirect sign-in breaks on sites not hosted
  on the auth domain), Cloud Firestore for progress and access, and the Cloud Functions in backend/.
  This module (and the Firebase SDK with it) is loaded on demand by accounts/index.ts, never in the first download.
  With VITE_FIREBASE_EMULATORS=1 it talks to the local Firebase emulators instead (see web/.env.example).
*/

/** Firebase wants a sign-in within the last 5 minutes before deleting an account; older ones sign in again first. */
const RECENT_SIGN_IN_MS = 4 * 60 * 1000

function googleProvider() {
  const p = new GoogleAuthProvider()
  p.setCustomParameters({ prompt: 'select_account' }) // shared computers: always ask which Google account
  return p
}

function appleProvider() {
  const p = new OAuthProvider('apple.com')
  p.addScope('email')
  p.addScope('name')
  return p
}

function providerOf(u: User): AccountUser['provider'] {
  const ids = u.providerData.map((p) => p.providerId)
  if (ids.includes('google.com')) return 'google'
  if (ids.includes('apple.com')) return 'apple'
  return 'other'
}

const toAccountUser = (u: User): AccountUser => ({
  uid: u.uid,
  email: u.email,
  name: u.displayName,
  photoURL: u.photoURL,
  provider: providerOf(u),
})

/** The `data` field holds the progress as JSON text; a damaged copy reads as empty rather than failing. */
function parseData(data: unknown): unknown {
  if (typeof data !== 'string') return {}
  try {
    return JSON.parse(data)
  } catch {
    return {}
  }
}

export function createFirebaseAdapter(config: FirebaseWebConfig, region: string): AccountsAdapter {
  const app = initializeApp(config)
  const auth = getAuth(app)
  const db = getFirestore(app)
  const functions = getFunctions(app, region)
  const emulators = import.meta.env.VITE_FIREBASE_EMULATORS === '1'
  if (emulators) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
    connectFunctionsEmulator(functions, '127.0.0.1', 5001)
  }

  // For the save sent while the page closes: Firestore's REST API, called directly with the user's ID token.
  const restBase = emulators ? 'http://127.0.0.1:8080' : 'https://firestore.googleapis.com'
  const docsPath = `projects/${config.projectId}/databases/(default)/documents`
  /** the current ID token, kept ready because nothing can be awaited while the page closes */
  let idToken: string | null = null
  onIdTokenChanged(auth, (u) => {
    idToken = null
    if (u)
      u.getIdToken().then(
        (t) => {
          if (auth.currentUser === u) idToken = t
        },
        () => {},
      )
  })

  const syncAccessFn = httpsCallable<void, { access: string }>(functions, 'syncAccess')
  const checkoutFn = httpsCallable<void, CheckoutStart>(functions, 'createCheckoutSession')
  const confirmFn = httpsCallable<{ sessionId: string }, { access: string; status?: string }>(functions, 'confirmCheckout')
  const progressRef = (uid: string) => doc(db, 'progress', uid)
  const signInAgain = (u: User) => reauthenticateWithPopup(u, providerOf(u) === 'apple' ? appleProvider() : googleProvider())

  return {
    onUser(cb) {
      return onAuthStateChanged(auth, (u) => cb(u ? toAccountUser(u) : null))
    },

    async signIn(provider: SignInProvider) {
      const p: AuthProvider = provider === 'apple' ? appleProvider() : googleProvider()
      await signInWithPopup(auth, p)
    },

    signOut: () => signOut(auth),

    async reauthenticateIfNeeded() {
      const u = auth.currentUser
      if (!u) return
      const last = Date.parse(u.metadata.lastSignInTime ?? '')
      if (Number.isNaN(last) || Date.now() - last > RECENT_SIGN_IN_MS) await signInAgain(u)
    },

    async deleteUser() {
      const u = auth.currentUser
      if (!u) return
      try {
        await deleteAuthUser(u)
      } catch (e) {
        if (errorCode(e) !== 'auth/requires-recent-login') throw e
        await signInAgain(u)
        await deleteAuthUser(u)
      }
    },

    watchAccess(uid, cb, onError) {
      // Offline (or while Firestore is slow to answer) the listener reports a missing document from its empty cache.
      // That means "not known yet", not "no access", so wait for the server's answer instead.
      return onSnapshot(
        doc(db, 'entitlements', uid),
        (snap) => {
          if (snap.metadata.fromCache && !snap.exists()) return
          cb(accessFrom(snap.get('access')))
        },
        onError,
      )
    },

    async syncAccess() {
      return accessFrom((await syncAccessFn()).data.access)
    },

    async createCheckoutSession() {
      return (await checkoutFn()).data
    },

    async confirmCheckout(sessionId) {
      const { data } = await confirmFn({ sessionId })
      return { access: data.access === 'paid' ? 'paid' : 'none', status: data.status }
    },

    async readProgress(uid) {
      const snap = await getDoc(progressRef(uid))
      return snap.exists() ? parseData(snap.get('data')) : null
    },

    watchProgress(uid, cb, onError) {
      return onSnapshot(
        progressRef(uid),
        { includeMetadataChanges: true }, // so the server's answer after a fromCache delivery arrives even when nothing changed
        (snap) =>
          cb({
            data: snap.exists() ? parseData(snap.get('data')) : null,
            hasPendingWrites: snap.metadata.hasPendingWrites,
            fromCache: snap.metadata.fromCache,
          }),
        onError,
      )
    },

    writeProgress(uid, state) {
      return setDoc(progressRef(uid), { data: JSON.stringify(state), v: 1, updatedAt: serverTimestamp() })
    },

    writeProgressOnExit(uid, state) {
      if (!idToken || auth.currentUser?.uid !== uid) return false
      // An update with no updateMask replaces the whole document, so it holds exactly {data, v, updatedAt}, as the rules require.
      const body = JSON.stringify({
        writes: [
          {
            update: {
              name: `${docsPath}/progress/${uid}`,
              fields: { data: { stringValue: JSON.stringify(state) }, v: { integerValue: '1' } },
            },
            // the server's time, so the rules' updatedAt == request.time still holds
            updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }],
          },
        ],
      })
      if (new TextEncoder().encode(body).length > 60_000) return false // browsers cap requests that outlive the page at 64 KB
      try {
        void fetch(`${restBase}/v1/${docsPath}:commit`, {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
          body,
        }).catch(() => {})
        return true
      } catch {
        return false
      }
    },

    deleteProgress(uid) {
      return deleteDoc(progressRef(uid))
    },
  }
}
