/*
  A tiny interpreter for the pandas selection expressions a learner types:
    df.loc[...], df.iloc[...], df['col'], df[['a', 'b']], df.col
  with keys that are labels/positions, slices (a:b, a:b:step), lists ([a, b]) or ':'.
  It reproduces pandas 2.2 behaviour (results AND error messages) for the small frames in this
  lesson; the cases were checked against real pandas output.
*/

export type Label = number | string

export interface Frame {
  index: Label[]
  columns: string[]
  /** index labels sorted ascending (pandas then allows slicing with labels that are absent) */
  monotonic: boolean
  /** the default RangeIndex 0..n-1 */
  range: boolean
}

type Key =
  | { kind: 'all' }
  | { kind: 'scalar'; v: Label }
  | { kind: 'slice'; start?: Label; stop?: Label; step?: Label }
  | { kind: 'list'; items: Label[] }

type Expr = { acc: 'loc' | 'iloc'; row: Key; col?: Key } | { acc: 'get'; key: Key } | { acc: 'attr'; name: string }

export type Outcome =
  | { ok: true; acc: 'loc' | 'iloc' | 'get' | 'attr'; rows: number[]; cols: number[]; kind: 'scalar' | 'series' | 'frame' }
  | { ok: false; error: string; parse?: boolean }

// ---------------------------------------------------------------- tokenising + parsing

type Tok = { t: 'id' | 'num' | 'str' | 'sym'; v: string }

function tokenize(src: string): Tok[] {
  const out: Tok[] = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (/\s/.test(ch)) {
      i++
    } else if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1
      while (j < src.length && /\w/.test(src[j])) j++
      out.push({ t: 'id', v: src.slice(i, j) })
      i = j
    } else if (/[0-9]/.test(ch) || (ch === '-' && /[0-9]/.test(src[i + 1] ?? ''))) {
      let j = i + 1
      while (j < src.length && /[0-9]/.test(src[j])) j++
      if (src[j] === '.') throw new Error('Use whole numbers for positions and labels in this demo.')
      out.push({ t: 'num', v: src.slice(i, j) })
      i = j
    } else if (ch === "'" || ch === '"') {
      const j = src.indexOf(ch, i + 1)
      if (j < 0) throw new Error('A string is missing its closing quote.')
      out.push({ t: 'str', v: src.slice(i + 1, j) })
      i = j + 1
    } else if ('[](),.:'.includes(ch)) {
      out.push({ t: 'sym', v: ch })
      i++
    } else {
      throw new Error(`Unexpected character "${ch}".`)
    }
  }
  return out
}

function parse(src: string): Expr {
  const toks = tokenize(src)
  let p = 0
  const peek = () => toks[p]
  const isSym = (v: string) => peek()?.t === 'sym' && peek()?.v === v
  const expect = (v: string) => {
    if (!isSym(v)) throw new Error(`Expected "${v}".`)
    p++
  }
  const scalar = (): Label | undefined => {
    const tk = peek()
    if (!tk) return undefined
    if (tk.t === 'num') {
      p++
      return Number(tk.v)
    }
    if (tk.t === 'str') {
      p++
      return tk.v
    }
    return undefined
  }
  const key = (): Key => {
    if (isSym('[')) {
      p++
      const items: Label[] = []
      while (!isSym(']')) {
        const v = scalar()
        if (v === undefined) throw new Error('A list can only hold labels or numbers, e.g. [0, 2].')
        items.push(v)
        if (isSym(',')) p++
        else if (!isSym(']')) throw new Error('Separate list items with commas.')
      }
      p++
      return { kind: 'list', items }
    }
    const a = scalar()
    if (!isSym(':')) {
      if (a === undefined) throw new Error('Expected a label, a number, a slice like 0:3, or a list like [0, 2].')
      return { kind: 'scalar', v: a }
    }
    p++
    const b = scalar()
    let step: Label | undefined
    if (isSym(':')) {
      p++
      step = scalar()
    }
    if (a === undefined && b === undefined && step === undefined) return { kind: 'all' }
    return { kind: 'slice', start: a, stop: b, step }
  }

  const head = toks[p]
  if (!head || head.t !== 'id' || head.v !== 'df') throw new Error('Start with df, e.g. df.loc[3] or df.iloc[0:2].')
  p++
  let expr: Expr
  if (isSym('.')) {
    p++
    const name = peek()
    if (!name || name.t !== 'id') throw new Error('Expected loc, iloc or a column name after the dot.')
    p++
    if (name.v === 'loc' || name.v === 'iloc') {
      expect('[')
      const row = key()
      let col: Key | undefined
      if (isSym(',')) {
        p++
        col = key()
      }
      expect(']')
      expr = { acc: name.v, row, col }
    } else {
      expr = { acc: 'attr', name: name.v }
    }
  } else if (isSym('[')) {
    p++
    const k = key()
    expect(']')
    expr = { acc: 'get', key: k }
  } else {
    throw new Error('After df, write .loc[…], .iloc[…] or […].')
  }
  if (p < toks.length) throw new Error('Unexpected text at the end.')
  return expr
}

// ---------------------------------------------------------------- evaluating

