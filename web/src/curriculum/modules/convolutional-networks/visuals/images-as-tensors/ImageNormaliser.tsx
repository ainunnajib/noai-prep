import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Readout, Segmented, Plot, Axes, Path, VLine, Rect, Dots, Label } from '../../../../../kit'
import { PixelCanvas, rgbaFrom } from './pixels'
import { makeXray } from './images'
import s from './it.module.css'

/*
  Three synthetic chest X-rays that differ in density (A clear, C hazy and dense: a whitish haze
  that lifts the whole picture and lowers its contrast).
  Pick a normalisation; see the pictures, the pixel-value histograms, each image's mean
  ("density") and the signs of one first-layer neuron's weight gradients dL/dw_i = δ·x_i.
  Pictures are always displayed with ONE fixed grey scale per method, so a transform that
  treats every image the same way leaves them looking as they did.
*/

type Method = 'raw' | 'minmax' | 'dataset' | 'perimage'
const N = 36
const PATIENTS = [
  { name: 'A', note: 'clear lungs', density: 0.05, seed: 11, color: 'var(--viz-1)' },
  { name: 'B', note: 'some haze', density: 0.45, seed: 12, color: 'var(--viz-3)' },
  { name: 'C', note: 'fluid, dense', density: 0.9, seed: 13, color: 'var(--viz-2)' },
]
// 16 sample pixels (row, col) spread over the image, used for the gradient-sign panel
const SAMPLE: [number, number][] = Array.from({ length: 16 }, (_, k) => [4 + Math.floor(k / 4) * 9, 3 + (k % 4) * 9 + (Math.floor(k / 4) % 2) * 2])

const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length
const std = (a: number[]) => {
  const m = mean(a)
  return Math.sqrt(mean(a.map((v) => (v - m) ** 2)))
}

const AXIS: Record<Method, [number, number]> = {
  raw: [-45, 265],
  minmax: [-0.18, 1.04],
  dataset: [-2.8, 3.2],
  perimage: [-2.8, 3.2],
}

const fmtVal = (m: Method, v: number) => (m === 'raw' ? v.toFixed(0) : m === 'minmax' ? v.toFixed(2) : (Math.abs(v) < 0.005 ? 0 : v).toFixed(2))

