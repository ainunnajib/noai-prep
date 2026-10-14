/* Python's repr() for the values shown in this lesson's visuals (str, list of str, int, float). */

export function strRepr(s: string): string {
  const q = s.includes("'") && !s.includes('"') ? '"' : "'"
  let out = q
  for (const ch of s) {
    if (ch === '\\') out += '\\\\'
    else if (ch === q) out += '\\' + q
    else if (ch === '\n') out += '\\n'
    else if (ch === '\t') out += '\\t'
    else if (ch === '\r') out += '\\r'
    else if (ch < ' ' || ch === '\x7f') out += '\\x' + ch.charCodeAt(0).toString(16).padStart(2, '0')
    else out += ch
  }
  return out + q
}

/** repr() of a float: shortest round-trip digits, scientific below 1e-4 and from 1e16 (as CPython). */
export function floatRepr(x: number): string {
  if (Number.isNaN(x)) return 'nan'
  if (x === Infinity) return 'inf'
  if (x === -Infinity) return '-inf'
  if (x === 0) return Object.is(x, -0) ? '-0.0' : '0.0'
  const sign = x < 0 ? '-' : ''
  const [mant, expStr] = Math.abs(x).toExponential().split('e')
  const digits = mant.replace('.', '')
  const e = Number(expStr)
  if (e < -4 || e >= 16) {
    const m = digits.length > 1 ? digits[0] + '.' + digits.slice(1) : digits
    return sign + m + 'e' + (e < 0 ? '-' : '+') + String(Math.abs(e)).padStart(2, '0')
  }
  if (e >= 0) {
    const whole = digits.length > e + 1 ? digits.slice(0, e + 1) : digits.padEnd(e + 1, '0')
    const frac = digits.length > e + 1 ? digits.slice(e + 1) : '0'
    return sign + whole + '.' + frac
  }
  return sign + '0.' + '0'.repeat(-e - 1) + digits
}

export type Val = string | string[] | number | { int: number }

/** repr of a value in the method chain: str, list of str, or int. */
export function reprVal(v: Val): string {
  if (typeof v === 'string') return strRepr(v)
  if (Array.isArray(v)) return '[' + v.map(strRepr).join(', ') + ']'
  if (typeof v === 'number') return floatRepr(v)
  return String(v.int)
}

/** Python's slice.indices(): the positions a slice start:stop:step takes from a sequence of length n. */
export function slicePositions(n: number, start: number | null, stop: number | null, step: number | null): number[] {
  const st = step ?? 1
  if (st === 0) throw new Error('slice step cannot be zero')
  const lower = st > 0 ? 0 : -1
  const upper = st > 0 ? n : n - 1
  const fix = (v: number | null, dflt: number) => {
    if (v === null) return dflt
    let x = v
    if (x < 0) {
      x += n
      if (x < lower) x = lower
    } else if (x > upper) x = upper
    return x
  }
  const a = fix(start, st < 0 ? upper : lower)
  const b = fix(stop, st < 0 ? lower : upper)
  const out: number[] = []
  if (st > 0) for (let i = a; i < b; i += st) out.push(i)
  else for (let i = a; i > b; i += st) out.push(i)
  return out
}
