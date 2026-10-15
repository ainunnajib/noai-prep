import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Bars, M } from '../../../../../kit'

/*
  Why deep learning does not use Newton's method. For a model with n parameters:
    gradient: n numbers          (what gradient descent needs each step)
    Hessian:  n² numbers         (what Newton's method needs each step)
    inverting / solving with it: about n³ arithmetic operations
  Bars are on a logarithmic scale (each tick = ×10), so the gap between n and n³ is visible.
*/

const PRESETS = [
  { value: 2, label: '100' },
  { value: 4, label: '10K (Q74)' },
  { value: Math.log10(2.56e7), label: 'ResNet-50' },
  { value: Math.log10(1.75e11), label: 'GPT-3' },
]
const BYTES = 4 // one float32 number
const OPS_PER_SECOND = 1e14 // a fast GPU, order of magnitude

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
/** round to a few significant figures and print without exponent notation: 400, 25.6, 1.7 */
const sig = (v: number, digits = 3) => Number(v.toPrecision(digits)).toLocaleString('en-GB', { maximumFractionDigits: 3 })
const sig3 = (v: number) => sig(v, 3)
/** 10^e as "2.5 × 10⁷" or "10⁵"; a mantissa that rounds up to 10 moves into the exponent */
const pow10 = (e: number) => {
  let k = Math.floor(e + 1e-9)
  let m = 10 ** (e - k)
  if (m >= 9.95) {
    k += 1
    m = 1
  }
  const exp = String(k)
    .split('')
    .map((d) => SUP[d] ?? d)
    .join('')
  return `${m < 1.05 ? '' : `${m.toFixed(1)} × `}10${exp}`
}
const count = (e: number) => {
  const v = 10 ** e
  if (v < 1e4) return Math.round(v).toLocaleString('en-GB')
  if (v < 1e6) return `${Math.round(v / 1e3).toLocaleString('en-GB')} thousand`
  if (v < 1e9) return `${sig3(v / 1e6)} million`
  if (v < 1e12) return `${sig3(v / 1e9)} billion`
  return pow10(e)
}
const bytes = (e: number) => {
  const v = 10 ** e
  const units: [number, string][] = [
    [1e24, 'YB'],
    [1e21, 'ZB'],
    [1e18, 'EB'],
    [1e15, 'PB'],
    [1e12, 'TB'],
    [1e9, 'GB'],
    [1e6, 'MB'],
    [1e3, 'kB'],
  ]
  for (const [u, name] of units) if (v >= u) return `${sig3(v / u)} ${name}`
  return `${Math.round(v)} bytes`
}
const duration = (e: number) => {
  const s = 10 ** e
  if (s < 1e-3) return 'under a millisecond'
  if (s < 1) return `${sig(s * 1000, 2)} milliseconds`
  if (s < 120) return `${sig(s, 2)} seconds`
  if (s < 7200) return `${sig(s / 60, 2)} minutes`
  if (s < 2 * 86400) return `${sig(s / 3600, 2)} hours`
  if (s < 2 * 31557600) return `${sig(s / 86400, 2)} days`
  const y = s / 31557600
  return y < 1e6 ? `${Math.round(y).toLocaleString('en-GB')} years` : `${pow10(Math.log10(y))} years`
}

export default function HessianCost() {
  const [e, setE] = useState(4)
  const n = 10 ** e
  const top = 36
  const data = [
    { label: <>gradient (n)</>, value: e, color: 'var(--viz-3)' },
    { label: <>Hessian (n²)</>, value: 2 * e, color: 'var(--viz-2)' },
    { label: <>inverting it (n³)</>, value: 3 * e, color: 'var(--viz-neg)', strong: true },
  ]
  const preset = PRESETS.find((p) => Math.abs(p.value - e) < 0.005)?.value ?? -1

  return (
    <Figure
      title="The price of curvature"
      caption={
        <>
          Slide the number of parameters <i>n</i>. Gradient descent needs the gradient (n numbers) each step; Newton&apos;s method also needs the
          Hessian (n² numbers) and has to solve with it (about n³ operations). The bars use a logarithmic scale, so each step along a bar is ten times more. Memory assumes 4 bytes per number (32-bit floats).
          Try the 10,000-parameter network from Prelim Q74, then a real image model and a large language model. Timings assume a fast GPU doing about
          10¹⁴ operations per second.
        </>
      }
    >
      <div style={{ width: '100%', fontSize: '0.95rem', textAlign: 'center' }}>
        <M>{`n = `}</M> <b className="tabular">{count(e)}</b> parameters
      </div>
      <div style={{ width: '100%' }}>
        <Bars data={data} max={top} format={(v) => pow10(v)} ariaLabel="Gradient size, Hessian size and inversion cost on a logarithmic scale" />
      </div>
      <dl className="readout" style={{ width: '100%', display: 'grid', gap: '0.35rem' }}>
        <div className="readout-item">
          <dt>gradient memory</dt>
          <dd className="tabular">{bytes(Math.log10(BYTES) + e)}</dd>
        </div>
        <div className="readout-item">
          <dt>Hessian memory</dt>
          <dd className="tabular">{bytes(Math.log10(BYTES) + 2 * e)}</dd>
        </div>
        <div className="readout-item">
          <dt>time for one Newton step</dt>
          <dd className="tabular">{duration(3 * e - Math.log10(OPS_PER_SECOND))}</dd>
        </div>
      </dl>
      <Controls>
        <Slider label="number of parameters n (log scale)" value={e} min={1} max={12} step={0.01} onChange={setE} format={() => count(e)} />
      </Controls>
      <Controls>
        <Segmented label="Real sizes" value={preset} onChange={setE} options={PRESETS} />
      </Controls>
      <div style={{ width: '100%', fontSize: '0.8125rem', color: 'var(--ink-2)' }}>
        ResNet-50 (an image model) has about 25.6 million parameters; GPT-3 (a 2020 language model) has about 175 billion. {n >= 1e6 ? 'At this size, even storing the Hessian is out of reach.' : ''}
      </div>
    </Figure>
  )
}
