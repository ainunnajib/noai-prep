/*
  Small signal-processing toolkit shared by the audio visuals (audio-as-data and speech-models):
  FFT, short-time Fourier transform, mel filterbank, synthetic signals, and a canvas colour map
  that follows the site's light/dark theme tokens.
*/
import { useEffect, useState } from 'react'
import { mulberry32 } from '../../../../../kit'

/* ---------------- maths ---------------- */

/** In-place radix-2 FFT. re/im must have a power-of-two length. */
export function fft(re: Float64Array, im: Float64Array) {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      ;[re[i], re[j]] = [re[j], re[i]]
      ;[im[i], im[j]] = [im[j], im[i]]
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len
    const wr = Math.cos(ang)
    const wi = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let cr = 1
      let ci = 0
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci
        const ai = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr
        re[i + k + len / 2] = re[i + k] - ar
        im[i + k + len / 2] = im[i + k] - ai
        re[i + k] += ar
        im[i + k] += ai
        const t = cr * wr - ci * wi
        ci = cr * wi + ci * wr
        cr = t
      }
    }
  }
}

export const nextPow2 = (n: number) => 2 ** Math.ceil(Math.log2(Math.max(2, n)))

/** Hann window: fades each slice in and out so its edges do not create fake frequencies. */
export function hann(n: number) {
  const w = new Float64Array(n)
  for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / n)
  return w
}

/** Number of STFT frames with no padding: 1 + floor((N - W) / H). */
export const frameCount = (n: number, win: number, hop: number) => (n < win ? 0 : 1 + Math.floor((n - win) / hop))

/**
 * Short-time Fourier transform: returns power |X|^2 per frame, shape [frames][nfft/2 + 1].
 * The window is `win` samples long; it is zero-padded to `nfft` (a power of two) for the FFT.
 */
export function stftPower(x: Float64Array, win: number, hop: number, nfft = nextPow2(win)) {
  const w = hann(win)
  const frames = frameCount(x.length, win, hop)
  const bins = nfft / 2 + 1
  const out: Float64Array[] = []
  const re = new Float64Array(nfft)
  const im = new Float64Array(nfft)
  // scale so that a sine of amplitude A gives a peak magnitude close to A
  const norm = 2 / w.reduce((a, b) => a + b, 0)
  for (let f = 0; f < frames; f++) {
    re.fill(0)
    im.fill(0)
    const s = f * hop
    for (let i = 0; i < win; i++) re[i] = x[s + i] * w[i]
    fft(re, im)
    const p = new Float64Array(bins)
    for (let k = 0; k < bins; k++) {
      const m = Math.hypot(re[k], im[k]) * norm
      p[k] = m * m
    }
    out.push(p)
  }
  return out
}

/** The mel scale (HTK formula): equal steps in mel sound like equal steps in pitch. */
export const hzToMel = (f: number) => 2595 * Math.log10(1 + f / 700)
export const melToHz = (m: number) => 700 * (10 ** (m / 2595) - 1)

/**
 * Triangular mel filterbank: nMels filters spread evenly on the mel scale from 0 Hz to fmax.
 * Returns weights [nMels][bins] for an FFT of size nfft at sample rate sr.
 */
export function melFilterbank(nMels: number, nfft: number, sr: number, fmax = sr / 2) {
  const bins = nfft / 2 + 1
  const mMax = hzToMel(fmax)
  const edges = Array.from({ length: nMels + 2 }, (_, i) => melToHz((mMax * i) / (nMels + 1)))
  const binHz = (k: number) => (k * sr) / nfft
  return Array.from({ length: nMels }, (_, m) => {
    const [lo, mid, hi] = [edges[m], edges[m + 1], edges[m + 2]]
    const row = new Float64Array(bins)
    for (let k = 0; k < bins; k++) {
      const f = binHz(k)
      if (f > lo && f <= mid) row[k] = (f - lo) / (mid - lo)
      else if (f > mid && f < hi) row[k] = (hi - f) / (hi - mid)
    }
    return row
  })
}

