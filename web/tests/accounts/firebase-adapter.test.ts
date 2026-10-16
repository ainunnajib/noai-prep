/*
  The Firebase adapter with the Firebase SDK replaced by stand-ins: what it asks the SDK for (listener options, the
  stored progress format, the save sent while the page closes), without any network. Run: npx vitest run tests/accounts
*/
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProgressState } from '../../src/lib/progress'
import { EXIT_SAVE_LIMIT, toFields } from '../../src/lib/accounts/progress-doc'

const sdk = vi.hoisted(() => ({
  onSnapshot: [] as unknown[][],
  setDoc: [] as unknown[][],
  auth: { currentUser: null as null | { uid: string; reload: () => Promise<void>; getIdToken: () => Promise<string> } },
  tokenChanged: null as null | ((u: unknown) => void),
}))

vi.mock('firebase/app', () => ({ initializeApp: () => ({}) }))
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {
    setCustomParameters() {}
  },
  OAuthProvider: class {
    addScope() {}
  },
  connectAuthEmulator: () => {},
  deleteUser: async () => {},
  getAuth: () => sdk.auth,
  onAuthStateChanged: () => () => {},
  onIdTokenChanged: (_auth: unknown, cb: (u: unknown) => void) => {
    sdk.tokenChanged = cb
    return () => {}
  },
  reauthenticateWithPopup: async () => {},
  signInWithPopup: async () => {},
  signOut: async () => {},
}))
vi.mock('firebase/firestore', () => ({
  connectFirestoreEmulator: () => {},
  deleteDoc: async () => {},
  doc: (_db: unknown, ...path: string[]) => ({ path: path.join('/') }),
  getDoc: async () => ({ exists: () => false, get: () => undefined }),
  getFirestore: () => ({}),
  onSnapshot: (...args: unknown[]) => {
    sdk.onSnapshot.push(args)
    return () => {}
  },
  serverTimestamp: () => 'SERVER_TIME',
  setDoc: async (...args: unknown[]) => {
    sdk.setDoc.push(args)
  },
}))
vi.mock('firebase/functions', () => ({ connectFunctionsEmulator: () => {}, getFunctions: () => ({}), httpsCallable: () => async () => ({ data: {} }) }))

const { createFirebaseAdapter } = await import('../../src/lib/accounts/firebase-adapter')

const D1 = '2026-03-01T00:00:00.000Z'
const state = (p: Partial<ProgressState> = {}): ProgressState => ({ lessons: {}, checkpoints: {}, answers: {}, exams: [], ...p })
const config = { apiKey: 'k', authDomain: 'p.firebaseapp.com', projectId: 'p', appId: 'a' }
/** A document snapshot stand-in. */
const snap = (data: Record<string, unknown> | null, fromCache = false, hasPendingWrites = false) => ({
  exists: () => data !== null,
  get: (k: string) => data?.[k],
  metadata: { fromCache, hasPendingWrites },
})

beforeEach(() => {
  sdk.onSnapshot = []
  sdk.setDoc = []
  sdk.auth.currentUser = null
})
afterEach(() => vi.unstubAllGlobals())

