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

  /** A whole progress document (format 3) with the given revision. */
  const progress = (rev = 1, lessons = '{}', resetAt = 0) => ({
    v: 3,
    rev,
    resetAt,
    updatedAt: serverTimestamp(),
    lessons,
    checkpoints: '{}',
    exams: '{}',
    a0: '{}',
    a1: '{}',
    a2: '{}',
    a3: '{}',
    a4: '{}',
    a5: '{}',
    a6: '{}',
    a7: '{}',
  })
  const LESSON = '{"a/b":{"d":"2026-10-16T00:00:00.000Z","t":1760572800000}}'

  describe('progress/{uid}', () => {
    it('lets the owner create (revision 1), read, update (the next revision) and delete their progress', async () => {
      const ref = doc(as('alice'), 'progress/alice')
      await assertSucceeds(setDoc(ref, progress(1)))
      await assertSucceeds(getDoc(ref))
      await assertSucceeds(setDoc(ref, progress(2, LESSON)))
      // a save of just the parts that changed (what the page sends while it closes), always with v, rev and resetAt
      await assertSucceeds(updateDoc(ref, { lessons: '{}', a3: '{"q1":[[true,1760572800001]]}', v: 3, rev: 3, resetAt: 0, updatedAt: serverTimestamp() }))
      await assertSucceeds(updateDoc(ref, { v: 3, rev: 4, resetAt: 1760572800002, updatedAt: serverTimestamp() })) // a Reset
      await assertSucceeds(deleteDoc(ref)) // (only when the account is deleted)
      // a new document starts again at revision 1
      await assertSucceeds(setDoc(ref, progress(1)))
    })

    it('refuses a save based on an out-of-date copy: each save must carry the next revision', async () => {
      const ref = doc(as('alice'), 'progress/alice')
      await assertFails(setDoc(ref, progress(2))) // a new document starts at 1
      await assertFails(setDoc(ref, progress(0)))
      await assertSucceeds(setDoc(ref, progress(1)))
      await assertFails(setDoc(ref, progress(1))) // another device saved revision 1 already
      await assertFails(setDoc(ref, progress(3))) // skipping one
      await assertFails(updateDoc(ref, { lessons: '{}', v: 3, rev: 1, resetAt: 0, updatedAt: serverTimestamp() }))
      await assertSucceeds(setDoc(ref, progress(2)))
      await assertFails(setDoc(ref, { ...progress(3), rev: '3' }))
      await assertFails(setDoc(ref, { ...progress(3), rev: 3.5 }))
    })

    it('counts a document saved without a revision as revision 0', async () => {
      const { rev: _rev, ...noRev } = progress(1)
      await seed('progress/alice', noRev)
      const ref = doc(as('alice'), 'progress/alice')
      await assertFails(setDoc(ref, progress(2)))
      await assertSucceeds(setDoc(ref, progress(1)))
    })

    it('keeps other people out', async () => {
      await seed('progress/alice', { ...progress(1), updatedAt: Timestamp.now() })
      const ref = doc(as('bob'), 'progress/alice')
      await assertFails(getDoc(ref))
      await assertFails(setDoc(ref, progress(2)))
      await assertFails(updateDoc(ref, { v: 3, rev: 2, resetAt: 0, updatedAt: serverTimestamp() }))
      await assertFails(deleteDoc(ref))
      await assertFails(setDoc(doc(as('bob'), 'progress/carol'), progress(1)))
    })

    it('keeps signed-out visitors out', async () => {
      await seed('progress/alice', { ...progress(1), updatedAt: Timestamp.now() })
      const ref = doc(signedOut(), 'progress/alice')
      await assertFails(getDoc(ref))
      await assertFails(setDoc(ref, progress(2)))
      await assertFails(deleteDoc(ref))
    })

    it('needs exactly the allowed fields: no extra ones, none missing', async () => {
      const ref = doc(as('alice'), 'progress/alice')
      await assertFails(setDoc(ref, { ...progress(), admin: true }))
      await assertFails(setDoc(ref, { ...progress(), data: '{}' })) // the first format's single text
      await assertFails(setDoc(ref, { ...progress(), a8: '{}' }))
      for (const key of ['v', 'rev', 'resetAt', 'updatedAt', 'lessons', 'checkpoints', 'exams', 'a0', 'a7']) {
        const { [key]: _gone, ...missing } = progress() as Record<string, unknown>
        await assertFails(setDoc(ref, missing))
      }
      await assertSucceeds(setDoc(ref, progress()))
    })

    it('needs every part to be text of at most 200 000 characters', async () => {
      const ref = doc(as('alice'), 'progress/alice')
      await assertFails(setDoc(ref, { ...progress(), lessons: { a: 1 } }))
      await assertFails(setDoc(ref, { ...progress(), a5: ['x'] }))
      await assertFails(setDoc(ref, { ...progress(), exams: 'x'.repeat(200_001) }))
      await assertSucceeds(setDoc(ref, { ...progress(), exams: 'x'.repeat(200_000) }))
      await assertFails(updateDoc(ref, { a2: 'x'.repeat(200_001), v: 3, rev: 2, resetAt: 0, updatedAt: serverTimestamp() }))
    })

    it('needs resetAt to be a whole number, zero or more', async () => {
      const ref = doc(as('alice'), 'progress/alice')
      await assertFails(setDoc(ref, { ...progress(), resetAt: '0' }))
      await assertFails(setDoc(ref, { ...progress(), resetAt: 1.5 }))
      await assertFails(setDoc(ref, { ...progress(), resetAt: -1 }))
      await assertFails(setDoc(ref, { ...progress(), resetAt: null }))
      await assertSucceeds(setDoc(ref, { ...progress(), resetAt: 1760572800000 }))
    })

    it('refuses any version other than 3, so the earlier format (2) can no longer be written', async () => {
      const ref = doc(as('alice'), 'progress/alice')
      await assertFails(setDoc(ref, { ...progress(), v: 2 }))
      await assertFails(setDoc(ref, { ...progress(), v: '3' }))
      const { resetAt: _r, ...v2 } = { ...progress(), v: 2, exams: '[]' }
      await assertFails(setDoc(ref, v2))
      // a document left in format 2 (which allowed missing parts) is replaced by a whole format 3 one, as its next revision
      await seed('progress/alice', { v: 2, rev: 4, lessons: '{"a/b":"2026-10-16T00:00:00.000Z"}', updatedAt: Timestamp.now() })
      await assertFails(updateDoc(ref, { lessons: '{}', v: 3, rev: 5, resetAt: 0, updatedAt: serverTimestamp() })) // (parts missing)
      await assertFails(updateDoc(ref, { lessons: '{}', rev: 5, updatedAt: serverTimestamp() })) // (still format 2)
      await assertSucceeds(setDoc(ref, progress(5)))
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

  describe('payments, refunds and everything else', () => {
    it('denies all client access to refund records', async () => {
      await seed('refunds/pi_111', { chargeId: 'ch_111', uid: 'alice', refundedAt: Timestamp.now() })
      await assertFails(getDoc(doc(as('alice'), 'refunds/pi_111')))
      await assertFails(setDoc(doc(as('alice'), 'refunds/pi_222'), { uid: 'alice' }))
      await assertFails(deleteDoc(doc(as('alice'), 'refunds/pi_111')))
    })

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
