/* Python/NumPy basic-indexing rules for a 2-D array, used by SliceHighlighter (tested against NumPy). */

export const R = 5
export const C = 6

type Part = { kind: 'int'; i: number; text: string } | { kind: 'slice'; start?: number; stop?: number; step?: number; text: string }

export interface Sel {
  rows: number[]
  cols: number[]
  keepRow: boolean
  keepCol: boolean
  notes: string[]
}

function parsePart(t: string): Part | string {
  const s = t.trim()
  if (/^-?\d+$/.test(s)) return { kind: 'int', i: parseInt(s, 10), text: s }
  if (s.includes(':')) {
    const bits = s.split(':')
    if (bits.length > 3) return `invalid slice "${s}"`
    const nums: (number | undefined)[] = []
    for (const b of bits) {
      const x = b.trim()
      if (x === '') nums.push(undefined)
      else if (/^-?\d+$/.test(x)) nums.push(parseInt(x, 10))
      else return `this explorer only understands whole numbers in slices, not "${x}"`
    }
    return { kind: 'slice', start: nums[0], stop: nums[1], step: nums[2], text: s }
  }
  if (s === '') return 'SyntaxError: invalid syntax'
  return `this explorer understands whole numbers and slices like 1:3 or ::2, not "${s}"`
}

function sliceIdx(p: Extract<Part, { kind: 'slice' }>, n: number): number[] | string {
  const step = p.step ?? 1
  if (step === 0) return 'ValueError: slice step cannot be zero'
  const lower = step > 0 ? 0 : -1
  const upper = step > 0 ? n : n - 1
  const fix = (v: number | undefined, dflt: number) => {
    if (v === undefined) return dflt
    if (v < 0) return Math.max(v + n, lower)
    return Math.min(v, upper)
  }
  const start = fix(p.start, step > 0 ? lower : upper)
  const stop = fix(p.stop, step > 0 ? upper : lower)
  const out: number[] = []
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) out.push(i)
  return out
}

export function evaluate(expr: string): Sel | string {
  const m = /^\s*arr\s*\[(.*)\]\s*$/.exec(expr)
  if (!m) return 'Write it as arr[ … ], for example arr[1:3, 0]'
  const parts = m[1].split(',')
  if (parts.length > 2) return `IndexError: too many indices for array: array is 2-dimensional, but ${parts.length} were indexed`
  const p0 = parsePart(parts[0])
  const p1 = parts.length > 1 ? parsePart(parts[1]) : ({ kind: 'slice', text: ':' } as Part)
  if (typeof p0 === 'string') return p0
  if (typeof p1 === 'string') return p1
  const notes: string[] = []
  const pick = (p: Part, n: number, axis: number, name: string): number[] | string => {
    if (p.kind === 'int') {
      const i = p.i < 0 ? p.i + n : p.i
      if (i < 0 || i >= n) return `IndexError: index ${p.i} is out of bounds for axis ${axis} with size ${n}`
      notes.push(`axis ${axis}: the integer ${p.i} picks ${name} ${i}${p.i < 0 ? ` (counting from the end)` : ''}, and this axis disappears from the result`)
      return [i]
    }
    const idx = sliceIdx(p, n)
    if (typeof idx === 'string') return idx
    notes.push(
      p.text.trim() === ':'
        ? `axis ${axis}: ":" keeps every ${name} (${n} of them)`
        : `axis ${axis}: the slice ${p.text.trim()} keeps ${name}s ${idx.length ? idx.join(', ') : '(none)'}, and this axis stays in the result`,
    )
    return idx
  }
  const rows = pick(p0, R, 0, 'row')
  if (typeof rows === 'string') return rows
  const cols = pick(p1, C, 1, 'column')
  if (typeof cols === 'string') return cols
  return { rows, cols, keepRow: p0.kind === 'slice', keepCol: p1.kind === 'slice', notes }
}

