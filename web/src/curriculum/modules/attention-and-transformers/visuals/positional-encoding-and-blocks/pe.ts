/* Maths and colour helpers shared by the positional-encoding-and-blocks visuals. */
import { useEffect, useState } from 'react'
import { mulberry32 } from '../../../../../kit'

export type Mat = number[][]

/* ---------------- maths ---------------- */

export type PeVariant = 'correct' | 'samefreq' | 'multiply'

/** The denominator 10000^(2i/d) shared by dimensions 2i and 2i+1. */
export const peDenominator = (i: number, d: number) => Math.pow(10000, (2 * i) / d)

/** The angle fed to sin/cos for one position and one dimension, for the correct formula or a buggy one. */
export function peAngle(pos: number, dim: number, d: number, variant: PeVariant = 'correct') {
  const i = Math.floor(dim / 2)
  if (variant === 'samefreq') return pos // forgot the 10000^(2i/d) term: every pair uses sin(pos), cos(pos)
  if (variant === 'multiply') return pos * peDenominator(i, d) // multiplied instead of divided
  return pos / peDenominator(i, d)
}

/** Sinusoidal positional encoding value PE(pos, dim). Even dims use sin, odd dims use cos. */
export function peValue(pos: number, dim: number, d: number, variant: PeVariant = 'correct') {
  const a = peAngle(pos, dim, d, variant)
  return dim % 2 === 0 ? Math.sin(a) : Math.cos(a)
}

/** The full (T × d) positional-encoding table. */
export function peTable(T: number, d: number, variant: PeVariant = 'correct'): Mat {
  return Array.from({ length: T }, (_, p) => Array.from({ length: d }, (_, j) => peValue(p, j, d, variant)))
}

export function softmax(row: number[]): number[] {
  const m = Math.max(...row)
  const e = row.map((v) => Math.exp(v - m))
  const z = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / z)
}

export function matmul(a: Mat, b: Mat): Mat {
  return a.map((row) => b[0].map((_, j) => row.reduce((s, v, t) => s + v * b[t][j], 0)))
}

export const transpose = (a: Mat): Mat => a[0].map((_, j) => a.map((row) => row[j]))

/** One head of scaled dot-product self-attention on the rows of X. */
export function selfAttention(X: Mat, Wq: Mat, Wk: Mat, Wv: Mat) {
  const Q = matmul(X, Wq)
  const K = matmul(X, Wk)
  const V = matmul(X, Wv)
  const dk = Q[0].length
  const weights = matmul(Q, transpose(K)).map((row) => softmax(row.map((v) => v / Math.sqrt(dk))))
  return { weights, out: matmul(weights, V) }
}

/** Deterministic matrix of roughly standard-normal numbers. */
export function randMat(rows: number, cols: number, seed: number, scale = 1): Mat {
  const rng = mulberry32(seed)
  const g = () => (rng() + rng() + rng() + rng() - 2) * Math.sqrt(3)
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => g() * scale))
}

export const dist = (a: number[], b: number[]) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))

/** 1,048,576-style thousands separators. */
export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-GB')

/** Short human sizes: 4.2 MB, 268.4 MB, 38.7 GB. */
export function fmtBytes(b: number) {
  if (b >= 1e9) return `${(b / 1e9).toFixed(1)} GB`
  if (b >= 1e6) return `${(b / 1e6).toFixed(1)} MB`
  if (b >= 1e3) return `${(b / 1e3).toFixed(1)} kB`
  return `${b} B`
}

/* ---------------- colours ---------------- */

/** Diverging tint for SVG/HTML: blue for negative, orange for positive, surface for 0. */
export const divColour = (v: number, max = 1) => {
  const t = Math.min(1, Math.abs(v) / max)
  return `color-mix(in srgb, ${v < 0 ? 'var(--viz-1)' : 'var(--viz-2)'} ${Math.round(t * 85)}%, var(--surface))`
}

export type RGB = [number, number, number]

export function parseColour(s: string): RGB {
  const t = s.trim()
  if (t.startsWith('#')) {
    const h = t.slice(1)
    if (h.length === 3) return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const m = t.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)
    return [p[0] || 0, p[1] || 0, p[2] || 0]
  }
  return [128, 128, 128]
}

/** a·t + b·(1 − t) */
export const mixRGB = (a: RGB, b: RGB, t: number): RGB => [a[0] * t + b[0] * (1 - t), a[1] * t + b[1] * (1 - t), a[2] * t + b[2] * (1 - t)]

export const rgbCss = (c: RGB) => `rgb(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])})`

export interface CanvasTheme {
  neg: RGB
  pos: RGB
  surface: RGB
  ink: RGB
  accent: RGB
  seq: RGB
}

const FALLBACK: CanvasTheme = { neg: [58, 67, 209], pos: [224, 117, 45], surface: [255, 255, 255], ink: [23, 32, 58], accent: [58, 67, 209], seq: [15, 155, 116] }

/**
 * Canvas cannot read CSS variables, so canvas visuals resolve the theme tokens to RGB here
 * and re-read them whenever the light/dark theme changes.
 */
export function useCanvasTheme(): CanvasTheme {
  const [theme, setTheme] = useState<CanvasTheme>(FALLBACK)
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement)
      const get = (n: string, fb: RGB) => {
        const v = cs.getPropertyValue(n)
        return v ? parseColour(v) : fb
      }
      setTheme({
        neg: get('--viz-1', FALLBACK.neg),
        pos: get('--viz-2', FALLBACK.pos),
        surface: get('--surface', FALLBACK.surface),
        ink: get('--viz-ink', FALLBACK.ink),
        accent: get('--accent', FALLBACK.accent),
        seq: get('--viz-3', FALLBACK.seq),
      })
    }
    read()
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    mq?.addEventListener?.('change', read)
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] })
    return () => {
      mq?.removeEventListener?.('change', read)
      mo.disconnect()
    }
  }, [])
  return theme
}

/** Sequential colour for canvas: t in [0, 1] from the surface to the full --viz-3 colour. */
export const seqRGB = (th: CanvasTheme, t: number) => rgbCss(mixRGB(th.seq, th.surface, 0.04 + 0.92 * Math.max(0, Math.min(1, t))))

/** Diverging colour for canvas: value in [-1, 1]. */
export const divRGB = (th: CanvasTheme, v: number) => {
  const t = Math.min(1, Math.abs(v))
  return rgbCss(mixRGB(v < 0 ? th.neg : th.pos, th.surface, 0.06 + 0.9 * t))
}
