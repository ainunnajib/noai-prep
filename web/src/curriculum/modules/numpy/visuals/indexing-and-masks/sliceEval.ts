/*
  Python/NumPy basic-indexing rules for a 2-D array, used by SliceHighlighter (tested against NumPy).
  Chained brackets such as arr[:][0] or arr[1:4][::2, 1] are applied left to right, each one indexing
  the result of the one before, exactly as NumPy does. Any chain of integers and slices still picks a
  rectangle of rows × columns, so the result is always described by a row list and a column list.
*/

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

/** The shortest slice text that picks exactly these positions (always an evenly spaced run) out of n. */
function sliceText(idx: number[], n: number): string {
  if (idx.length === 0) return '0:0'
  if (idx.length === 1) return `${idx[0]}:${idx[0] + 1}`
  const step = idx[1] - idx[0]
  const first = idx[0]
  const last = idx[idx.length - 1]
  const stepText = step === 1 ? '' : `:${step}`
  if (step > 0) {
    const startText = first === 0 ? '' : String(first)
    const stopText = last + step >= n ? '' : String(last + step)
    return `${startText}:${stopText}${stepText}`
  }
  const startText = first === n - 1 ? '' : String(first)
  const stopText = last + step < 0 ? '' : String(last + step)
  return `${startText}:${stopText}${stepText}`
}

export function evaluate(expr: string): Sel | string {
  const s = expr.trim()
  if (/^arr\s*\[\s*\[/.test(s)) return 'A list of positions, like arr[[0, 2]], is fancy indexing: see "Views and copies" further down this lesson. This explorer handles whole numbers and slices.'
  if (/^arr\s*\[[^\]]*(arr|[<>=!&|~])/.test(s)) return 'Boolean masks, like arr[arr > 20], come in the next section of this lesson. This explorer handles whole numbers and slices.'
  const m = /^arr\s*((?:\[[^[\]]*\]\s*)+)$/.exec(s)
  if (!m) return 'Write it as arr[ … ], for example arr[1:3, 0]'
  const groups = Array.from(m[1].matchAll(/\[([^[\]]*)\]/g), (g) => g[1])
  const chained = groups.length > 1

  let rows = Array.from({ length: R }, (_, i) => i)
  let cols = Array.from({ length: C }, (_, j) => j)
  let keepRow = true
  let keepCol = true
  const notes: string[] = []
  if (chained) notes.push('Brackets work left to right: each new [ ] indexes the result of the one before.')

  for (const inner of groups) {
    const parts = inner.split(',')
    const live: ('row' | 'col')[] = []
    if (keepRow) live.push('row')
    if (keepCol) live.push('col')
    if (live.length === 0) return 'IndexError: invalid index to scalar variable.'
    if (parts.length > live.length) return `IndexError: too many indices for array: array is ${live.length}-dimensional, but ${parts.length} were indexed`
    const parsed: Part[] = []
    for (const t of parts) {
      const p = parsePart(t)
      if (typeof p === 'string') return p
      parsed.push(p)
    }
    // axes not named in this bracket are kept whole (an implicit ":")
    if (!chained) while (parsed.length < live.length) parsed.push({ kind: 'slice', text: ':' })
    const prefix = chained ? `[${inner.trim()}] ` : ''
    for (let k = 0; k < parsed.length; k++) {
      const p = parsed[k]
      const which = live[k]
      const name = which === 'row' ? 'row' : 'column'
      const list = which === 'row' ? rows : cols
      const n = list.length
      const axis = chained ? k : which === 'row' ? 0 : 1
      let next: number[]
      if (p.kind === 'int') {
        const i = p.i < 0 ? p.i + n : p.i
        if (i < 0 || i >= n) return `IndexError: index ${p.i} is out of bounds for axis ${axis} with size ${n}`
        next = [list[i]]
        const pos = list[i] === i ? `${name} ${i}` : `${name} ${i} of what is left, which is ${name} ${list[i]} of arr`
        notes.push(`${prefix}axis ${axis}: the integer ${p.i} picks ${pos}${p.i < 0 ? ' (counting from the end)' : ''}, and this axis disappears from the result`)
        if (which === 'row') keepRow = false
        else keepCol = false
      } else {
        const idx = sliceIdx(p, n)
        if (typeof idx === 'string') return idx
        next = idx.map((i) => list[i])
        notes.push(
          p.text.trim() === ':'
            ? `${prefix}axis ${axis}: ":" keeps every ${name} (${n} of them)`
            : `${prefix}axis ${axis}: the slice ${p.text.trim()} keeps ${name}s ${next.length ? next.join(', ') : '(none)'}${chained ? ' of arr' : ''}, and this axis stays in the result`,
        )
      }
      if (which === 'row') rows = next
      else cols = next
    }
  }

  if (chained) {
    const rowText = keepRow ? sliceText(rows, R) : String(rows[0])
    const colText = keepCol ? sliceText(cols, C) : String(cols[0])
    const same = colText === ':' ? `arr[${rowText}]` : `arr[${rowText}, ${colText}]`
    notes.push(`So this picks the same as ${same}, written with one pair of brackets.`)
    if (groups[0].trim() === ':' && !keepRow && keepCol)
      notes.push('Careful: arr[:] is just the whole array, so the next bracket picks a row again. For a column, put both indices in one bracket, such as arr[:, 0].')
  }
  return { rows, cols, keepRow, keepCol, notes }
}
