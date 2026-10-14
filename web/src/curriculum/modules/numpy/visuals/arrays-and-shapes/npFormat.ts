/*
  A faithful port of how NumPy prints arrays with print(arr) under the default options
  (precision 8, floatmode 'maxprec', linewidth 75), for the small int and float arrays used in
  these lessons. It mirrors numpy/core/arrayprint.py: one element width for the whole array,
  nested brackets, blank lines between blocks of a 3-D array and wrapping at 75 characters.
  (Scientific notation for very large or tiny floats is not needed here and not implemented.)
*/

export type Nested = number | Nested[]

export function shapeOf(a: Nested): number[] {
  const s: number[] = []
  let x: Nested = a
  while (Array.isArray(x)) {
    s.push(x.length)
    if (x.length === 0) break
    x = x[0]
  }
  return s
}

export function flat(a: Nested): number[] {
  return Array.isArray(a) ? a.flatMap((x) => flat(x)) : [a]
}

/** Rebuild a nested array of the given shape from flat (row-major) data. */
export function nest(data: number[], shape: number[]): Nested {
  if (shape.length === 0) return data[0]
  const [n, ...rest] = shape
  const step = rest.reduce((p, q) => p * q, 1)
  return Array.from({ length: n }, (_, i) => nest(data.slice(i * step, (i + 1) * step), rest))
}

/** NumPy's 'maxprec' digits for one float: at most 8 decimals, trailing zeros trimmed, keep the point. */
function floatStr(x: number): string {
  let s = x.toFixed(8)
  s = s.replace(/0+$/, '')
  if (s === '-0.') s = '-0.'
  return s
}

function makeFormatter(values: number[], isFloat: boolean): (x: number) => string {
  if (!isFloat) {
    const w = values.length ? Math.max(...values.map((v) => String(v).length)) : 0
    return (x) => String(x).padStart(w)
  }
  const strs = values.map(floatStr)
  const parts = strs.map((s) => s.split('.'))
  const padLeft = parts.length ? Math.max(...parts.map((p) => p[0].length)) : 0
  const padRight = parts.length ? Math.max(...parts.map((p) => p[1].length)) : 0
  return (x) => {
    const [i, f] = floatStr(x).split('.')
    return i.padStart(padLeft) + '.' + f.padEnd(padRight)
  }
}

function extendLine(s: string, line: string, word: string, width: number, prefix: string): [string, string] {
  let needsWrap = line.length + word.length > width
  if (line.length <= prefix.length) needsWrap = false
  if (needsWrap) {
    s += line.replace(/\s+$/, '') + '\n'
    line = prefix
  }
  return [s, line + word]
}

/**
 * The text that print(arr) shows. `kind` is true for a float array, false for an int array and
 * 'bool' for a boolean array (pass 1 for True and 0 for False).
 */
export function npPrint(a: Nested, kind: boolean | 'bool', lineWidth = 75): string {
  const shape = shapeOf(a)
  const values = flat(a)
  const fmt = kind === 'bool' ? (x: number) => (x ? ' True' : 'False') : makeFormatter(values, kind)
  if (shape.length === 0) return kind === 'bool' ? (values[0] ? 'True' : 'False') : fmt(values[0]).trim()
  if (values.length === 0) return '[]'
  const ndim = shape.length

  const recurse = (x: Nested, depth: number, hanging: string, width: number): string => {
    if (!Array.isArray(x)) return fmt(x)
    const axesLeft = ndim - depth
    const nextHanging = hanging + ' '
    const nextWidth = width - 1
    let s = ''
    if (axesLeft === 1) {
      const elemWidth = width - 1
      let line = hanging
      x.forEach((v, i) => {
        const word = recurse(v, depth + 1, nextHanging, nextWidth)
        ;[s, line] = extendLine(s, line, word, elemWidth, hanging)
        if (i < x.length - 1) line += ' '
      })
      s += line
    } else {
      const sep = '\n'.repeat(axesLeft - 1)
      x.forEach((v, i) => {
        const nested = recurse(v, depth + 1, nextHanging, nextWidth)
        s += hanging + nested + (i < x.length - 1 ? sep : '')
      })
    }
    return '[' + s.slice(hanging.length) + ']'
  }
  return recurse(a, 0, ' ', lineWidth)
}

/** Format one element the way it appears inside a printed array (without padding). */
export function elemStr(x: number, isFloat: boolean): string {
  return isFloat ? floatStr(x) : String(x)
}

export const shapeStr = (shape: number[]) => (shape.length === 1 ? `(${shape[0]},)` : `(${shape.join(', ')})`)
