/*
  Learning-rate schedules used by the visuals in this lesson. Every visual computes its numbers from
  these formulas (the same ones the lesson teaches), so the read-outs are exact.
*/

export type Kind = 'constant' | 'step' | 'cosine' | 'warmcos' | 'onecycle'

export interface SchedParams {
  kind: Kind
  /** peak / starting learning rate */
  base: number
  /** total number of steps T */
  total: number
  /** warm-up steps W (warm-up + cosine; also used by the toy-model visual for any schedule) */
  warmup: number
  /** step decay: multiply by gamma every `every` steps */
  gamma: number
  every: number
  /** cosine schedules decay to this value */
  min: number
}

/** 1cycle constants: PyTorch OneCycleLR defaults */
export const ONECYCLE_PCT = 0.3
export const ONECYCLE_DIV = 25
export const ONECYCLE_FINAL_DIV = 1e4

export function lrAt(t: number, p: SchedParams): number {
  const { kind, base, total: T, warmup: W, gamma, every, min } = p
  switch (kind) {
    case 'constant':
      return base
    case 'step':
      return base * gamma ** Math.floor(t / every)
    case 'cosine':
      return min + 0.5 * (base - min) * (1 + Math.cos((Math.PI * t) / T))
    case 'warmcos':
      if (t < W) return (base * t) / W
      return min + 0.5 * (base - min) * (1 + Math.cos((Math.PI * (t - W)) / Math.max(1, T - W)))
    case 'onecycle': {
      // exactly as torch.optim.lr_scheduler.OneCycleLR (anneal_strategy='cos'): peak at step 0.3T - 1, end at step T - 1
      const start = base / ONECYCLE_DIV
      const end = start / ONECYCLE_FINAL_DIV
      const peak = Math.round(ONECYCLE_PCT * T) - 1
      const last = T - 1
      if (t <= peak) return base + (start - base) * 0.5 * (1 + Math.cos((Math.PI * t) / peak))
      const u = Math.min(1, (t - peak) / (last - peak))
      return end + (base - end) * 0.5 * (1 + Math.cos(Math.PI * u))
    }
  }
}

/** compact, exact-looking number: 0.00025, 0.0005, 1e-7 */
export function fmtLR(v: number): string {
  if (v === 0) return '0'
  const a = Math.abs(v)
  if (a < 1e-5) {
    const [m, e] = v.toExponential(2).split('e')
    return `${Number(m)}e${e}`
  }
  return String(Number(v.toPrecision(4)))
}

/** TeX version of fmtLR (scientific notation as a × 10^b) */
export function texLR(v: number): string {
  const s = fmtLR(v)
  if (!s.includes('e')) return s
  const [m, e] = s.split('e')
  return `${m} \\times 10^{${Number(e)}}`
}