describe('firebase adapter', () => {
  it("hears the server's answer about access after an offline delivery, but not the empty cache", () => {
    const a = createFirebaseAdapter(config, 'asia-southeast1')
    const seen: string[] = []
    a.watchAccess('u1', (acc) => seen.push(acc), () => {})
    const [ref, options, next] = sdk.onSnapshot[0] as [{ path: string }, unknown, (s: unknown) => void]
    expect(ref.path).toBe('entitlements/u1')
    // without this, a change in sync state only (the server confirming "no document") is never raised
    expect(options).toEqual({ includeMetadataChanges: true })
    next(snap(null, true)) // offline: an empty cache says nothing
    expect(seen).toEqual([])
    next(snap(null, false)) // the server: no entitlement
    next(snap({ access: 'paid' }, false))
    expect(seen).toEqual(['none', 'paid'])
  })

  it('saves progress in parts, with the format, the revision and the server time', async () => {
    const a = createFirebaseAdapter(config, 'asia-southeast1')
    const s = state({ lessons: { 'm/a': D1 }, answers: { 'bank.x.q1': [true] } })
    await a.writeProgress('u1', s, 5)
    const [ref, data] = sdk.setDoc[0] as [{ path: string }, Record<string, unknown>]
    expect(ref.path).toBe('progress/u1')
    expect(data).toEqual({ ...toFields(s), v: 2, rev: 5, updatedAt: 'SERVER_TIME' })
  })

  it('reads the account copy and its revision from the listener', () => {
    const a = createFirebaseAdapter(config, 'asia-southeast1')
    const got: unknown[] = []
    a.watchProgress('u1', (x) => got.push(x), () => {})
    const [, options, next] = sdk.onSnapshot[0] as [unknown, unknown, (s: unknown) => void]
    expect(options).toEqual({ includeMetadataChanges: true })
    const s = state({ lessons: { 'm/a': D1 } })
    next(snap({ ...toFields(s), v: 2, rev: 3 }))
    next(snap(null))
    expect(got).toEqual([
      { data: { lessons: { 'm/a': D1 }, checkpoints: {}, exams: [], answers: {} }, rev: 3, hasPendingWrites: false, fromCache: false },
      { data: null, rev: 0, hasPendingWrites: false, fromCache: false },
    ])
  })

  it('sends the changed parts while the page closes, and nothing it could not send whole', async () => {
    const fetches: [string, RequestInit][] = []
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      fetches.push([url, init])
      return new Response('{}')
    })
    const a = createFirebaseAdapter(config, 'asia-southeast1')
    const user = { uid: 'u1', reload: async () => {}, getIdToken: async () => 'token-1' }
    expect(a.writeProgressOnExit!('u1', state({ lessons: { 'm/a': D1 } }), 2, state())).toBe(false) // no ID token yet
    sdk.auth.currentUser = user
    sdk.tokenChanged!(user)
    await Promise.resolve()

    const base = state({ lessons: { 'm/a': D1 } })
    expect(a.writeProgressOnExit!('u1', base, 4, base)).toBe(true) // nothing changed: nothing to send
    expect(fetches).toHaveLength(0)

    expect(a.writeProgressOnExit!('u1', state({ lessons: { 'm/a': D1, 'm/b': D1 } }), 4, base)).toBe(true)
    const [url, init] = fetches[0]
    expect(url).toBe('https://firestore.googleapis.com/v1/projects/p/databases/(default)/documents:commit')
    expect(init).toMatchObject({ method: 'POST', keepalive: true, headers: { Authorization: 'Bearer token-1' } })
    const w = JSON.parse(init.body as string).writes[0]
    expect(w.updateMask.fieldPaths).toEqual(['lessons', 'v', 'rev'])
    expect(w.update.fields.rev).toEqual({ integerValue: '4' })

    // too big for a request that outlives the page: not sent at all (it reaches the account on the next visit)
    const huge = state({ lessons: Object.fromEntries(Array.from({ length: 2000 }, (_, i) => [`module/lesson-${i}`, D1])) })
    expect(a.writeProgressOnExit!('u1', huge, 4, base)).toBe(false)
    expect(fetches).toHaveLength(1)
    expect(JSON.stringify(toFields(huge)).length).toBeGreaterThan(EXIT_SAVE_LIMIT)
  })

  it('checks the account still exists by reloading the signed-in user', async () => {
    const a = createFirebaseAdapter(config, 'asia-southeast1')
    const reload = vi.fn(async () => {})
    sdk.auth.currentUser = { uid: 'u1', reload, getIdToken: async () => 't' }
    await a.confirmUser()
    expect(reload).toHaveBeenCalledTimes(1)
    reload.mockRejectedValueOnce(Object.assign(new Error('gone'), { code: 'auth/user-token-expired' }))
    await expect(a.confirmUser()).rejects.toMatchObject({ code: 'auth/user-token-expired' })
  })
})
