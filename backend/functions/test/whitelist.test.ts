import { describe, expect, it } from 'vitest'
import { isWhitelisted, normaliseEmail, parseWhitelist } from '../src/whitelist'

describe('parseWhitelist', () => {
  it('splits on commas, spaces, semicolons and new lines, lower-casing every entry', () => {
    const list = parseWhitelist('Ann@Example.com, bob@example.com\ncarol@EXAMPLE.com;dan@example.com  eve@example.com')
    expect([...list].sort()).toEqual([
      'ann@example.com',
      'bob@example.com',
      'carol@example.com',
      'dan@example.com',
      'eve@example.com',
    ])
  })

  it('ignores empty entries, blank lines, Windows line endings and stray separators', () => {
    const list = parseWhitelist('\r\n , ann@example.com,,\r\n\r\n  ,bob@example.com ,\n\t')
    expect([...list].sort()).toEqual(['ann@example.com', 'bob@example.com'])
  })

  it('ignores quotes or angle brackets pasted around the list or an address', () => {
    const list = parseWhitelist(`"ann@example.com, 'bob@example.com', <carol@example.com>"`)
    expect([...list].sort()).toEqual(['ann@example.com', 'bob@example.com', 'carol@example.com'])
  })

  it('treats a missing or empty secret as an empty whitelist', () => {
    expect(parseWhitelist('').size).toBe(0)
    expect(parseWhitelist('  \n , ').size).toBe(0)
    expect(parseWhitelist(undefined).size).toBe(0)
    expect(parseWhitelist(null).size).toBe(0)
  })

  it('removes duplicates that differ only in case or spacing', () => {
    expect(parseWhitelist('ann@example.com, ANN@example.com,  Ann@Example.Com ').size).toBe(1)
  })
})

describe('isWhitelisted', () => {
  const list = parseWhitelist('ann@example.com\nbob@example.com')

  it('matches regardless of case and surrounding whitespace', () => {
    expect(isWhitelisted('ann@example.com', list)).toBe(true)
    expect(isWhitelisted('  ANN@Example.COM \n', list)).toBe(true)
  })

  it('needs an exact address, not a part of one', () => {
    expect(isWhitelisted('ann@example.co', list)).toBe(false)
    expect(isWhitelisted('xann@example.com', list)).toBe(false)
    expect(isWhitelisted('ann@example.com.evil.test', list)).toBe(false)
    expect(isWhitelisted('example.com', list)).toBe(false)
  })

  it('never matches a missing or blank email', () => {
    expect(isWhitelisted(null, list)).toBe(false)
    expect(isWhitelisted(undefined, list)).toBe(false)
    expect(isWhitelisted('', list)).toBe(false)
    expect(isWhitelisted('   ', parseWhitelist(' , '))).toBe(false)
  })

  it('never matches anything when the whitelist is empty', () => {
    expect(isWhitelisted('ann@example.com', parseWhitelist(''))).toBe(false)
  })
})

describe('normaliseEmail', () => {
  it('trims and lower-cases', () => {
    expect(normaliseEmail('  Sam.Student@Example.com\n')).toBe('sam.student@example.com')
  })
})
