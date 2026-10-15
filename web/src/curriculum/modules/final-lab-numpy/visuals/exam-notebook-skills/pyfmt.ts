/*
  Tiny formatters that print numbers the way Python and NumPy do, so the outputs shown in
  the notebook-style visuals match what a learner sees in Jupyter (checked against
  Python 3.13 / NumPy 2.5 for every value the lessons display).
*/

/** Python's repr() of a float: 2.0, 7.333333333333333, -0.0, 5e-06. */
export function pyFloat(v: number): string {
  if (Number.isNaN(v)) return 'nan'
  if (!Number.isFinite(v)) return v > 0 ? 'inf' : '-inf'
  if (Object.is(v, -0)) return '-0.0'
  const a = Math.abs(v)
  if (a !== 0 && (a < 1e-4 || a >= 1e16)) {
    // Python switches to exponent form below 1e-4; exponent has at least 2 digits
    const [m, e] = v.toExponential().split('e')
    const sign = e[0] === '-' ? '-' : '+'
    const digits = e.replace(/^[+-]/, '').padStart(2, '0')
    return `${m}e${sign}${digits}`
  }
  if (Number.isInteger(v)) return v.toFixed(1)
  return String(v)
}

/** Python round(x, nd) for the values used here (half-way cases do not occur in the lessons). */
export function pyRound(v: number, nd = 4): number {
  const f = 10 ** nd
  const r = Math.round(v * f) / f
  // keep the sign of tiny negative numbers, as Python does: round(-0.00001, 4) == -0.0
  return r === 0 && (v < 0 || Object.is(v, -0)) ? -0 : r
}

/** np.round for an array */
export function npRound(a: number[], nd = 4): number[] {
  return a.map((v) => pyRound(v, nd))
}

/** Shortest digits after the point (at most `prec`) that identify v, like NumPy's 'maxprec' mode. */
function fracDigits(v: number, prec: number): string {
  let s = Math.abs(v).toFixed(prec)
  s = s.replace(/0+$/, '')
  const dot = s.indexOf('.')
  return dot >= 0 ? s.slice(dot + 1) : ''
}

/**
 * repr() of a 1-D float NumPy array, e.g. array([0.003 , 0.9987]) or array([5.000e-04, 9.994e-01]).
 * Implements NumPy's default float printing (precision 8, 'maxprec', automatic scientific mode).
 */
export function npArrayRepr(a: number[]): string {
  return `array([${npArrayBody(a)}])`
}

/** str() of a 1-D float array, as print(arr) shows it: [0.003  0.9987] */
export function npArrayStr(a: number[]): string {
  return `[${npArrayItems(a).join(' ')}]`
}

/** repr() of a 2-D float array, rows aligned the way NumPy prints them */
export function npArray2DRepr(rows: number[][]): string {
  const flat = npArrayItems(rows.flat())
  const w = rows[0].length
  const lines = rows.map((_, i) => `[${flat.slice(i * w, (i + 1) * w).join(', ')}]`)
  return `array([${lines.join(',\n       ')}])`
}

function npArrayBody(a: number[]): string {
  return npArrayItems(a).join(', ')
}

function npArrayItems(a: number[]): string[] {
  if (a.some((v) => !Number.isFinite(v))) return a.map((v) => (Number.isNaN(v) ? 'nan' : v > 0 ? 'inf' : Number.isFinite(v) ? String(v) : '-inf'))
  const nz = a.map(Math.abs).filter((v) => v !== 0)
  const max = nz.length ? Math.max(...nz) : 0
  const min = nz.length ? Math.min(...nz) : 0
  const exp = nz.length > 0 && (max >= 1e8 || min < 1e-4 || max / min > 1e3)
  const anyNeg = a.some((v) => v < 0 || Object.is(v, -0))
  let items: string[]
  if (exp) {
    // mantissa digits: the most any element needs (up to 8), zero-padded
    const need = Math.max(
      0,
      ...a.map((v) => {
        const m = Number(Math.abs(v).toExponential(8).split('e')[0])
        return fracDigits(m, 8).length
      }),
    )
    items = a.map((v) => {
      const [m, e] = Math.abs(v).toExponential(need).split('e')
      const sign = e[0] === '-' ? '-' : '+'
      const ex = e.replace(/^[+-]/, '').padStart(2, '0')
      return `${v < 0 || Object.is(v, -0) ? '-' : ''}${need === 0 ? m + '.' : m}e${sign}${ex}`
    })
  } else {
    const fr = a.map((v) => fracDigits(v, 8))
    const width = Math.max(...fr.map((f) => f.length))
    items = a.map((v, i) => {
      const ip = Math.trunc(Math.abs(Number(Math.abs(v).toFixed(8))))
      const sign = v < 0 || Object.is(v, -0) ? '-' : ''
      return `${sign}${ip}.${fr[i].padEnd(width, ' ')}`
    })
  }
  // right-align the integer parts (and leave room for a minus sign)
  const lead = (s: string) => s.indexOf(exp ? 'e' : '.') - (s.startsWith('-') ? 1 : 0)
  const maxLead = Math.max(...items.map(lead))
  return items.map((s) => {
    const pad = maxLead - lead(s) + (anyNeg && !s.startsWith('-') ? 1 : 0)
    return ' '.repeat(pad) + s
  })
}

/** Python repr of a tuple of floats: (2.0, 7.3333) */
export function pyTuple(t: number[]): string {
  return t.length === 1 ? `(${pyFloat(t[0])},)` : `(${t.map(pyFloat).join(', ')})`
}
