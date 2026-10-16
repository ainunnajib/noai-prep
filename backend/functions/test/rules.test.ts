// Tests for ../../firestore.rules against the real Firestore emulator.
// Run them with (from backend/):
//   firebase emulators:exec --only firestore --project demo-noai "cd functions && npm run test:rules"
// Without the emulator (FIRESTORE_EMULATOR_HOST unset) they are skipped.

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  setLogLevel,
  Timestamp,
  updateDoc,
  type Firestore,
} from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

const emulator = process.env.FIRESTORE_EMULATOR_HOST

describe.skipIf(!emulator)('firestore.rules', () => {
  let env: RulesTestEnvironment

  beforeAll(async () => {
    // Every denied write is expected here, so don't print the client's warnings about them.
    setLogLevel('silent')
    env = await initializeTestEnvironment({
      projectId: 'demo-noai',
      firestore: { rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8') },
    })
  })

  afterAll(async () => {
    await env?.cleanup()
  })

  beforeEach(async () => {
    await env.clearFirestore()
  })

  // rules-unit-testing hands back the compat Firestore; the modular functions accept it at runtime.
  const as = (uid: string) => env.authenticatedContext(uid).firestore() as unknown as Firestore
  const signedOut = () => env.unauthenticatedContext().firestore() as unknown as Firestore

  async function seed(path: string, data: Record<string, unknown>) {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore() as unknown as Firestore, path), data)
    })
  }

  const progress = (data = '{"lessons":{}}') => ({ data, v: 1, updatedAt: serverTimestamp() })

  describe('progress/{uid}', () => {
    it('lets the owner create, read, update and delete their progress', async () => {
      const ref = doc(as('alice'), 'progress/alice')
      await assertSucceeds(setDoc(ref, progress()))
      await assertSucceeds(getDoc(ref))
      await assertSucceeds(setDoc(ref, progress('{"lessons":{"a/b":"2026-10-16T00:00:00.000Z"}}')))
      await assertSucceeds(updateDoc(ref, { data: '{}', updatedAt: serverTimestamp() }))
      await assertSucceeds(deleteDoc(ref))
    })

    it('keeps other people out', async () => {
      await seed('progress/alice', { data: '{}', v: 1, updatedAt: Timestamp.now() })
      const ref = doc(as('bob'), 'progress/alice')
      await assertFails(getDoc(ref))
      await assertFails(setDoc(ref, progress()))
      await assertFails(deleteDoc(ref))
    })

    it('keeps signed-out visitors out', async () => {
      await seed('progress/alice', { data: '{}', v: 1, updatedAt: Timestamp.now() })
      const ref = doc(signedOut(), 'progress/alice')
      await assertFails(getDoc(ref))
      await assertFails(setDoc(ref, progress()))
      await assertFails(deleteDoc(ref))
    })

    it('rejects extra or missing fields', async () => {
      const ref = doc(as('alice'), 'progress/alice')
      await assertFails(setDoc(ref, { ...progress(), admin: true }))
      await assertFails(setDoc(ref, { data: '{}', v: 1 }))
      await assertFails(setDoc(ref, { data: '{}', updatedAt: serverTimestamp() }))
    })

    it('rejects progress that is not a string or is 400 000 characters or more', async () => {
      const ref = doc(as('alice'), 'progress/alice')
      await assertFails(setDoc(ref, { data: { lessons: {} }, v: 1, updatedAt: serverTimestamp() }))
      await assertFails(setDoc(ref, progress('x'.repeat(400_000))))
      await assertSucceeds(setDoc(ref, progress('x'.repeat(399_999))))
    })

    it('rejects any version other than 1', async () => {
      const ref = doc(as('alice'), 'progress/alice')
      await assertFails(setDoc(ref, { ...progress(), v: 2 }))
      await assertFails(setDoc(ref, { ...progress(), v: '1' }))
    })

    it('rejects an updatedAt chosen by the client instead of the server', async () => {
      const ref = doc(as('alice'), 'progress/alice')
      await assertFails(setDoc(ref, { ...progress(), updatedAt: Timestamp.now() }))
      await assertFails(setDoc(ref, { ...progress(), updatedAt: Timestamp.fromDate(new Date('2030-01-01')) }))
    })

    it('does not allow sub-collections under progress', async () => {
      await assertFails(setDoc(doc(as('alice'), 'progress/alice/extra/x'), { a: 1 }))
    })
  })

  describe('entitlements/{uid}', () => {
    beforeEach(async () => {
      await seed('entitlements/alice', { access: 'paid', source: 'stripe', email: 'alice@example.com', grantedAt: Timestamp.now() })
    })

    it('lets the owner read their own entitlement', async () => {
      await assertSucceeds(getDoc(doc(as('alice'), 'entitlements/alice')))
    })

    it('does not let the owner create, change or delete it', async () => {
      const own = doc(as('alice'), 'entitlements/alice')
      await assertFails(setDoc(own, { access: 'paid', source: 'stripe', email: null, grantedAt: Timestamp.now() }))
      await assertFails(updateDoc(own, { access: 'whitelist' }))
      await assertFails(deleteDoc(own))
      await assertFails(setDoc(doc(as('bob'), 'entitlements/bob'), { access: 'paid' }))
    })

    it('keeps other people and signed-out visitors out', async () => {
      await assertFails(getDoc(doc(as('bob'), 'entitlements/alice')))
      await assertFails(getDoc(doc(signedOut(), 'entitlements/alice')))
    })
  })

  describe('payments and everything else', () => {
    it('denies all client access to payments, even your own', async () => {
      await seed('payments/cs_test_a1', { uid: 'alice', status: 'paid' })
      const ref = doc(as('alice'), 'payments/cs_test_a1')
      await assertFails(getDoc(ref))
      await assertFails(setDoc(ref, { uid: 'alice', status: 'paid' }))
      await assertFails(deleteDoc(ref))
      await assertFails(setDoc(doc(as('alice'), 'payments/cs_test_new'), { uid: 'alice' }))
    })

    it('denies unknown collections', async () => {
      await seed('users/alice', { name: 'Alice' })
      await assertFails(getDoc(doc(as('alice'), 'users/alice')))
      await assertFails(setDoc(doc(as('alice'), 'users/alice'), { name: 'Alice' }))
      await assertFails(setDoc(doc(as('alice'), 'anything/else'), { a: 1 }))
      await assertFails(getDoc(doc(signedOut(), 'anything/else')))
    })
  })
})
