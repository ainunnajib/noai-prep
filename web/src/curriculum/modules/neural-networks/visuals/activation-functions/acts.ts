/*
  The activation functions and their derivatives, shared by the activation-function visuals.
  GELU uses the exact definition z·Φ(z), with erf from Abramowitz & Stegun 7.1.26 (error < 1.5e-7).
*/

export type ActName = 'sigmoid' | 'tanh' | 'relu' | 'leaky' | 'gelu'

/** Leaky ReLU slope used in the gallery: exaggerated so it is visible (PyTorch's default is 0.01). */
export const GALLERY_ALPHA = 0.1

export function erf(x: number) {
  const s = x < 0 ? -1 : 1
  const a = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * a)
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)
  return s * y
}

const Phi = (z: number) => 0.5 * (1 + erf(z / Math.SQRT2))
const phi = (z: number) => Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI)
export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))

export interface ActInfo {
  label: string
  f: (z: number) => number
  /** derivative; at a kink (z = 0 for ReLU-type) returns the value frameworks use (the left slope) */
  df: (z: number) => number
  fTex: string
  dfTex: string
  range: string
  /** y-values the function approaches but never reaches (drawn as dashed lines) */
  asymptotes: number[]
  kink: boolean
  note: string
  /** y-range for plotting f */
  yr: [number, number]
}

export const ACTS: Record<ActName, ActInfo> = {
  sigmoid: {
    label: 'sigmoid',
    f: sigmoid,
    df: (z) => sigmoid(z) * (1 - sigmoid(z)),
    fTex: '\\sigma(z) = \\dfrac{1}{1 + e^{-z}}',
    dfTex: "\\sigma'(z) = \\sigma(z)\\,(1 - \\sigma(z))",
    range: '(0, 1)',
    asymptotes: [0, 1],
    kink: false,
    yr: [-0.5, 1.5],
    note: 'Squashes any input into (0, 1). Steepest at z = 0, where the slope is only 0.25; flat (saturated) at both ends.',
  },
  tanh: {
    label: 'tanh',
    f: Math.tanh,
    df: (z) => 1 - Math.tanh(z) ** 2,
    fTex: '\\tanh(z) = \\dfrac{e^{z} - e^{-z}}{e^{z} + e^{-z}}',
    dfTex: "\\tanh'(z) = 1 - \\tanh^2(z)",
    range: '(−1, 1)',
    asymptotes: [-1, 1],
    kink: false,
    yr: [-1.5, 1.5],
    note: 'An S-curve like the sigmoid but centred on 0, with slope 1 at z = 0. Still saturates at both ends.',
  },
  relu: {
    label: 'ReLU',
    f: (z) => Math.max(0, z),
    df: (z) => (z > 0 ? 1 : 0),
    fTex: '\\text{ReLU}(z) = \\max(0, z)',
    dfTex: "\\text{ReLU}'(z) = \\begin{cases} 1 & z > 0 \\\\ 0 & z < 0 \\end{cases}",
    range: '[0, ∞)',
    asymptotes: [],
    kink: true,
    yr: [-1.5, 5.25],
    note: 'Passes positive inputs straight through (slope exactly 1, never saturates) and zeroes negative ones (slope exactly 0). Very cheap to compute.',
  },
  leaky: {
    label: 'Leaky ReLU',
    f: (z) => (z > 0 ? z : GALLERY_ALPHA * z),
    df: (z) => (z > 0 ? 1 : GALLERY_ALPHA),
    fTex: '\\text{LeakyReLU}(z) = \\begin{cases} z & z > 0 \\\\ \\alpha z & z \\le 0 \\end{cases}',
    dfTex: "\\text{slope} = 1 \\text{ or } \\alpha",
    range: '(−∞, ∞)',
    asymptotes: [],
    kink: true,
    yr: [-1.5, 5.25],
    note: 'Like ReLU, but negative inputs keep a small slope α, so some gradient always gets through. Drawn here with α = 0.1 so you can see it; the usual default is 0.01.',
  },
  gelu: {
    label: 'GELU',
    f: (z) => z * Phi(z),
    df: (z) => Phi(z) + z * phi(z),
    fTex: '\\text{GELU}(z) = z\\,\\Phi(z)',
    dfTex: "\\text{GELU}'(z) = \\Phi(z) + z\\,\\varphi(z)",
    range: '≈ [−0.17, ∞)',
    asymptotes: [],
    kink: false,
    yr: [-1.5, 5.25],
    note: 'A smooth version of ReLU: Φ(z) is the chance that a standard normal value is below z. Used in Transformers such as BERT and GPT.',
  },
}

/** Intervals of [lo, hi] where |f'(z)| < thr, found by sampling. */
export function flatZones(df: (z: number) => number, lo: number, hi: number, thr = 0.05): [number, number][] {
  const out: [number, number][] = []
  const n = 400
  let start: number | null = null
  for (let i = 0; i <= n; i++) {
    const z = lo + ((hi - lo) * i) / n
    const flat = Math.abs(df(z)) < thr
    if (flat && start === null) start = z
    if ((!flat || i === n) && start !== null) {
      out.push([start, flat ? z : z - (hi - lo) / n])
      start = null
    }
  }
  return out.filter(([a, b]) => b - a > 0.05)
}
