import type { CSSProperties, ReactNode } from 'react'

/*
  Helpers shared by the autoencoder visuals.
  Images are scikit-learn's 8 x 8 handwritten digits (values 0..1), stored as base64 strings of 64 bytes.
*/

export const SIDE = 8

/** base64 string of 64 bytes (0..255) -> 64 numbers in [0, 1] */
export function decodeImg(b64: string): number[] {
  const bin = atob(b64)
  const out: number[] = new Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) / 255
  return out
}

/** base64 of little-endian float16 values -> Float32Array */
export function decodeF16(b64: string): Float32Array {
  const bin = atob(b64)
  const out = new Float32Array(bin.length / 2)
  for (let i = 0; i < out.length; i++) {
    const h = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8)
    const sign = h & 0x8000 ? -1 : 1
    const exp = (h >> 10) & 0x1f
    const frac = h & 0x3ff
    out[i] = exp === 0 ? sign * 2 ** -14 * (frac / 1024) : exp === 31 ? (frac ? NaN : sign * Infinity) : sign * 2 ** (exp - 15) * (1 + frac / 1024)
  }
  return out
}

/** a 2 -> 128 (ReLU) -> 64 (sigmoid) decoder, run in the browser */
export function makeDecoder(w: { W1: string; b1: string; W2: string; b2: string }): (z: [number, number]) => number[] {
  const W1 = decodeF16(w.W1)
  const b1 = decodeF16(w.b1)
  const W2 = decodeF16(w.W2)
  const b2 = decodeF16(w.b2)
  const Hn = b1.length
  const On = b2.length
  const h = new Float32Array(Hn)
  return ([z1, z2]) => {
    for (let i = 0; i < Hn; i++) h[i] = Math.max(0, W1[2 * i] * z1 + W1[2 * i + 1] * z2 + b1[i])
    const out: number[] = new Array(On)
    for (let o = 0; o < On; o++) {
      let s = b2[o]
      for (let i = 0; i < Hn; i++) s += W2[o * Hn + i] * h[i]
      out[o] = 1 / (1 + Math.exp(-s))
    }
    return out
  }
}

export function mse(a: number[], b: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2
  return s / a.length
}

/**
 * One 8 x 8 greyscale image drawn as SVG squares: ink colour with opacity = pixel value, so it reads as
 * dark ink on paper in light mode and light chalk on a board in dark mode.
 * tone 'error' draws a heat map of squared errors in the "negative" colour instead.
 */
export function DigitImg({
  px,
  size = 56,
  label,
  tone = 'ink',
  outline,
  style,
}: {
  px: number[]
  size?: number
  label: string
  tone?: 'ink' | 'error' | 'accent'
  outline?: string
  style?: CSSProperties
}) {
  const colour = tone === 'error' ? 'var(--viz-neg)' : tone === 'accent' ? 'var(--viz-5)' : 'var(--ink)'
  return (
    <svg
      viewBox={`0 0 ${SIDE} ${SIDE}`}
      width={size}
      height={size}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      style={{ display: 'block', background: 'var(--surface)', borderRadius: 3, outline: outline ?? '1px solid var(--rule)', outlineOffset: outline ? 1 : 0, flex: 'none', ...style }}
    >
      {px.map((v, i) => {
        // error maps use a square-root gain so small errors stay visible (on navy too) while big ones still look bigger
        const a = tone === 'error' ? Math.min(1, 1.6 * Math.sqrt(v)) : Math.min(1, v)
        return a > 0.02 ? <rect key={i} x={i % SIDE} y={Math.floor(i / SIDE)} width={1.02} height={1.02} style={{ fill: colour, fillOpacity: a }} /> : null
      })}
    </svg>
  )
}

/** a small caption under or beside an image */
export function Tiny({ children, strong, color }: { children: ReactNode; strong?: boolean; color?: string }) {
  return <span style={{ fontSize: '0.75rem', color: color ?? 'var(--ink-2)', fontWeight: strong ? 700 : 400, lineHeight: 1.2, textAlign: 'center' }} className="tabular">{children}</span>
}