class PdError extends Error {}
const pyRepr = (v: Label) => (typeof v === 'string' ? `'${v}'` : String(v))
const pyList = (vs: Label[]) => `[${vs.map(pyRepr).join(', ')}]`
/** Python's repr of an exception message string: single quotes unless it contains one */
const quoteMsg = (m: string) => (m.includes("'") ? `"${m}"` : `'${m}'`)
const keyError = (v: Label) => new PdError(`KeyError: ${pyRepr(v)}`)
const ILOC_TYPES = 'ValueError: Location based indexing can only have [integer, integer slice (START point is INCLUDED, END point is EXCLUDED), listlike of integers, boolean array] types'

function rangeOf(n: number, start: number, stop: number, step: number): number[] {
  const out: number[] = []
  if (step > 0) for (let i = Math.max(0, start); i < Math.min(n, stop); i += step) out.push(i)
  return out
}

/** Python slice semantics on positions 0..n-1 (positive step only). */
function posSlice(n: number, a?: number, b?: number, step = 1): number[] {
  const norm = (v: number) => (v < 0 ? Math.max(0, n + v) : Math.min(n, v))
  return rangeOf(n, a === undefined ? 0 : norm(a), b === undefined ? n : norm(b), step)
}

// labels and bound have the same type here (numbers with numbers, text with text)
const lt = (a: Label, b: Label) => (a as number) < (b as number)
function bisectLeft(arr: Label[], v: Label) {
  let i = 0
  while (i < arr.length && lt(arr[i], v)) i++
  return i
}
function bisectRight(arr: Label[], v: Label) {
  let i = 0
  while (i < arr.length && !lt(v, arr[i])) i++
  return i
}

/** Label-based lookup along one axis (rows: labels = index; columns: labels = column names). */
function locAxis(k: Key, labels: Label[], axis: 'index' | 'columns', monotonic: boolean, isRange: boolean): number[] {
  const n = labels.length
  const strAxis = typeof labels[0] === 'string'
  const typeOk = (v: Label) => (typeof v === 'string') === strAxis
  switch (k.kind) {
    case 'all':
      return rangeOf(n, 0, n, 1)
    case 'scalar': {
      const i = typeOk(k.v) ? labels.indexOf(k.v) : -1
      if (i < 0) throw keyError(k.v)
      return [i]
    }
    case 'list': {
      const missing = k.items.filter((v) => !typeOk(v) || !labels.includes(v))
      if (missing.length === k.items.length && k.items.length) {
        const allStr = k.items.every((v) => typeof v === 'string')
        const dt = allStr ? 'object' : k.items.every((v) => typeof v === 'number') ? 'int64' : 'object'
        throw new PdError(`KeyError: ${quoteMsg(`None of [Index(${pyList(k.items)}, dtype='${dt}')] are in the [${axis}]`)}`)
      }
      if (missing.length) throw new PdError(`KeyError: ${quoteMsg(`${pyList(missing)} not in index`)}`)
      return k.items.map((v) => labels.indexOf(v))
    }
    case 'slice': {
      if (k.step !== undefined && typeof k.step !== 'number') throw new PdError('TypeError: slice step must be a whole number')
      const step = (k.step as number | undefined) ?? 1
      if (step <= 0) throw new Error('This demo only does positive steps.')
      for (const b of [k.start, k.stop]) {
        if (b === undefined) continue
        if (strAxis && typeof b === 'number') throw new PdError(`TypeError: cannot do slice indexing on Index with these indexers [${b}] of type int`)
      }
      const strBound = [k.start, k.stop].some((b) => typeof b === 'string')
      // pandas gives erratic results here (an empty table for some letters, an internal error for others)
      if (!strAxis && strBound && isRange) throw new Error('These row labels are numbers, so slice them with numbers: pandas gives confusing results (sometimes an empty table, sometimes an error) for text here.')
      let a = 0
      let b = n
      if (monotonic) {
        if (k.start !== undefined) a = bisectLeft(labels, k.start)
        if (k.stop !== undefined) b = bisectRight(labels, k.stop)
      } else {
        if (k.start !== undefined) {
          a = typeOk(k.start) ? labels.indexOf(k.start) : -1
          if (a < 0) throw keyError(k.start)
        }
        if (k.stop !== undefined) {
          const e = typeOk(k.stop) ? labels.indexOf(k.stop) : -1
          if (e < 0) throw keyError(k.stop)
          b = e + 1
        }
      }
      return rangeOf(n, a, b, step)
    }
  }
}

