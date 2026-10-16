/*
  The Firebase adapter with the Firebase SDK replaced by stand-ins: what it asks the SDK for (listener options, the
  stored progress format, the save sent while the page closes), without any network. Run: npx vitest run tests/accounts
*/
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as crdt from '../../src/lib/progress-crdt'
import { EXIT_SAVE_LIMIT, toDoc, toParts } from '../../src/lib/accounts/progress-doc'

const sdk = vi.hoisted(() => ({
  onSnapshot: [] as unknown[][],
  setDoc: [] as unknown[][],
  /** what a read from the server finds */
  serverDoc: null as Record<string, unknown> | null,
  serverPending: false,
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
  getDocFromServer: async () => ({
    exists: () => sdk.serverDoc !== null,
    get: (k: string) => sdk.serverDoc?.[k],
    metadata: { fromCache: false, hasPendingWrites: sdk.serverPending },
  }),
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

const T1 = Date.parse('2026-03-01T00:00:00.000Z')
const ticked = (...keys: string[]) => keys.reduce((s, k, i) => crdt.markLesson(s, k, true, T1 + i), crdt.empty())
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

  it('saves progress in parts, with the format, the revision, resetAt and the server time', async () => {
    const a = createFirebaseAdapter(config, 'asia-southeast1')
    const s = crdt.recordAnswer(crdt.reset(ticked('m/a'), T1 + 5), 'bank.x.q1', true, T1 + 6)
    await a.writeProgress('u1', s, 5)
    const [ref, data] = sdk.setDoc[0] as [{ path: string }, Record<string, unknown>]
    expect(ref.path).toBe('progress/u1')
    expect(data).toEqual({ ...toParts(s), v: 3, rev: 5, resetAt: T1 + 5, updatedAt: 'SERVER_TIME' })
  })

  it('reads the account copy and its revision from the listener', () => {
    const a = createFirebaseAdapter(config, 'asia-southeast1')
    const got: unknown[] = []
    a.watchProgress('u1', (x) => got.push(x), () => {})
    const [, options, next] = sdk.onSnapshot[0] as [unknown, unknown, (s: unknown) => void]
    expect(options).toEqual({ includeMetadataChanges: true })
    const s = ticked('m/a')
    next(snap(toDoc(s, 3)))
    next(snap(toDoc(s, 4), false, true))
    next(snap(null, true))
    expect(got).toEqual([
      { state: s, rev: 3, hasPendingWrites: false, fromCache: false },
      { state: s, rev: 4, hasPendingWrites: true, fromCache: false },
      { state: null, rev: 0, hasPendingWrites: false, fromCache: true },
    ])
  })

  it('reads the account copy from the server itself, saying when it includes a save still on its way', async () => {
    const a = createFirebaseAdapter(config, 'asia-southeast1')
    sdk.serverDoc = null
    expect(await a.readProgress('u1')).toEqual({ state: null, rev: 0, hasPendingWrites: false })
    sdk.serverDoc = toDoc(ticked('m/a'), 7)
    sdk.serverPending = true
    expect(await a.readProgress('u1')).toEqual({ state: ticked('m/a'), rev: 7, hasPendingWrites: true })
    sdk.serverPending = false
  })

  it('sends the changed parts while the page closes (as many as fit), and says whether it sent anything', async () => {
    const fetches: [string, RequestInit][] = []
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      fetches.push([url, init])
      return new Response('{}')
    })
    const a = createFirebaseAdapter(config, 'asia-southeast1')
    const user = { uid: 'u1', reload: async () => {}, getIdToken: async () => 'token-1' }
    const base = ticked('m/a')
    expect(a.writeProgressOnExit!('u1', ticked('m/a', 'm/b'), 2, base)).toBe(false) // no ID token yet
    sdk.auth.currentUser = user
    sdk.tokenChanged!(user)
    await Promise.resolve()

    expect(a.writeProgressOnExit!('u1', base, 4, base)).toBe(false) // nothing changed: nothing to send
    expect(a.writeProgressOnExit!('u2', ticked('m/a', 'm/b'), 4, base)).toBe(false) // not the signed-in user
    expect(fetches).toHaveLength(0)

    expect(a.writeProgressOnExit!('u1', ticked('m/a', 'm/b'), 4, base)).toBe(true)
    const [url, init] = fetches[0]
    expect(url).toBe('https://firestore.googleapis.com/v1/projects/p/databases/(default)/documents:commit')
    expect(init).toMatchObject({ method: 'POST', keepalive: true, headers: { Authorization: 'Bearer token-1' } })
    const w = JSON.parse(init.body as string).writes[0]
    expect(w.update.name).toBe('projects/p/databases/(default)/documents/progress/u1')
    expect(w.updateMask.fieldPaths).toEqual(['lessons', 'v', 'rev', 'resetAt'])
    expect(w.update.fields.rev).toEqual({ integerValue: '4' })
    expect(w.updateTransforms).toEqual([{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }])

    // too big for a request that outlives the page: the parts that fit are sent (here the answers, not the lessons),
    // and the rest reaches the account later
    const huge = crdt.recordAnswer(
      ticked(...Array.from({ length: 2000 }, (_, i) => `module/lesson-${i}`)),
      'bank.x.q1',
      true,
      T1 + 5000,
    )
    expect(JSON.stringify(toParts(huge)).length).toBeGreaterThan(EXIT_SAVE_LIMIT)
    expect(a.writeProgressOnExit!('u1', huge, 4, base)).toBe(true)
    expect(fetches).toHaveLength(2)
    const mask: string[] = JSON.parse(fetches[1][1].body as string).writes[0].updateMask.fieldPaths
    expect(mask).toHaveLength(4)
    expect(mask[0]).toMatch(/^a[0-7]$/)
    expect(mask.slice(1)).toEqual(['v', 'rev', 'resetAt'])
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
