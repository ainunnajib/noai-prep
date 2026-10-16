import { HttpsError } from 'firebase-functions/v2/https'
import { describe, expect, it } from 'vitest'
import { syncAccess } from '../src/access'
import { INVITED, makeDeps, signedIn, signedOut, WHITELIST } from './fakes'

describe('syncAccess', () => {
  it('rejects a signed-out caller with "unauthenticated"', async () => {
    const deps = makeDeps()
    const call = syncAccess(deps, signedOut())
    await expect(call).rejects.toBeInstanceOf(HttpsError)
    await expect(syncAccess(deps, signedOut())).rejects.toMatchObject({ code: 'unauthenticated' })
    expect(deps.db.docs.size).toBe(0)
  })

  it('grants whitelist access to a verified whitelisted email', async () => {
    const deps = makeDeps()
    expect(await syncAccess(deps, signedIn('u1', INVITED))).toEqual({ access: 'whitelist' })
    expect(deps.db.read('entitlements/u1')).toEqual({
      access: 'whitelist',
      source: 'whitelist',
      email: INVITED,
      grantedAt: 'server-time-1',
    })
  })

  it('matches the whitelist regardless of case and spacing in the sign-in email', async () => {
    const deps = makeDeps()
    expect(await syncAccess(deps, signedIn('u1', ' FRIEND@example.COM'))).toEqual({ access: 'whitelist' })
  })

  it('keeps an existing whitelist grant as it is', async () => {
    const deps = makeDeps()
    await syncAccess(deps, signedIn('u1', INVITED))
    await syncAccess(deps, signedIn('u1', INVITED))
    expect(deps.db.read('entitlements/u1')?.grantedAt).toBe('server-time-1')
  })

  it('keeps a paid unlock for a whitelisted person (no downgrade to whitelist)', async () => {
    const deps = makeDeps()
    const paid = { access: 'paid', source: 'stripe', email: INVITED, grantedAt: 'earlier', paymentIntent: 'pi_1' }
    deps.db.seed('entitlements/u1', paid)
    expect(await syncAccess(deps, signedIn('u1', INVITED))).toEqual({ access: 'paid' })
    expect(deps.db.read('entitlements/u1')).toEqual(paid)
  })

  it('re-grants whitelist access to a whitelisted person whose paid unlock was refunded', async () => {
    const deps = makeDeps()
    deps.db.seed('entitlements/u1', { access: 'revoked', source: 'stripe', email: INVITED, grantedAt: 'x', revokedAt: 'y' })
    expect(await syncAccess(deps, signedIn('u1', INVITED))).toEqual({ access: 'whitelist' })
    expect(deps.db.read('entitlements/u1')).toEqual({
      access: 'whitelist',
      source: 'whitelist',
      email: INVITED,
      grantedAt: 'server-time-1',
    })
  })

  it('removes whitelist access when the email is taken off the whitelist', async () => {
    const deps = makeDeps()
    await syncAccess(deps, signedIn('u1', INVITED))
    deps.whitelist = 'friend@example.com'
    expect(await syncAccess(deps, signedIn('u1', INVITED))).toEqual({ access: 'none' })
    expect(deps.db.read('entitlements/u1')).toBeUndefined()
  })

  it('never removes a paid unlock', async () => {
    const deps = makeDeps()
    deps.db.seed('entitlements/u1', { access: 'paid', source: 'stripe', email: 'student@example.com', grantedAt: 'x' })
    expect(await syncAccess(deps, signedIn('u1', 'student@example.com'))).toEqual({ access: 'paid' })
    expect(deps.db.read('entitlements/u1')?.access).toBe('paid')
  })

  it('gives nothing to a whitelisted email that is not verified', async () => {
    const deps = makeDeps()
    expect(await syncAccess(deps, signedIn('u1', INVITED, false))).toEqual({ access: 'none' })
    expect(deps.db.read('entitlements/u1')).toBeUndefined()
  })

  it('treats an existing whitelist grant as removed if the email is no longer verified', async () => {
    const deps = makeDeps()
    await syncAccess(deps, signedIn('u1', INVITED))
    expect(await syncAccess(deps, signedIn('u1', INVITED, false))).toEqual({ access: 'none' })
    expect(deps.db.read('entitlements/u1')).toBeUndefined()
  })

  it('gives nothing to an account without an email, or with an email not on the list', async () => {
    const deps = makeDeps()
    expect(await syncAccess(deps, signedIn('u1', null))).toEqual({ access: 'none' })
    expect(await syncAccess(deps, signedIn('u2', 'abc123@privaterelay.appleid.com'))).toEqual({ access: 'none' })
    expect(deps.db.docs.size).toBe(0)
  })

  it('gives nothing to anyone when the whitelist is empty', async () => {
    const deps = makeDeps()
    deps.whitelist = ''
    expect(await syncAccess(deps, signedIn('u1', INVITED))).toEqual({ access: 'none' })
  })

  it('never returns or logs the whitelist', async () => {
    const deps = makeDeps()
    const results = [
      await syncAccess(deps, signedIn('u1', INVITED)),
      await syncAccess(deps, signedIn('u2', 'student@example.com')),
    ]
    const everything = JSON.stringify({ results, logs: deps.log.entries })
    expect(everything).not.toContain('friend@example.com')
    expect(everything).not.toContain(INVITED)
    expect(everything).not.toContain(WHITELIST.trim())
    for (const result of results) expect(Object.keys(result)).toEqual(['access'])
  })
})
