/*
  The shape rule of torch.matmul (the @ operator) for operands with 2 or more dims, including the
  exact error messages PyTorch 2.x prints. Checked against real PyTorch on random shapes.
*/

export interface MatmulResult {
  shape?: number[]
  error?: string
  /** broadcast batch dims (empty for a plain 2-D product) */
  batch: number[]
  /** which batch position (in the broadcast batch) failed, counted from the left */
  badBatch?: number
  innerBad?: boolean
}

const prod = (xs: number[]) => xs.reduce((p, x) => p * x, 1)

export function matmulShape(a: number[], b: number[]): MatmulResult {
  const m = a[a.length - 2]
  const k1 = a[a.length - 1]
  const k2 = b[b.length - 2]
  const n = b[b.length - 1]
  if (b.length === 2) {
    // a 2-D right operand: PyTorch folds a's leading dims into the rows
    const rows = prod(a.slice(0, -1))
    if (k1 !== k2) return { error: `RuntimeError: mat1 and mat2 shapes cannot be multiplied (${rows}x${k1} and ${k2}x${n})`, batch: a.slice(0, -2), innerBad: true }
    return { shape: [...a.slice(0, -1), n], batch: a.slice(0, -2) }
  }
  const ba = a.slice(0, -2)
  const bb = b.slice(0, -2)
  const L = Math.max(ba.length, bb.length)
  const batch = new Array(L).fill(1)
  for (let i = L - 1; i >= 0; i--) {
    const x = ba[i - (L - ba.length)] ?? 1
    const y = bb[i - (L - bb.length)] ?? 1
    if (x !== y && x !== 1 && y !== 1)
      return { error: `RuntimeError: The size of tensor a (${x}) must match the size of tensor b (${y}) at non-singleton dimension ${i}`, batch: [], badBatch: i }
    batch[i] = Math.max(x, y)
  }
  if (k1 !== k2) {
    const P = prod(batch)
    return { error: `RuntimeError: Expected size for first two dimensions of batch2 tensor to be: [${P}, ${k1}] but got: [${P}, ${k2}].`, batch, innerBad: true }
  }
  return { shape: [...batch, m, n], batch }
}
