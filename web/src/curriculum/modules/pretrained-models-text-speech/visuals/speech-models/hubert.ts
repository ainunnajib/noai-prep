/*
  The numbers behind HuBERTMaskedUnits: synthetic speech cut into 20 ms frames, two features per frame,
  k-means hidden units, and a toy context model that guesses a masked frame's unit from the nearest
  visible frames. Kept separate from the component so the loss trend can be checked outside React.
*/
import { fft, hann } from '../audio-as-data/dsp'
import { SR, kmeans, type Seg } from './speech'

export const FRAME_S = 0.02
export const N_FR = 30
export const FS = Math.round(FRAME_S * SR) // 320 samples per frame
const A: [number, number, number] = [730, 1090, 2440]
const I: [number, number, number] = [270, 2290, 3010]
const U: [number, number, number] = [300, 870, 2240]
const NAS: [number, number, number] = [250, 1000, 2200]
export const SEGS: Seg[] = [
  { kind: 'sil', dur: 0.04, f: A, word: -1 },
  { kind: 'fric', dur: 0.08, f: A, word: 0 },
  { kind: 'vowel', dur: 0.12, f: A, word: 0 },
  { kind: 'nasal', dur: 0.06, f: NAS, word: 0 },
  { kind: 'vowel', dur: 0.1, f: I, word: 0 },
  { kind: 'stop', dur: 0.04, f: A, word: 0 },
  { kind: 'vowel', dur: 0.1, f: U, word: 0 },
  { kind: 'sil', dur: 0.06, f: A, word: -1 },
]
/** Loudness (dB) and brightness (spectral centre, kHz) of every 20 ms frame. */
export function frameFeatures(x: Float64Array): [number, number][] {
  const w = hann(FS)
  const out: [number, number][] = []
  for (let k = 0; k < N_FR; k++) {
    const re = new Float64Array(512)
    const im = new Float64Array(512)
    for (let i = 0; i < FS; i++) re[i] = (x[k * FS + i] ?? 0) * w[i]
    fft(re, im)
    let pw = 0
    let fw = 0
    for (let b = 0; b <= 256; b++) {
      const p = re[b] * re[b] + im[b] * im[b]
      pw += p
      fw += p * ((b * SR) / 512)
    }
    out.push([fw / pw / 1000, 10 * Math.log10(pw + 1e-12)])
  }
  return out
}

/** Toy context model: a masked frame probably shares the unit of its nearest visible neighbours, less so the further away they are. */
export function predict(t: number, units: number[], masked: boolean[], k: number) {
  let l = t - 1
  while (l >= 0 && masked[l]) l--
  let r = t + 1
  while (r < units.length && masked[r]) r++
  const score = new Array(k).fill(0)
  if (l >= 0) score[units[l]] += 3.2 * Math.exp(-(t - l - 1) / 2.2)
  if (r < units.length) score[units[r]] += 3.2 * Math.exp(-(r - t - 1) / 2.2)
  const e = score.map((v) => Math.exp(v))
  const z = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / z)
}


/** Cluster the frames: features are [log2(brightness in kHz), loudness in dB], standardised before k-means. */
export function clusterFrames(feats: [number, number][], k: number) {
  const m = [0, 1].map((d) => feats.reduce((a, f) => a + f[d], 0) / feats.length)
  const sd = [0, 1].map((d) => Math.sqrt(feats.reduce((a, f) => a + (f[d] - m[d]) ** 2, 0) / feats.length) || 1)
  const z = feats.map((f) => [(f[0] - m[0]) / sd[0], (f[1] - m[1]) / sd[1]] as [number, number])
  const res = kmeans(z, k, 11)
  return { labels: res.labels, centroids: res.centroids.map((c) => [c[0] * sd[0] + m[0], c[1] * sd[1] + m[1]] as [number, number]) }
}

/** Average cross-entropy over the masked frames when frames start .. start+len-1 are hidden. */
export function spanLoss(units: number[], k: number, start: number, len: number) {
  const end = Math.min(units.length, start + len)
  const masked = units.map((_, i) => i >= start && i < end)
  let sum = 0
  for (let t = start; t < end; t++) sum += -Math.log(predict(t, units, masked, k)[units[t]])
  return sum / (end - start)
}

/** spanLoss averaged over every start where the whole span fits: the trend for a given span length. */
export function meanSpanLoss(units: number[], k: number, len: number) {
  let sum = 0
  let n = 0
  for (let s = 0; s + len <= units.length; s++, n++) sum += spanLoss(units, k, s, len)
  return sum / n
}