/** Apply a filterbank to power spectra: [frames][bins] → [frames][nMels]. */
export function applyFilterbank(power: Float64Array[], fb: Float64Array[]) {
  return power.map((p) => {
    const out = new Float64Array(fb.length)
    for (let m = 0; m < fb.length; m++) {
      let s = 0
      const row = fb[m]
      for (let k = 0; k < row.length; k++) if (row[k]) s += row[k] * p[k]
      out[m] = s
    }
    return out
  })
}

/** Power → decibels, clipped to `range` dB below the loudest value, then scaled to [0, 1]. */
export function toUnitDb(mat: Float64Array[], range = 70) {
  let mx = 1e-20
  for (const r of mat) for (const v of r) if (v > mx) mx = v
  const top = 10 * Math.log10(mx)
  return mat.map((r) => Float64Array.from(r, (v) => Math.max(0, (10 * Math.log10(v + 1e-20) - (top - range)) / range)))
}

/** Magnitude (not power) scaled to [0, 1] by the loudest value: what you see without a log. */
export function toUnitLinear(mat: Float64Array[]) {
  let mx = 1e-20
  for (const r of mat) for (const v of r) if (v > mx) mx = v
  const s = Math.sqrt(mx)
  return mat.map((r) => Float64Array.from(r, (v) => Math.sqrt(v) / s))
}

/* ---------------- synthetic signals ---------------- */

/**
 * The lesson's demo clip: a chirp sweeping 300 → 3,500 Hz, a steady 1,000 Hz tone,
 * and a short click (a tap on the microphone) at 0.7 s. Sample rate sr, length `secs`.
 */
export function demoClip(sr = 8000, secs = 1) {
  const n = Math.round(sr * secs)
  const x = new Float64Array(n)
  const f0 = 300
  const f1 = 3500
  const rng = mulberry32(7)
  for (let i = 0; i < n; i++) {
    const t = i / sr
    const phase = 2 * Math.PI * (f0 * t + ((f1 - f0) / (2 * secs)) * t * t)
    const env = Math.min(1, t / 0.02, (secs - t) / 0.02)
    x[i] = 0.55 * env * Math.sin(phase) + 0.3 * env * Math.sin(2 * Math.PI * 1000 * t)
  }
  // click: 3 ms of decaying noise
  const c0 = Math.round(0.7 * sr)
  const cl = Math.round(0.003 * sr)
  for (let i = 0; i < cl; i++) x[c0 + i] += (rng() * 2 - 1) * 0.9 * Math.exp(-i / (cl / 3))
  return x
}

/* ---------------- canvas theme ---------------- */

export type RGB = [number, number, number]

export function parseColour(s: string): RGB | null {
  const t = s.trim()
  if (t.startsWith('#')) {
    const h = t.slice(1)
    if (h.length === 3) return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
    if (h.length >= 6) return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
    return null
  }
  const m = t.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)
    return [p[0] || 0, p[1] || 0, p[2] || 0]
  }
  return null
}

export const mixRGB = (a: RGB, b: RGB, t: number): RGB => [a[0] * t + b[0] * (1 - t), a[1] * t + b[1] * (1 - t), a[2] * t + b[2] * (1 - t)]
export const rgbCss = (c: RGB, alpha = 1) => (alpha >= 1 ? `rgb(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])})` : `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${alpha})`)

export interface AudioTheme {
  surface: RGB
  surface2: RGB
  ink: RGB
  ink2: RGB
  muted: RGB
  axis: RGB
  v1: RGB
  v2: RGB
  v3: RGB
  v4: RGB
  v5: RGB
  v6: RGB
  dark: boolean
}

