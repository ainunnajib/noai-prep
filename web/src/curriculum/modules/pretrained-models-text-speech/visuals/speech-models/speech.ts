/*
  Synthetic speech for the speech-models visuals: a tiny source-filter "voice" (harmonics shaped by
  vowel formants, hissy fricatives, stop bursts), Whisper-style log-mel features, and k-means.
  Nothing here is a real recording; it is generated so the pictures look and behave like speech.
*/
import { mulberry32, hashString } from '../../../../../kit'
import { applyFilterbank, melFilterbank, stftPower } from '../audio-as-data/dsp'

export const SR = 16000

export type SegKind = 'sil' | 'vowel' | 'fric' | 'nasal' | 'stop'
export interface Seg {
  kind: SegKind
  dur: number // seconds
  f: [number, number, number] // formants (Hz), used by vowels and nasals
  word: number // index of the word this segment belongs to (-1 for pauses)
}

// average adult formants (Hz) for a few vowels: a, i, u, e, o
const VOWELS: [number, number, number][] = [
  [730, 1090, 2440],
  [270, 2290, 3010],
  [300, 870, 2240],
  [530, 1840, 2480],
  [570, 840, 2410],
]
const NASAL: [number, number, number] = [250, 1000, 2200]

/** Turn words (with syllable counts) into a timeline of segments, deterministically from a seed. */
export function wordsToSegments(words: { text: string; syl: number }[], seed: string) {
  const rng = mulberry32(hashString(seed))
  const segs: Seg[] = [{ kind: 'sil', dur: 0.25, f: VOWELS[0], word: -1 }]
  const spans: [number, number][] = []
  let t = 0.25
  words.forEach((w, wi) => {
    const start = t
    for (let s = 0; s < w.syl; s++) {
      const r = rng()
      const ck: SegKind | null = r < 0.32 ? 'stop' : r < 0.58 ? 'fric' : r < 0.78 ? 'nasal' : null
      if (ck) {
        const d = ck === 'stop' ? 0.06 : ck === 'fric' ? 0.07 + rng() * 0.04 : 0.06
        segs.push({ kind: ck, dur: d, f: NASAL, word: wi })
        t += d
      }
      const d = 0.1 + rng() * 0.07
      segs.push({ kind: 'vowel', dur: d, f: VOWELS[Math.floor(rng() * VOWELS.length)], word: wi })
      t += d
    }
    spans.push([start, t])
    const gap = wi === words.length - 1 ? 0.35 : 0.04 + rng() * 0.05
    segs.push({ kind: 'sil', dur: gap, f: VOWELS[0], word: -1 })
    t += gap
  })
  return { segs, spans, duration: t }
}

