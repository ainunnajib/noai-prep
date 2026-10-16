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
  /** the stored revision a transaction reads, and what it sets */
  txRev: 0 as unknown,
  txSet: [] as unknown[][],
  /** the next N transactions are refused, as if another device saved between their read and write */
  txRefuse: 0,
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
  runTransaction: async (_db: unknown, fn: (t: unknown) => Promise<unknown>) => {
    const result = await fn({
      get: async () => ({ exists: () => sdk.txRev !== undefined, get: (f: string) => (f === 'rev' ? sdk.txRev : undefined) }),
      set: (...args: unknown[]) => sdk.txSet.push(args),
    })
    if (sdk.txRefuse > 0) {
      sdk.txRefuse--
      sdk.txRev = (sdk.txRev as number) + 1 // the other device's save
      throw Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' })
    }
    return result
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

  it('"Delete my saved progress" saves an empty copy as the next revision, in a transaction', async () => {
    const a = createFirebaseAdapter(config, 'asia-southeast1')
    sdk.txRev = 6
    sdk.txSet.length = 0
    expect(await a.clearProgress('u1')).toBe(7)
    const [ref, data] = sdk.txSet[0] as [{ path: string }, Record<string, unknown>]
    expect(ref.path).toBe('progress/u1')
    expect(data).toEqual({ ...toFields(state()), v: 2, rev: 7, updatedAt: 'SERVER_TIME' })
    // another device saves between the read and the write: read again and retry
    sdk.txRev = 6
    sdk.txRefuse = 1
    expect(await a.clearProgress('u1')).toBe(8)
    sdk.txRefuse = 5 // refused every time: gives up
    await expect(a.clearProgress('u1')).rejects.toMatchObject({ code: 'permission-denied' })
    sdk.txRefuse = 0
    sdk.txRev = null // a copy in the first format (no revision)
    expect(await a.clearProgress('u1')).toBe(1)
    sdk.txSet.length = 0
    sdk.txRev = undefined // no copy at all: nothing is written (the account may have been deleted elsewhere)
    expect(await a.clearProgress('u1')).toBe(0)
    expect(sdk.txSet).toHaveLength(0)
  })

  it('sends the changed parts while the page closes (as many as fit), and reports what it sent', async () => {
    const fetches: [string, RequestInit][] = []
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      fetches.push([url, init])
      return new Response('{}')
    })
    const a = createFirebaseAdapter(config, 'asia-southeast1')
    const user = { uid: 'u1', reload: async () => {}, getIdToken: async () => 'token-1' }
    expect(a.writeProgressOnExit!('u1', state({ lessons: { 'm/a': D1 } }), 2, state())).toBeNull() // no ID token yet
    sdk.auth.currentUser = user
    sdk.tokenChanged!(user)
    await Promise.resolve()

    const base = state({ lessons: { 'm/a': D1 } })
    expect(a.writeProgressOnExit!('u1', base, 4, base)).toBeNull() // nothing changed: nothing to send
    expect(fetches).toHaveLength(0)

    const next = state({ lessons: { 'm/a': D1, 'm/b': D1 } })
    expect(a.writeProgressOnExit!('u1', next, 4, base)).toEqual(next)
    const [url, init] = fetches[0]
    expect(url).toBe('https://firestore.googleapis.com/v1/projects/p/databases/(default)/documents:commit')
    expect(init).toMatchObject({ method: 'POST', keepalive: true, headers: { Authorization: 'Bearer token-1' } })
    const w = JSON.parse(init.body as string).writes[0]
    expect(w.updateMask.fieldPaths).toEqual(['lessons', 'v', 'rev'])
    expect(w.update.fields.rev).toEqual({ integerValue: '4' })

    // too big for a request that outlives the page: the parts that fit are sent (here the answers, not the lessons),
    // and the rest reaches the account on the next visit
    const huge = state({
      lessons: Object.fromEntries(Array.from({ length: 2000 }, (_, i) => [`module/lesson-${i}`, D1])),
      answers: { 'bank.x.q1': [true] },
    })
    expect(JSON.stringify(toFields(huge)).length).toBeGreaterThan(EXIT_SAVE_LIMIT)
    expect(a.writeProgressOnExit!('u1', huge, 4, base)).toEqual({ ...base, answers: { 'bank.x.q1': [true] } })
    expect(fetches).toHaveLength(2)
    expect(JSON.parse(fetches[1][1].body as string).writes[0].updateMask.fieldPaths).not.toContain('lessons')
    // nothing fits at all: nothing is sent
    expect(a.writeProgressOnExit!('u1', { ...huge, answers: {} }, 4, base)).toBeNull()
    expect(fetches).toHaveLength(2)
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