const FALLBACK: AudioTheme = {
  surface: [255, 255, 255],
  surface2: [241, 244, 249],
  ink: [23, 32, 58],
  ink2: [68, 80, 109],
  muted: [152, 162, 184],
  axis: [92, 104, 132],
  v1: [58, 67, 209],
  v2: [224, 117, 45],
  v3: [15, 155, 116],
  v4: [194, 42, 114],
  v5: [123, 90, 224],
  v6: [138, 122, 18],
  dark: false,
}

/** Canvas cannot read CSS variables, so resolve the theme tokens to RGB and re-read them when the theme changes. */
export function useAudioTheme(): AudioTheme {
  const [theme, setTheme] = useState<AudioTheme>(FALLBACK)
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement)
      const get = (n: string, fb: RGB) => parseColour(cs.getPropertyValue(n)) ?? fb
      const surface = get('--surface', FALLBACK.surface)
      setTheme({
        surface,
        surface2: get('--surface-2', FALLBACK.surface2),
        ink: get('--viz-ink', FALLBACK.ink),
        ink2: get('--ink-2', FALLBACK.ink2),
        muted: get('--viz-muted', FALLBACK.muted),
        axis: get('--viz-axis', FALLBACK.axis),
        v1: get('--viz-1', FALLBACK.v1),
        v2: get('--viz-2', FALLBACK.v2),
        v3: get('--viz-3', FALLBACK.v3),
        v4: get('--viz-4', FALLBACK.v4),
        v5: get('--viz-5', FALLBACK.v5),
        v6: get('--viz-6', FALLBACK.v6),
        dark: surface[0] + surface[1] + surface[2] < 300,
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

/**
 * Sequential colour map for spectrograms: quiet = page surface, loud = --viz-1, loudest = ink.
 * Lightness changes monotonically in both themes, so "darker on light / brighter on dark" means louder.
 * Returns a 256-entry lookup table of RGB triples.
 */
export function spectroLUT(th: AudioTheme): RGB[] {
  return Array.from({ length: 256 }, (_, i) => {
    const t = i / 255
    if (t < 0.62) return mixRGB(th.v1, th.surface, 0.04 + (0.96 * t) / 0.62)
    return mixRGB(th.ink, th.v1, (t - 0.62) / 0.38)
  })
}

/** Paint a [cols][rows] matrix of values in [0, 1] (rows = frequency, drawn bottom-up) into an offscreen canvas. */
export function matrixToCanvas(mat: ArrayLike<number>[], lut: RGB[], alphaFrom?: (col: number) => number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null
  const cols = mat.length
  const rows = mat[0]?.length ?? 0
  if (!cols || !rows) return null
  const cv = document.createElement('canvas')
  cv.width = cols
  cv.height = rows
  const ctx = cv.getContext('2d')
  if (!ctx) return null
  const img = ctx.createImageData(cols, rows)
  for (let c = 0; c < cols; c++) {
    const a = alphaFrom ? alphaFrom(c) : 1
    for (let r = 0; r < rows; r++) {
      const v = Math.max(0, Math.min(1, mat[c][r]))
      const col = lut[Math.round(v * 255)]
      const idx = ((rows - 1 - r) * cols + c) * 4
      img.data[idx] = col[0]
      img.data[idx + 1] = col[1]
      img.data[idx + 2] = col[2]
      img.data[idx + 3] = Math.round(a * 255)
    }
  }
  ctx.putImageData(img, 0, 0)
  return cv
}

/** Set up a canvas for crisp drawing at the device pixel ratio; returns its 2-D context (or null in tests). */
export function prepCanvas(cv: HTMLCanvasElement | null, w: number, h: number) {
  if (!cv) return null
  const dpr = window.devicePixelRatio || 1
  cv.width = Math.round(w * dpr)
  cv.height = Math.round(h * dpr)
  const ctx = cv.getContext('2d')
  if (!ctx) return null
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  return ctx
}

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

/** 16000 → "16,000" */
export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-GB')