/** Position-based lookup along one axis. `two` = the expression had both a row and a column key. */
function ilocAxis(k: Key, n: number, two: boolean, isRange: boolean): number[] {
  switch (k.kind) {
    case 'all':
      return rangeOf(n, 0, n, 1)
    case 'scalar':
      if (typeof k.v === 'string') {
        if (two) throw new PdError(ILOC_TYPES)
        throw new PdError('TypeError: Cannot index by location index with a non-integer key')
      }
      if (k.v < -n || k.v >= n) throw new PdError('IndexError: single positional indexer is out-of-bounds')
      return [k.v < 0 ? n + k.v : k.v]
    case 'list': {
      const bad = k.items.find((v) => typeof v === 'string')
      if (bad !== undefined) {
        if (two) throw new PdError(`IndexError: .iloc requires numeric indexers, got [${k.items.map((v) => `'${v}'`).join(' ')}]`)
        throw new PdError(`ValueError: invalid literal for int() with base 10: np.str_('${bad}')`)
      }
      const nums = k.items as number[]
      if (nums.some((v) => v < -n || v >= n)) throw new PdError('IndexError: positional indexers are out-of-bounds')
      return nums.map((v) => (v < 0 ? n + v : v))
    }
    case 'slice': {
      for (const b of [k.start, k.stop]) {
        if (typeof b === 'string') throw new PdError(`TypeError: cannot do positional indexing on ${isRange ? 'RangeIndex' : 'Index'} with these indexers [${b}] of type str`)
      }
      if (k.step !== undefined && typeof k.step !== 'number') throw new PdError('TypeError: slice step must be a whole number')
      const step = (k.step as number | undefined) ?? 1
      if (step <= 0) throw new Error('This demo only does positive steps.')
      return posSlice(n, k.start as number | undefined, k.stop as number | undefined, step)
    }
  }
}

const isScalar = (k?: Key) => k?.kind === 'scalar'

export function evaluate(src: string, f: Frame): Outcome {
  let e: Expr
  try {
    e = parse(src)
  } catch (err) {
    return { ok: false, error: (err as Error).message, parse: true }
  }
  try {
    const nRows = f.index.length
    const nCols = f.columns.length
    const allRows = rangeOf(nRows, 0, nRows, 1)
    if (e.acc === 'attr') {
      const j = f.columns.indexOf(e.name)
      if (j >= 0) return { ok: true, acc: 'attr', rows: allRows, cols: [j], kind: 'series' }
      if (['shape', 'index', 'columns', 'dtypes', 'values'].includes(e.name)) throw new Error(`df.${e.name} works, but it is information about the table rather than a block of cells, so there is nothing to highlight.`)
      throw new PdError(`AttributeError: 'DataFrame' object has no attribute '${e.name}'`)
    }
    if (e.acc === 'get') {
      const k = e.key
      if (k.kind === 'scalar') {
        const j = typeof k.v === 'string' ? f.columns.indexOf(k.v) : -1
        if (j < 0) throw keyError(k.v)
        return { ok: true, acc: 'get', rows: allRows, cols: [j], kind: 'series' }
      }
      if (k.kind === 'list') {
        const cols = locAxis(k, f.columns, 'columns', false, false)
        return { ok: true, acc: 'get', rows: allRows, cols, kind: 'frame' }
      }
      throw new Error('df[a:b] slices rows by position. It works, but it is easy to misread: use df.iloc[a:b] instead.')
    }
    const two = e.col !== undefined
    let rows: number[]
    let cols: number[]
    if (e.acc === 'iloc') {
      const rk = e.row
      const ck = e.col
      if (rk.kind === 'scalar' && ck?.kind === 'scalar' && typeof rk.v === 'number' && typeof ck.v === 'number') {
        // df.iloc[r, c] with two numbers takes a fast path in pandas with its own message
        if (ck.v < -nCols || ck.v >= nCols) throw new PdError(`IndexError: index ${ck.v} is out of bounds for axis 0 with size ${nCols}`)
        if (rk.v < -nRows || rk.v >= nRows) throw new PdError(`IndexError: index ${rk.v} is out of bounds for axis 0 with size ${nRows}`)
      }
      rows = ilocAxis(rk, nRows, two, f.range)
      cols = ck === undefined ? rangeOf(nCols, 0, nCols, 1) : ilocAxis(ck, nCols, two, false)
    } else {
      // when both keys are bad, pandas reports the column key first except in these two cases
      const rowFirst = (e.row.kind === 'scalar' && e.col !== undefined && e.col.kind !== 'scalar') || (e.row.kind === 'list' && e.col?.kind === 'list')
      const getCols = () => (e.col === undefined ? rangeOf(nCols, 0, nCols, 1) : locAxis(e.col, f.columns, 'columns', false, false))
      const getRows = () => locAxis(e.row, f.index, 'index', f.monotonic, f.range)
      if (rowFirst) {
        rows = getRows()
        cols = getCols()
      } else {
        cols = getCols()
        rows = getRows()
      }
    }
    const sr = isScalar(e.row)
    const sc = e.col === undefined ? false : isScalar(e.col)
    const kind = sr && sc ? 'scalar' : sr || sc ? 'series' : 'frame'
    return { ok: true, acc: e.acc, rows, cols, kind }
  } catch (err) {
    if (err instanceof PdError) return { ok: false, error: err.message }
    return { ok: false, error: (err as Error).message, parse: true }
  }
}

/** The same expression with loc and iloc swapped, or null if it has neither. */
export function twinOf(src: string): string | null {
  if (/\.iloc\s*\[/.test(src)) return src.replace(/\.iloc(\s*\[)/, '.loc$1')
  if (/\.loc\s*\[/.test(src)) return src.replace(/\.loc(\s*\[)/, '.iloc$1')
  return null
}