/** Synthesise a waveform from segments: harmonics of a falling pitch, shaped by formants; noise for fricatives. */
export function synth(segs: Seg[], seed: string, sr = SR) {
  const rng = mulberry32(hashString(seed + '#noise'))
  const total = segs.reduce((a, s) => a + s.dur, 0)
  const n = Math.round(total * sr)
  const x = new Float64Array(n)
  // segment index for every sample
  const bounds: number[] = []
  let acc = 0
  for (const s of segs) {
    acc += s.dur
    bounds.push(acc)
  }
  let si = 0
  let phase = 0
  let prevNoise = 0
  let ampSeg = -1
  let amps = new Float64Array(0)
  const env = (f: number, F: [number, number, number]) => 1 / (1 + ((f - F[0]) / 90) ** 2) + 0.7 / (1 + ((f - F[1]) / 110) ** 2) + 0.35 / (1 + ((f - F[2]) / 150) ** 2)
  for (let i = 0; i < n; i++) {
    const t = i / sr
    while (si < segs.length - 1 && t >= bounds[si]) si++
    const seg = segs[si]
    const segStart = si ? bounds[si - 1] : 0
    const u = (t - segStart) / seg.dur // 0..1 within the segment
    const f0 = 185 - 55 * (t / total) + 12 * Math.sin(Math.PI * u)
    phase += (2 * Math.PI * f0) / sr
    const noise = rng() * 2 - 1
    let v = 0
    if (seg.kind === 'vowel' || seg.kind === 'nasal') {
      // open vowels (high F1, like 'a') are naturally louder than close ones ('i', 'u'); nasals are quieter still
      const amp = (seg.kind === 'vowel' ? 0.32 * Math.sqrt(seg.f[0] / 730) : 0.09) * Math.min(1, u / 0.15, (1 - u) / 0.15 + 0.25)
      // harmonic amplitudes follow the formants; refresh them every 5 ms (pitch moves slowly)
      if (ampSeg !== si || i % 80 === 0) {
        const hMax = Math.floor(4000 / f0)
        amps = Float64Array.from({ length: hMax }, (_, h) => env((h + 1) * f0, seg.f))
        ampSeg = si
      }
      let s = 0
      for (let h = 0; h < amps.length; h++) s += amps[h] * Math.sin((h + 1) * phase)
      v = amp * s * (seg.kind === 'nasal' ? 1 : 0.55)
    } else if (seg.kind === 'fric') {
      // differencing white noise tilts its spectrum towards high frequencies: a hissy "s"
      v = 0.06 * Math.min(1, u / 0.2, (1 - u) / 0.2) * (noise - prevNoise)
    } else if (seg.kind === 'stop') {
      // silence (the closure) then a short burst
      v = u > 0.7 ? 0.12 * (noise - 0.5 * prevNoise) * (1 - (u - 0.7) / 0.3) : 0
    }
    prevNoise = noise
    x[i] = v + 0.0015 * noise // a little room noise
  }
  return x
}

/**
 * Whisper-style log-mel: 25 ms Hann windows (400 samples) every 10 ms (160 samples), 80 mel bands up to 8 kHz,
 * log10 of the power, clamped to 8 (i.e. 80 dB) below the maximum. Returned scaled to [0, 1], shape [frames][80].
 */
export function logMel(x: Float64Array, nMels = 80) {
  const power = stftPower(x, 400, 160, 512)
  const fb = melFilterbank(nMels, 512, SR, SR / 2)
  const mel = applyFilterbank(power, fb)
  let mx = -Infinity
  const lg = mel.map((r) => Float64Array.from(r, (v) => Math.log10(v + 1e-10)))
  for (const r of lg) for (const v of r) if (v > mx) mx = v
  return lg.map((r) => Float64Array.from(r, (v) => (Math.max(v, mx - 8) - (mx - 8)) / 8))
}

/** Plain k-means (k-means++ start, fixed seed). Returns labels relabelled so cluster 0 has the smallest mean of feature 0. */
export function kmeans(points: [number, number][], k: number, seed = 3, iters = 30) {
  const rng = mulberry32(seed)
  const d2 = (a: [number, number], b: [number, number]) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
  const cents: [number, number][] = [points[Math.floor(rng() * points.length)]]
  while (cents.length < k) {
    const ds = points.map((p) => Math.min(...cents.map((c) => d2(p, c))))
    const tot = ds.reduce((a, b) => a + b, 0)
    let r = rng() * tot
    let idx = 0
    for (; idx < ds.length - 1; idx++) {
      r -= ds[idx]
      if (r <= 0) break
    }
    cents.push([...points[idx]] as [number, number])
  }
  let labels = points.map(() => 0)
  for (let it = 0; it < iters; it++) {
    labels = points.map((p) => {
      let best = 0
      let bd = Infinity
      cents.forEach((c, j) => {
        const d = d2(p, c)
        if (d < bd) {
          bd = d
          best = j
        }
      })
      return best
    })
    for (let j = 0; j < k; j++) {
      const mine = points.filter((_, i) => labels[i] === j)
      if (mine.length) cents[j] = [mine.reduce((a, p) => a + p[0], 0) / mine.length, mine.reduce((a, p) => a + p[1], 0) / mine.length]
    }
  }
  // stable colours: order clusters by their first coordinate
  const order = cents.map((c, j) => [c[0], j] as const).sort((a, b) => a[0] - b[0]).map(([, j]) => j)
  const remap = new Map(order.map((j, r) => [j, r]))
  return { labels: labels.map((l) => remap.get(l)!), centroids: order.map((j) => cents[j]) }
}