export default function ImageNormaliser() {
  const [method, setMethod] = useState<Method>('minmax')
  const raw = useMemo(() => PATIENTS.map((p) => makeXray(N, p.density, p.seed).flat()), [])
  const all = useMemo(() => raw.flat(), [raw])
  const mu = useMemo(() => mean(all), [all])
  const sd = useMemo(() => std(all), [all])

  const transformed = useMemo(
    () =>
      raw.map((img) => {
        const mi = mean(img)
        const si = std(img)
        return img.map((v) => (method === 'raw' ? v : method === 'minmax' ? v / 255 : method === 'dataset' ? (v - mu) / sd : (v - mi) / si))
      }),
    [raw, method, mu, sd],
  )
  // one fixed display scale per method (its inverse dataset-wide map), so pictures are comparable
  const toGrey = (t: number) => (method === 'raw' ? t : method === 'minmax' ? t * 255 : t * sd + mu)
  const pics = useMemo(
    () =>
      transformed.map((img) =>
        rgbaFrom(N, N, (x, y) => {
          const g = Math.max(0, Math.min(255, Math.round(toGrey(img[y * N + x]))))
          return [g, g, g]
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transformed],
  )

  const [lo, hi] = AXIS[method]
  // a five-number summary per image: 5th, 25th, 75th, 95th percentiles
  const summaries = transformed.map((img) => {
    const a = img.slice().sort((p, q) => p - q)
    const q = (f: number) => a[Math.min(a.length - 1, Math.floor(f * a.length))]
    return { p5: q(0.05), p25: q(0.25), p75: q(0.75), p95: q(0.95) }
  })
  const rowY = [2.5, 1.5, 0.5]
  const means = transformed.map(mean)

  const sampleVals = SAMPLE.map(([r, c]) => transformed[1][r * N + c])
  const nPos = sampleVals.filter((v) => v > 0).length

  const notes: Record<Method, ReactNode> = {
    raw: (
      <>
        Raw bytes from 0 to 255: big numbers, and <b>all positive</b>. Every gradient of this neuron has the same sign, and large inputs make training unstable.
      </>
    ),
    minmax: (
      <>
        Divided by 255, so every value is in [0, 1]. Better scaled, but still <b>all positive</b>: for one training image, all of this neuron's weight
        gradients share one sign, so its weights can only all go up or all go down together.
      </>
    ),
    dataset: (
      <>
        Subtract the training set's mean ({(mu / 255).toFixed(2)}) and divide by its standard deviation ({(sd / 255).toFixed(2)}), both measured after ÷ 255.
        Inputs now <b>straddle zero</b>, gradient signs are mixed, and because every image got the same transform, C still looks hazier than A: the
        diagnostic difference survives.
      </>
    ),
    perimage: (
      <>
        Each image uses <b>its own</b> mean and standard deviation, so every image ends up with mean 0 and spread 1. The signs are mixed, but look at the
        pictures: the haze has gone and <b>C now looks almost exactly like A</b>. The density difference a doctor would use has been erased.
      </>
    ),
  }

  return (
    <Figure
      title="Raw pixels and three ways to normalise an X-ray"
      caption={
        <>
          <b>Try:</b> switch between raw pixels and the three normalisations. <b>Notice:</b> where the values sit compared with zero, whether A, B and C still look different,
          and the gradient signs. Only the dataset z-score gives both mixed signs and a visible difference.
        </>
      }
    >
      <Segmented
        label="Normalisation"
        value={method}
        onChange={setMethod}
        options={[
          { value: 'raw', label: 'Raw 0–255' },
          { value: 'minmax', label: 'Min-max ÷ 255' },
          { value: 'dataset', label: 'Dataset z-score' },
          { value: 'perimage', label: 'Per-image z-score' },
        ]}
      />
      <div className={s.row} style={{ flexWrap: 'nowrap', maxWidth: 480 }}>
        {PATIENTS.map((p, k) => (
          <div key={p.name} className={s.tile}>
            <PixelCanvas w={N} h={N} pixels={pics[k]} ariaLabel={`Patient ${p.name} X-ray (${p.note}) after ${method} normalisation`} />
            <span className={s.cap} style={{ color: p.color }}>
              {p.name}: {p.note}
            </span>
            <span className={s.capSmall}>
              mean <span className={s.mono}>{fmtVal(method, means[k])}</span>
            </span>
          </div>
        ))}
      </div>
      <Plot
        x={[lo, hi]}
        y={[0, 3]}
        width={520}
        height={150}
        minHeight={150}
        margin={{ left: 26, right: 14, top: 10, bottom: 34 }}
        ariaLabel="Where each image's pixel values lie: boxes show the middle half of the values, whiskers the middle 90 per cent, dots the means"
      >
        {lo < 0 && <Rect x0={lo} x1={0} y0={0} y1={3} fill="color-mix(in srgb, var(--viz-neg) 8%, transparent)" />}
        <Axes xTicks={6} hideYTicks xLabel="pixel value" />
        <VLine x={0} color="var(--viz-ink)" dash="0" width={1.6} />
        {summaries.map((sm, k) => (
          <g key={k}>
            <Path points={[[sm.p5, rowY[k]], [sm.p95, rowY[k]]]} color={PATIENTS[k].color} width={2} />
            <Rect x0={sm.p25} x1={sm.p75} y0={rowY[k] - 0.28} y1={rowY[k] + 0.28} fill={`color-mix(in srgb, ${PATIENTS[k].color} 30%, var(--surface))`} stroke={PATIENTS[k].color} rx={3} />
            <Dots points={[{ x: means[k], y: rowY[k], r: 5, color: PATIENTS[k].color }]} stroke="var(--viz-ink)" />
            <Label x={lo} y={rowY[k]} dx={-6} dy={4} anchor="end" color={PATIENTS[k].color} weight={800}>
              {PATIENTS[k].name}
            </Label>
          </g>
        ))}
      </Plot>
      <div className={s.boxKey} aria-hidden="true">
        <span>
          <svg width="22" height="12">
            <rect x="1" y="1" width="20" height="10" rx="2" style={{ fill: 'color-mix(in srgb, var(--viz-muted) 30%, var(--surface))', stroke: 'var(--viz-muted)' }} />
          </svg>
          middle half of an image's values
        </span>
        <span>
          <svg width="22" height="12">
            <line x1="1" y1="6" x2="21" y2="6" style={{ stroke: 'var(--viz-muted)', strokeWidth: 2 }} />
          </svg>
          middle 90%
        </span>
        <span>
          <svg width="12" height="12">
            <circle cx="6" cy="6" r="4.5" style={{ fill: 'var(--viz-muted)', stroke: 'var(--viz-ink)' }} />
          </svg>
          mean
        </span>
      </div>
      <div className={s.stack} style={{ gap: '0.35rem' }}>
        <span className={s.capSmall}>
          Signs of one first-layer neuron's gradients, ∂L/∂w = δ · x, for 16 pixels of image B (with δ positive here; a negative δ flips them all)
        </span>
        <div className={s.signRow} role="img" aria-label={`${nPos} positive and ${16 - nPos} negative gradient signs`}>
          {sampleVals.map((v, i) => (
            <span key={i} className={`${s.sign} ${v > 0 ? s.signPos : s.signNeg}`}>
              {v > 0 ? '+' : '−'}
            </span>
          ))}
        </div>
      </div>
      <div className={s.note} aria-live="polite">
        {notes[method]}
      </div>
      <Readout
        items={[
          ['mean A / B / C', means.map((m) => fmtVal(method, m)).join('  /  ')],
          ['gradient signs', `${nPos} plus, ${16 - nPos} minus`],
        ]}
      />
    </Figure>
  )
}
