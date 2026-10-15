/*
  A tiny model of how PyTorch stores a tensor: one flat strip of memory (the "storage") plus a
  shape and strides that say how to read it. The shape-surgery lab runs every operation through
  this model, so permute/transpose really do change only the strides, view really does refuse a
  non-contiguous layout, and reshape really does copy when it has to (same rules as ATen).
*/

export interface TState {
  shape: number[]
  strides: number[]
  /** storage[p] = id of the element held at memory position p */
  storage: number[]
  /** a short name for each axis (H, W, C, 1, C·H·W, ...) */
  names: string[]
  /** stable id per axis, so the shape chips can animate when axes move */
  axisIds: number[]
}

let nextAxisId = 1000
export const freshAxisId = () => nextAxisId++

export const prod = (xs: number[]) => xs.reduce((a, b) => a * b, 1)

export function contiguousStrides(shape: number[]): number[] {
  const st = new Array(shape.length).fill(1)
  for (let i = shape.length - 2; i >= 0; i--) st[i] = st[i + 1] * shape[i + 1]
  return st
}

/** PyTorch's is_contiguous(): size-1 axes are ignored. */
export function isContiguous(shape: number[], strides: number[]): boolean {
  let expected = 1
  for (let i = shape.length - 1; i >= 0; i--) {
    if (shape[i] === 1) continue
    if (strides[i] !== expected) return false
    expected *= shape[i]
  }
  return true
}

/** ATen's computeStride: the strides a view would need, or null if no view is possible. */
export function computeViewStrides(oldshape: number[], oldstride: number[], newshape: number[]): number[] | null {
  if (oldshape.length === 0) return newshape.map(() => 1)
  const newstride = new Array(newshape.length).fill(0)
  let viewD = newshape.length - 1
  let chunkBase = oldstride[oldstride.length - 1]
  let tensorNumel = 1
  let viewNumel = 1
  for (let td = oldshape.length - 1; td >= 0; td--) {
    tensorNumel *= oldshape[td]
    if (td === 0 || (oldshape[td - 1] !== 1 && oldstride[td - 1] !== tensorNumel * chunkBase)) {
      while (viewD >= 0 && (viewNumel < tensorNumel || newshape[viewD] === 1)) {
        newstride[viewD] = viewNumel * chunkBase
        viewNumel *= newshape[viewD]
        viewD--
      }
      if (viewNumel !== tensorNumel) return null
      if (td > 0) {
        chunkBase = oldstride[td - 1]
        tensorNumel = 1
        viewNumel = 1
      }
    }
  }
  if (viewD !== -1) return null
  return newstride
}

/** memory position of the element at logical (row-major) index k */
export function storagePos(t: TState, k: number): number {
  let p = 0
  let rem = k
  for (let i = t.shape.length - 1; i >= 0; i--) {
    const idx = rem % t.shape[i]
    rem = Math.floor(rem / t.shape[i])
    p += idx * t.strides[i]
  }
  return p
}

/** copy into a fresh, contiguous strip in logical order (what .contiguous() and a copying reshape do) */
export function materialise(t: TState): TState {
  const n = prod(t.shape)
  const storage = Array.from({ length: n }, (_, k) => t.storage[storagePos(t, k)])
  return { ...t, storage, strides: contiguousStrides(t.shape) }
}

/** Replace a single -1 by the inferred length (sizes in this lab always divide evenly). */
export function inferShape(target: number[], numel: number): number[] | string {
  const unknown = target.filter((d) => d === -1).length
  if (unknown > 1) return 'RuntimeError: only one dimension can be inferred'
  const known = prod(target.filter((d) => d !== -1))
  if (unknown === 1) {
    if (numel % known !== 0) return `RuntimeError: shape '[${target.join(', ')}]' is invalid for input of size ${numel}`
    return target.map((d) => (d === -1 ? numel / known : d))
  }
  if (known !== numel) return `RuntimeError: shape '[${target.join(', ')}]' is invalid for input of size ${numel}`
  return target
}

/** Names for a view/reshape result: merge the names of the old axes that combine into each new axis. */
export function mergedNames(oldShape: number[], oldNames: string[], newShape: number[]): string[] {
  const old = oldShape.map((s, i) => ({ s, n: oldNames[i] })).filter((o) => o.s !== 1)
  let i = 0
  let broken = false
  return newShape.map((s) => {
    if (s === 1) return '1'
    if (broken) return '?'
    let p = 1
    const parts: string[] = []
    while (i < old.length && p < s) {
      p *= old[i].s
      parts.push(old[i].n)
      i++
    }
    if (p !== s) {
      broken = true
      return '?'
    }
    return parts.join('·')
  })
}

export const VIEW_ERROR =
  "RuntimeError: view size is not compatible with input tensor's size and stride (at least one dimension spans across two contiguous subspaces). Use .reshape(...) instead."

export type Op = 'unsqueeze' | 'squeeze' | 'permute' | 'transpose' | 'flatten' | 'view' | 'reshape' | 'contiguous'

export interface OpArg {
  /** text shown inside the brackets, e.g. "2, 0, 1" */
  label: string
  dims: number[]
}

export interface OpResult {
  state?: TState
  error?: string
  note?: string
}

const shapeArgs: number[][] = [[-1], [1, -1], [3, -1], [-1, 3], [4, 5, 3], [3, 4, 5], [1, 3, 4, 5]]

function permutations(n: number): number[][] {
  if (n === 1) return [[0]]
  const out: number[][] = []
  const rec = (pre: number[], rest: number[]) => {
    if (!rest.length) out.push(pre)
    rest.forEach((r, i) => rec([...pre, r], [...rest.slice(0, i), ...rest.slice(i + 1)]))
  }
  rec([], Array.from({ length: n }, (_, i) => i))
  return out
}

const PERM4: number[][] = [
  [0, 3, 1, 2],
  [0, 2, 3, 1],
  [0, 1, 3, 2],
  [1, 0, 2, 3],
  [0, 2, 1, 3],
]

/** argument choices the lab offers for an operation on a tensor of this shape */
export function argChoices(op: Op, shape: number[]): OpArg[] {
  const n = shape.length
  const idx = Array.from({ length: n }, (_, i) => i)
  switch (op) {
    case 'unsqueeze':
      return n >= 4 ? [] : Array.from({ length: n + 1 }, (_, i) => ({ label: String(i), dims: [i] }))
    case 'squeeze':
      return [{ label: '', dims: [] }, ...idx.map((i) => ({ label: String(i), dims: [i] }))]
    case 'permute': {
      const ps = n === 4 ? PERM4 : permutations(n).filter((p) => p.some((v, i) => v !== i))
      return ps.map((p) => ({ label: p.join(', '), dims: p }))
    }
    case 'transpose': {
      const out: OpArg[] = []
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) out.push({ label: `${a}, ${b}`, dims: [a, b] })
      return out
    }
    case 'flatten':
      return [{ label: '', dims: [0] }, ...(n >= 3 ? [{ label: '1', dims: [1] }] : []), ...(n >= 4 ? [{ label: '2', dims: [2] }] : [])]
    case 'view':
    case 'reshape':
      return shapeArgs.map((d) => ({ label: d.join(', '), dims: d }))
    case 'contiguous':
      return [{ label: '', dims: [] }]
  }
}

function viewLike(t: TState, target: number[], copyIfNeeded: boolean, opName = 'reshape'): OpResult {
  const n = prod(t.shape)
  const shape = inferShape(target, n)
  if (typeof shape === 'string') return { error: shape }
  const st = computeViewStrides(t.shape, t.strides, shape)
  const names = mergedNames(t.shape, t.names, shape)
  const axisIds = shape.map(() => freshAxisId())
  if (st) {
    const note = isContiguous(t.shape, t.strides)
      ? undefined
      : `x is not contiguous, but the axes this ${opName} splits, keeps or merges are still evenly spaced in memory, so it can relabel the strip without copying.`
    return { state: { ...t, shape, strides: st, names, axisIds }, note }
  }
  if (!copyIfNeeded) return { error: VIEW_ERROR }
  const m = materialise(t)
  return { state: { ...m, shape, strides: contiguousStrides(shape), names, axisIds }, note: `The numbers were not stored in reading order, so ${opName} could not just relabel the memory: it quietly made a contiguous copy first.` }
}

export function applyOp(t: TState, op: Op, dims: number[]): OpResult {
  const n = t.shape.length
  switch (op) {
    case 'unsqueeze': {
      const d = dims[0]
      const ns = d >= n ? 1 : t.shape[d] * t.strides[d]
      return {
        state: {
          ...t,
          shape: [...t.shape.slice(0, d), 1, ...t.shape.slice(d)],
          strides: [...t.strides.slice(0, d), ns, ...t.strides.slice(d)],
          names: [...t.names.slice(0, d), '1', ...t.names.slice(d)],
          axisIds: [...t.axisIds.slice(0, d), freshAxisId(), ...t.axisIds.slice(d)],
        },
      }
    }
    case 'squeeze': {
      const keep = t.shape.map((s, i) => (dims.length ? !(i === dims[0] && s === 1) : s !== 1))
      if (keep.every(Boolean))
        return { state: t, note: dims.length ? `Axis ${dims[0]} has size ${t.shape[dims[0]]}, not 1, so squeeze(${dims[0]}) changes nothing (and raises no error).` : 'There are no size-1 axes, so squeeze() changes nothing.' }
      const pick = <T,>(xs: T[]) => xs.filter((_, i) => keep[i])
      if (pick(t.shape).length === 0) return { state: t }
      return { state: { ...t, shape: pick(t.shape), strides: pick(t.strides), names: pick(t.names), axisIds: pick(t.axisIds) } }
    }
    case 'permute':
      return { state: { ...t, shape: dims.map((d) => t.shape[d]), strides: dims.map((d) => t.strides[d]), names: dims.map((d) => t.names[d]), axisIds: dims.map((d) => t.axisIds[d]) } }
    case 'transpose': {
      const [a, b] = dims
      const order = t.shape.map((_, i) => (i === a ? b : i === b ? a : i))
      return applyOp(t, 'permute', order)
    }
    case 'flatten': {
      const s = dims[0]
      if (n <= 1) return { state: t }
      const target = [...t.shape.slice(0, s), prod(t.shape.slice(s))]
      const r = viewLike(t, target, true, 'flatten')
      if (r.state) r.state = { ...r.state, names: [...t.names.slice(0, s), t.names.slice(s).filter((x) => x !== '1').join('·') || '1'], axisIds: [...t.axisIds.slice(0, s), freshAxisId()] }
      return r
    }
    case 'view':
      return viewLike(t, dims, false, 'view')
    case 'reshape':
      return viewLike(t, dims, true)
    case 'contiguous': {
      if (isContiguous(t.shape, t.strides)) return { state: t, note: 'Already contiguous, so .contiguous() returns the same tensor without copying.' }
      return { state: materialise(t), note: '.contiguous() copied the numbers into a new strip of memory in reading order.' }
    }
  }
}

export function callText(op: Op, label: string): string {
  return `.${op}(${label})`
}

export const shapeText = (s: number[]) => `(${s.join(', ')}${s.length === 1 ? ',' : ''})`
